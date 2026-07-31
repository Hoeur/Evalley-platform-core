"use server";

import { revalidatePath } from "next/cache";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getClientAccessToken } from "@/core/auth/session-cookie.server";
import { serverApiRequest } from "@/core/http/api-client.server";
import { normalizeError } from "@/core/http/normalize-error";
import type { RoleInput } from "./role.types";

type MutationResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function authHeaders(): Promise<Record<string, string>> {
  const accessToken = await getClientAccessToken();
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

function toBody(input: RoleInput) {
  return {
    name: input.name,
    ...(input.slug ? { slug: input.slug } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.isDefault !== undefined ? { is_default: input.isDefault } : {}),
    permissions: [...input.permissions],
  };
}

function fail(error: unknown): MutationResult {
  const details = normalizeError(error);
  return { ok: false, error: details.message, fieldErrors: details.fieldErrors };
}

export async function createRoleAction(input: RoleInput): Promise<MutationResult> {
  try {
    await requireModuleAccess("roles", "roles.manage");
    await serverApiRequest("/roles", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(toBody(input)),
    });
    revalidatePath("/roles");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateRoleAction(
  id: number,
  input: RoleInput,
): Promise<MutationResult> {
  try {
    await requireModuleAccess("roles", "roles.manage");
    await serverApiRequest(`/roles/${id}`, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(toBody(input)),
    });
    revalidatePath("/roles");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteRoleAction(id: number): Promise<MutationResult> {
  try {
    await requireModuleAccess("roles", "roles.manage");
    await serverApiRequest(`/roles/${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    revalidatePath("/roles");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
