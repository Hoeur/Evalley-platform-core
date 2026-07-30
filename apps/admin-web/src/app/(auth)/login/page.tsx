import Image from "next/image";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { resolveClient } from "@/clients/client-resolver.server";
import { BrandIcon } from "@/components/brand/brand-icon";
import { getSession } from "@/core/auth/session.server";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage() {
  const client = resolveClient();
  if (await getSession()) redirect("/dashboard");

  return (
    <div className="bg-card grid min-h-screen lg:grid-cols-2">
      <section className="bg-sidebar text-sidebar-foreground relative hidden flex-col justify-between overflow-hidden px-12 py-10 lg:flex">
        <div className="absolute -top-24 -right-24 size-80 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--sidebar-primary)_32%,transparent),transparent_70%)]" />
        <div className="relative flex items-center gap-3">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground grid size-10 place-items-center overflow-hidden rounded-xl p-0.5 shadow-lg">
            <BrandIcon brand={client.public.brand} />
          </div>
          <div>
            <p className="font-heading text-sidebar-accent-foreground text-lg leading-tight font-bold">
              {client.public.brand.shortName}
            </p>
            <p className="text-sidebar-foreground/50 text-[9px] font-bold tracking-[0.17em] uppercase">
              Operations OS
            </p>
          </div>
        </div>
        <div className="relative max-w-md">
          {client.public.brand.loginArtwork ? (
            <div className="relative mb-5 aspect-[3/2] w-full overflow-hidden rounded-3xl border border-white/5 bg-black/20 shadow-2xl">
              <Image
                src={client.public.brand.loginArtwork}
                alt={`${client.public.brand.shortName} brand artwork`}
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 0px"
                className="object-cover"
              />
            </div>
          ) : null}
          <h1 className="font-heading text-sidebar-accent-foreground text-4xl leading-tight font-bold tracking-tight">
            Run your operations from one secure workspace.
          </h1>
          <p className="text-sidebar-foreground/70 mt-4 text-sm leading-7">
            {client.public.brand.description ??
              "Client-aware administration and modular operations."}
          </p>
          <div className="text-sidebar-foreground/60 mt-8 flex items-center gap-3 text-xs">
            <KeyRound className="text-sidebar-primary size-4" />
            Session isolated for client: {client.public.key}
          </div>
        </div>
        <p className="text-sidebar-foreground/45 relative text-[11px]">
          © 2026 {client.public.brand.shortName} · Secure admin
        </p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-7 lg:hidden">
            <div className="bg-primary text-primary-foreground grid size-10 place-items-center overflow-hidden rounded-xl p-0.5">
              <BrandIcon brand={client.public.brand} />
            </div>
            <p className="font-heading mt-2 font-bold">
              {client.public.brand.shortName}
            </p>
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Welcome back
          </h2>
          <p className="text-muted-foreground mt-1 mb-7 text-sm">
            Sign in to {client.public.brand.shortName}
          </p>
          <LoginForm
            clientKey={client.public.key}
            mockAdapter={client.server.auth.adapter === "mock"}
          />
        </div>
      </section>
    </div>
  );
}
