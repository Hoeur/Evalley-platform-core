"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  CheckCheck,
  Download,
  FileText,
  Headset,
  Loader2,
  Mic,
  Paperclip,
  Reply,
  Search,
  Send,
  Smile,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { PageContainer } from "@/components/page/page-container";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/ui/avatar";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Input } from "@/design-system/ui/input";
import { Textarea } from "@/design-system/ui/textarea";
import { Separator } from "@/design-system/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/design-system/ui/popover";
import { cn } from "@/core/utils/cn";
import {
  getChatAssetUrl,
  useChatSocket,
  useChatStore,
  useChatToken,
  useConversations,
  useDmThread,
  type DirectMessage,
  type MessageReaction,
  type UserSummary,
} from "@/features/chat";
import { getChatSocket } from "@/features/chat/lib/chat-socket";

const CANNED_REPLIES = [
  "Thanks for reaching out! Let me check that for you.",
  "Your order is on the way and should arrive soon.",
  "I've escalated this to our team — we'll update you shortly.",
  "Is there anything else I can help you with?",
];
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const;
const COMPOSER_EMOJIS = [
  "😀","😁","😂","😊","😍","😘","😎","🤔","😅","😢","😭","😡",
  "👍","👏","🙏","💪","👌","👋","❤️","🔥","✨","🎉","✅","📦",
] as const;
const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
function formatRelative(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}
function partnerOf(dm: DirectMessage, me: string): UserSummary {
  return dm.senderId === me ? dm.receiver : dm.sender;
}
function previewOf(dm: DirectMessage) {
  if (dm.messageType === "image") return "Photo";
  if (dm.messageType === "voice") return "Voice message";
  if (dm.messageType === "file") return dm.fileName ?? "File";
  return dm.content;
}
function groupReactions(reactions: MessageReaction[] | undefined, me?: string) {
  const map = new Map<string, { emoji: string; count: number; mine: boolean }>();
  for (const r of reactions ?? []) {
    const entry = map.get(r.emoji) ?? { emoji: r.emoji, count: 0, mine: false };
    entry.count += 1;
    if (r.userId === me) entry.mine = true;
    map.set(r.emoji, entry);
  }
  return [...map.values()];
}

