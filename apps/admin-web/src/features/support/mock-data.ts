import type { SupportConversation, SupportInboxView } from "./types";

/**
 * Dummy support conversations for the inbox screen. Replace `getSupportInboxData`
 * with a real API/websocket source when the chat backend lands. Timestamps are
 * fixed ISO strings so the mock renders deterministically.
 */
export const MOCK_SUPPORT_CONVERSATIONS: SupportConversation[] = [
  {
    id: "conv_1001",
    customerName: "Sokha Chan",
    customerEmail: "sokha.chan@gmail.com",
    channel: "app",
    status: "open",
    online: true,
    unread: 2,
    orderRef: "EV-24817",
    location: "Phnom Penh, KH",
    messages: [
      { id: "m1", author: "customer", senderName: "Sokha Chan", body: "Hi, I ordered a blender two days ago but the tracking hasn't updated.", sentAt: "2026-08-01T02:41:00.000Z" },
      { id: "m2", author: "agent", senderName: "You", body: "Hi Sokha! Let me pull up order EV-24817 for you right now.", sentAt: "2026-08-01T02:43:00.000Z" },
      { id: "m3", author: "customer", senderName: "Sokha Chan", body: "Thank you. I really need it before the weekend if possible.", sentAt: "2026-08-01T02:44:00.000Z" },
      { id: "m4", author: "customer", senderName: "Sokha Chan", body: "Is it still on the way?", sentAt: "2026-08-01T02:58:00.000Z" },
    ],
  },
  {
    id: "conv_1002",
    customerName: "Dara Kim",
    customerEmail: "dara.kim@outlook.com",
    channel: "website",
    status: "pending",
    online: false,
    unread: 0,
    orderRef: "EV-24790",
    location: "Siem Reap, KH",
    messages: [
      { id: "m1", author: "customer", senderName: "Dara Kim", body: "The coupon SAVE20 isn't applying at checkout.", sentAt: "2026-08-01T01:10:00.000Z" },
      { id: "m2", author: "agent", senderName: "You", body: "Sorry about that! SAVE20 is valid on orders over $35 — could you tell me your cart total?", sentAt: "2026-08-01T01:15:00.000Z" },
      { id: "m3", author: "customer", senderName: "Dara Kim", body: "It's $28.", sentAt: "2026-08-01T01:17:00.000Z" },
      { id: "m4", author: "agent", senderName: "You", body: "That's why — add one more item to reach $35 and it'll apply automatically.", sentAt: "2026-08-01T01:18:00.000Z" },
    ],
  },
  {
    id: "conv_1003",
    customerName: "Lucas Meyer",
    customerEmail: "lucas.meyer@gmail.com",
    channel: "app",
    status: "open",
    online: true,
    unread: 1,
    location: "Berlin, DE",
    messages: [
      { id: "m1", author: "customer", senderName: "Lucas Meyer", body: "Do you ship internationally? I'm in Germany.", sentAt: "2026-08-01T03:05:00.000Z" },
      { id: "m2", author: "customer", senderName: "Lucas Meyer", body: "And what are the delivery fees?", sentAt: "2026-08-01T03:06:00.000Z" },
    ],
  },
  {
    id: "conv_1004",
    customerName: "Mariam Al-Farsi",
    customerEmail: "mariam.f@icloud.com",
    channel: "website",
    status: "open",
    online: false,
    unread: 3,
    orderRef: "EV-24705",
    location: "Dubai, AE",
    messages: [
      { id: "m1", author: "customer", senderName: "Mariam Al-Farsi", body: "I received the wrong size for my order.", sentAt: "2026-07-31T18:20:00.000Z" },
      { id: "m2", author: "customer", senderName: "Mariam Al-Farsi", body: "I ordered Large but got Medium.", sentAt: "2026-07-31T18:21:00.000Z" },
      { id: "m3", author: "customer", senderName: "Mariam Al-Farsi", body: "How do I exchange it?", sentAt: "2026-07-31T18:22:00.000Z" },
    ],
  },
  {
    id: "conv_1005",
    customerName: "Ravy Sok",
    customerEmail: "ravy.sok@gmail.com",
    channel: "app",
    status: "resolved",
    online: false,
    unread: 0,
    orderRef: "EV-24650",
    location: "Battambang, KH",
    messages: [
      { id: "m1", author: "customer", senderName: "Ravy Sok", body: "My refund still hasn't arrived.", sentAt: "2026-07-30T09:00:00.000Z" },
      { id: "m2", author: "agent", senderName: "You", body: "It was processed on the 29th and takes 3–5 business days to reflect. You should see it by tomorrow.", sentAt: "2026-07-30T09:12:00.000Z" },
      { id: "m3", author: "customer", senderName: "Ravy Sok", body: "Got it, thank you so much!", sentAt: "2026-07-30T09:15:00.000Z" },
    ],
  },
  {
    id: "conv_1006",
    customerName: "Elena Rossi",
    customerEmail: "elena.rossi@gmail.com",
    channel: "website",
    status: "open",
    online: true,
    unread: 0,
    location: "Milan, IT",
    messages: [
      { id: "m1", author: "customer", senderName: "Elena Rossi", body: "Is the espresso machine back in stock?", sentAt: "2026-08-01T03:20:00.000Z" },
      { id: "m2", author: "agent", senderName: "You", body: "Not yet, but restock is expected next week. Want me to notify you when it's available?", sentAt: "2026-08-01T03:22:00.000Z" },
      { id: "m3", author: "customer", senderName: "Elena Rossi", body: "Yes please!", sentAt: "2026-08-01T03:23:00.000Z" },
    ],
  },
];

export function getSupportInboxData(): SupportInboxView {
  return { conversations: MOCK_SUPPORT_CONVERSATIONS, agentName: "Support Agent" };
}
