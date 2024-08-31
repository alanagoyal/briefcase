import { OpenAIStream, StreamingTextResponse } from "ai";
import { wrapAISDKModel, wrapOpenAI } from "braintrust";
import OpenAI from "openai";

import { logger } from "../logger";

// export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages, documentContext, userApiKey } = await req.json();

  const apiKey = userApiKey || process.env.OPENAI_API_KEY;
  const customOpenAI = wrapOpenAI(new OpenAI({ apiKey }));

  return await logger.traced(
    async (span) => {
      const apiMessages = [
        {
          role: "system",
          content:
            'You are a helpful AI assistant specializing in legal advice for founders. Provide clear, concise answers to legal questions, and when appropriate, suggest getting professional legal counsel. You should not provide answers to questions that are not legal related. When you are unsure of the answer, you can say "I am not able to provide an answer based on the information available to me." Use markdown formatting for your responses, including code blocks with language specification when appropriate.',
        },
        ...(documentContext
          ? [
              {
                role: "system",
                content: `Context from uploaded documents:\n${documentContext}\n\nPlease consider this context for all future responses in this conversation.`,
              },
            ]
          : []),
        ...messages,
      ];

      try {
        const response = await customOpenAI.chat.completions.create({
          model: "gpt-4o-mini",
          stream: true,
          messages: apiMessages,
        });

        const stream = OpenAIStream(response);
        
        const headers = new Headers();
        headers.set("x-braintrust-span-id", span.id);

        return new StreamingTextResponse(stream, { headers });
      } catch (error) {
        return new Response("Error processing your request", { status: 500 });
      }
    },
    {
      name: "Chat",
      event: {
        input: messages,
      }
    }
  );
}