export function SupportChatWorkspace() {
  // Mount the shared chat socket for the signed-in agent.
  useChatSocket();
  const tokenQuery = useChatToken();
  const meId = tokenQuery.data?.chatUserId ?? "";
  const conversationsQuery = useConversations();
  const conversations = conversationsQuery.data ?? [];

  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const onlineUserIds = useChatStore((s) => s.onlineUserIds);
  const unreadCounts = useChatStore((s) => s.unreadCounts);
  const setActiveDmUser = useChatStore((s) => s.setActiveDmUser);

  // Default to the first conversation once loaded.
  useEffect(() => {
    if (!activeId && conversations.length && meId) {
      setActiveId(partnerOf(conversations[0], meId).id);
    }
  }, [activeId, conversations, meId]);

  const rows = useMemo(() => {
    if (!meId) return [];
    const q = query.trim().toLowerCase();
    return conversations
      .map((dm) => {
        const partner = partnerOf(dm, meId);
        const storeUnread = unreadCounts[partner.id] ?? 0;
        const derivedUnread =
          dm.senderId === partner.id && !dm.read ? 1 : 0;
        return {
          dm,
          partner,
          unread: Math.max(storeUnread, derivedUnread),
        };
      })
      .filter((row) => {
        const matchesQuery =
          !q ||
          row.partner.username.toLowerCase().includes(q) ||
          previewOf(row.dm).toLowerCase().includes(q);
        const matchesFilter = filter === "unread" ? row.unread > 0 : true;
        return matchesQuery && matchesFilter;
      });
  }, [conversations, meId, query, filter, unreadCounts]);

  const totalUnread = rows.reduce((sum, r) => sum + r.unread, 0);
  const activePartner =
    rows.find((r) => r.partner.id === activeId)?.partner ??
    (activeId
      ? conversations
          .map((dm) => partnerOf(dm, meId))
          .find((p) => p.id === activeId)
      : undefined);

  return (
    <PageContainer className="max-w-[1600px] gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">
            Support Chat
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Live conversations with customers from the app and website.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Headset className="size-3" />
          {totalUnread} unread
        </Badge>
      </div>

      <div className="flex h-[calc(100dvh-11rem)] min-h-[32rem] overflow-hidden rounded-2xl border bg-card">
        {/* Conversation list */}
        <aside className="flex w-full max-w-[20rem] shrink-0 flex-col border-r">
          <div className="space-y-3 border-b p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations..."
                className="h-9 bg-muted pl-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                    filter === f.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tokenQuery.isError ? (
              <p className="px-3 py-10 text-center text-xs text-destructive">
                Chat isn’t connected. Configure the chat token bridge
                (CHAT_API_* env vars) to load live conversations.
              </p>
            ) : null}
            {conversationsQuery.isLoading && !tokenQuery.isError ? (
              <p className="px-3 py-10 text-center text-xs text-muted-foreground">
                Loading conversations…
              </p>
            ) : null}
            {conversationsQuery.isError ? (
              <p className="px-3 py-10 text-center text-xs text-destructive">
                Couldn’t load conversations. Check the chat connection.
              </p>
            ) : null}
            {rows.map(({ dm, partner, unread }) => {
              const online = onlineUserIds.has(partner.id);
              return (
                <button
                  key={partner.id}
                  onClick={() => setActiveId(partner.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b px-3 py-3 text-left transition-colors",
                    partner.id === activeId ? "bg-muted" : "hover:bg-muted/50",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-10">
                      {partner.avatarUrl ? (
                        <AvatarImage
                          src={getChatAssetUrl(partner.avatarUrl) ?? undefined}
                          alt={partner.username}
                        />
                      ) : null}
                      <AvatarFallback>
                        {initials(partner.username)}
                      </AvatarFallback>
                    </Avatar>
                    {online ? (
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-success" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {partner.username}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatRelative(dm.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {dm.senderId === meId ? "You: " : ""}
                      {previewOf(dm) || "No messages yet"}
                    </p>
                    {unread > 0 ? (
                      <span className="mt-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {unread}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
            {!conversationsQuery.isLoading && rows.length === 0 ? (
              <p className="px-3 py-10 text-center text-xs text-muted-foreground">
                No conversations match your filters.
              </p>
            ) : null}
          </div>
        </aside>

        {/* Thread */}
        <ChatThread
          key={activeId ?? "none"}
          partner={activePartner ?? null}
          meId={meId}
        />

        {/* Context panel */}
        {activePartner ? (
          <ContextPanel partner={activePartner} meId={meId} />
        ) : null}
      </div>
    </PageContainer>
  );
}

function ChatThread({
  partner,
  meId,
}: {
  partner: UserSummary | null;
  meId: string;
}) {
  const partnerId = partner?.id ?? null;
  const thread = useDmThread(partnerId);
  const isTyping = useChatStore((s) =>
    partnerId ? Boolean(s.dmTypingUserIds[partnerId]) : false,
  );
  const isOnline = useChatStore((s) =>
    partnerId ? s.onlineUserIds.has(partnerId) : false,
  );
  const lastSeen = useChatStore((s) =>
    partnerId ? s.lastSeenById[partnerId] : undefined,
  );

  const [replyTo, setReplyTo] = useState<DirectMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastLen = thread.messages.length;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastLen, partnerId]);

  if (!partner) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Select a conversation to start replying.
      </section>
    );
  }

  const effectiveLastSeen = lastSeen ?? partner.lastSeenAt ?? null;
  const presenceText = isTyping
    ? "typing…"
    : isOnline
      ? "Online now"
      : effectiveLastSeen
        ? `last seen ${formatDistanceToNow(new Date(effectiveLastSeen), {
            addSuffix: true,
          })}`
        : "Offline";

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b p-3">
        <div className="relative shrink-0">
          <Avatar className="size-9">
            {partner.avatarUrl ? (
              <AvatarImage
                src={getChatAssetUrl(partner.avatarUrl) ?? undefined}
                alt={partner.username}
              />
            ) : null}
            <AvatarFallback>{initials(partner.username)}</AvatarFallback>
          </Avatar>
          {isOnline ? (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-success" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{partner.username}</p>
          <p
            className={cn(
              "text-xs",
              isOnline || isTyping
                ? "font-medium text-success"
                : "text-muted-foreground",
            )}
          >
            {presenceText}
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-1.5 overflow-y-auto bg-muted/30 p-4"
      >
        {thread.hasMore ? (
          <div className="flex justify-center pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => thread.loadMore()}
              disabled={thread.isLoadingMore}
            >
              {thread.isLoadingMore ? "Loading…" : "Load earlier messages"}
            </Button>
          </div>
        ) : null}
        {thread.messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isOwn={m.senderId === meId}
            meId={meId}
            onReply={() => setReplyTo(m)}
            onReact={(emoji) => thread.react(m.id, emoji)}
            onDelete={() => thread.remove(m.id)}
          />
        ))}
        {thread.messages.length === 0 && !thread.isLoading ? (
          <p className="py-10 text-center text-xs text-muted-foreground">
            No messages yet. Say hello 👋
          </p>
        ) : null}
      </div>

      {isTyping ? (
        <div className="flex h-5 flex-none items-center gap-2 bg-muted px-4 text-[11px] text-muted-foreground">
          {partner.username} is typing…
        </div>
      ) : null}

      <Composer
        partnerId={partner.id}
        partnerName={partner.username}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        send={async (input) => {
          await thread.send({ ...input, replyToId: replyTo?.id });
          setReplyTo(null);
        }}
      />
    </section>
  );
}

function MessageBubble({
  message,
  isOwn,
  meId,
  onReply,
  onReact,
  onDelete,
}: {
  message: DirectMessage;
  isOwn: boolean;
  meId: string;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onDelete: () => void;
}) {
  const fileUrl = getChatAssetUrl(message.fileUrl);
  const grouped = groupReactions(message.reactions, meId);
  const showText =
    message.messageType === "text" ||
    (Boolean(message.content) &&
      !(message.messageType === "voice" && message.content === "Voice message"));

  return (
    <div className={cn("group flex", isOwn ? "justify-end" : "justify-start")}>
      <div className="flex max-w-[78%] flex-col gap-1">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm shadow-sm",
            isOwn
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-card text-foreground",
          )}
        >
          {message.replyTo ? (
            <div
              className={cn(
                "mb-1.5 border-l-2 py-0.5 pl-2.5 text-xs",
                isOwn ? "border-primary-foreground/50" : "border-primary",
              )}
            >
              <span className="block truncate font-semibold">
                {message.replyTo.sender.username}
              </span>
              <span className="block truncate opacity-80">
                {message.replyTo.messageType === "image"
                  ? "Photo"
                  : message.replyTo.messageType === "voice"
                    ? "Voice message"
                    : message.replyTo.messageType === "file"
                      ? (message.replyTo.fileName ?? "File")
                      : message.replyTo.content}
              </span>
            </div>
          ) : null}

          {fileUrl && message.messageType === "image" ? (
            <a href={fileUrl} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl}
                alt={message.fileName ?? "Image"}
                className="mb-1 max-h-72 w-auto max-w-full rounded-lg object-contain"
              />
            </a>
          ) : null}

          {fileUrl && message.messageType === "voice" ? (
            <audio controls preload="metadata" src={fileUrl} className="my-1 h-9 w-64 max-w-full" />
          ) : null}

          {fileUrl && message.messageType === "file" ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-1 flex min-w-56 items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-2.5"
            >
              <span className="flex size-9 flex-none items-center justify-center rounded-full bg-primary text-primary-foreground">
                <FileText className="size-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                {message.fileName ?? "Attachment"}
              </span>
              <Download className="size-4 flex-none opacity-70" />
            </a>
          ) : null}

          {message.linkPreview ? (
            <a
              href={message.linkPreview.url}
              target="_blank"
              rel="noreferrer"
              className="mb-1 mt-1 block overflow-hidden rounded-lg border border-border/60 bg-background/40 p-2.5 text-xs"
            >
              <span className="font-semibold text-foreground">
                {message.linkPreview.title ?? message.linkPreview.siteName ?? "Link"}
              </span>
              {message.linkPreview.description ? (
                <span className="mt-0.5 line-clamp-2 block opacity-80">
                  {message.linkPreview.description}
                </span>
              ) : null}
            </a>
          ) : null}

          {showText && message.content ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : null}

          <span
            className={cn(
              "mt-1 flex items-center gap-1 text-[10px]",
              isOwn
                ? "justify-end text-primary-foreground/70"
                : "text-muted-foreground",
            )}
          >
            {formatTime(message.createdAt)}
            {isOwn ? (
              message.read ? (
                <CheckCheck className="size-3" />
              ) : (
                <Check className="size-3" />
              )
            ) : null}
          </span>
        </div>

        {grouped.length ? (
          <div className={cn("flex flex-wrap gap-1", isOwn ? "justify-end" : "")}>
            {grouped.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(r.emoji)}
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px]",
                  r.mine ? "border-primary bg-primary/10" : "border-border bg-muted",
                )}
              >
                <span>{r.emoji}</span>
                <span className="tabular-nums">{r.count}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
            isOwn ? "justify-end" : "",
          )}
        >
          <Popover>
            <PopoverTrigger asChild>
              <button
                aria-label="React"
                className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <Smile className="size-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1.5">
              <div className="flex gap-1">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReact(emoji)}
                    className="rounded-md p-1 text-lg hover:bg-muted"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <button
            aria-label="Reply"
            onClick={onReply}
            className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <Reply className="size-3.5" />
          </button>
          {isOwn ? (
            <button
              aria-label="Delete"
              onClick={onDelete}
              className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Composer({
  partnerId,
  partnerName,
  replyTo,
  onCancelReply,
  send,
}: {
  partnerId: string;
  partnerName: string;
  replyTo: DirectMessage | null;
  onCancelReply: () => void;
  send: (input: {
    content?: string;
    attachment?: File;
    forcedType?: "voice";
  }) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingRef = useRef(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopTyping = () => {
    if (!typingRef.current) return;
    getChatSocket().emit("dm_typing_stop", { receiverId: partnerId });
    typingRef.current = false;
  };
  const notifyTyping = () => {
    if (!typingRef.current) {
      getChatSocket().emit("dm_typing_start", { receiverId: partnerId });
      typingRef.current = true;
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 2000);
  };
  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [partnerId]);

  const doSend = async () => {
    const content = draft.trim();
    if ((!content && !attachment) || busy) return;
    setBusy(true);
    setError("");
    try {
      await send({ content, attachment: attachment ?? undefined });
      setDraft("");
      setAttachment(null);
      stopTyping();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Message could not be sent.");
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void doSend();
    }
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setError("Attachment must be 25 MB or smaller.");
      return;
    }
    setError("");
    setAttachment(file);
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  const toggleRecording = async () => {
    if (recording) {
      recorderRef.current?.state === "recording" && recorderRef.current.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        stopStream();
        setRecording(false);
        if (blob.size === 0) return;
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: blob.type,
        });
        setBusy(true);
        try {
          await send({ content: "Voice message", attachment: file, forcedType: "voice" });
        } catch (e) {
          setError(e instanceof Error ? e.message : "Voice upload failed.");
        } finally {
          setBusy(false);
        }
      };
      recorder.start();
      setRecording(true);
    } catch {
      stopStream();
      setRecording(false);
      setError("Microphone access is required to record a voice message.");
    }
  };

  return (
    <div className="border-t p-3">
      {replyTo ? (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs">
          <Reply className="size-3.5 text-primary" />
          <span className="min-w-0 flex-1 truncate">
            Replying to{" "}
            <strong>{replyTo.sender.username}</strong>:{" "}
            {previewOf(replyTo)}
          </span>
          <button onClick={onCancelReply} aria-label="Cancel reply">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
      ) : null}

      {attachment ? (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs">
          <Paperclip className="size-3.5" />
          <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
          <button onClick={() => setAttachment(null)} aria-label="Remove attachment">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mb-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mb-2 flex flex-wrap gap-1.5">
        {CANNED_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => setDraft(reply)}
            className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted"
          >
            {reply.length > 34 ? `${reply.slice(0, 34)}…` : reply}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <input ref={fileRef} type="file" className="hidden" onChange={onPickFile} />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Attach file"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <Paperclip className="size-4" />
        </Button>
        <Textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            notifyTyping();
          }}
          onKeyDown={onKeyDown}
          placeholder={`Reply to ${partnerName}...`}
          rows={1}
          disabled={busy}
          className="max-h-32 min-h-10 flex-1 resize-none"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Add emoji">
              <Smile className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1.5">
            <div className="grid grid-cols-8 gap-0.5">
              {COMPOSER_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setDraft((d) => d + emoji)}
                  className="rounded-md p-1 text-lg hover:bg-muted"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {draft.trim() || attachment ? (
          <Button onClick={doSend} disabled={busy} className="shrink-0 gap-1.5">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Send
          </Button>
        ) : (
          <Button
            variant={recording ? "destructive" : "default"}
            size="icon"
            className="shrink-0"
            aria-label={recording ? "Stop recording" : "Record voice message"}
            onClick={toggleRecording}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : recording ? (
              <Square className="size-4" />
            ) : (
              <Mic className="size-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function ContextPanel({
  partner,
  meId,
}: {
  partner: UserSummary;
  meId: string;
}) {
  const isOnline = useChatStore((s) => s.onlineUserIds.has(partner.id));
  const lastSeen = useChatStore((s) => s.lastSeenById[partner.id]);
  const effectiveLastSeen = lastSeen ?? partner.lastSeenAt ?? null;
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l p-4 xl:flex">
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar className="size-16" size="lg">
          {partner.avatarUrl ? (
            <AvatarImage
              src={getChatAssetUrl(partner.avatarUrl) ?? undefined}
              alt={partner.username}
            />
          ) : null}
          <AvatarFallback className="text-lg">
            {initials(partner.username)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{partner.username}</p>
          <p className="text-xs text-muted-foreground">
            {isOnline
              ? "Online now"
              : effectiveLastSeen
                ? `Last seen ${formatDistanceToNow(new Date(effectiveLastSeen), {
                    addSuffix: true,
                  })}`
                : "Offline"}
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <p className="text-xs text-muted-foreground">
        Order history, channel, and assignment details will appear here once
        support metadata is connected.
      </p>
    </aside>
  );
}
