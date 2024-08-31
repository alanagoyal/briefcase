import { OpenAIStream, StreamingTextResponse } from "ai";
import { wrapAISDKModel, wrapOpenAI } from "braintrust";
import OpenAI from "openai";

import { logger } from "../generate-title/logger";

// export const runtime = 'edge'

export async function POST(req: Request) {
  console.log("Received POST request to /api/chat");

  const { messages, documentContext, userApiKey } = await req.json();
  console.log("Received messages:", messages);
  console.log(
    "Document context:",
    documentContext ? "Present" : "Not provided"
  );

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
        // Add document context if available
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

      console.log("Prepared API messages:", apiMessages);
      span.log({ input: messages });

      try {
        console.log("Calling OpenAI API...");
        const response = await customOpenAI.chat.completions.create({
          model: "gpt-4o-mini",
          stream: true,
          messages: apiMessages,
        });
        console.log("Received response from OpenAI API");

        const stream = OpenAIStream(response);
        console.log("Created OpenAIStream");
        return new StreamingTextResponse(stream, {
          headers: {
            "x-braintrust-span-id": span.id,
          },
        });
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return new Response("Error processing your request", { status: 500 });
      }
    },
    {
      name: "Chat",
    }
  );
}
