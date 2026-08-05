import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../socket.types";
import { getChatSocketUrl } from "./chat-config";

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: ChatSocket | null = null;

/** Lazily create the single shared chat socket (not auto-connected). */
export function getChatSocket(): ChatSocket {
  if (!socket) {
    socket = io(getChatSocketUrl(), {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

/** Set/refresh the bridged access token and connect if not already live. */
export function connectChatSocket(token: string): ChatSocket {
  const s = getChatSocket();
  s.auth = { token };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectChatSocket() {
  // Keep the instance so listeners registered elsewhere survive a reconnect.
  socket?.disconnect();
}
