import {
  CircleCheck,
  FilePenLine,
  PackageSearch,
  TriangleAlert,
} from "lucide-react";
import type { ProductCatalogSummary as ProductCatalogSummaryData } from "../types/product.types";

const summaryItems = [
  {
    key: "total",
    label: "Total catalog",
    detail: "All registered products",
    icon: PackageSearch,
    tone: "bg-primary/10 text-primary",
  },
  {
    key: "active",
    label: "Active",
    detail: "Published and available",
    icon: CircleCheck,
    tone: "bg-success/10 text-success",
  },
  {
    key: "lowStock",
    label: "Low stock",
    detail: "Below 10 units",
    icon: TriangleAlert,
    tone: "bg-warning/15 text-warning-foreground dark:text-warning",
  },
  {
    key: "drafts",
    label: "Drafts",
    detail: "Awaiting publication",
    icon: FilePenLine,
    tone: "bg-info/10 text-info",
  },
] as const;

export function ProductCatalogSummary({
  summary,
}: {
  summary: ProductCatalogSummaryData;
}) {
  return (
    <section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Catalog summary"
    >
      {summaryItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className="bg-card flex items-center gap-4 rounded-2xl border p-4 shadow-sm"
          >
            <div
              className={`grid size-11 shrink-0 place-items-center rounded-xl ${item.tone}`}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold tracking-tight">
                {summary[item.key]}
              </p>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-muted-foreground truncate text-xs">
                {item.detail}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
