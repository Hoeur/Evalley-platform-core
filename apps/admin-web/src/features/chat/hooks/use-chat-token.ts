"use client";

import { useQuery } from "@tanstack/react-query";
import type { ChatTokenResponse } from "../chat.types";

async function fetchChatToken(): Promise<ChatTokenResponse> {
  const response = await fetch("/api/chat/token", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Chat token request failed (${response.status})`);
  }
  return (await response.json()) as ChatTokenResponse;
}

/**
 * Fetches the bridged Chat API token and keeps it fresh. Refetch fires a
 * little before expiry so the socket can reconnect with a valid token.
 */
export function useChatToken() {
  return useQuery({
    queryKey: ["chat", "token"],
    queryFn: fetchChatToken,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 12 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
