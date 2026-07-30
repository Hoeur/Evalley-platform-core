"use client";
import { LayoutPanelLeft } from "lucide-react";
import { Button } from "@/design-system/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/design-system/ui/dropdown-menu";
import { useClientConfig } from "@/providers/client-config-provider";
export function LayoutSwitcher() { const client = useClientConfig(); if (!client.features.layoutSwitcher) return null; const select = async (layout: string) => { await fetch("/api/preferences/layout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ layout }) }); window.location.reload(); }; return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Change dashboard layout"><LayoutPanelLeft /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{client.layout.allowedTypes.map((type) => <DropdownMenuItem key={type} onClick={() => void select(type)} className="capitalize">{type}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>; }
