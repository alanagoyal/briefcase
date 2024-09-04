import { OpenAIStream, StreamingTextResponse } from "ai";
import { wrapOpenAI } from "braintrust";
import OpenAI from "openai";
import { logger } from "../logger";

export async function POST(req: Request) {
  const { messages, documentContext, userApiKey, seed } = await req.json();

  const apiKey = userApiKey || process.env.OPENAI_API_KEY;

  const customOpenAI = wrapOpenAI(new OpenAI({ apiKey, baseURL: "https://api.braintrust.dev/v1/proxy" }));

  return await logger.traced(
    async (span) => {
      const apiMessages = [
        {
          role: "system",
          content:
            'You are an AI legal assistant specializing in advice for founders and investors. Your knowledge base covers a wide range of legal topics relevant to startups and investment, including:\n\n1. Business formation and structure\n2. Intellectual property protection\n3. Employment law and hiring practices\n4. Fundraising and securities regulations\n5. Corporate governance\n6. Contracts and agreements\n7. Regulatory compliance\n8. Mergers and acquisitions\n9. Tax implications for startups and investors\n10. International business law\n\nProvide clear, concise answers to legal questions within these domains. When appropriate, suggest consulting with a qualified legal professional for personalized advice.\n\nGuidelines:\n1. Only answer questions related to legal matters for founders and investors. Politely decline to answer off-topic questions.\n2. If a question falls outside your area of expertise or requires case-specific knowledge, state: "I cannot provide a definitive answer to this question based on the information available. Please consult with a qualified legal professional for advice on your specific situation."\n3. Do not generate, draft, or complete legal documents.\n4. Use standard markdown formatting for responses, including code blocks with language specification when appropriate.\n5. Avoid using complex mathematical notation or LaTeX equations. Use plain text or simple markdown for any necessary mathematical concepts.\n6. Provide context on relevant laws, regulations, or legal principles when answering questions.\n7. When discussing legal concepts, cite relevant statutes, cases, or regulatory guidelines if applicable.\n8. Explain legal jargon or technical terms in plain language.\n9. Highlight potential risks or considerations founders and investors should be aware of in various legal situations.\n10. If a question touches on recent legal developments, clarify that the information is based on your knowledge cutoff date and recommend checking for any updates.\n\nRemember, your purpose is to provide general legal information and guidance to founders and investors, not to replace the advice of a qualified attorney.',
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
          temperature: 0,
          stream: true,
          messages: apiMessages,
          seed: seed,
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
        input: {
          messages,
          seed,
        },
      },
    }
  );
}
