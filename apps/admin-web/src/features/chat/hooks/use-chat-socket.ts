"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { connectChatSocket, getChatSocket } from "../lib/chat-socket";
import {
  appendMessage,
  markSentAsRead,
  removeMessage,
  setReactions,
  type MessageCache,
} from "../lib/message-cache";
import { markConversationRead } from "../api/dm.client";
import { useChatStore } from "../store/chat-store";
import { useChatToken } from "./use-chat-token";
import type { DirectMessage, MessageReaction } from "../chat.types";

/**
 * Mounts the single chat socket for the signed-in agent and wires every DM /
 * presence event into the TanStack Query cache + the chat store. Ported from
 * the standalone client's useSocket (DM branches only). Mount once, high in
 * the dashboard tree.
 */
export function useChatSocket() {
  const { data: token } = useChatToken();
  const queryClient = useQueryClient();
  const accessToken = token?.accessToken;
  const me = token?.chatUserId;

  useEffect(() => {
    if (!accessToken || !me) return;
    const socket = connectChatSocket(accessToken);

    const onNewDm = ({ dm }: { dm: DirectMessage }) => {
      const partnerId = dm.senderId === me ? dm.receiverId : dm.senderId;
      const isIncoming = dm.senderId !== me;

      if (isIncoming) useChatStore.getState().setDmTyping(dm.senderId, false);

      queryClient.setQueryData<MessageCache<DirectMessage>>(
        ["dm", partnerId],
        (cache) => appendMessage(cache, dm),
      );

      if (isIncoming) {
        const viewing = useChatStore.getState().activeDmUserId === partnerId;
        if (viewing) {
          void markConversationRead(accessToken, partnerId)
            .catch(() => undefined)
            .finally(() =>
              queryClient.invalidateQueries({
                queryKey: ["dm-conversations"],
              }),
            );
          return;
        }
        useChatStore.getState().incrementUnread(partnerId);
      }
      queryClient.invalidateQueries({ queryKey: ["dm-conversations"] });
    };

    const onDmDeleted = ({
      messageId,
      senderId,
      receiverId,
    }: {
      messageId: string;
      senderId: string;
      receiverId: string;
    }) => {
      const partnerId = senderId === me ? receiverId : senderId;
      queryClient.setQueryData<MessageCache<DirectMessage>>(
        ["dm", partnerId],
        (cache) => removeMessage(cache, messageId),
      );
      queryClient.invalidateQueries({ queryKey: ["dm-conversations"] });
    };

    const onDmReactions = ({
      messageId,
      senderId,
      receiverId,
      reactions,
    }: {
      messageId: string;
      senderId: string;
      receiverId: string;
      reactions: MessageReaction[];
    }) => {
      const partnerId = senderId === me ? receiverId : senderId;
      queryClient.setQueryData<MessageCache<DirectMessage>>(
        ["dm", partnerId],
        (cache) => setReactions(cache, messageId, reactions),
      );
    };

    const onDmRead = ({
      readerId,
      senderId,
    }: {
      readerId: string;
      senderId: string;
    }) => {
      if (senderId !== me) return;
      queryClient.setQueryData<MessageCache<DirectMessage>>(
        ["dm", readerId],
        (cache) => markSentAsRead(cache, me),
      );
    };

    const onDmConversationDeleted = ({
      userId,
      otherUserId,
    }: {
      userId: string;
      otherUserId: string;
    }) => {
      if (![userId, otherUserId].includes(me)) return;
      const partnerId = me === userId ? otherUserId : userId;
      queryClient.removeQueries({ queryKey: ["dm", partnerId] });
      queryClient.invalidateQueries({ queryKey: ["dm-conversations"] });
    };

    const onDmTyping = ({
      userId,
      isTyping,
    }: {
      userId: string;
      username: string;
      isTyping: boolean;
    }) => {
      if (userId === me) return;
      useChatStore.getState().setDmTyping(userId, isTyping);
    };

    const onPresenceState = ({ userIds }: { userIds: string[] }) =>
      useChatStore.getState().setOnlineUsers(userIds);
    const onUserOnline = ({ userId }: { userId: string }) =>
      useChatStore.getState().addOnlineUser(userId);
    const onUserOffline = ({
      userId,
      lastSeenAt,
    }: {
      userId: string;
      lastSeenAt?: string | null;
    }) => useChatStore.getState().removeOnlineUser(userId, lastSeenAt);

    socket.on("new_dm", onNewDm);
    socket.on("dm_deleted", onDmDeleted);
    socket.on("dm_reactions", onDmReactions);
    socket.on("dm_read", onDmRead);
    socket.on("dm_conversation_deleted", onDmConversationDeleted);
    socket.on("dm_typing", onDmTyping);
    socket.on("presence_state", onPresenceState);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);

    return () => {
      socket.off("new_dm", onNewDm);
      socket.off("dm_deleted", onDmDeleted);
      socket.off("dm_reactions", onDmReactions);
      socket.off("dm_read", onDmRead);
      socket.off("dm_conversation_deleted", onDmConversationDeleted);
      socket.off("dm_typing", onDmTyping);
      socket.off("presence_state", onPresenceState);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);
    };
  }, [accessToken, me, queryClient]);

  return getChatSocket();
}
