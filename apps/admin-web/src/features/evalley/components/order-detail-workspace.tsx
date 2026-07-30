import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Order } from "@platform/ecommerce-core";
import { PageContainer } from "@/components/page/page-container";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/ui/table";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function statusVariant(status: string) {
  if (["completed", "delivered"].includes(status.toLowerCase())) return "success" as const;
  if (["cancelled", "canceled", "failed"].includes(status.toLowerCase())) return "danger" as const;
  return "warning" as const;
}

export function OrderDetailWorkspace({ order }: { order: Order }) {
  return (
    <PageContainer className="max-w-[1100px] gap-4 py-5 md:px-7">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="icon" className="rounded-[10px]">
          <Link href="/orders">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-xl font-bold">Order {order.number}</h1>
          <p className="text-xs text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleString("en-US")} · {order.items.length} items
          </p>
        </div>
        <StatusBadge variant={statusVariant(order.status)}>{order.status}</StatusBadge>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-base">Order items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold">{item.productName}</TableCell>
                    <TableCell className="font-mono text-xs">{item.sku ?? "—"}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right font-bold">
                      {currency.format(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="space-y-2 border-t p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{currency.format(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{currency.format(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{currency.format(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-{currency.format(order.discountAmount)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-heading text-base font-bold">
                <span>Total</span>
                <span>{currency.format(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">Customer #{order.customerId}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Admin customer profiles require the remaining customer-directory API.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span>{order.payment?.status ?? "unpaid"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>{order.payment?.method ?? "—"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
