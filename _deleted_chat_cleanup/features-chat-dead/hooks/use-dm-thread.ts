"use client";

import {
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { getChatSocket } from "../lib/chat-socket";
import {
  removeMessage,
  setReactions,
  type MessageCache,
} from "../lib/message-cache";
import {
  deleteDirectMessage,
  getThread,
  sendDirectMessage,
  toggleReaction,
} from "../api/dm.client";
import {
  toAttachmentPayload,
  uploadChatFile,
} from "../api/uploads.client";
import { useChatStore } from "../store/chat-store";
import { useChatToken } from "./use-chat-token";
import type {
  DirectMessage,
  DmConversation,
  PaginatedDirectMessages,
  SendDmInput,
} from "../chat.types";

/**
 * Live thread with one customer: history (cursor-paginated) + send / react /
 * delete / attachment actions. Real-time inbound is delivered by useChatSocket
 * into the same ["dm", userId] cache, so this hook only issues writes.
 */
export function useDmThread(otherUserId: string | null) {
  const { data: token } = useChatToken();
  const accessToken = token?.accessToken;
  const me = token?.chatUserId;
  const queryClient = useQueryClient();
  const setActiveDmUser = useChatStore((s) => s.setActiveDmUser);

  const query = useInfiniteQuery<PaginatedDirectMessages>({
    queryKey: ["dm", otherUserId],
    queryFn: ({ pageParam }) =>
      getThread(accessToken!, otherUserId!, pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (firstPage) => firstPage.nextCursor ?? undefined,
    enabled: Boolean(accessToken && otherUserId),
  });

  // Track the active conversation (drives unread-clearing + presence header).
  useEffect(() => {
    if (!otherUserId) return;
    setActiveDmUser(otherUserId);
    return () => setActiveDmUser(null);
  }, [otherUserId, setActiveDmUser]);

  // Opening the thread marks the partner's messages read server-side; reflect
  // that in the inbox list immediately so the unread badge clears.
  useEffect(() => {
    if (!otherUserId || !me || !query.isSuccess) return;
    queryClient.setQueryData<DmConversation[]>(["dm-conversations"], (list) =>
      list?.map((dm) =>
        dm.senderId === otherUserId && dm.receiverId === me && !dm.read
          ? { ...dm, read: true }
          : dm,
      ),
    );
  }, [otherUserId, me, query.isSuccess, queryClient]);

  // Join the DM socket room so typing/read events flow for this thread.
  useEffect(() => {
    if (!accessToken || !otherUserId) return;
    const socket = getChatSocket();
    const join = () => socket.emit("join_dm", { userId: otherUserId });
    if (socket.connected) join();
    else socket.once("connect", join);
    return () => {
      socket.off("connect", join);
    };
  }, [accessToken, otherUserId]);

  const messages = useMemo(
    () =>
      query.data?.pages
        .slice()
        .reverse()
        .flatMap((page) => page.messages) ?? [],
    [query.data],
  );

  const send = useCallback(
    async (input: {
      content?: string;
      replyToId?: string;
      attachment?: File;
      forcedType?: "voice";
    }) => {
      if (!accessToken || !otherUserId) return;
      let payload: Omit<SendDmInput, "receiverId"> = {
        content: input.content?.trim() ?? "",
        replyToId: input.replyToId,
      };
      if (input.attachment) {
        const uploaded = await uploadChatFile(accessToken, input.attachment);
        payload = { ...payload, ...toAttachmentPayload(uploaded, input.forcedType) };
      }
      // Server emits new_dm; the socket handler appends to the cache.
      await sendDirectMessage(accessToken, otherUserId, payload);
    },
    [accessToken, otherUserId],
  );

  const react = useCallback(
    async (messageId: string, emoji: string) => {
      if (!accessToken || !otherUserId || !me) return;
      const key = ["dm", otherUserId] as const;
      const cache = queryClient.getQueryData<MessageCache<DirectMessage>>(key);
      const current =
        cache?.pages
          .flatMap((p) => p.messages)
          .find((m) => m.id === messageId)?.reactions ?? [];
      const mine = current.some((r) => r.emoji === emoji && r.userId === me);
      const optimistic = mine
        ? current.filter((r) => !(r.emoji === emoji && r.userId === me))
        : [...current, { emoji, userId: me }];
      queryClient.setQueryData<MessageCache<DirectMessage>>(key, (c) =>
        setReactions(c, messageId, optimistic),
      );
      try {
        await toggleReaction(accessToken, messageId, emoji);
      } catch {
        queryClient.setQueryData<MessageCache<DirectMessage>>(key, (c) =>
          setReactions(c, messageId, current),
        );
      }
    },
    [accessToken, otherUserId, me, queryClient],
  );

  const remove = useCallback(
    async (messageId: string) => {
      if (!accessToken || !otherUserId) return;
      await deleteDirectMessage(accessToken, messageId);
      queryClient.setQueryData<MessageCache<DirectMessage>>(
        ["dm", otherUserId],
        (c) => removeMessage(c, messageId),
      );
      queryClient.invalidateQueries({ queryKey: ["dm-conversations"] });
    },
    [accessToken, otherUserId, queryClient],
  );

  return {
    messages,
    isLoading: query.isLoading,
    isError: query.isError,
    hasMore: Boolean(query.hasNextPage),
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
    meId: me,
    send,
    react,
    remove,
  };
}
