"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/design-system/ui/button";
import { Checkbox } from "@/design-system/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/ui/dialog";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import { ScrollArea } from "@/design-system/ui/scroll-area";
import { Switch } from "@/design-system/ui/switch";
import { createAdminAction, updateAdminAction } from "../users.mutations";
import type { AdminRole, AdminUser } from "../user.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing; absent when creating. */
  admin?: AdminUser;
  /** Assignable roles from the roles catalog. */
  roles: readonly AdminRole[];
};

export function AdminFormDialog({ open, onOpenChange, admin, roles }: Props) {
  const isEdit = admin !== undefined;
  const [name, setName] = useState(admin?.name ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [password, setPassword] = useState("");
  const [superUser, setSuperUser] = useState(admin?.superUser ?? false);
  const [roleIds, setRoleIds] = useState<Set<number>>(
    () => new Set((admin?.roles ?? []).map((r) => r.id)),
  );
  const [saving, setSaving] = useState(false);

  function toggleRole(id: number, on: boolean) {
    setRoleIds((cur) => {
      const next = new Set(cur);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function submit() {
    if (!name.trim() || !email.trim()) {
      toast.error("Enter a name and email.");
      return;
    }
    if (!isEdit && password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    const result = isEdit
      ? await updateAdminAction(admin.id, {
          name: name.trim(),
          email: email.trim(),
          password: password || undefined,
          superUser,
          roleIds: [...roleIds],
        })
      : await createAdminAction({
          name: name.trim(),
          email: email.trim(),
          password,
          superUser,
          roleIds: [...roleIds],
        });
    setSaving(false);

    if (result.ok) {
      toast.success(isEdit ? "Admin updated" : "Admin created");
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${admin.name}` : "Create admin"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the admin's details, roles, and access."
              : "Create a new administrative account and assign roles."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="admin-name">Full name</Label>
            <Input
              id="admin-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">
              {isEdit ? "New password (leave blank to keep)" : "Password"}
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Super user</p>
              <p className="text-xs text-muted-foreground">
                Bypasses per-permission checks.
              </p>
            </div>
            <Switch checked={superUser} onCheckedChange={setSuperUser} />
          </div>

          <div className="space-y-1.5">
            <Label>Roles</Label>
            <ScrollArea className="h-40 rounded-lg border p-3">
              {roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No roles available.</p>
              ) : (
                <div className="space-y-2">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={roleIds.has(role.id)}
                        onCheckedChange={(v) => toggleRole(role.id, v === true)}
                        disabled={superUser}
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
            {superUser ? (
              <p className="text-xs text-muted-foreground">
                Super users have every permission; role assignments are optional.
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
