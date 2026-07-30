import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveClient } from "@/clients/client-resolver.server";

const bodySchema = z.object({ layout: z.enum(["sidebar", "compact", "topbar"]) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Invalid layout" }, { status: 400 });
  const { public: client } = resolveClient();
  if (!client.features.layoutSwitcher || !client.layout.allowedTypes.includes(parsed.data.layout)) {
    return NextResponse.json({ message: "Layout is not available" }, { status: 403 });
  }
  const cookieStore = await cookies();
  cookieStore.set(`dashboard-layout-${client.key}`, parsed.data.layout, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 31_536_000 });
  return NextResponse.json({ ok: true });
}
