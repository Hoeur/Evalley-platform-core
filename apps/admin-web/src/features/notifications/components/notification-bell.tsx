"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Inbox, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminNotification } from "@platform/ecommerce-core";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/design-system/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/design-system/ui/popover";
import { ScrollArea } from "@/design-system/ui/scroll-area";
import { cn } from "@/core/utils/cn";
import {
  deleteNotificationAction,
  fetchAdminInboxAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "../api/notification-inbox.actions";
import type { InboxSnapshot } from "../notification-utils";
import {
  notificationTone,
  notificationTypeLabel,
  timeAgo,
} from "../notification-utils";

const INBOX_KEY = ["admin-inbox"] as const;

export function NotificationBell() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery<InboxSnapshot>({
    queryKey: INBOX_KEY,
    queryFn: () => fetchAdminInboxAction(),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const unread = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: INBOX_KEY });

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationReadAction(id),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      invalidate();
    },
  });
  const markAll = useMutation({
    mutationFn: () => markAllNotificationsReadAction(),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Marked all as read");
      invalidate();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteNotificationAction(id),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      invalidate();
    },
  });

  const busy = markRead.isPending || remove.isPending;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-card relative size-10 rounded-xl"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
        >
          <Bell className="size-[18px]" />
          {unread > 0 ? (
            <span className="bg-primary text-primary-foreground ring-card absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold ring-2">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] overflow-hidden p-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-muted-foreground text-[11px]">
              {unread > 0 ? `${unread} unread` : "You're all caught up"}
            </p>
          </div>
          {unread > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          ) : null}
        </div>
        <ScrollArea className="[&_[data-slot=scroll-area-viewport]]:max-h-[380px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <Inbox className="text-muted-foreground/40 size-7" />
              <p className="text-muted-foreground text-xs">
                No notifications yet
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  busy={busy}
                  onRead={() => markRead.mutate(notification.id)}
                  onDelete={() => remove.mutate(notification.id)}
                />
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  notification,
  onRead,
  onDelete,
  busy,
}: {
  notification: AdminNotification;
  onRead: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const unread = !notification.isRead;
  return (
    <li
      className={cn(
        "group/notif flex gap-3 px-4 py-3",
        unread && "bg-primary/[0.04]",
      )}
    >
      <span
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          unread ? "bg-primary" : "bg-transparent",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <StatusBadge variant={notificationTone(notification.type)}>
            {notificationTypeLabel(notification.type)}
          </StatusBadge>
          <span className="text-muted-foreground ml-auto text-[10px] whitespace-nowrap">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="mt-1 truncate text-[13px] font-medium">
          {notification.title}
        </p>
        <p className="text-muted-foreground line-clamp-2 text-xs">
          {notification.body}
        </p>
      </div>
      <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover/notif:opacity-100 focus-within:opacity-100">
        {unread ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Mark as read"
            onClick={onRead}
            disabled={busy}
          >
            <Check className="size-3.5" />
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive size-7"
          aria-label="Delete notification"
          onClick={onDelete}
          disabled={busy}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}
