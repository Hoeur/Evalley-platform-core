import Script from "next/script";

import { requireModuleAccess } from "@/core/auth/authorize.server";

/**
 * Customer inbox — the ChatGate agent Business Inbox, embedded with one script
 * tag. The inbox UI is served by the chat app, so it stays current on its own;
 * this dashboard never rebuilds when the chat changes.
 *
 * All this page provides is a container + the loader script. The loader calls
 * /api/chat/token (this app's existing route) to mint the agent's short-lived
 * token and hands it to the iframe — no token or key is exposed in the page.
 *
 * Set NEXT_PUBLIC_CHAT_BASE_URL to the chat app origin (default chat-gate.com).
 * Adjust the 4rem height offset to match your dashboard header.
 */
export default async function InboxPage() {
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
        data-session-endpoint="/api/chat/token"
      />
    </div>
  );
}
