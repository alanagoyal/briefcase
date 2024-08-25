import { invoke, initLogger, wrapTraced } from "braintrust";
import { BraintrustAdapter } from "@braintrust/vercel-ai-sdk";

initLogger({
  projectName: "ycs24",
  apiKey: process.env.BRAINTRUST_API_KEY,
  asyncFlush: true,
});

export async function POST(req: Request) {
  const { context, question } = await req.json();
  const estimate = await handleRequest(context, question);
  return BraintrustAdapter.toAIStreamResponse(estimate);
}

const handleRequest = wrapTraced(async function handleRequest(context: string, question: string) {
  return await invoke({
    projectName: "ycs24",
    slug: "calculate-fees-2b87",
    input: {
      context,
      question
    },
    stream: true,
  });
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;