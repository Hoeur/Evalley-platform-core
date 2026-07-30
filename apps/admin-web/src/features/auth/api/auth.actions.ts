"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/core/auth/auth-service.server";
import { normalizeError } from "@/core/http/normalize-error";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean(),
});

export type LoginActionState = {
  readonly error?: string;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on",
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid login details.",
    };
  }
  try {
    await signIn(parsed.data);
  } catch (error) {
    return { error: normalizeError(error).message };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  await signOut();
  redirect("/login");
}
