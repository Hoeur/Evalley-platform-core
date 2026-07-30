import "server-only";
import { redirect } from "next/navigation";
import { readSignedSession } from "./session-cookie.server";
import type { Session } from "./session.types";

export async function getSession(): Promise<Session | null> {
  return readSignedSession();
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
