import { describe, expect, it } from "vitest";
import { defaultDarkTheme, defaultLightTheme } from "./default-theme";
import { createThemeCss, createThemeStyleVariables } from "./theme.utils";
describe("theme utilities", () => { it("generates semantic style variables", () => { expect(createThemeStyleVariables(defaultLightTheme)["--primary"]).toBe(defaultLightTheme.primary); }); it("creates light and dark scopes", () => { const css = createThemeCss(defaultLightTheme, defaultDarkTheme); expect(css).toContain(":root{"); expect(css).toContain(".dark{"); }); });
