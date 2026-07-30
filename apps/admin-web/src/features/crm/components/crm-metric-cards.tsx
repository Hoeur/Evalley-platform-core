import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/ui/card";
import type { CrmMetric } from "../api/crm-workspaces.server";

export function CrmMetricCards({ metrics }: { metrics: readonly CrmMetric[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardHeader>
            <CardDescription>{metric.label}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {metric.value}
            </CardTitle>
            <p className="text-muted-foreground text-xs">{metric.hint}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
