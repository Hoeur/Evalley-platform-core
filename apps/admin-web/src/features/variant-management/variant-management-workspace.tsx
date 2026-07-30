"use client";

import type {
  AttributeSet,
  Product,
  PublishStatus,
} from "@platform/ecommerce-core";
import {
  Boxes,
  DollarSign,
  Eye,
  Package,
  Pencil,
  Plus,
  Search,
  Store,
  Tag,
  Trash2,
} from "lucide-react";
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
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Icon className="text-muted-foreground size-4" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {description && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function attributeLabels(variant: Product) {
  return variant.attributes
    .map((attribute) =>
      attribute.value
        ? `${attribute.attribute}: ${attribute.value}`
        : attribute.attribute,
    )
    .filter(Boolean);
}

function combination(variant: Product) {
  const labels = attributeLabels(variant);
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

  const selectedChips = usableAttributeSets
    .filter((set) => selectedValues[set.id])
    .map((set) => ({
      setName: set.name,
      valueName:
        set.values.find((value) => value.id === selectedValues[set.id])?.name ??
        "",
    }));

  const priceValid = Number.isFinite(form.price) && form.price >= 0;
  const hasCombination =
    Boolean(editing) || Object.keys(selectedValues).length > 0;

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
    const label = variant.name || attributeLabels(variant).join(" / ");
    if (!parent || !window.confirm(`Delete variant "${label}"?`)) return;
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

      <Card className="rounded-2xl shadow-none">
        <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(240px,360px)_1fr] md:items-end">
          <Field label="Parent product">
            <Select value={parent?.id} onValueChange={selectParent}>
              <SelectTrigger className="w-full">
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
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search variant, SKU, or option"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {usableAttributeSets.length === 0 && (
        <Card className="border-warning/40 bg-warning/5 rounded-2xl shadow-none">
          <CardContent className="py-4 text-sm">
            Create an attribute set with at least one value before generating
            variants.
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden rounded-2xl shadow-none">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="bg-muted grid size-9 place-items-center rounded-lg">
            <Store className="text-muted-foreground size-4" />
          </div>
          <div>
            <p className="font-semibold">
              {parent?.name ?? "No product selected"}
            </p>
            <p className="text-muted-foreground text-xs">
              {variants.length}{" "}
              {variants.length === 1 ? "variant" : "variants"} from the catalog
              API.
            </p>
          </div>
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
            {visibleVariants.map((variant) => {
              const labels = attributeLabels(variant);
              return (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {variant.name || "Untitled variant"}
                      {variant.featured && (
                        <Badge variant="outline" className="font-normal">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {labels.length ? (
                        labels.map((label) => (
                          <Badge
                            key={label}
                            variant="outline"
                            className="font-normal"
                          >
                            {label}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {variant.sku || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {variant.salePrice != null ? (
                      <span>
                        <span className="font-medium">
                          {currency.format(variant.salePrice)}
                        </span>
                        <span className="text-muted-foreground ml-1 text-xs line-through">
                          {currency.format(variant.price)}
                        </span>
                      </span>
                    ) : (
                      <span className="font-medium">
                        {currency.format(variant.price)}
                      </span>
                    )}
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
              );
            })}
            {visibleVariants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center">
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <Boxes className="size-6" />
                    <span className="text-sm">
                      {parent
                        ? "No variants configured for this product."
                        : "Select a parent product to manage its variants."}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
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

          <div className="space-y-6">
            {editing ? (
              <Section
                icon={Boxes}
                title="Combination"
                description="The attribute combination is fixed after creation."
              >
                <div className="flex flex-wrap gap-1">
                  {attributeLabels(editing).length ? (
                    attributeLabels(editing).map((label) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No attribute details
                    </span>
                  )}
                </div>
              </Section>
            ) : (
              <Section
                icon={Boxes}
                title="Attributes"
                description="Pick one value from each set that applies — at least one is required."
              >
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
                        <SelectTrigger className="w-full">
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
                {selectedChips.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-muted-foreground text-xs">
                      Combination:
                    </span>
                    {selectedChips.map((chip) => (
                      <Badge key={chip.setName} variant="secondary">
                        {chip.setName}: {chip.valueName}
                      </Badge>
                    ))}
                  </div>
                )}
              </Section>
            )}

            <Section icon={Tag} title="Identity">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="SKU">
                  <Input
                    value={form.sku}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        sku: event.target.value,
                      }))
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
              </div>
            </Section>

            <Section icon={DollarSign} title="Pricing & sale">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price" required>
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
              </div>
            </Section>

            <Section icon={Package} title="Shipping measurements">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              </div>
            </Section>

            <Section icon={Eye} title="Publishing">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Status">
                  <Select
                    value={form.status}
                    onValueChange={(status: PublishStatus) =>
                      setForm((value) => ({ ...value, status }))
                    }
                  >
                    <SelectTrigger className="w-full">
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
            </Section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={pending || !hasCombination || !priceValid}
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
