"use client";

import { useMemo, useState } from "react";
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
import { Separator } from "@/design-system/ui/separator";
import { Switch } from "@/design-system/ui/switch";
import { Textarea } from "@/design-system/ui/textarea";
import { createRoleAction, updateRoleAction } from "../roles.mutations";
import type { AdminRoleDetail, PermissionGroup } from "../role.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing; absent when creating. */
  role?: AdminRoleDetail;
  catalog: readonly PermissionGroup[];
};

export function RoleFormDialog({ open, onOpenChange, role, catalog }: Props) {
  const isEdit = role !== undefined;
  const [name, setName] = useState(role?.name ?? "");
  const [slug, setSlug] = useState(role?.slug ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [isDefault, setIsDefault] = useState(role?.isDefault ?? false);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(role?.permissions ?? []),
  );
  const [saving, setSaving] = useState(false);

  const allFlags = useMemo(
    () =>
      catalog.flatMap((g) =>
        g.modules.flatMap((m) => m.permissions.map((p) => p.permission)),
      ),
    [catalog],
  );

  function toggle(flag: string, on: boolean) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (on) next.add(flag);
      else next.delete(flag);
      return next;
    });
  }

  function toggleModule(flags: readonly string[], on: boolean) {
    setSelected((cur) => {
      const next = new Set(cur);
      for (const f of flags) {
        if (on) next.add(f);
        else next.delete(f);
      }
      return next;
    });
  }

  async function submit() {
    if (!name.trim()) {
      toast.error("Enter a role name.");
      return;
    }
    setSaving(true);
    const input = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      isDefault,
      permissions: [...selected],
    };
    const result = isEdit
      ? await updateRoleAction(role.id, input)
      : await createRoleAction(input);
    setSaving(false);

    if (result.ok) {
      toast.success(isEdit ? "Role updated" : "Role created");
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${role.name}` : "Create role"}</DialogTitle>
          <DialogDescription>
            Name the role and choose exactly which permissions it grants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="role-name">Name</Label>
              <Input
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Catalog Manager"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-slug">Slug</Label>
              <Input
                id="role-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated if blank"
                disabled={isEdit}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role-description">Description</Label>
            <Textarea
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What can this role do?"
              rows={2}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Default role</p>
              <p className="text-xs text-muted-foreground">
                Assigned automatically to new admins.
              </p>
            </div>
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Permissions ({selected.size})
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelected(new Set(allFlags))}
            >
              Select all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[40vh] rounded-lg border p-3">
          <div className="space-y-4">
            {catalog.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No permission catalog available.
              </p>
            ) : null}
            {catalog.map((group) => (
              <div key={group.group} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {group.group}
                </p>
                {group.modules.map((module) => {
                  const flags = module.permissions.map((p) => p.permission);
                  const allOn = flags.every((f) => selected.has(f));
                  return (
                    <div key={module.module} className="rounded-md bg-muted/40 p-2.5">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Checkbox
                          checked={allOn}
                          onCheckedChange={(v) => toggleModule(flags, v === true)}
                        />
                        {module.module}
                      </label>
                      <div className="mt-2 grid gap-1.5 pl-6 sm:grid-cols-2">
                        {module.permissions.map((perm) => (
                          <label
                            key={perm.permission}
                            className="flex items-center gap-2 text-xs"
                            title={perm.description ?? undefined}
                          >
                            <Checkbox
                              checked={selected.has(perm.permission)}
                              onCheckedChange={(v) =>
                                toggle(perm.permission, v === true)
                              }
                            />
                            <span className="truncate">{perm.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
