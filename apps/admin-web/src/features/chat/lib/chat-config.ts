/**
 * Resolves the browser-facing Chat API URLs. Mirrors the standalone client's
 * runtime-config: when the configured URL points at loopback but the page is
 * served from a LAN host, swap in the page host so phones/other devices work.
 */
function resolveBrowserHost(configuredUrl: string) {
  if (typeof window === "undefined") return configuredUrl.replace(/\/$/, "");

  try {
    const url = new URL(configuredUrl);
    const usesLoopback =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const browserUsesLoopback =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (usesLoopback && !browserUsesLoopback)
      url.hostname = window.location.hostname;
    return url.toString().replace(/\/$/, "");
  } catch {
    return configuredUrl.replace(/\/$/, "");
  }
}

/** Base URL for Chat API REST calls (includes the /api prefix). */
export function getChatApiUrl() {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_CHAT_API_URL ?? "http://localhost:3001/api",
  );
}

/** Origin the socket.io client connects to (no /api prefix). */
export function getChatSocketUrl() {
  return resolveBrowserHost(
    process.env.NEXT_PUBLIC_CHAT_SOCKET_URL ?? "http://localhost:3001",
  );
}
