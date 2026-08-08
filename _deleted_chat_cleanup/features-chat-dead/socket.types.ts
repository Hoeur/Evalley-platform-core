import type {
  DirectMessage,
  MessageReaction,
  ChatMessageType,
} from "./chat.types";

/** Events the Chat API emits to the browser (DM + presence subset). */
export interface ServerToClientEvents {
  new_dm: (data: { dm: DirectMessage }) => void;
  dm_deleted: (data: {
    messageId: string;
    senderId: string;
    receiverId: string;
  }) => void;
  dm_reactions: (data: {
    messageId: string;
    senderId: string;
    receiverId: string;
    reactions: MessageReaction[];
  }) => void;
  dm_conversation_deleted: (data: {
    userId: string;
    otherUserId: string;
  }) => void;
  dm_read: (data: { readerId: string; senderId: string }) => void;
  dm_typing: (data: {
    userId: string;
    username: string;
    isTyping: boolean;
  }) => void;
  presence_state: (data: { userIds: string[] }) => void;
  user_online: (data: { userId: string }) => void;
  user_offline: (data: { userId: string; lastSeenAt?: string | null }) => void;
  error: (data: { message: string }) => void;
}

/** Events the browser sends to the Chat API. */
export interface ClientToServerEvents {
  join_dm: (data: { userId: string }) => void;
  send_dm: (data: {
    receiverId: string;
    content?: string;
    messageType?: ChatMessageType;
    fileUrl?: string;
    fileName?: string;
    fileMimeType?: string;
    fileSize?: number;
    fileDurationMs?: number;
    replyToId?: string;
  }) => void;
  dm_typing_start: (data: { receiverId: string }) => void;
  dm_typing_stop: (data: { receiverId: string }) => void;
}
