"use server";

import { revalidatePath } from "next/cache";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getClientAccessToken } from "@/core/auth/session-cookie.server";
import { serverApiRequest } from "@/core/http/api-client.server";
import { normalizeError } from "@/core/http/normalize-error";

type MutationResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export type CreateAdminInput = {
  name: string;
  email: string;
  password: string;
  superUser?: boolean;
  roleIds: readonly number[];
};

export type UpdateAdminInput = {
  name?: string;
  email?: string;
  password?: string;
  superUser?: boolean;
  roleIds?: readonly number[];
};

async function authHeaders(): Promise<Record<string, string>> {
  const accessToken = await getClientAccessToken();
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

function fail(error: unknown): MutationResult {
  const details = normalizeError(error);
  return { ok: false, error: details.message, fieldErrors: details.fieldErrors };
}

export async function createAdminAction(
  input: CreateAdminInput,
): Promise<MutationResult> {
  try {
    await requireModuleAccess("users", "users.manage");
    await serverApiRequest("/admin-users", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        password: input.password,
        // The API validates `password` with the `confirmed` rule.
        password_confirmation: input.password,
        super_user: input.superUser ?? false,
        role_ids: [...input.roleIds],
      }),
    });
    revalidatePath("/users");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateAdminAction(
  id: number,
  input: UpdateAdminInput,
): Promise<MutationResult> {
  try {
    await requireModuleAccess("users", "users.manage");
    const body: Record<string, unknown> = {};
    if (input.name !== undefined) body.name = input.name;
    if (input.email !== undefined) body.email = input.email;
    if (input.password) {
      body.password = input.password;
      body.password_confirmation = input.password;
    }
    if (input.superUser !== undefined) body.super_user = input.superUser;
    if (input.roleIds !== undefined) body.role_ids = [...input.roleIds];

    await serverApiRequest(`/admin-users/${id}`, {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    revalidatePath("/users");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteAdminAction(id: number): Promise<MutationResult> {
  try {
    await requireModuleAccess("users", "users.manage");
    await serverApiRequest(`/admin-users/${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    revalidatePath("/users");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
