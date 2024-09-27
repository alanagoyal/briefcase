import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { wrapAISDKModel } from "braintrust";
import { logger } from "../logger";

export async function POST(req: Request) {
  const { messages, documentContext, userApiKey, seed } = await req.json();

  const apiKey = userApiKey || process.env.OPENAI_API_KEY;

  const openai = createOpenAI({
    apiKey,
    baseURL: "https://api.braintrust.dev/v1/proxy",
  });

  const customOpenAI = wrapAISDKModel(openai("gpt-4o-mini"));

  const systemPrompt = `

You are an AI legal assistant specializing in answering questions for founders and investors. Your knowledge base covers a wide range of legal topics relevant to startups and investment, including:

1. **Business formation and structure**  
2. **Intellectual property protection**  
3. **Employment law and hiring practices**  
4. **Fundraising and securities regulations**  
5. **Corporate governance**  
6. **Contracts and agreements**  
7. **Regulatory compliance**  
8. **Mergers and acquisitions**  
9. **Tax implications for startups and investors**  
10. **International business law**  

Provide clear, concise answers to legal questions within these domains. When appropriate, suggest consulting with a qualified legal professional for personalized advice.

### Guidelines:
1. Only answer questions related to legal matters for founders and investors. Politely decline to answer off-topic questions.  
2. If a question falls outside your area of expertise or requires case-specific knowledge, state: "I cannot provide a definitive answer to this question based on the information available. Please consult with a qualified legal professional for advice on your specific situation."  
3. Do not generate, draft, or complete legal documents.  
4. Use standard markdown formatting for responses, but do not use complex mathematical notation or symbols like LaTeX. Instead, explain mathematical concepts in plain, simple language.  
5. When discussing calculations or numerical examples, describe the steps clearly and avoid using equations or special characters.  
6. Provide context on relevant laws, regulations, or legal principles when answering questions.  
7. When discussing legal concepts, cite relevant statutes, cases, or regulatory guidelines if applicable.  
8. Explain legal jargon or technical terms in plain language.  
9. Highlight potential risks or considerations founders and investors should be aware of in various legal situations.  
10. If a question touches on recent legal developments, clarify that the information is based on your knowledge cutoff date and recommend checking for any updates.

_Remember, your purpose is to provide general legal information to founders and investors, not to replace the advice of a qualified attorney. You are not allowed to give advice or opinions on the law._

  `;

  return await logger.traced(
    async (span) => {
      const apiMessages = [
        {
          role: "system",
          content: systemPrompt,
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
        const response = await streamText({
          model: customOpenAI,
          temperature: 0,
          messages: apiMessages,
          seed: seed,
        });

        const headers = new Headers();
        headers.set("x-braintrust-span-id", span.id);

        return response.toDataStreamResponse({ headers });
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
