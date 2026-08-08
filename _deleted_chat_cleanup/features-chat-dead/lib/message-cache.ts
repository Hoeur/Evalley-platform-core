import type { InfiniteData } from "@tanstack/react-query";

interface MessageReactionEntity {
  emoji: string;
  userId: string;
}

interface MessageEntity {
  id: string;
  replyToId?: string | null;
  replyTo?: unknown | null;
  reactions?: MessageReactionEntity[];
}

interface ReadableEntity {
  id: string;
  senderId?: string;
  read?: boolean;
}

export interface MessagePage<T> {
  messages: T[];
  nextCursor: string | null;
}

export type MessageCache<T> = InfiniteData<MessagePage<T>, unknown>;

export function appendMessage<T extends MessageEntity>(
  cache: MessageCache<T> | undefined,
  message: T,
) {
  if (!cache) return cache;
  if (
    cache.pages.some((page) =>
      page.messages.some((item) => item.id === message.id),
    )
  )
    return cache;

  return {
    ...cache,
    // Page 0 holds the newest messages; older history is paged in after it.
    pages: cache.pages.map((page, index) =>
      index === 0
        ? { ...page, messages: [...page.messages, message] }
        : page,
    ),
  };
}

export function updateMessage<T extends MessageEntity>(
  cache: MessageCache<T> | undefined,
  message: T,
) {
  if (!cache) return cache;
  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      messages: page.messages.map((item) =>
        item.id === message.id ? message : item,
      ),
    })),
  };
}

export function setReactions<T extends MessageEntity>(
  cache: MessageCache<T> | undefined,
  messageId: string,
  reactions: MessageReactionEntity[],
) {
  if (!cache) return cache;
  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      messages: page.messages.map((item) =>
        item.id === messageId ? { ...item, reactions } : item,
      ),
    })),
  };
}

export function markSentAsRead<T extends ReadableEntity>(
  cache: MessageCache<T> | undefined,
  senderId: string,
) {
  if (!cache) return cache;
  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      messages: page.messages.map((item) =>
        item.senderId === senderId && !item.read
          ? { ...item, read: true }
          : item,
      ),
    })),
  };
}

export function removeMessage<T extends MessageEntity>(
  cache: MessageCache<T> | undefined,
  messageId: string,
) {
  if (!cache) return cache;
  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      messages: page.messages
        .filter((message) => message.id !== messageId)
        .map((message) =>
          message.replyToId === messageId
            ? { ...message, replyToId: null, replyTo: null }
            : message,
        ),
    })),
  };
}
