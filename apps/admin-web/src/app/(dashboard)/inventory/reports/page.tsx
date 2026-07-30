import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { InventoryItem, StockMovement } from "@platform/ecommerce-core";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { PageContainer } from "@/components/page/page-container";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Card } from "@/design-system/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/design-system/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/ui/table";

function StockTable({ items }: { items: readonly InventoryItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead className="text-right">On hand</TableHead>
          <TableHead className="text-right">Reserved</TableHead>
          <TableHead className="text-right">Available</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.productId}>
            <TableCell className="font-medium">
              {item.productName ?? `Product #${item.productId}`}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {item.sku ?? "—"}
            </TableCell>
            <TableCell className="text-right">{item.onHand}</TableCell>
            <TableCell className="text-right">{item.reserved}</TableCell>
            <TableCell className="text-right">{item.available}</TableCell>
            <TableCell>
              <Badge variant="secondary">
                {item.status.replaceAll("_", " ")}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-muted-foreground h-24 text-center"
            >
              Nothing to report.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function MovementsTable({ items }: { items: readonly StockMovement[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">Before</TableHead>
          <TableHead className="text-right">After</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((movement) => (
          <TableRow key={movement.id}>
            <TableCell className="font-mono text-xs">
              #{movement.productId}
            </TableCell>
            <TableCell className="capitalize">
              {movement.reason.replaceAll("_", " ")}
            </TableCell>
            <TableCell
              className={
                movement.quantityDelta < 0
                  ? "text-destructive text-right font-semibold"
                  : "text-success text-right font-semibold"
              }
            >
              {movement.quantityDelta > 0
                ? `+${movement.quantityDelta}`
                : movement.quantityDelta}
            </TableCell>
            <TableCell className="text-right">
              {movement.quantityBefore}
            </TableCell>
            <TableCell className="text-right">
              {movement.quantityAfter}
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {new Date(movement.createdAt).toLocaleDateString("en-US")}
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-muted-foreground h-24 text-center"
            >
              No movements recorded.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default async function InventoryReportsPage() {
  await requireModuleAccess("inventory", "inventory.read");
  const core = getEcommerceCore();
  const [lowStock, outOfStock, movements, adjustments] = await Promise.all([
    core.inventory.reportLowStock({ perPage: 50 }),
    core.inventory.reportOutOfStock({ perPage: 50 }),
    core.inventory.reportMovements({ perPage: 50 }),
    core.inventory.reportAdjustments({ perPage: 50 }),
  ]);

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="rounded-[10px]"
        >
          <Link href="/inventory" aria-label="Back to inventory">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">
            Inventory reports
          </h1>
          <p className="text-muted-foreground text-xs">
            Stock health and movement ledger from the commerce API.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl shadow-none">
        <Tabs defaultValue="low-stock" className="w-full">
          <div className="border-b p-3">
            <TabsList>
              <TabsTrigger value="low-stock">
                Low stock ({lowStock.total})
              </TabsTrigger>
              <TabsTrigger value="out-of-stock">
                Out of stock ({outOfStock.total})
              </TabsTrigger>
              <TabsTrigger value="movements">Movements</TabsTrigger>
              <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="low-stock" className="m-0">
            <StockTable items={lowStock.items} />
          </TabsContent>
          <TabsContent value="out-of-stock" className="m-0">
            <StockTable items={outOfStock.items} />
          </TabsContent>
          <TabsContent value="movements" className="m-0">
            <MovementsTable items={movements.items} />
          </TabsContent>
          <TabsContent value="adjustments" className="m-0">
            <MovementsTable items={adjustments.items} />
          </TabsContent>
        </Tabs>
      </Card>
    </PageContainer>
  );
}
