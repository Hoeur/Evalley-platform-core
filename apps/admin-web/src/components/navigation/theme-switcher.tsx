"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/core/utils/cn";
import { Button } from "@/design-system/ui/button";
import { useClientConfig } from "@/providers/client-config-provider";

export function ThemeSwitcher({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const client = useClientConfig();
  if (!client.features.themeSwitcher) return null;
  const dark = resolvedTheme === "dark";
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle color theme"
      className={cn("bg-card size-10 rounded-xl", className)}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? (
        <Sun className="size-[18px]" />
      ) : (
        <Moon className="size-[18px]" />
      )}
    </Button>
  );
}
