"use client";

import { useState } from "react";
import { Blocks, Check, LockKeyhole, Search } from "lucide-react";
import { toast } from "sonner";
import type { ModuleKey } from "@/clients/client.types";
import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { Badge } from "@/design-system/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
import { Switch } from "@/design-system/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/design-system/ui/tabs";

type ModuleMarketplaceItem = {
  key: ModuleKey;
  label: string;
  description: string;
  group: string;
  dependencies: ModuleKey[];
  locked: boolean;
  enabled: boolean;
  enabledByDefault: boolean;
  backendRequired: boolean;
  backendReason?: string;
};

type Filter = "all" | "enabled" | "available";

export function ModuleMarketplace({ clientName, modules }: { clientName: string; modules: ModuleMarketplaceItem[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [enabled, setEnabled] = useState(() => new Set(modules.filter((item) => item.enabled).map((item) => item.key)));
  const [pending, setPending] = useState<ModuleKey | null>(null);
  const search = query.trim().toLowerCase();
  const filtered = modules.filter((item) => {
    const matchesFilter = filter === "all" || (filter === "enabled" ? enabled.has(item.key) : !enabled.has(item.key));
    const matchesSearch = !search || `${item.label} ${item.description} ${item.group}`.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });

  async function updateModule(item: ModuleMarketplaceItem, checked: boolean) {
    setPending(item.key);
    try {
      const response = await fetch("/api/preferences/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: item.key, enabled: checked }),
      });
      const payload = await response.json() as { enabledModules?: ModuleKey[]; message?: string };
      if (!response.ok || !payload.enabledModules) throw new Error(payload.message ?? "Unable to update this module.");
      setEnabled(new Set(payload.enabledModules));
      toast.success(`${item.label} ${checked ? "enabled" : "disabled"}`);
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update this module.");
    } finally {
      setPending(null);
    }
  }

  const enabledCount = enabled.size;
  return (
    <PageContainer className="gap-5 py-5 md:px-7">
      <PageHeader
        title="Module Add-ons"
        description={`Choose which bundled capabilities are active for ${clientName}. Dependencies are handled automatically.`}
        actions={<Badge variant="secondary">{enabledCount} of {modules.length} enabled</Badge>}
      />

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="enabled">Enabled</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search modules..." className="pl-9" />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const isEnabled = enabled.has(item.key);
            return (
              <Card key={item.key} className="min-h-52 rounded-2xl shadow-none">
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Blocks className="size-5" />
                  </div>
                  <CardTitle>{item.label}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                  <CardAction>
                    <Switch
                      aria-label={`${isEnabled ? "Disable" : "Enable"} ${item.label}`}
                      data-module-key={item.key}
                      checked={isEnabled}
                      disabled={item.locked || item.backendRequired || pending !== null}
                      onCheckedChange={(checked) => updateModule(item, checked)}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent className="mt-auto space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{item.group}</Badge>
                    {item.locked ? <Badge variant="secondary"><LockKeyhole className="size-3" /> Core</Badge> : null}
                    {!item.enabledByDefault ? <Badge variant="secondary">Add-on</Badge> : null}
                    {item.backendRequired ? <Badge variant="destructive">Backend required</Badge> : null}
                    {isEnabled ? <Badge><Check className="size-3" /> Active</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.backendReason ?? (item.dependencies.length > 0 ? `Requires: ${item.dependencies.join(", ")}` : "No module dependencies")}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">No modules match this view.</div>
      )}
    </PageContainer>
  );
}
