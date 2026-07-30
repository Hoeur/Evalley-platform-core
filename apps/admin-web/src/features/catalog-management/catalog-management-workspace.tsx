"use client";

import type { Brand, Category } from "@platform/ecommerce-core";
import { Image as ImageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Card } from "@/design-system/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/design-system/ui/tabs";
import { Textarea } from "@/design-system/ui/textarea";
import {
  deleteBrandAction,
  deleteCategoryAction,
  saveBrandAction,
  saveCategoryAction,
  uploadBrandLogoAction,
  uploadCategoryImageAction,
} from "./mutations";
import type { BrandFormValues, CategoryFormValues } from "./schemas";

const emptyCategory: CategoryFormValues = {
  name: "",
  description: "",
  nameKm: "",
  descriptionKm: "",
  parentId: null,
  slug: null,
  status: "draft",
  order: 0,
  featured: false,
};

const emptyBrand: BrandFormValues = {
  name: "",
  description: "",
  nameKm: "",
  descriptionKm: "",
  slug: null,
  website: null,
  status: "draft",
  order: 0,
  featured: false,
};

function Status({ status }: { status: "draft" | "published" }) {
  return (
    <Badge variant={status === "published" ? "default" : "secondary"}>
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
}

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

export function CatalogManagementWorkspace({
  categories,
  brands,
  canManage,
}: {
  categories: readonly Category[];
  brands: readonly Brand[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [brandDialog, setBrandDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category>();
  const [editingBrand, setEditingBrand] = useState<Brand>();
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [brandForm, setBrandForm] = useState(emptyBrand);
  const [categoryImage, setCategoryImage] = useState<File>();
  const [brandLogo, setBrandLogo] = useState<File>();

  const filteredCategories = useMemo(
    () =>
      categories.filter((item) =>
        `${item.name} ${item.slug}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [categories, query],
  );
  const filteredBrands = useMemo(
    () =>
      brands.filter((item) =>
        `${item.name} ${item.slug}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [brands, query],
  );
  const categoryNames = useMemo(
    () => new Map(categories.map((item) => [item.id, item.name])),
    [categories],
  );

  function openCategory(category?: Category) {
    setEditingCategory(category);
    setCategoryForm(
      category
        ? {
            name: category.name,
            description: category.description ?? "",
            nameKm: category.translations.km?.name ?? "",
            descriptionKm: category.translations.km?.description ?? "",
            parentId: category.parentId,
            slug: category.slug,
            status: category.status,
            order: category.order,
            featured: category.featured,
          }
        : emptyCategory,
    );
    setCategoryImage(undefined);
    setCategoryDialog(true);
  }

  function openBrand(brand?: Brand) {
    setEditingBrand(brand);
    setBrandForm(
      brand
        ? {
            name: brand.name,
            description: brand.description ?? "",
            nameKm: brand.translations.km?.name ?? "",
            descriptionKm: brand.translations.km?.description ?? "",
            slug: brand.slug,
            website: brand.website,
            status: brand.status,
            order: brand.order,
            featured: brand.featured,
          }
        : emptyBrand,
    );
    setBrandLogo(undefined);
    setBrandDialog(true);
  }

  function saveCategory() {
    startTransition(async () => {
      const result = await saveCategoryAction(
        categoryForm,
        editingCategory?.id,
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (categoryImage) {
        const data = new FormData();
        data.append("image", categoryImage);
        const upload = await uploadCategoryImageAction(result.item.id, data);
        if (!upload.ok) {
          toast.error(`Category saved, but image failed: ${upload.error}`);
          return;
        }
      }
      toast.success(editingCategory ? "Category updated" : "Category created");
      setCategoryDialog(false);
      router.refresh();
    });
  }

  function saveBrand() {
    startTransition(async () => {
      const result = await saveBrandAction(brandForm, editingBrand?.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (brandLogo) {
        const data = new FormData();
        data.append("logo", brandLogo);
        const upload = await uploadBrandLogoAction(result.item.id, data);
        if (!upload.ok) {
          toast.error(`Brand saved, but logo failed: ${upload.error}`);
          return;
        }
      }
      toast.success(editingBrand ? "Brand updated" : "Brand created");
      setBrandDialog(false);
      router.refresh();
    });
  }

  function removeCategory(category: Category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Category deleted");
      router.refresh();
    });
  }

  function removeBrand(brand: Brand) {
    if (!window.confirm(`Delete brand "${brand.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteBrandAction(brand.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Brand deleted");
      router.refresh();
    });
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight">
          Categories & brands
        </h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Organize the product catalog using records stored by the commerce API.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search categories or brands"
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="brands">Brands ({brands.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4">
          <Card className="overflow-hidden rounded-2xl shadow-none">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="font-semibold">Product categories</p>
                <p className="text-muted-foreground text-xs">
                  Parent relationships and storefront publishing state.
                </p>
              </div>
              {canManage && (
                <Button onClick={() => openCategory()}>
                  <Plus /> Add category
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                      {category.featured && (
                        <Badge variant="outline" className="ml-2">
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {category.parentId
                        ? (categoryNames.get(category.parentId) ?? "Unknown")
                        : "Top level"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {category.slug}
                    </TableCell>
                    <TableCell>
                      <Status status={category.status} />
                    </TableCell>
                    <TableCell>{category.order}</TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${category.name}`}
                            onClick={() => openCategory(category)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${category.name}`}
                            disabled={pending}
                            onClick={() => removeCategory(category)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCategories.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground h-28 text-center"
                    >
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="brands" className="mt-4">
          <Card className="overflow-hidden rounded-2xl shadow-none">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="font-semibold">Product brands</p>
                <p className="text-muted-foreground text-xs">
                  Manufacturer identity and storefront visibility.
                </p>
              </div>
              {canManage && (
                <Button onClick={() => openBrand()}>
                  <Plus /> Add brand
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">
                      {brand.name}
                      {brand.featured && (
                        <Badge variant="outline" className="ml-2">
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {brand.slug}
                    </TableCell>
                    <TableCell>{brand.website ?? "—"}</TableCell>
                    <TableCell>
                      <Status status={brand.status} />
                    </TableCell>
                    <TableCell>{brand.order}</TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${brand.name}`}
                            onClick={() => openBrand(brand)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${brand.name}`}
                            disabled={pending}
                            onClick={() => removeBrand(brand)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBrands.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground h-28 text-center"
                    >
                      No brands found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <CategoryDialog
        open={categoryDialog}
        onOpenChange={setCategoryDialog}
        editing={Boolean(editingCategory)}
        form={categoryForm}
        setForm={setCategoryForm}
        categories={categories.filter(
          (category) => category.id !== editingCategory?.id,
        )}
        pending={pending}
        image={categoryImage}
        currentImageUrl={editingCategory?.imageUrl}
        onImageChange={setCategoryImage}
        onSave={saveCategory}
      />
      <BrandDialog
        open={brandDialog}
        onOpenChange={setBrandDialog}
        editing={Boolean(editingBrand)}
        form={brandForm}
        setForm={setBrandForm}
        pending={pending}
        logo={brandLogo}
        currentLogoUrl={editingBrand?.logoUrl}
        onLogoChange={setBrandLogo}
        onSave={saveBrand}
      />
    </PageContainer>
  );
}

function CategoryDialog({
  open,
  onOpenChange,
  editing,
  form,
  setForm,
  categories,
  pending,
  image,
  currentImageUrl,
  onImageChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: boolean;
  form: CategoryFormValues;
  setForm: React.Dispatch<React.SetStateAction<CategoryFormValues>>;
  categories: readonly Category[];
  pending: boolean;
  image?: File;
  currentImageUrl?: string | null;
  onImageChange: (file?: File) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit category" : "Add category"}
          </DialogTitle>
          <DialogDescription>
            Saved directly to the catalog category API.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="English name">
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
                  setForm((value) => ({ ...value, nameKm: event.target.value }))
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
            <Field label="Parent category">
              <Select
                value={form.parentId ?? "__none__"}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    parentId: value === "__none__" ? null : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Top level</SelectItem>
                  {categories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(status: "draft" | "published") =>
                  setForm((current) => ({ ...current, status }))
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
            <Field label="Slug (optional)">
              <Input
                value={form.slug ?? ""}
                onChange={(event) =>
                  setForm((value) => ({ ...value, slug: event.target.value }))
                }
              />
            </Field>
            <Field label="Sort order">
              <Input
                type="number"
                min={0}
                value={form.order}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    order: Number(event.target.value),
                  }))
                }
              />
            </Field>
          </div>
          <ToggleField
            label="Featured category"
            description="Highlight this category in storefront navigation."
            checked={form.featured}
            onCheckedChange={(featured) =>
              setForm((value) => ({ ...value, featured }))
            }
          />
          <ImageUploadField
            label="Category image"
            currentUrl={currentImageUrl}
            file={image}
            onChange={onImageChange}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={pending || !form.name.trim()} onClick={onSave}>
            {pending ? "Saving..." : "Save category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BrandDialog({
  open,
  onOpenChange,
  editing,
  form,
  setForm,
  pending,
  logo,
  currentLogoUrl,
  onLogoChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: boolean;
  form: BrandFormValues;
  setForm: React.Dispatch<React.SetStateAction<BrandFormValues>>;
  pending: boolean;
  logo?: File;
  currentLogoUrl?: string | null;
  onLogoChange: (file?: File) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit brand" : "Add brand"}</DialogTitle>
          <DialogDescription>
            Saved directly to the catalog brand API.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="English name">
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
                  setForm((value) => ({ ...value, nameKm: event.target.value }))
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
            <Field label="Website">
              <Input
                type="url"
                value={form.website ?? ""}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    website: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(status: "draft" | "published") =>
                  setForm((current) => ({ ...current, status }))
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
            <Field label="Slug (optional)">
              <Input
                value={form.slug ?? ""}
                onChange={(event) =>
                  setForm((value) => ({ ...value, slug: event.target.value }))
                }
              />
            </Field>
            <Field label="Sort order">
              <Input
                type="number"
                min={0}
                value={form.order}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    order: Number(event.target.value),
                  }))
                }
              />
            </Field>
          </div>
          <ToggleField
            label="Featured brand"
            description="Highlight this brand on storefront catalog surfaces."
            checked={form.featured}
            onCheckedChange={(featured) =>
              setForm((value) => ({ ...value, featured }))
            }
          />
          <ImageUploadField
            label="Brand logo"
            currentUrl={currentLogoUrl}
            file={logo}
            onChange={onLogoChange}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={pending || !form.name.trim()} onClick={onSave}>
            {pending ? "Saving..." : "Save brand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImageUploadField({
  label,
  currentUrl,
  file,
  onChange,
}: {
  label: string;
  currentUrl?: string | null;
  file?: File;
  onChange: (file?: File) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview ?? currentUrl ?? null;

  return (
    <Field label={label}>
      <div className="flex items-center gap-4">
        <div className="bg-muted flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="text-muted-foreground size-5" />
          )}
        </div>
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => onChange(event.target.files?.[0])}
        />
      </div>
    </Field>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <Label>{label}</Label>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
