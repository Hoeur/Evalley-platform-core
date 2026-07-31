"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Card } from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/design-system/ui/alert-dialog";
import { deleteRoleAction } from "../roles.mutations";
import type { AdminRoleDetail, PermissionGroup } from "../role.types";
import { RoleFormDialog } from "./role-form-dialog";

export function RolesWorkspace({
  roles,
  catalog,
  canManage,
}: {
  roles: readonly AdminRoleDetail[];
  catalog: readonly PermissionGroup[];
  canManage: boolean;
}) {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<AdminRoleDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminRoleDetail | null>(null);
  const [deleting, setDeleting] = useState(false);

  const rows = useMemo(
    () =>
      roles.filter((r) => {
        const q = query.toLowerCase();
        return (
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q)
        );
      }),
    [roles, query],
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteRoleAction(deleteTarget.id);
    setDeleting(false);
    if (result.ok) {
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } else {
      toast.error(result.error);
    }
  }

  function permissionSummary(role: AdminRoleDetail) {
    if (role.syncsAllPermissions) return "All permissions";
    return `${role.permissions.length} permission${role.permissions.length === 1 ? "" : "s"}`;
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">
            Roles &amp; Permissions
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Define roles and control exactly what each one can access.
          </p>
        </div>
        {canManage ? (
          <Button className="h-9 rounded-[10px] text-xs" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create role
          </Button>
        ) : null}
      </div>

      <Card className="overflow-hidden rounded-2xl shadow-none">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles..."
              className="h-9 rounded-[10px] bg-muted pl-9 text-xs"
            />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            {rows.length} roles
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Role</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Permissions</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Flags</TableHead>
                {canManage ? <TableHead className="h-10 w-10" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="h-14">
                  <TableCell>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.description ?? r.slug}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {permissionSummary(r)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {r.isDefault ? (
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                          Default
                        </Badge>
                      ) : null}
                      {r.type ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          {r.type}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Actions for ${r.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onSelect={() => setEditRole(r)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setDeleteTarget(r)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 4 : 3}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No roles found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      {canManage ? (
        <>
          <RoleFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            catalog={catalog}
          />
          {editRole ? (
            <RoleFormDialog
              key={editRole.id}
              open={editRole !== null}
              onOpenChange={(open) => {
                if (!open) setEditRole(null);
              }}
              role={editRole}
              catalog={catalog}
            />
          ) : null}
          <AlertDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Admins with only this role lose its permissions. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Keep role</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete role"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : null}
    </PageContainer>
  );
}
