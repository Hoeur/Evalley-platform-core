"use client";

import type { Brand, Category } from "@platform/ecommerce-core";
import {
  Boxes,
  DollarSign,
  Eye,
  Image as ImageIcon,
  Package,
  Search,
  Store,
  Tag,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormError } from "@/components/forms/form-error";
import { cn } from "@/core/utils/cn";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/ui/card";
import { Checkbox } from "@/design-system/ui/checkbox";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import { ScrollArea } from "@/design-system/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/ui/select";
import { Switch } from "@/design-system/ui/switch";
import { Textarea } from "@/design-system/ui/textarea";
import type { Product } from "../types/product.types";
import {
  productSchema,
  type ProductFormValues,
} from "../schemas/product.schema";
import {
  saveProductAction,
  uploadProductImageAction,
} from "../api/product.mutations";
import { ProductImagesField } from "./product-images-field";

function dateTimeValue(value?: string | null) {
  return value ? value.slice(0, 16) : "";
}

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      <FormError message={error} />
    </div>
  );
}

function SectionCard({
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="text-muted-foreground size-4" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function CategoryPicker({
  categories,
  value,
  onChange,
  error,
}: {
  categories: readonly Category[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      categories.filter((category) =>
        category.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [categories, query],
  );

  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...value, id] : value.filter((item) => item !== id));
  }

  return (
    <Field label="Categories" error={error}>
      <div className="rounded-lg border">
        <div className="flex items-center gap-2 border-b p-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories"
              className="h-8 pl-8"
            />
          </div>
          <Badge variant="secondary" className="shrink-0">
            {value.length} selected
          </Badge>
        </div>
        <ScrollArea className="h-44">
          <div className="grid gap-0.5 p-2 sm:grid-cols-2">
            {filtered.map((category) => (
              <label
                key={category.id}
                className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
              >
                <Checkbox
                  checked={value.includes(category.id)}
                  onCheckedChange={(checked) =>
                    toggle(category.id, checked === true)
                  }
                />
                <span className="truncate">{category.name}</span>
              </label>
            ))}
            {filtered.length === 0 && (
              <p className="text-muted-foreground col-span-full px-2 py-6 text-center text-sm">
                {categories.length === 0
                  ? "No categories configured."
                  : "No categories match your search."}
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </Field>
  );
}

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: Product;
  categories: readonly Category[];
  brands: readonly Brand[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [images, setImages] = useState<File[]>([]);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: "onChange",
    defaultValues: {
      name: product?.translations?.en?.name ?? product?.name ?? "",
      description:
        product?.translations?.en?.description ?? product?.description ?? "",
      nameKm: product?.translations?.km?.name ?? "",
      descriptionKm: product?.translations?.km?.description ?? "",
      sku: product?.sku ?? "",
      barcode: product?.barcode ?? "",
      slug: product?.slug ?? "",
      brandId: product?.brandId ?? null,
      categoryIds: product?.categoryIds ?? [],
      price: product?.price ?? 0,
      salePrice: product?.salePrice ?? null,
      saleStartsAt: dateTimeValue(product?.saleStartsAt) || null,
      saleEndsAt: dateTimeValue(product?.saleEndsAt) || null,
      weight: product?.weight ?? null,
      length: product?.length ?? null,
      width: product?.width ?? null,
      height: product?.height ?? null,
      stock: product?.stock ?? 0,
      status: product?.status ?? "draft",
      featured: product?.featured ?? false,
      order: product?.order ?? 0,
    },
  });

  const { isDirty, isValid } = form.formState;

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [form.formState.isDirty]);

  const submit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await saveProductAction(values, product?.id);
      if (!result.ok) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) =>
            form.setError(field as keyof ProductFormValues, { message }),
          );
        }
        toast.error(result.error);
        return;
      }

      for (const file of images) {
        const imageData = new FormData();
        imageData.append("image", file);
        const upload = await uploadProductImageAction(
          result.productId,
          imageData,
        );
        if (!upload.ok) {
          toast.error(`Product saved, but an image failed: ${upload.error}`);
          router.push(`/products/${result.productId}/edit`);
          return;
        }
      }

      toast.success(product ? "Product updated" : "Product created");
      form.reset(values);
      router.push(`/products/${result.productId}`);
    }),
  );

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Main column */}
        <div className="space-y-6">
          <SectionCard
            icon={Package}
            title="General"
            description="English is required; Khmer follows the configured API locale."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="English name"
                required
                error={form.formState.errors.name?.message}
              >
                <Input
                  {...form.register("name")}
                  placeholder="e.g. Classic Cotton T-Shirt"
                />
              </Field>
              <Field
                label="Khmer name"
                error={form.formState.errors.nameKm?.message}
              >
                <Input {...form.register("nameKm")} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="English description"
                error={form.formState.errors.description?.message}
              >
                <Textarea rows={4} {...form.register("description")} />
              </Field>
              <Field
                label="Khmer description"
                error={form.formState.errors.descriptionKm?.message}
              >
                <Textarea rows={4} {...form.register("descriptionKm")} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            icon={Tag}
            title="Catalog identity"
            description="Product codes and category relationships."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SKU" error={form.formState.errors.sku?.message}>
                <Input {...form.register("sku")} />
              </Field>
              <Field
                label="Barcode"
                error={form.formState.errors.barcode?.message}
              >
                <Input {...form.register("barcode")} />
              </Field>
              <Field
                label="Slug"
                error={form.formState.errors.slug?.message}
                className="sm:col-span-2"
              >
                <Input {...form.register("slug")} placeholder="auto-generated-if-empty" />
              </Field>
            </div>
            <Controller
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <CategoryPicker
                  categories={categories}
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.categoryIds?.message}
                />
              )}
            />
          </SectionCard>

          <SectionCard
            icon={DollarSign}
            title="Pricing & sale"
            description="Base price and an optional scheduled sale."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Price"
                required
                error={form.formState.errors.price?.message}
              >
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  {...form.register("price", { valueAsNumber: true })}
                />
              </Field>
              <Controller
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <Field
                    label="Sale price"
                    error={form.formState.errors.salePrice?.message}
                  >
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? null
                            : Number(event.target.value),
                        )
                      }
                    />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="saleStartsAt"
                render={({ field }) => (
                  <Field
                    label="Sale starts"
                    error={form.formState.errors.saleStartsAt?.message}
                  >
                    <Input
                      type="datetime-local"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(event.target.value || null)
                      }
                    />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="saleEndsAt"
                render={({ field }) => (
                  <Field
                    label="Sale ends"
                    error={form.formState.errors.saleEndsAt?.message}
                  >
                    <Input
                      type="datetime-local"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(event.target.value || null)
                      }
                    />
                  </Field>
                )}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Boxes}
            title="Inventory & shipping"
            description="Stock is updated through Inventory; measurements map to Catalog."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                label="Stock"
                required
                error={form.formState.errors.stock?.message}
              >
                <Input
                  type="number"
                  min={0}
                  {...form.register("stock", { valueAsNumber: true })}
                />
              </Field>
              {(["weight", "length", "width", "height"] as const).map(
                (name) => (
                  <Controller
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <Field
                        label={name[0].toUpperCase() + name.slice(1)}
                        error={form.formState.errors[name]?.message}
                      >
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? null
                                : Number(event.target.value),
                            )
                          }
                        />
                      </Field>
                    )}
                  />
                ),
              )}
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <SectionCard icon={Eye} title="Publishing">
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Field
                  label="Status"
                  error={form.formState.errors.status?.message}
                >
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="featured"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label>Featured product</Label>
                    <p className="text-muted-foreground text-xs">
                      Highlight on storefront surfaces.
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          </SectionCard>

          <SectionCard icon={Store} title="Organization">
            <Controller
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <Field
                  label="Brand"
                  error={form.formState.errors.brandId?.message}
                >
                  <Select
                    value={field.value ?? "__none__"}
                    onValueChange={(value) =>
                      field.onChange(value === "__none__" ? null : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No brand</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Field
              label="Sort order"
              error={form.formState.errors.order?.message}
            >
              <Input
                type="number"
                min={0}
                {...form.register("order", { valueAsNumber: true })}
              />
            </Field>
          </SectionCard>

          <SectionCard icon={ImageIcon} title="Media">
            <ProductImagesField
              existing={product?.imageUrls ?? []}
              files={images}
              onChange={setImages}
            />
          </SectionCard>
        </div>
      </div>

      <FormActions>
        <span className="mr-auto text-xs text-muted-foreground">
          {isDirty ? "Unsaved changes" : "All changes saved"}
        </span>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending || !isDirty || !isValid}>
          {pending ? "Saving..." : product ? "Save changes" : "Create product"}
        </Button>
      </FormActions>
    </form>
  );
}
