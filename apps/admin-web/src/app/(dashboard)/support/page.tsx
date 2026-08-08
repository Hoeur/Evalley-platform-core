import Script from "next/script";

import { requireModuleAccess } from "@/core/auth/authorize.server";

/**
 * Support Chat — the ChatGate agent Business Inbox, embedded with one script
 * tag. The inbox UI is served by the chat app (data-session-endpoint mints the
 * agent token server-side), so this dashboard never rebuilds when chat changes.
 *
 * Requires:
 *   NEXT_PUBLIC_CHAT_BASE_URL  → the chat app that serves /chatgate-inbox.js and
 *                                /embed/inbox (default https://chat-gate.com)
 *   CHAT_API_SUBSCRIPTION_KEY (or the CHAT_API_AGENT_* bridge) → powers
 *                                /api/chat/token
 * Keep NEXT_PUBLIC_CHAT_BASE_URL and CHAT_API_BASE_URL in the SAME environment.
 *
 * Adjust the 4rem offset to match your dashboard header height.
 */
export default async function SupportPage() {
  await requireModuleAccess("support", "support.read");

  const base = (
    process.env.NEXT_PUBLIC_CHAT_BASE_URL ?? "https://chat-gate.com"
  ).replace(/\/$/, "");
  const src =
    `${base}/chatgate-inbox.js` +
    `?mount=${encodeURIComponent("#chatgate-inbox")}` +
    `&session=${encodeURIComponent("/api/chat/token")}`;

  return (
    <div
      id="chatgate-inbox"
      style={{ height: "calc(100dvh - 4rem)", minHeight: 560 }}
    >
      <Script
        src={src}
        strategy="afterInteractive"
        data-mount="#chatgate-inbox"
        data-theme="light"
        data-session-endpoint="/api/chat/token"
      />
    </div>
  );
}
