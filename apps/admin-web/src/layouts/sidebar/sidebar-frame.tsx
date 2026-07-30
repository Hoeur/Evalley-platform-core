"use client";
import { createContext, useContext, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/design-system/ui/button";
import { cn } from "@/core/utils/cn";
const SidebarContext = createContext(false);
export function SidebarFrame({ collapsible, defaultCollapsed, sidebar, children }: { collapsible: boolean; defaultCollapsed: boolean; sidebar: React.ReactNode; children: React.ReactNode }) { const [collapsed, setCollapsed] = useState(defaultCollapsed); return <SidebarContext value={collapsed}><div className="flex min-h-screen bg-background"><aside className={cn("sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] md:block", collapsed ? "w-20" : "w-[252px]")}>{sidebar}{collapsible && <Button variant="ghost" size="icon" className="absolute -right-3 top-[70px] size-7 rounded-full border bg-card text-foreground shadow-sm" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle sidebar">{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</Button>}</aside><div className="min-w-0 flex-1">{children}</div></div></SidebarContext>; }
export function SidebarLabel({ children }: { children: React.ReactNode }) { const collapsed = useContext(SidebarContext); return <span className={cn(collapsed && "sr-only")}>{children}</span>; }
