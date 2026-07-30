"use client";

import type { Brand, Category } from "@platform/ecommerce-core";
import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormActions } from "@/components/forms/form-actions";
import { FormError } from "@/components/forms/form-error";
import { FormSection } from "@/components/forms/form-section";
import { Button } from "@/design-system/ui/button";
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

function dateTimeValue(value?: string | null) {
  return value ? value.slice(0, 16) : "";
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      <FormError message={error} />
    </div>
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
  const [image, setImage] = useState<File>();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
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

      if (image) {
        const imageData = new FormData();
        imageData.append("image", image);
        const upload = await uploadProductImageAction(
          result.productId,
          imageData,
        );
        if (!upload.ok) {
          toast.error(`Product saved, but image failed: ${upload.error}`);
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
      <FormSection
        title="Translations"
        description="English is required; Khmer follows the configured API locale."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="English name"
            error={form.formState.errors.name?.message}
          >
            <Input {...form.register("name")} />
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
            <Textarea {...form.register("description")} />
          </Field>
          <Field
            label="Khmer description"
            error={form.formState.errors.descriptionKm?.message}
          >
            <Textarea {...form.register("descriptionKm")} />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Catalog identity"
        description="Existing product request fields and relationships."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SKU" error={form.formState.errors.sku?.message}>
            <Input {...form.register("sku")} />
          </Field>
          <Field label="Barcode" error={form.formState.errors.barcode?.message}>
            <Input {...form.register("barcode")} />
          </Field>
          <Field label="Slug" error={form.formState.errors.slug?.message}>
            <Input {...form.register("slug")} />
          </Field>
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
                  <SelectTrigger>
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
          <Field label="Product image">
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => setImage(event.target.files?.[0])}
            />
          </Field>
        </div>

        <Controller
          control={form.control}
          name="categoryIds"
          render={({ field }) => (
            <Field
              label="Categories"
              error={form.formState.errors.categoryIds?.message}
            >
              <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={field.value.includes(category.id)}
                      onChange={(event) =>
                        field.onChange(
                          event.target.checked
                            ? [...field.value, category.id]
                            : field.value.filter((id) => id !== category.id),
                        )
                      }
                    />
                    {category.name}
                  </label>
                ))}
                {categories.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No categories configured.
                  </p>
                )}
              </div>
            </Field>
          )}
        />
      </FormSection>

      <FormSection
        title="Pricing and sale"
        description="Pricing and optional scheduled sale fields."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price" error={form.formState.errors.price?.message}>
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
      </FormSection>

      <FormSection
        title="Inventory and shipping measurements"
        description="Stock is updated through Inventory; measurements map to Catalog."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Stock" error={form.formState.errors.stock?.message}>
            <Input
              type="number"
              min={0}
              {...form.register("stock", { valueAsNumber: true })}
            />
          </Field>
          {(["weight", "length", "width", "height"] as const).map((name) => (
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
          ))}
        </div>
      </FormSection>

      <FormSection title="Publishing">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Field
                label="Status"
                error={form.formState.errors.status?.message}
              >
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
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
                    Maps to is_featured.
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        </div>
      </FormSection>

      <FormActions>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : product ? "Save changes" : "Create product"}
        </Button>
      </FormActions>
    </form>
  );
}
