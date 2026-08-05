import { getChatApiUrl } from "../lib/chat-config";
import type {
  DirectMessage,
  DmConversation,
  PaginatedDirectMessages,
  SendDmInput,
} from "../chat.types";

async function chatFetch<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${getChatApiUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    const message =
      (detail && typeof detail === "object" && "message" in detail
        ? String((detail as { message?: unknown }).message)
        : null) ?? `Chat request failed (${response.status})`;
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Latest DM per conversation partner (the inbox list). */
export function listConversations(token: string) {
  return chatFetch<DmConversation[]>(token, "/dm");
}

/** One customer↔agent thread, cursor-paginated (also marks it read server-side). */
export function getThread(
  token: string,
  otherUserId: string,
  cursor?: string,
  limit = 50,
) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", String(limit));
  return chatFetch<PaginatedDirectMessages>(
    token,
    `/dm/${otherUserId}?${params.toString()}`,
  );
}

export function sendDirectMessage(
  token: string,
  receiverId: string,
  input: Omit<SendDmInput, "receiverId">,
) {
  return chatFetch<DirectMessage>(token, `/dm/${receiverId}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function markConversationRead(token: string, otherUserId: string) {
  return chatFetch<{ read: number }>(token, `/dm/${otherUserId}/read`, {
    method: "POST",
  });
}

export function toggleReaction(token: string, messageId: string, emoji: string) {
  return chatFetch<{
    messageId: string;
    senderId: string;
    receiverId: string;
    reactions: { emoji: string; userId: string }[];
  }>(token, `/dm/messages/${messageId}/reactions`, {
    method: "POST",
    body: JSON.stringify({ emoji }),
  });
}

export function deleteDirectMessage(token: string, messageId: string) {
  return chatFetch<void>(token, `/dm/messages/${messageId}`, {
    method: "DELETE",
  });
}
