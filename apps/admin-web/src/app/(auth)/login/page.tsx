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
      <section
        className="relative hidden flex-col justify-between overflow-hidden px-12 py-10 text-white lg:flex"
        style={{
          background:
            "linear-gradient(155deg, oklch(0.3 0.06 162) 0%, oklch(0.17 0.03 165) 55%, oklch(0.12 0.02 165) 100%)",
        }}
      >
        <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.16_160_/_0.45),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.6_0.14_190_/_0.3),transparent_70%)]" />
        <div className="relative flex items-center gap-3">
          <div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white/10 p-0.5 ring-1 ring-white/15 backdrop-blur">
            <BrandIcon brand={client.public.brand} />
          </div>
          <div>
            <p className="font-heading text-lg leading-tight font-bold">
              {client.public.brand.shortName}
            </p>
            <p className="text-[9px] font-bold tracking-[0.17em] text-white/50 uppercase">
              Operations OS
            </p>
          </div>
        </div>
        <div className="relative max-w-md">
          {client.public.brand.loginArtwork ? (
            <div className="relative mb-6 aspect-[3/2] w-full overflow-hidden rounded-3xl bg-white/5 shadow-2xl ring-1 ring-white/10 backdrop-blur">
              <Image
                src={client.public.brand.loginArtwork}
                alt={`${client.public.brand.shortName} brand artwork`}
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 0px"
                className="object-contain p-8"
              />
            </div>
          ) : null}
          <h1 className="font-heading text-4xl leading-tight font-bold tracking-tight">
            Run your operations from one secure workspace.
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            {client.public.brand.description ??
              "Client-aware administration and modular operations."}
          </p>
          <div className="mt-8 flex items-center gap-3 text-xs text-white/60">
            <KeyRound className="size-4 text-[oklch(0.78_0.15_160)]" />
            Session isolated for client: {client.public.key}
          </div>
        </div>
        <p className="relative text-[11px] text-white/45">
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
