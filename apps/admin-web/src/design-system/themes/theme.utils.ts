import type { ThemeTokens } from "./theme.types";

export function createThemeStyleVariables(theme: ThemeTokens) {
  return Object.fromEntries(
    Object.entries(theme).map(([key, value]) => [`--${key}`, value]),
  ) as Record<`--${string}`, string>;
}

export function createThemeCss(light: ThemeTokens, dark: ThemeTokens) {
  const serialize = (theme: ThemeTokens) =>
    Object.entries(theme).map(([key, value]) => `--${key}:${value};`).join("");
  return `:root{${serialize(light)}}.dark{${serialize(dark)}}`;
}
