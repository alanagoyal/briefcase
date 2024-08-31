import { invoke, wrapTraced } from "braintrust";
import { NextResponse } from "next/server";

// This enables logging for braintrust
import "./logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userMessage, assistantMessage } = body;
    const title = await handleRequest(userMessage, assistantMessage);
    return NextResponse.json({ title });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

const handleRequest = wrapTraced(async function handleRequest(
  userMessage: string,
  assistantMessage: string
) {
  try {
    const result = await invoke({
      projectName: "ycs24",
      slug: "generate-title-97f2",
      input: {
        userMessage,
        assistantMessage,
      },
      stream: false,
    });
    return result;
  } catch (error) {
    console.error("Error in handleRequest:", error);
    throw error;
  }
});
