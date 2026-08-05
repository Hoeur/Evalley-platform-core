"use client";

import { useQuery } from "@tanstack/react-query";
import { listConversations } from "../api/dm.client";
import { useChatToken } from "./use-chat-token";

/** The support inbox list: latest DM per customer for the signed-in agent. */
export function useConversations() {
  const { data: token } = useChatToken();
  return useQuery({
    queryKey: ["dm-conversations"],
    queryFn: () => listConversations(token!.accessToken),
    enabled: Boolean(token?.accessToken),
    staleTime: 15_000,
  });
}
