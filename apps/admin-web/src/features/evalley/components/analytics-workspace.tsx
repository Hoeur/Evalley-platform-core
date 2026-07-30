"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageContainer } from "@/components/page/page-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/design-system/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system/ui/tabs";

const sales = [
  { month: "Jul", sales: 42, orders: 520 }, { month: "Aug", sales: 55, orders: 640 }, { month: "Sep", sales: 49, orders: 610 },
  { month: "Oct", sales: 63, orders: 730 }, { month: "Nov", sales: 57, orders: 690 }, { month: "Dec", sales: 74, orders: 820 },
  { month: "Jan", sales: 68, orders: 780 }, { month: "Feb", sales: 83, orders: 910 }, { month: "Mar", sales: 78, orders: 860 },
  { month: "Apr", sales: 92, orders: 1040 }, { month: "May", sales: 88, orders: 980 }, { month: "Jun", sales: 104, orders: 1140 },
];

const channels = [{ name: "Organic search", value: 38 }, { name: "Direct", value: 24 }, { name: "Paid social", value: 18 }, { name: "Email", value: 12 }, { name: "Referral", value: 8 }];
const categories = [{ name: "Electronics", value: 92 }, { name: "Footwear", value: 74 }, { name: "Home & Kitchen", value: 63 }, { name: "Audio", value: 58 }, { name: "Wearables", value: 41 }, { name: "Cameras", value: 29 }];

const metricGroups = {
  sales: [{ label: "Gross sales", value: "$312,480", change: "+11.2%" }, { label: "Net revenue", value: "$268,140", change: "+9.4%" }, { label: "Tax collected", value: "$28,410", change: "+8.1%" }, { label: "Refunds", value: "$15,930", change: "−2.3%" }, { label: "Avg. order value", value: "$74.10", change: "+3.6%" }],
  customers: [{ label: "New customers", value: "1,204", change: "+9.1%" }, { label: "Returning", value: "642", change: "+4.2%" }, { label: "Repeat rate", value: "34.8%", change: "+1.9%" }, { label: "Abandoned carts", value: "318", change: "−5.4%" }],
  marketplace: [{ label: "GMV", value: "$1.84M", change: "+13.5%" }, { label: "Commission earned", value: "$220K", change: "+12.1%" }, { label: "Active vendors", value: "689", change: "+18" }, { label: "Pending payouts", value: "$9.9K", change: "3 requests" }],
};

function Metrics({ items }: { items: { label: string; value: string; change: string }[] }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{items.map((item) => <Card key={item.label} className="rounded-2xl shadow-none"><CardContent className="p-4"><p className="text-[11px] text-muted-foreground">{item.label}</p><p className="mt-1 font-heading text-xl font-bold">{item.value}</p><span className="mt-2 inline-block rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">{item.change}</span></CardContent></Card>)}</div>;
}

function SalesCharts() {
  return <div className="grid gap-4 xl:grid-cols-3"><Card className="rounded-2xl shadow-none xl:col-span-2"><CardHeader><CardTitle className="font-heading text-base">Revenue trend</CardTitle><CardDescription>Gross sales over the last 12 months</CardDescription></CardHeader><CardContent className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={sales}><defs><linearGradient id="analytics-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-1)" stopOpacity={0.3} /><stop offset="1" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={11} /><YAxis axisLine={false} tickLine={false} fontSize={11} /><Tooltip /><Area type="monotone" dataKey="sales" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#analytics-fill)" /></AreaChart></ResponsiveContainer></CardContent></Card><Card className="rounded-2xl shadow-none"><CardHeader><CardTitle className="font-heading text-base">Sales by channel</CardTitle><CardDescription>Share of marketplace revenue</CardDescription></CardHeader><CardContent className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={channels} layout="vertical"><XAxis type="number" hide /><YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} fontSize={11} /><Tooltip /><Bar dataKey="value" fill="var(--chart-1)" radius={6} /></BarChart></ResponsiveContainer></CardContent></Card></div>;
}

export function AnalyticsWorkspace() {
  return <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7"><div><h1 className="font-heading text-xl font-bold tracking-tight">Analytics</h1><p className="mt-1 text-xs text-muted-foreground">Sales, catalog, customer and marketplace reports.</p></div><Tabs defaultValue="sales"><TabsList className="h-10 rounded-xl"><TabsTrigger value="sales">Sales</TabsTrigger><TabsTrigger value="catalog">Catalog</TabsTrigger><TabsTrigger value="customers">Customers</TabsTrigger><TabsTrigger value="marketplace">Marketplace</TabsTrigger></TabsList><TabsContent value="sales" className="space-y-4"><Metrics items={metricGroups.sales} /><SalesCharts /></TabsContent><TabsContent value="catalog" className="space-y-4"><Metrics items={[{ label: "Published products", value: "1,204", change: "+42" }, { label: "Draft products", value: "48", change: "12 updated" }, { label: "Out of stock", value: "32", change: "−8" }, { label: "Catalog value", value: "$428K", change: "+6.8%" }]} /><Card className="rounded-2xl shadow-none"><CardHeader><CardTitle className="font-heading text-base">Category performance</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={categories}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" fill="var(--chart-1)" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></CardContent></Card></TabsContent><TabsContent value="customers" className="space-y-4"><Metrics items={metricGroups.customers} /><SalesCharts /></TabsContent><TabsContent value="marketplace" className="space-y-4"><Metrics items={metricGroups.marketplace} /><SalesCharts /></TabsContent></Tabs></PageContainer>;
}
