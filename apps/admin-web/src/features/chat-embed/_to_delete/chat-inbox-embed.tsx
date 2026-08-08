"use client";

/**
 * Embedded agent inbox.
 *
 * Loads the ChatGate Business Inbox from the chat app in an <iframe> and hands
 * it a short-lived Chat API token for the signed-in agent. Because the inbox
 * lives in the chat app, it stays up to date on its own — the dashboard never
 * needs to be rebuilt when the chat UI changes.
 *
 * Set NEXT_PUBLIC_CHAT_EMBED_URL to the chat app's embed route, e.g.
 *   NEXT_PUBLIC_CHAT_EMBED_URL=https://chat-gate.com/embed/inbox
 */

import { useCallback, useEffect, useRef } from "react";

import { useChatToken } from "@/features/chat/hooks/use-chat-token";

const EMBED_URL = process.env.NEXT_PUBLIC_CHAT_EMBED_URL ?? "";

function embedOrigin(): string {
  try {
    return new URL(EMBED_URL).origin;
  } catch {
    return "";
  }
}

export function ChatInboxEmbed({
  agentName = "Support",
  className,
}: {
  agentName?: string;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const tokenQuery = useChatToken();
  const token = tokenQuery.data;
  const origin = embedOrigin();

  const postAuth = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !token || !origin) return;
    win.postMessage(
      {
        type: "chatgate:auth",
        accessToken: token.accessToken,
        user: { id: token.chatUserId, username: agentName },
      },
      origin,
    );
  }, [token, origin, agentName]);

  // The iframe tells us when it's mounted (ready) and when its token expired.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (origin && event.origin !== origin) return;
      const type = (event.data as { type?: string } | null)?.type;
      if (type === "chatgate:token-expired") {
        void tokenQuery.refetch();
        return;
      }
      if (type === "chatgate:ready") {
        postAuth();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin, postAuth, tokenQuery]);

  // Push the token whenever it (re)loads — useChatToken refreshes it ~every
  // 12 min, so the iframe always has a valid token.
  useEffect(() => {
    postAuth();
  }, [postAuth]);

  if (!EMBED_URL) {
    return (
      <div className="p-6 text-sm text-red-600">
        Set <code>NEXT_PUBLIC_CHAT_EMBED_URL</code> to the chat app&apos;s{" "}
        <code>/embed/inbox</code> URL to load the inbox.
      </div>
    );
  }

  if (tokenQuery.isError) {
    return (
      <div className="p-6 text-sm text-red-600">
        Couldn&apos;t authorize the chat inbox. Check the CHAT_API_* environment
        variables on the dashboard.
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      src={EMBED_URL}
      title="Customer inbox"
      className={className ?? "h-full w-full border-0"}
      allow="microphone; clipboard-write; autoplay"
    />
  );
}
