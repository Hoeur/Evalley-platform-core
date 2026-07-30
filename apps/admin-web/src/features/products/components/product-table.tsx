"use client";

import { useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/design-system/ui/button";
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
import type { Product } from "../types/product.types";
import { deleteProductsAction } from "../api/product.mutations";
import { createProductColumns } from "./product-columns";
import { ProductFilters } from "./product-filters";

export function ProductTable({
  products,
  total,
  categories,
  page,
  pageCount,
  limit,
  canEdit,
  canDelete,
}: {
  products: Product[];
  total: number;
  categories: string[];
  page: number;
  pageCount: number;
  limit: number;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [targets, setTargets] = useState<Product[]>([]);
  const [pending, startTransition] = useTransition();
  const columns = useMemo(
    () =>
      createProductColumns({
        canEdit,
        canDelete,
        onDelete: (product) => setTargets([product]),
      }),
    [canDelete, canEdit],
  );
  const confirmDelete = () =>
    targets.length &&
    startTransition(async () => {
      const result = await deleteProductsAction(
        targets.map((product) => product.id),
      );
      if (result.ok) {
        toast.success(
          `${targets.length} product${targets.length === 1 ? "" : "s"} deleted`,
        );
        setTargets([]);
        router.refresh();
      } else toast.error(result.error);
    });

  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        total={total}
        entityName="product"
        page={page}
        pageCount={pageCount}
        limit={limit}
        toolbar={<ProductFilters categories={categories} total={total} />}
        bulkActions={
          canDelete
            ? (selectedProducts) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setTargets(selectedProducts)}
                >
                  <Trash2 />
                  Delete selected
                </Button>
              )
            : undefined
        }
      />
      <AlertDialog
        open={targets.length > 0}
        onOpenChange={(open) => !open && setTargets([])}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{" "}
              {targets.length > 1 ? `${targets.length} products` : "product"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {targets.length > 1
                ? "The selected products will be permanently removed from the catalog."
                : `This permanently removes ${targets[0]?.name}.`}{" "}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={confirmDelete}
            >
              {pending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
