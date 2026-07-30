import type { ThemeTokens } from "./theme.types";

const shared = {
  "destructive": "oklch(0.577 0.245 27.325)",
  "destructive-foreground": "oklch(0.985 0 0)",
  "success": "oklch(0.62 0.17 145)",
  "success-foreground": "oklch(0.985 0 0)",
  "warning": "oklch(0.75 0.16 75)",
  "warning-foreground": "oklch(0.2 0.03 75)",
  "info": "oklch(0.62 0.15 245)",
  "info-foreground": "oklch(0.985 0 0)",
  "radius": "0.625rem",
};

export const defaultLightTheme: ThemeTokens = {
  ...shared,
  background: "oklch(0.985 0.004 85)", foreground: "oklch(0.18 0.02 70)",
  card: "oklch(1 0 0)", "card-foreground": "oklch(0.18 0.02 70)",
  popover: "oklch(1 0 0)", "popover-foreground": "oklch(0.18 0.02 70)",
  primary: "oklch(0.82 0.17 88)", "primary-foreground": "oklch(0.18 0.03 70)",
  secondary: "oklch(0.96 0.01 85)", "secondary-foreground": "oklch(0.25 0.02 70)",
  muted: "oklch(0.96 0.01 85)", "muted-foreground": "oklch(0.5 0.02 70)",
  accent: "oklch(0.94 0.035 90)", "accent-foreground": "oklch(0.23 0.03 70)",
  border: "oklch(0.9 0.012 85)", input: "oklch(0.9 0.012 85)", ring: "oklch(0.72 0.16 88)",
  sidebar: "oklch(0.19 0.025 70)", "sidebar-foreground": "oklch(0.94 0.01 85)",
  "sidebar-primary": "oklch(0.82 0.17 88)", "sidebar-primary-foreground": "oklch(0.18 0.03 70)",
  "sidebar-accent": "oklch(0.27 0.025 70)", "sidebar-accent-foreground": "oklch(0.98 0 0)",
  "sidebar-border": "oklch(0.32 0.02 70)",
  "chart-1": "oklch(0.72 0.18 75)", "chart-2": "oklch(0.64 0.15 150)",
  "chart-3": "oklch(0.6 0.16 245)", "chart-4": "oklch(0.68 0.16 315)", "chart-5": "oklch(0.7 0.15 25)",
};

export const defaultDarkTheme: ThemeTokens = {
  ...defaultLightTheme,
  background: "oklch(0.145 0.012 70)", foreground: "oklch(0.96 0.008 85)",
  card: "oklch(0.19 0.014 70)", "card-foreground": "oklch(0.96 0.008 85)",
  popover: "oklch(0.19 0.014 70)", "popover-foreground": "oklch(0.96 0.008 85)",
  primary: "oklch(0.82 0.17 88)", "primary-foreground": "oklch(0.18 0.03 70)",
  secondary: "oklch(0.25 0.014 70)", "secondary-foreground": "oklch(0.96 0.008 85)",
  muted: "oklch(0.25 0.014 70)", "muted-foreground": "oklch(0.7 0.012 85)",
  accent: "oklch(0.27 0.025 80)", "accent-foreground": "oklch(0.96 0.008 85)",
  border: "oklch(0.3 0.014 70)", input: "oklch(0.3 0.014 70)", ring: "oklch(0.72 0.16 88)",
};
