"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Package, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Checkbox } from "@/design-system/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatCurrency } from "@/core/utils/currency";
import { formatDate } from "@/core/utils/dates";
import { cn } from "@/core/utils/cn";
import type { Product, ProductInventoryStatus } from "../types/product.types";
import { ProductStatusBadge } from "./product-status-badge";

function InventoryCell({
  stock,
  status,
}: {
  stock: number;
  status: ProductInventoryStatus;
}) {
  const presentation =
    status === "out-of-stock"
      ? {
          label: "Out of stock",
          className: "text-destructive",
          bar: "bg-destructive",
        }
      : status === "low-stock"
        ? {
            label: "Low stock",
            className: "text-warning-foreground dark:text-warning",
            bar: "bg-warning",
          }
        : status === "backorder"
          ? { label: "Backorder", className: "text-primary", bar: "bg-primary" }
          : { label: "In stock", className: "text-success", bar: "bg-success" };
  const percentage = Math.min(100, Math.max(4, (stock / 60) * 100));
  return (
    <div className="w-28">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-medium tabular-nums">{stock}</span>
        <span className={cn("text-[11px] font-medium", presentation.className)}>
          {presentation.label}
        </span>
      </div>
      <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
        <div
          className={cn("h-full rounded-full", presentation.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function createProductColumns({
  canEdit,
  canDelete,
  onDelete,
}: {
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (product: Product) => void;
}): ColumnDef<Product>[] {
  const columns: ColumnDef<Product>[] = [];
  if (canDelete)
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all products"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(Boolean(value))
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    });
  columns.push(
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product" />
      ),
      cell: ({ row }) => (
        <div className="flex min-w-64 items-center gap-3">
          <div className="border-primary/15 bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl border">
            <Package className="size-5" />
          </div>
          <div className="min-w-0">
            <Link
              className="hover:text-primary block truncate font-medium hover:underline"
              href={`/products/${row.original.id}`}
            >
              {row.original.name}
            </Link>
            <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
              {row.original.sku}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-background font-normal">
          {row.original.categoryName ?? "Uncategorized"}
        </Badge>
      ),
      meta: {
        className: "hidden xl:table-cell",
        headerClassName: "hidden xl:table-cell",
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium tabular-nums">
            {formatCurrency(row.original.price)}
          </p>
          <p className="text-muted-foreground text-[11px]">USD</p>
        </div>
      ),
      meta: {
        className: "hidden sm:table-cell",
        headerClassName: "hidden sm:table-cell",
      },
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Inventory" />
      ),
      cell: ({ row }) => (
        <InventoryCell
          stock={row.original.stock}
          status={row.original.inventoryStatus}
        />
      ),
      meta: {
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <ProductStatusBadge status={row.original.status} />,
      meta: {
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
      meta: {
        className: "hidden 2xl:table-cell",
        headerClassName: "hidden 2xl:table-cell",
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${row.original.name}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href={`/products/${row.original.id}`}>
                <Eye />
                View details
              </Link>
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem asChild>
                <Link href={`/products/${row.original.id}/edit`}>
                  <Pencil />
                  Edit product
                </Link>
              </DropdownMenuItem>
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(row.original)}
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  );
  return columns;
}
