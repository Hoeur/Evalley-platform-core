import { getChatSocketUrl } from "./chat-config";

const UPLOAD_PATH_PREFIX = "/uploads/";

/** Resolve a (possibly relative or stale-host) Chat API asset URL to a
 *  reachable absolute URL against the current Chat API origin. */
export function getChatAssetUrl(value?: string | null) {
  const assetUrl = value?.trim();
  if (!assetUrl) return null;

  try {
    const parsedUrl = new URL(assetUrl, `${getChatSocketUrl()}/`);
    if (parsedUrl.pathname.startsWith(UPLOAD_PATH_PREFIX)) {
      const apiOrigin = new URL(getChatSocketUrl()).origin;
      return `${apiOrigin}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }
  } catch {
    return assetUrl;
  }
  return assetUrl;
}
