"use client";

import { useMemo, useState } from "react";
import { Filter, MoreHorizontal, Pencil, Search, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { Avatar, AvatarFallback } from "@/design-system/ui/avatar";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent } from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/ui/select";
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
import { deleteAdminAction } from "../users.mutations";
import { initials, type AdminRole, type AdminUser } from "../user.types";
import { AdminFormDialog } from "./admin-form-dialog";

function createdLabel(user: AdminUser) {
  const time = Date.parse(user.createdAt);
  if (Number.isNaN(time) || time === 0) return "—";
  return new Date(time).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UsersWorkspace({
  users,
  roles,
  canManage,
}: {
  users: readonly AdminUser[];
  roles: readonly AdminRole[];
  canManage: boolean;
}) {
  const [query, setQuery] = useState("");
  const [roleSlug, setRoleSlug] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Distinct roles across the loaded page, for the filter dropdown.
  const roleOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) for (const r of u.roles) map.set(r.slug, r.name);
    return [...map.entries()].map(([slug, name]) => ({ slug, name }));
  }, [users]);

  const rows = useMemo(
    () =>
      users.filter((u) => {
        const q = query.toLowerCase();
        const matchesQuery =
          !q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.roles.some((r) => r.name.toLowerCase().includes(q));
        const matchesRole =
          roleSlug === "all" || u.roles.some((r) => r.slug === roleSlug);
        return matchesQuery && matchesRole;
      }),
    [users, query, roleSlug],
  );

  const metrics = useMemo(
    () => [
      { label: "Total admins", value: String(users.length) },
      {
        label: "Super users",
        value: String(users.filter((u) => u.superUser).length),
      },
      { label: "Roles in use", value: String(roleOptions.length) },
    ],
    [users, roleOptions],
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteAdminAction(deleteTarget.id);
    setDeleting(false);
    if (result.ok) {
      toast.success(`${deleteTarget.name} removed`);
      setDeleteTarget(null);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">Users</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Administrative accounts and their assigned roles.
          </p>
        </div>
        {canManage ? (
          <Button className="h-9 rounded-[10px] text-xs" onClick={() => setCreateOpen(true)}>
            <UserPlus className="size-4" />
            Create admin
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label} className="rounded-2xl shadow-none">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-muted-foreground">{m.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold tracking-tight">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-2xl shadow-none">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or role..."
              className="h-9 rounded-[10px] bg-muted pl-9 text-xs"
            />
          </div>
          <Select value={roleSlug} onValueChange={setRoleSlug}>
            <SelectTrigger className="h-9 w-full rounded-[10px] text-xs sm:w-44">
              <Filter className="size-3.5" />
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roleOptions.map((r) => (
                <SelectItem key={r.slug} value={r.slug}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-[11px] font-medium text-muted-foreground">
            {rows.length} admins
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Admin</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Roles</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider">Created</TableHead>
                {canManage ? <TableHead className="h-10 w-10" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id} className="h-16">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback>{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {u.superUser ? (
                        <Badge
                          variant="outline"
                          className="border-info/30 bg-info/10 text-info"
                        >
                          <ShieldCheck className="size-3" />
                          Super
                        </Badge>
                      ) : null}
                      {u.roles.map((r) => (
                        <Badge key={r.id} variant="outline" className="bg-muted text-muted-foreground">
                          {r.name}
                        </Badge>
                      ))}
                      {!u.superUser && u.roles.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No roles</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {createdLabel(u)}
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Actions for ${u.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onSelect={() => setEditAdmin(u)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setDeleteTarget(u)}
                          >
                            <Trash2 className="size-4" />
                            Remove
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
                    No admins match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      {canManage ? (
        <>
          <AdminFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            roles={roles}
          />
          {editAdmin ? (
            <AdminFormDialog
              key={editAdmin.id}
              open={editAdmin !== null}
              onOpenChange={(open) => {
                if (!open) setEditAdmin(null);
              }}
              admin={editAdmin}
              roles={roles}
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
                <AlertDialogTitle>Remove {deleteTarget?.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  They lose access immediately. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Keep admin</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
                  {deleting ? "Removing..." : "Remove admin"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : null}
    </PageContainer>
  );
}
