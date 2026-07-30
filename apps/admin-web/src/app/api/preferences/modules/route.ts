import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveClient } from "@/clients/client-resolver.server";
import { moduleKeys, type ModuleKey } from "@/clients/client.types";
import { requirePermission } from "@/core/auth/authorize.server";
import { collectDependencies, findEnabledDependents, moduleRules } from "@/modules/module-catalog";
import {
  filterEnabledModulesByApi,
  getEnabledModules,
  modulePreferenceCookieName,
  normalizeEnabledModules,
} from "@/modules/enabled-modules.server";

const requestSchema = z.object({
  module: z.enum(moduleKeys),
  enabled: z.boolean(),
});

export async function POST(request: Request) {
  await requirePermission("modules.manage");
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid module preference." }, { status: 400 });
  }

  const resolvedClient = resolveClient();
  const client = resolvedClient.public;
  const moduleKey = parsed.data.module as ModuleKey;
  if (!client.availableModules.includes(moduleKey)) {
    return NextResponse.json({ message: "This module is not included for this client." }, { status: 403 });
  }
  if (!parsed.data.enabled && moduleRules[moduleKey].locked) {
    return NextResponse.json({ message: "Core modules cannot be disabled." }, { status: 409 });
  }

  const current = await getEnabledModules(client);
  const next = new Set(current);
  if (parsed.data.enabled) {
    next.add(moduleKey);
    for (const dependency of collectDependencies(moduleKey, client.availableModules)) next.add(dependency);
  } else {
    const dependents = findEnabledDependents(moduleKey, current);
    if (dependents.length > 0) {
      return NextResponse.json(
        { message: `Disable ${dependents.join(", ")} first because they depend on this module.` },
        { status: 409 },
      );
    }
    next.delete(moduleKey);
  }

  const enabledModules = filterEnabledModulesByApi(
    normalizeEnabledModules([...next], client),
    resolvedClient.server.api.adapter,
  );
  if (parsed.data.enabled && !enabledModules.includes(moduleKey)) {
    return NextResponse.json(
      { message: "This module requires commerce backend endpoints that are not implemented yet." },
      { status: 409 },
    );
  }
  const response = NextResponse.json({ enabledModules });
  response.cookies.set(modulePreferenceCookieName(client.key), encodeURIComponent(JSON.stringify(enabledModules)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
