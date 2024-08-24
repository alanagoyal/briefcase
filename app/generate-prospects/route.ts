import { invoke, initLogger, wrapTraced } from "braintrust";
import { BraintrustAdapter } from "@braintrust/vercel-ai-sdk";
import { NextResponse } from "next/server";

initLogger({
  projectName: "ycs24",
  apiKey: process.env.BRAINTRUST_API_KEY,
  asyncFlush: true,
});

export async function POST(req: Request) {
  const { description } = await req.json();
  const prospects = await handleRequest(description);
  console.log("Prospects:", prospects);
  return NextResponse.json(prospects);
}

const handleRequest = wrapTraced(async function handleRequest(
  description
) {
  return await invoke({
    projectName: "ycs24",
    slug: "generate-prospects-0dd7",
    input: {
      description,
    },
    stream: true,
  });
});



// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
