import type { ThemeTokens } from "@/design-system/themes/theme.types";

export type LayoutType = "sidebar" | "compact" | "topbar";
export type Density = "compact" | "comfortable";
export const moduleKeys = [
  "dashboard",
  "analytics",
  "products",
  "variants",
  "attributes",
  "inventory",
  "categories",
  "promotions",
  "reviews",
  "content",
  "orders",
  "returns",
  "shipments",
  "customers",
  "vendors",
  "withdrawals",
  "ledger",
  "marketing",
  "shipping",
  "reports",
  "properties",
  "bookings",
  "tenants",
  "leases",
  "payments",
  "maintenance",
  "users",
  "crm",
  "crmLeads",
  "modules",
  "settings",
] as const;
export type ModuleKey = (typeof moduleKeys)[number];

export type ClientPublicConfig = {
  key: string;
  brand: {
    name: string;
    shortName: string;
    description?: string;
    logo: string;
    logoDark?: string;
    icon?: string;
    favicon?: string;
    loginArtwork?: string;
  };
  theme: {
    light: ThemeTokens;
    dark: ThemeTokens;
    fontSans?: string;
    fontHeading?: string;
  };
  layout: {
    defaultType: LayoutType;
    allowedTypes: LayoutType[];
    density: Density;
    sidebarCollapsible: boolean;
    sidebarDefaultCollapsed: boolean;
    headerSticky: boolean;
    contentWidth: "full" | "contained";
  };
  modules: ModuleKey[];
  availableModules: ModuleKey[];
  features: {
    darkMode: boolean;
    themeSwitcher: boolean;
    layoutSwitcher: boolean;
    notifications: boolean;
    commandMenu: boolean;
    globalSearch: boolean;
    languageSwitcher: boolean;
  };
  localization: { defaultLocale: string; supportedLocales: string[] };
};

export type ClientServerConfig = {
  api: {
    baseUrl: string;
    adapter: "mock" | "standard" | "legacy";
    timeoutMs: number;
  };
  auth: { adapter: "mock" | "ecommerce-api" };
};

export type ClientConfig = {
  public: ClientPublicConfig;
  server: ClientServerConfig;
};
