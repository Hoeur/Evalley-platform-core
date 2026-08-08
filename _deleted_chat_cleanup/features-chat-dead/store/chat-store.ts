"use client";

import { create } from "zustand";

interface ChatState {
  /** The customer whose thread the agent is currently viewing. */
  activeDmUserId: string | null;
  /** partner userId -> is currently typing */
  dmTypingUserIds: Record<string, boolean>;
  onlineUserIds: Set<string>;
  /** userId -> ISO timestamp of last seen (when offline) */
  lastSeenById: Record<string, string>;
  /** partner userId -> unseen inbound count */
  unreadCounts: Record<string, number>;

  setActiveDmUser: (userId: string | null) => void;
  setDmTyping: (userId: string, isTyping: boolean) => void;
  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string, lastSeenAt?: string | null) => void;
  incrementUnread: (userId: string) => void;
  clearUnread: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeDmUserId: null,
  dmTypingUserIds: {},
  onlineUserIds: new Set(),
  lastSeenById: {},
  unreadCounts: {},

  setActiveDmUser: (userId) =>
    set((state) => ({
      activeDmUserId: userId,
      unreadCounts: userId
        ? { ...state.unreadCounts, [userId]: 0 }
        : state.unreadCounts,
    })),

  setDmTyping: (userId, isTyping) =>
    set((state) => {
      if (Boolean(state.dmTypingUserIds[userId]) === isTyping) return state;
      const next = { ...state.dmTypingUserIds };
      if (isTyping) next[userId] = true;
      else delete next[userId];
      return { dmTypingUserIds: next };
    }),

  setOnlineUsers: (userIds) => set({ onlineUserIds: new Set(userIds) }),

  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUserIds: new Set([...state.onlineUserIds, userId]),
    })),

  removeOnlineUser: (userId, lastSeenAt) =>
    set((state) => {
      const next = new Set(state.onlineUserIds);
      next.delete(userId);
      return {
        onlineUserIds: next,
        lastSeenById: lastSeenAt
          ? { ...state.lastSeenById, [userId]: lastSeenAt }
          : state.lastSeenById,
      };
    }),

  incrementUnread: (userId) =>
    set((state) => {
      if (state.activeDmUserId === userId) return state;
      return {
        unreadCounts: {
          ...state.unreadCounts,
          [userId]: (state.unreadCounts[userId] ?? 0) + 1,
        },
      };
    }),

  clearUnread: (userId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [userId]: 0 },
    })),
}));
