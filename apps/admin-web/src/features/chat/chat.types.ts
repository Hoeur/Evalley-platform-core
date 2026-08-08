/**
 * Chat API domain types (ported from the standalone chat client).
 * DM-focused: the support inbox models each customer conversation as a
 * direct-message thread between the customer and the signed-in agent.
 */

export interface ChatUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  directMessagesEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserSummary = Pick<ChatUser, "id" | "username" | "avatarUrl"> & {
  lastSeenAt?: string | null;
};

export type ChatMessageType = "text" | "image" | "file" | "voice";

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
}

export interface DirectMessageReply {
  id: string;
  content: string;
  messageType: ChatMessageType;
  fileName?: string | null;
  linkPreview?: LinkPreview | null;
  senderId: string;
  sender: UserSummary;
}

export interface DirectMessage {
  id: string;
  content: string;
  messageType: ChatMessageType;
  fileUrl?: string | null;
  fileName?: string | null;
  fileMimeType?: string | null;
  fileSize?: number | null;
  fileDurationMs?: number | null;
  linkPreview?: LinkPreview | null;
  replyToId?: string | null;
  replyTo?: DirectMessageReply | null;
  senderId: string;
  receiverId: string;
  read: boolean;
  createdAt: string;
  sender: UserSummary;
  receiver: UserSummary;
  reactions?: MessageReaction[];
}

/** One entry per conversation partner (latest DM), from GET /dm/conversations. */
export type DmConversation = DirectMessage;

export interface PaginatedDirectMessages {
  messages: DirectMessage[];
  nextCursor: string | null;
}

/** Payload accepted by the send_dm socket event. */
export interface SendDmInput {
  receiverId: string;
  content?: string;
  messageType?: ChatMessageType;
  fileUrl?: string;
  fileName?: string;
  fileMimeType?: string;
  fileSize?: number;
  fileDurationMs?: number;
  replyToId?: string;
}

/** Result of the token bridge: a short-lived Chat API access token. */
export interface ChatTokenResponse {
  accessToken: string;
  chatUserId: string;
  /** ISO timestamp when the access token expires. */
  expiresAt: string;
  /**
   * Organization the token is scoped to. Present when the token was minted from
   * a subscription key (which carries its org); the inbox embed uses it so it
   * doesn't have to resolve the org separately.
   */
  organizationId?: string | null;
}
