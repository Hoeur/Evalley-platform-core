import type {
  CrmLeadRecord,
  CrmLeadStatus,
} from "@platform/crm-core/api-client";
import { Badge } from "@/design-system/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/ui/table";

const leadStageTone: Record<
  CrmLeadStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  NEW: "outline",
  CONTACTED: "secondary",
  QUALIFIED: "default",
  UNQUALIFIED: "destructive",
  CONVERTED: "default",
};

function formatCurrency(value: number | null, currency: string): string {
  if (value === null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("en-US")}`;
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function LeadStageBadge({ status }: { status: CrmLeadRecord["status"] }) {
  return <Badge variant={leadStageTone[status.key]}>{status.name}</Badge>;
}

export function LeadsTable({ leads }: { leads: readonly CrmLeadRecord[] }) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-right">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground h-32 text-center"
              >
                No leads match the current view.
              </TableCell>
            </TableRow>
          ) : null}
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <div className="font-medium">
                  {lead.firstName} {lead.lastName}
                </div>
                <div className="text-muted-foreground text-xs">
                  {lead.email ?? lead.phone ?? "No contact details"}
                </div>
              </TableCell>
              <TableCell>{lead.companyName ?? "—"}</TableCell>
              <TableCell>
                <LeadStageBadge status={lead.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {lead.assignedUserId
                  ? `User ${lead.assignedUserId.slice(0, 8)}`
                  : "Unassigned"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(lead.estimatedValue, lead.currency)}
              </TableCell>
              <TableCell className="text-muted-foreground text-right tabular-nums">
                {formatDate(lead.updatedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
