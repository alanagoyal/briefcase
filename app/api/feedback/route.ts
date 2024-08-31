import { logger } from "../logger";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    logger.logFeedback({
      id: body.requestId,
      scores: {
        correctness: body.score,
      },
      comment: body.comment,
      metadata: {
        user_id: body.userId,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error logging feedback:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to log feedback" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
