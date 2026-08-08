"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  AnalyticsTrend,
  DashboardSnapshot,
} from "@platform/ecommerce-core";
import { PageContainer } from "@/components/page/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/ui/card";

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatChange(trend: AnalyticsTrend): string {
  if (trend.changePercent === null) return "—";
  const sign = trend.changePercent >= 0 ? "+" : "";
  return `${sign}${trend.changePercent.toFixed(1)}%`;
}

function MetricCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: AnalyticsTrend;
}) {
  const tone = trend.isImprovement
    ? "bg-success/10 text-success"
    : "bg-destructive/10 text-destructive";
  return (
    <Card className="rounded-2xl shadow-none">
      <CardContent className="p-4">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="mt-1 font-heading text-xl font-bold">{value}</p>
        <span
          className={`mt-2 inline-block rounded-full px-2 py-1 text-[10px] font-bold ${tone}`}
        >
          {formatChange(trend)}
        </span>
      </CardContent>
    </Card>
  );
}

export function AnalyticsWorkspace({
  snapshot,
}: {
  snapshot: DashboardSnapshot;
}) {
  const { summary, currency } = snapshot;
  const series = snapshot.revenueSeries.map((point) => ({
    label: point.label,
    revenue: point.revenue,
    orders: point.orders,
  }));

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {snapshot.range.label} · {snapshot.range.startDate} →{" "}
          {snapshot.range.endDate}. Live from the commerce API.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={formatCurrency(summary.revenue.value, currency)}
          trend={summary.revenue}
        />
        <MetricCard
          label="Orders"
          value={summary.orders.value.toLocaleString("en-US")}
          trend={summary.orders}
        />
        <MetricCard
          label="New customers"
          value={summary.newCustomers.value.toLocaleString("en-US")}
          trend={summary.newCustomers}
        />
        <MetricCard
          label="Refund rate"
          value={`${summary.refundRate.value.toFixed(1)}%`}
          trend={summary.refundRate}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl shadow-none xl:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-base">
              Revenue trend
            </CardTitle>
            <CardDescription>
              Revenue per {snapshot.range.granularity}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="analytics-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="1" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value), currency)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#analytics-fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-base">
              Order status
            </CardTitle>
            <CardDescription>{snapshot.orderStatus.total} orders</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...snapshot.orderStatus.slices]} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  fontSize={11}
                />
                <Tooltip />
                <Bar dataKey="count" fill="var(--chart-1)" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-base">Top products</CardTitle>
            <CardDescription>Best sellers in this window</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.topProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No sales yet.</p>
            ) : (
              snapshot.topProducts.map((product) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span className="truncate">
                    {product.name ?? `Product #${product.productId}`}
                  </span>
                  <span className="ml-3 shrink-0 text-muted-foreground">
                    {product.unitsSold} sold ·{" "}
                    {formatCurrency(product.revenue, currency)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-base">Low stock</CardTitle>
            <CardDescription>
              {snapshot.lowStock.total} items need attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.lowStock.items.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Everything is well stocked.
              </p>
            ) : (
              snapshot.lowStock.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span className="truncate">
                    {item.name ?? `Product #${item.productId}`}
                    {item.sku ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {item.sku}
                      </span>
                    ) : null}
                  </span>
                  <span className="ml-3 shrink-0 text-muted-foreground">
                    {item.quantityAvailable} left · {item.status.replaceAll("_", " ")}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
