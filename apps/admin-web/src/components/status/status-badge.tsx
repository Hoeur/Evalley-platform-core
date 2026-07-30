import { Badge } from "@/design-system/ui/badge";
import { cn } from "@/core/utils/cn";
const styles = { success: "border-success/30 bg-success/10 text-success", warning: "border-warning/30 bg-warning/10 text-warning-foreground dark:text-warning", danger: "border-destructive/30 bg-destructive/10 text-destructive", info: "border-info/30 bg-info/10 text-info", neutral: "border-border bg-muted text-muted-foreground" };
export function StatusBadge({ variant = "neutral", children }: { variant?: keyof typeof styles; children: React.ReactNode }) { return <Badge variant="outline" className={cn("capitalize", styles[variant])}>{children}</Badge>; }
