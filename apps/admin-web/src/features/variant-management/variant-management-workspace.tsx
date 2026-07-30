"use client";

import type {
  AttributeSet,
  Product,
  PublishStatus,
} from "@platform/ecommerce-core";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent } from "@/design-system/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/ui/select";
import { Switch } from "@/design-system/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/ui/table";
import { Textarea } from "@/design-system/ui/textarea";
import {
  createVariantAction,
  deleteVariantAction,
  updateVariantAction,
} from "./mutations";
import type { VariantDetailsValues } from "./schemas";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const emptyVariant: VariantDetailsValues = {
  name: "",
  description: "",
  nameKm: "",
  descriptionKm: "",
  sku: "",
  barcode: "",
  price: 0,
  salePrice: null,
  saleStartsAt: null,
  saleEndsAt: null,
  weight: null,
  length: null,
  width: null,
  height: null,
  status: "draft",
  featured: false,
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function combination(variant: Product) {
  const labels = variant.attributes
    .map((attribute) =>
      attribute.value
        ? `${attribute.attribute}: ${attribute.value}`
        : attribute.attribute,
    )
    .filter(Boolean);
  return labels.length ? labels.join(" · ") : "No attribute details";
}

export function VariantManagementWorkspace({
  products,
  parent,
  variants,
  attributeSets,
  canManage,
}: {
  products: readonly Product[];
  parent?: Product;
  variants: readonly Product[];
  attributeSets: readonly AttributeSet[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product>();
  const [form, setForm] = useState(emptyVariant);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    {},
  );

  const visibleVariants = useMemo(
    () =>
      variants.filter((variant) =>
        `${variant.name} ${variant.sku} ${combination(variant)}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, variants],
  );
  const usableAttributeSets = attributeSets.filter(
    (set) => set.values.length > 0,
  );

  function selectParent(productId: string) {
    router.push(`/variants?productId=${productId}`);
  }

  function openVariant(variant?: Product) {
    setEditing(variant);
    setForm(
      variant
        ? {
            name: variant.name,
            description: variant.description ?? "",
            nameKm: variant.translations.km?.name ?? "",
            descriptionKm: variant.translations.km?.description ?? "",
            sku: variant.sku,
            barcode: variant.barcode ?? "",
            price: variant.price,
            salePrice: variant.salePrice,
            saleStartsAt: variant.saleStartsAt?.slice(0, 16) ?? null,
            saleEndsAt: variant.saleEndsAt?.slice(0, 16) ?? null,
            weight: variant.weight,
            length: variant.length,
            width: variant.width,
            height: variant.height,
            status: variant.status,
            featured: variant.featured,
          }
        : emptyVariant,
    );
    setSelectedValues({});
    setDialogOpen(true);
  }

  function saveVariant() {
    if (!parent) return;
    startTransition(async () => {
      const result = editing
        ? await updateVariantAction(parent.id, editing.id, form)
        : await createVariantAction(parent.id, {
            ...form,
            attributeValueIds: Object.values(selectedValues),
          });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Variant updated" : "Variant created");
      setDialogOpen(false);
      router.refresh();
    });
  }

  function removeVariant(variant: Product) {
    if (!parent || !window.confirm(`Delete variant "${variant.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteVariantAction(parent.id, variant.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Variant deleted");
      router.refresh();
    });
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold">Variant setup</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Create product variations from existing catalog attribute values.
          </p>
        </div>
        {canManage && parent && (
          <Button
            disabled={usableAttributeSets.length === 0}
            onClick={() => openVariant()}
          >
            <Plus /> Add variant
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(240px,360px)_1fr]">
        <Field label="Parent product">
          <Select value={parent?.id} onValueChange={selectParent}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} {product.sku ? `(${product.sku})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="relative self-end">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search variant, SKU, or option"
            className="pl-9"
          />
        </div>
      </div>

      {usableAttributeSets.length === 0 && (
        <Card className="border-warning/40 bg-warning/5 rounded-2xl shadow-none">
          <CardContent className="py-4 text-sm">
            Create an attribute set with at least one value before generating
            variants.
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden rounded-2xl shadow-none">
        <div className="border-b p-4">
          <p className="font-semibold">
            {parent?.name ?? "No product selected"}
          </p>
          <p className="text-muted-foreground text-xs">
            {variants.length} variants returned by the catalog API.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleVariants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{variant.name}</TableCell>
                <TableCell>{combination(variant)}</TableCell>
                <TableCell className="font-mono text-xs">
                  {variant.sku || "—"}
                </TableCell>
                <TableCell className="text-right">
                  {currency.format(variant.salePrice ?? variant.price)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      variant.status === "published" ? "default" : "secondary"
                    }
                  >
                    {variant.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {canManage && (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${variant.name}`}
                        onClick={() => openVariant(variant)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${variant.name}`}
                        disabled={pending}
                        onClick={() => removeVariant(variant)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {visibleVariants.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground h-28 text-center"
                >
                  {parent
                    ? "No variants configured for this product."
                    : "No catalog product is available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit variant" : "Add variant"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Product fields can be updated; the attribute combination is fixed after creation."
                : "Choose one value from each attribute set needed for this variant."}
            </DialogDescription>
          </DialogHeader>

          {!editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              {usableAttributeSets.map((set) => (
                <Field key={set.id} label={set.name}>
                  <Select
                    value={selectedValues[set.id] ?? "__none__"}
                    onValueChange={(value) =>
                      setSelectedValues((current) => {
                        const next = { ...current };
                        if (value === "__none__") delete next[set.id];
                        else next[set.id] = value;
                        return next;
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not used</SelectItem>
                      {set.values.map((value) => (
                        <SelectItem key={value.id} value={value.id}>
                          {value.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ))}
            </div>
          )}

          {editing && (
            <div className="bg-muted/30 rounded-lg border p-3 text-sm">
              <span className="font-medium">Options:</span>{" "}
              {combination(editing)}
            </div>
          )}

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="English name (optional)">
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((value) => ({ ...value, name: event.target.value }))
                  }
                />
              </Field>
              <Field label="Khmer name">
                <Input
                  value={form.nameKm}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      nameKm: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="English description">
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      description: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Khmer description">
                <Textarea
                  value={form.descriptionKm}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      descriptionKm: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SKU">
                <Input
                  value={form.sku}
                  onChange={(event) =>
                    setForm((value) => ({ ...value, sku: event.target.value }))
                  }
                />
              </Field>
              <Field label="Barcode">
                <Input
                  value={form.barcode}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      barcode: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Price">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      price: Number(event.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Sale price">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.salePrice ?? ""}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      salePrice:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Sale starts">
                <Input
                  type="datetime-local"
                  value={form.saleStartsAt ?? ""}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      saleStartsAt: event.target.value || null,
                    }))
                  }
                />
              </Field>
              <Field label="Sale ends">
                <Input
                  type="datetime-local"
                  value={form.saleEndsAt ?? ""}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      saleEndsAt: event.target.value || null,
                    }))
                  }
                />
              </Field>
              {(["weight", "length", "width", "height"] as const).map(
                (name) => (
                  <Field
                    key={name}
                    label={name[0].toUpperCase() + name.slice(1)}
                  >
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form[name] ?? ""}
                      onChange={(event) =>
                        setForm((value) => ({
                          ...value,
                          [name]:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        }))
                      }
                    />
                  </Field>
                ),
              )}
              <Field label="Status">
                <Select
                  value={form.status}
                  onValueChange={(status: PublishStatus) =>
                    setForm((value) => ({ ...value, status }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label>Featured</Label>
                  <p className="text-muted-foreground text-xs">
                    Maps to is_featured.
                  </p>
                </div>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(featured) =>
                    setForm((value) => ({ ...value, featured }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                pending ||
                (!editing && Object.keys(selectedValues).length === 0)
              }
              onClick={saveVariant}
            >
              {pending
                ? "Saving..."
                : editing
                  ? "Save variant"
                  : "Create variant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
