import "server-only";
import { getSupportInboxData } from "../mock-data";
import type { SupportInboxView } from "../types";

/**
 * Loads the support inbox. Mock-backed for now; swap this for the real
 * chat service (REST + websocket stream) when the backend is ready.
 */
export async function getSupportInbox(): Promise<SupportInboxView> {
  return getSupportInboxData();
}
