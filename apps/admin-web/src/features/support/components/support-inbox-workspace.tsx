"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCheck,
  Globe,
  Headset,
  MapPin,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  ShoppingBag,
  Smartphone,
  Smile,
} from "lucide-react";
import { PageContainer } from "@/components/page/page-container";
import { StatusBadge } from "@/components/status/status-badge";
import { Avatar, AvatarFallback } from "@/design-system/ui/avatar";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Input } from "@/design-system/ui/input";
import { Separator } from "@/design-system/ui/separator";
import { Textarea } from "@/design-system/ui/textarea";
import { cn } from "@/core/utils/cn";
import type {
  ConversationStatus,
  SupportChannel,
  SupportConversation,
  SupportInboxView,
  SupportMessage,
} from "../types";

const CANNED_REPLIES = [
  "Thanks for reaching out! Let me check that for you.",
  "Your order is on the way and should arrive soon.",
  "I've escalated this to our team — we'll update you shortly.",
  "Is there anything else I can help you with?",
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "app", label: "App" },
  { key: "website", label: "Website" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const STATUS_VARIANT: Record<ConversationStatus, "success" | "warning" | "neutral"> = {
  open: "success",
  pending: "warning",
  resolved: "neutral",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelative(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function channelMeta(channel: SupportChannel) {
  return channel === "app"
    ? { label: "App", Icon: Smartphone }
    : { label: "Website", Icon: Globe };
}

function lastMessage(conversation: SupportConversation): SupportMessage | undefined {
  return conversation.messages[conversation.messages.length - 1];
}

function ChannelTag({ channel }: { channel: SupportChannel }) {
  const { label, Icon } = channelMeta(channel);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      <Icon className="size-3" />
      {label}
    </span>
  );
}

export function SupportInboxWorkspace({ view }: { view: SupportInboxView }) {
  const [conversations, setConversations] = useState<SupportConversation[]>(
    view.conversations,
  );
  const [activeId, setActiveId] = useState<string>(view.conversations[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [draft, setDraft] = useState("");
  const localIdRef = useRef(0);
  const threadRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      const matchesQuery =
        !q ||
        c.customerName.toLowerCase().includes(q) ||
        c.customerEmail.toLowerCase().includes(q) ||
        (lastMessage(c)?.body.toLowerCase().includes(q) ?? false);
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "unread"
            ? c.unread > 0
            : c.channel === filter;
      return matchesQuery && matchesFilter;
    });
  }, [conversations, query, filter]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread, 0),
    [conversations],
  );

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.messages.length, activeId]);

  function openConversation(id: string) {
    setActiveId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  }

  function sendReply() {
    const body = draft.trim();
    if (!body || !active) return;
    localIdRef.current += 1;
    const message: SupportMessage = {
      id: `local_${localIdRef.current}`,
      author: "agent",
      senderName: "You",
      body,
      sentAt: new Date().toISOString(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, status: "pending", messages: [...c.messages, message] }
          : c,
      ),
    );
    setDraft("");
  }

  function onComposerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendReply();
    }
  }

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
            {visible.map((c) => {
              const last = lastMessage(c);
              return (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b px-3 py-3 text-left transition-colors",
                    c.id === activeId ? "bg-muted" : "hover:bg-muted/50",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-10">
                      <AvatarFallback>{initials(c.customerName)}</AvatarFallback>
                    </Avatar>
                    {c.online ? (
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-success" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {c.customerName}
                      </p>
                      {last ? (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatRelative(last.sentAt)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {last?.author === "agent" ? "You: " : ""}
                      {last?.body ?? "No messages yet"}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <ChannelTag channel={c.channel} />
                      {c.unread > 0 ? (
                        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                          {c.unread}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
            {visible.length === 0 ? (
              <p className="px-3 py-10 text-center text-xs text-muted-foreground">
                No conversations match your filters.
              </p>
            ) : null}
          </div>
        </aside>

        {/* Message thread */}
        <section className="flex min-w-0 flex-1 flex-col">
          {active ? (
            <>
              <header className="flex items-center gap-3 border-b p-3">
                <div className="relative shrink-0">
                  <Avatar className="size-9">
                    <AvatarFallback>{initials(active.customerName)}</AvatarFallback>
                  </Avatar>
                  {active.online ? (
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-success" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {active.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {active.online ? "Online now" : "Offline"} · via{" "}
                    {channelMeta(active.channel).label}
                  </p>
                </div>
                <StatusBadge variant={STATUS_VARIANT[active.status]}>
                  {active.status}
                </StatusBadge>
                <Button variant="ghost" size="icon" aria-label="Call customer">
                  <Phone className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="More actions">
                  <MoreVertical className="size-4" />
                </Button>
              </header>

              <div
                ref={threadRef}
                className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4"
              >
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex",
                      m.author === "agent" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                        m.author === "agent"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-card text-foreground",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <span
                        className={cn(
                          "mt-1 flex items-center gap-1 text-[10px]",
                          m.author === "agent"
                            ? "justify-end text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatTime(m.sentAt)}
                        {m.author === "agent" ? <CheckCheck className="size-3" /> : null}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-3">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-label="Attach file"
                  >
                    <Paperclip className="size-4" />
                  </Button>
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onComposerKeyDown}
                    placeholder={`Reply to ${active.customerName}...`}
                    rows={1}
                    className="max-h-32 min-h-10 flex-1 resize-none"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-label="Add emoji"
                  >
                    <Smile className="size-4" />
                  </Button>
                  <Button
                    onClick={sendReply}
                    disabled={!draft.trim()}
                    className="shrink-0 gap-1.5"
                  >
                    <Send className="size-4" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Select a conversation to start replying.
            </div>
          )}
        </section>

        {/* Customer context */}
        {active ? (
          <aside className="hidden w-72 shrink-0 flex-col border-l p-4 xl:flex">
            <div className="flex flex-col items-center gap-2 text-center">
              <Avatar className="size-16" size="lg">
                <AvatarFallback className="text-lg">
                  {initials(active.customerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{active.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {active.customerEmail}
                </p>
              </div>
              <StatusBadge variant={active.online ? "success" : "neutral"}>
                {active.online ? "Online" : "Offline"}
              </StatusBadge>
            </div>

            <Separator className="my-4" />

            <dl className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Smartphone className="size-3.5" />
                  Channel
                </dt>
                <dd className="font-medium">{channelMeta(active.channel).label}</dd>
              </div>
              {active.orderRef ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <ShoppingBag className="size-3.5" />
                    Order
                  </dt>
                  <dd className="font-medium tabular-nums">{active.orderRef}</dd>
                </div>
              ) : null}
              {active.location ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5" />
                    Location
                  </dt>
                  <dd className="font-medium">{active.location}</dd>
                </div>
              ) : null}
            </dl>

            <Button variant="outline" size="sm" className="mt-4 w-full">
              View customer profile
            </Button>
          </aside>
        ) : null}
      </div>
    </PageContainer>
  );
}
