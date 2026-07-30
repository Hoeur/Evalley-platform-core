"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/design-system/ui/button";
import { useClientConfig } from "@/providers/client-config-provider";
export function ThemeSwitcher() { const { setTheme, resolvedTheme } = useTheme(); const client = useClientConfig(); if (!client.features.themeSwitcher) return null; const dark = resolvedTheme === "dark"; return <Button variant="ghost" size="icon" aria-label="Toggle color theme" onClick={() => setTheme(dark ? "light" : "dark")}>{dark ? <Sun /> : <Moon />}</Button>; }
