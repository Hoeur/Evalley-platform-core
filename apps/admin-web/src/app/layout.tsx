import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { resolveClient } from "@/clients/client-resolver.server";
import { createThemeCss } from "@/design-system/themes/theme.utils";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { public: client } = resolveClient();
  const favicon = client.brand.favicon ?? "/brands/default/favicon.ico";
  return {
    title: {
      default: client.brand.name,
      template: `%s | ${client.brand.shortName}`,
    },
    description: client.brand.description,
    icons: {
      icon: [{ url: favicon }],
      shortcut: [{ url: favicon }],
      apple: client.brand.icon ? [{ url: client.brand.icon }] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { public: client } = resolveClient();
  return (
    <html
      lang={client.localization.defaultLocale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: createThemeCss(client.theme.light, client.theme.dark),
          }}
        />
      </head>
      <body>
        <AppProviders client={client}>{children}</AppProviders>
      </body>
    </html>
  );
}
