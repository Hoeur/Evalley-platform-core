import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Order, Refund } from "@platform/ecommerce-core";
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
import { OrderActions } from "./order-actions";
import { OrderPaymentPanel } from "./order-payment-panel";
import { orderCurrency as currency, orderStatusVariant } from "../order-status";

export function OrderDetailWorkspace({
  order,
  refunds,
  canManageRefunds,
}: {
  order: Order;
  refunds: readonly Refund[];
  canManageRefunds: boolean;
}) {
  return (
    <PageContainer className="max-w-[1100px] gap-4 py-5 md:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="rounded-[10px]">
            <Link href="/orders">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-bold">Order {order.number}</h1>
              <StatusBadge variant={orderStatusVariant(order.status)}>{order.status}</StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground">
              Placed {new Date(order.createdAt).toLocaleString("en-US")} · {order.items.length}{" "}
              items
            </p>
          </div>
        </div>
        {canManageRefunds ? (
          <OrderActions orderId={order.id} orderNumber={order.number} status={order.status} />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-base">Order items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold">{item.productName}</TableCell>
                      <TableCell className="font-mono text-xs">{item.sku ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {currency.format(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {currency.format(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="space-y-2 border-t p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{currency.format(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="tabular-nums">{currency.format(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="tabular-nums">{currency.format(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="tabular-nums">-{currency.format(order.discountAmount)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-heading text-base font-bold">
                <span>Total</span>
                <span className="tabular-nums">{currency.format(order.total)}</span>
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
          <OrderPaymentPanel order={order} refunds={refunds} canManage={canManageRefunds} />
        </div>
      </div>
    </PageContainer>
  );
}
