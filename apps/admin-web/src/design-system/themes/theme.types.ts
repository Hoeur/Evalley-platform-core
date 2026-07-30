export const themeTokenKeys = [
  "background", "foreground", "card", "card-foreground", "popover",
  "popover-foreground", "primary", "primary-foreground", "secondary",
  "secondary-foreground", "muted", "muted-foreground", "accent",
  "accent-foreground", "destructive", "destructive-foreground", "border",
  "input", "ring", "sidebar", "sidebar-foreground", "sidebar-primary",
  "sidebar-primary-foreground", "sidebar-accent", "sidebar-accent-foreground",
  "sidebar-border", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
  "success", "success-foreground", "warning", "warning-foreground", "info",
  "info-foreground",
] as const;
export type ThemeTokenKey = (typeof themeTokenKeys)[number];
export type ThemeTokens = Record<ThemeTokenKey, string> & { radius: string };
