import Link from "next/link";
import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { NotFoundError } from "@/core/errors/not-found-error";
import { formatCurrency } from "@/core/utils/currency";
import { formatDate } from "@/core/utils/dates";
import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system/ui/card";
import { getProductRepository, ProductStatusBadge } from "@/features/products";
export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) { await requireModuleAccess("products", "products.read"); const { productId } = await params; let product; try { product = await getProductRepository().findById(productId); } catch (error) { if (error instanceof NotFoundError) notFound(); throw error; } return <PageContainer><PageHeader title={product.name} description={product.sku} actions={<Button asChild><Link href={`/products/${product.id}/edit`}><Pencil />Edit product</Link></Button>} /><div className="grid gap-6 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHeader><CardTitle>Product details</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Category</p><p className="mt-1 font-medium">{product.categoryName ?? "Uncategorized"}</p></div><div><p className="text-xs text-muted-foreground">Status</p><div className="mt-1"><ProductStatusBadge status={product.status} /></div></div><div><p className="text-xs text-muted-foreground">Price</p><p className="mt-1 font-medium">{formatCurrency(product.price)}</p></div><div><p className="text-xs text-muted-foreground">Inventory</p><p className="mt-1 font-medium">{product.stock} units</p></div></CardContent></Card><Card><CardHeader><CardTitle>Timeline</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><div><p className="text-muted-foreground">Created</p><p>{formatDate(product.createdAt)}</p></div><div><p className="text-muted-foreground">Last updated</p><p>{formatDate(product.updatedAt)}</p></div></CardContent></Card></div></PageContainer>; }
