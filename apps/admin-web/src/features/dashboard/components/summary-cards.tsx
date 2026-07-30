import { ReceiptText, RotateCcw, TrendingDown, TrendingUp, UserRoundPlus, WalletCards } from "lucide-react";
import type { DashboardMetric } from "../types/dashboard.types";
import { Card, CardContent } from "@/design-system/ui/card";

const icons = [WalletCards, ReceiptText, UserRoundPlus, RotateCcw];
const iconStyles = ["bg-primary/10 text-primary", "bg-info/10 text-info", "bg-success/10 text-success", "bg-chart-4/10 text-chart-4"];

export function SummaryCards({ metrics }: { metrics: DashboardMetric[] }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric, index) => { const Icon = icons[index] ?? WalletCards; const Trend = metric.trend === "up" ? TrendingUp : TrendingDown; return <Card key={metric.label} className="rounded-2xl shadow-none"><CardContent className="p-4"><div className="flex items-center justify-between"><div className={`grid size-10 place-items-center rounded-xl ${iconStyles[index]}`}><Icon className="size-5" /></div><span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success"><Trend className="size-3" />{metric.change.replace(/^\+/, "")}</span></div><p className="mt-3 font-heading text-[26px] font-bold leading-none tracking-tight">{metric.value}</p><p className="mt-1 text-[11px] font-medium text-muted-foreground">{metric.label}</p></CardContent></Card>; })}</div>;
}
