/** Support inbox domain types (mock-backed until the chat service lands). */
export type SupportChannel = "app" | "website";

export type ConversationStatus = "open" | "pending" | "resolved";

export type MessageAuthor = "customer" | "agent";

export interface SupportMessage {
  id: string;
  author: MessageAuthor;
  /** Display name of the sender (customer name, or the agent). */
  senderName: string;
  body: string;
  /** ISO timestamp. */
  sentAt: string;
}

export interface SupportConversation {
  id: string;
  customerName: string;
  customerEmail: string;
  /** Where the customer is chatting from. */
  channel: SupportChannel;
  status: ConversationStatus;
  /** Whether the customer is currently online. */
  online: boolean;
  /** Unread inbound messages awaiting an agent reply. */
  unread: number;
  /** Optional order the chat is about, for support context. */
  orderRef?: string;
  /** Customer location, shown in the context panel. */
  location?: string;
  messages: SupportMessage[];
}

export interface SupportInboxView {
  conversations: SupportConversation[];
  /** The signed-in support agent replying to customers. */
  agentName: string;
}
