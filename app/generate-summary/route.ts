import { invoke, initLogger, wrapTraced } from "braintrust";
import { BraintrustAdapter } from "@braintrust/vercel-ai-sdk";

initLogger({
  projectName: "ycs24",
  apiKey: process.env.BRAINTRUST_API_KEY,
  asyncFlush: true,
});

export async function POST(req: Request) {

  const { content } = await req.json();
  const summary = await handleRequest(content);
  return BraintrustAdapter.toAIStreamResponse(summary);
}

const handleRequest = wrapTraced(async function handleRequest(content ) {
  return await invoke({
    projectName: "ycs24",
    slug: "generate-summary-3c24",
    input: {
      content
    },
    stream: true,
  });
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;