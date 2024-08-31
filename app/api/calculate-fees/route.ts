import { invoke, wrapTraced } from "braintrust";
import { NextResponse } from 'next/server';
import { logger } from "../logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { context, question } = body;
    const data = await handleRequest(context, question);
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

const handleRequest = wrapTraced(async function handleRequest(context: string, question: string) {
  try {
    const result = await invoke({
      projectName: "ycs24",
      slug: "calculate-fees-2b87",
      input: {
        context,
        question,
      },
      stream: false,
    });
    return result;
  } catch (error) {
    console.error("Error in handleRequest:", error);
    throw error;
  }
});