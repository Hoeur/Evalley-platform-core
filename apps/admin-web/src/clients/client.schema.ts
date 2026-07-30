import { z } from "zod";
import { themeTokensSchema } from "@/design-system/themes/theme.schema";
import { moduleKeys } from "./client.types";

const layoutTypeSchema = z.enum(["sidebar", "compact", "topbar"]);
const moduleKeySchema = z.enum(moduleKeys);

export const clientPublicConfigSchema = z.object({
  key: z.string().regex(/^[a-z0-9-]+$/),
  brand: z.object({
    name: z.string().min(1),
    shortName: z.string().min(1),
    description: z.string().optional(),
    logo: z.string(),
    logoDark: z.string().optional(),
    icon: z.string().optional(),
    favicon: z.string().optional(),
    loginArtwork: z.string().optional(),
  }),
  theme: z.object({
    light: themeTokensSchema,
    dark: themeTokensSchema,
    fontSans: z.string().optional(),
    fontHeading: z.string().optional(),
  }),
  layout: z.object({
    defaultType: layoutTypeSchema,
    allowedTypes: z.array(layoutTypeSchema).min(1),
    density: z.enum(["compact", "comfortable"]),
    sidebarCollapsible: z.boolean(),
    sidebarDefaultCollapsed: z.boolean(),
    headerSticky: z.boolean(),
    contentWidth: z.enum(["full", "contained"]),
  }),
  modules: z.array(moduleKeySchema),
  availableModules: z.array(moduleKeySchema),
  features: z.object({
    darkMode: z.boolean(),
    themeSwitcher: z.boolean(),
    layoutSwitcher: z.boolean(),
    notifications: z.boolean(),
    commandMenu: z.boolean(),
    globalSearch: z.boolean(),
    languageSwitcher: z.boolean(),
  }),
  localization: z.object({
    defaultLocale: z.string(),
    supportedLocales: z.array(z.string()).min(1),
  }),
});

export const clientConfigSchema = z.object({
  public: clientPublicConfigSchema,
  server: z.object({
    api: z.object({
      baseUrl: z.url(),
      adapter: z.enum(["mock", "standard", "legacy"]),
      timeoutMs: z.number().int().positive(),
    }),
    auth: z.object({ adapter: z.enum(["mock", "ecommerce-api"]) }),
  }),
});
