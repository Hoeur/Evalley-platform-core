import { NextResponse } from "next/server";
import { getChatTokenForCurrentAgent } from "@/features/chat/api/chat-token.server";

/**
 * Hands the browser a short-lived Chat API access token for the signed-in
 * agent. The evalley session cookie authenticates this request; the Chat API
 * service key never leaves the server.
 */
export async function GET() {
  try {
    const token = await getChatTokenForCurrentAgent();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json(token, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mint chat token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
