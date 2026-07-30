"use client";

import { ChevronsUpDown, LogOut, User } from "lucide-react";
import type { SessionUser } from "@/core/auth/session.types";
import { logoutAction } from "@/features/auth/api/auth.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/ui/dropdown-menu";
import { SidebarLabel } from "./sidebar-frame";

export function SidebarUserMenu({ user }: { user: SessionUser }) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className="focus-visible:ring-ring hover:bg-sidebar-accent bg-sidebar-accent/70 flex w-full items-center gap-3 rounded-xl p-2.5 text-left outline-none transition-colors focus-visible:ring-2"
        >
          <div className="from-primary to-warning grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br text-xs font-bold text-white">
            {initials}
          </div>
          <SidebarLabel>
            <div className="min-w-0 flex-1">
              <p className="text-sidebar-accent-foreground truncate text-xs font-bold">
                {user.name}
              </p>
              <p className="text-sidebar-foreground/55 truncate text-[10px] capitalize">
                {user.role === "owner" ? "Store owner" : user.role}
              </p>
            </div>
          </SidebarLabel>
          <SidebarLabel>
            <ChevronsUpDown className="text-sidebar-foreground/50 ml-auto size-4 shrink-0" />
          </SidebarLabel>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-[228px]">
        <DropdownMenuLabel>
          <span className="block">{user.name}</span>
          <span className="text-muted-foreground block truncate text-xs font-normal">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User />
          Profile
        </DropdownMenuItem>
        <form action={logoutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
