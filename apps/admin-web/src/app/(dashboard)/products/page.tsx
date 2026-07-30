import Link from "next/link";
import { Plus } from "lucide-react";
import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/design-system/ui/button";
import { getProductRepository, parseProductFilters, ProductCatalogSummary, ProductExportButton, ProductTable } from "@/features/products";
export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [{ user }, params] = await Promise.all([requireModuleAccess("products", "products.read"), searchParams]); const filters = parseProductFilters(params); const repository = getProductRepository(); const [result, summary] = await Promise.all([repository.list(filters), repository.summary()]); const canCreate = hasPermission(user.permissions, "products.create"); return <PageContainer><PageHeader title="Product catalog" description="Manage product information, publishing status, pricing, and inventory." actions={<><ProductExportButton />{canCreate && <Button asChild><Link href="/products/new"><Plus />Add product</Link></Button>}</>} /><ProductCatalogSummary summary={summary} /><ProductTable products={result.items} total={result.total} categories={summary.categories} page={result.page} pageCount={result.pageCount} limit={result.limit} canEdit={hasPermission(user.permissions, "products.update")} canDelete={hasPermission(user.permissions, "products.delete")} /></PageContainer>; }
