import { getChatApiUrl } from "../lib/chat-config";
import type { ChatMessageType } from "../chat.types";

export interface ChatUploadResponse {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  durationMs?: number | null;
}

export interface AttachmentPayload {
  messageType: ChatMessageType;
  fileUrl: string;
  fileName: string;
  fileMimeType: string;
  fileSize: number;
  fileDurationMs?: number;
}

/** Upload a chat attachment/voice file to the Chat API (max 25 MB). */
export async function uploadChatFile(
  token: string,
  file: File,
): Promise<ChatUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${getChatApiUrl()}/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Attachment upload failed (${response.status})`);
  }
  return (await response.json()) as ChatUploadResponse;
}

/** Map an upload result to the attachment fields of a send payload. */
export function toAttachmentPayload(
  uploaded: ChatUploadResponse,
  forcedType?: "voice",
): AttachmentPayload {
  const messageType: ChatMessageType =
    forcedType ??
    (uploaded.mimeType.startsWith("image/")
      ? "image"
      : uploaded.mimeType.startsWith("audio/")
        ? "voice"
        : "file");
  return {
    messageType,
    fileUrl: uploaded.url,
    fileName: uploaded.fileName,
    fileMimeType: uploaded.mimeType,
    fileSize: uploaded.size,
    fileDurationMs: uploaded.durationMs ?? undefined,
  };
}
