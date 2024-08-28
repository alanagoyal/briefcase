import { OpenAIStream } from "ai";
import { cloudstate } from "freestyle-sh";
import {
  type ChatCompletionRequestMessage,
  type ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai-edge";
import { StreamingTextResponse } from "ai";

@cloudstate
export class Chat {
  static readonly id = "chat";

  async respond(
    messages: {
      role: ChatCompletionRequestMessageRoleEnum;
      content: string;
    }[],
    documentContexts?: string
  ): Promise<string> {
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(config);

    console.log("Received POST request to /api/chat");

    console.log("Received messages:", messages);
    console.log(
      "Document contexts:",
      documentContexts ? "Present" : "Not provided"
    );

    const apiMessages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant specializing in legal advice for founders. Provide clear, concise answers to legal questions, and when appropriate, suggest getting professional legal counsel. Use markdown formatting for your responses, including code blocks with language specification when appropriate.",
      },
      // Add document contexts if available
      // ...(documentContexts
      //   ? [
      //       {
      //         role: "system",
      //         content: `Context from uploaded documents:\n${documentContexts}\n\nPlease consider this context for all future responses in this conversation.`,
      //       },
      //     ]
      //   : []),
      ...messages,
    ];

    console.log("Prepared API messages:", apiMessages);

    try {
      console.log("Calling OpenAI API...");
      const response = await openai
        .createChatCompletion({
          model: "gpt-4o-mini",
          stream: true,
          messages: apiMessages,
        })
        .then((response) => response.json());

      console.log("Response from OpenAI API:", response);

      // I think this is how the API Works / but I'm not sure why its not strongly typed
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw error;
    }
  }
}
