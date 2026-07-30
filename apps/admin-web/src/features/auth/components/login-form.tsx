"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/design-system/ui/button";
import { Checkbox } from "@/design-system/ui/checkbox";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import { loginAction, type LoginActionState } from "../api/auth.actions";

const initialState: LoginActionState = {};

export function LoginForm({
  clientKey,
  mockAdapter,
}: {
  clientKey: string;
  mockAdapter: boolean;
}) {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const mockEmail = `admin@${clientKey}.local`;

  return (
    <form action={action} className="space-y-4">
      {state.error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
        >
          {state.error}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-bold">
          Email address
        </Label>
        <div className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 size-[18px] -translate-y-1/2" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={mockAdapter ? mockEmail : undefined}
            required
            className="bg-muted h-11 rounded-xl pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="password" className="text-xs font-bold">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-primary text-xs font-semibold"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <LockKeyhole className="text-muted-foreground absolute top-1/2 left-3 size-[18px] -translate-y-1/2" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            defaultValue={mockAdapter ? "password" : undefined}
            required
            className="bg-muted h-11 rounded-xl pr-10 pl-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="size-[18px]" />
            ) : (
              <Eye className="size-[18px]" />
            )}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="remember" name="remember" defaultChecked />
        <Label htmlFor="remember" className="text-xs font-medium">
          Keep me signed in for 30 days
        </Label>
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-xl font-bold shadow-md"
      >
        {pending ? "Signing in..." : "Sign in"}
        <ArrowRight className="size-4" />
      </Button>
      {mockAdapter ? (
        <p className="text-muted-foreground text-center text-xs">
          Local adapter: {mockEmail} / password
        </p>
      ) : null}
    </form>
  );
}
