"use client";

import { useState } from "react";
import { DataWorkspace } from "./data-workspace";
import type { WorkspaceConfig } from "../types";

export function CategoriesWorkspace({ configs }: { configs: Record<"categories" | "brands", WorkspaceConfig> }) {
  const [view, setView] = useState<"categories" | "brands">("categories");
  return <div><div className="mx-auto flex max-w-[1296px] gap-2 px-4 pt-5 md:px-7"><button onClick={() => setView("categories")} className={view === "categories" ? "rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground" : "rounded-lg border bg-card px-4 py-2 text-xs font-semibold"}>Categories</button><button onClick={() => setView("brands")} className={view === "brands" ? "rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground" : "rounded-lg border bg-card px-4 py-2 text-xs font-semibold"}>Brands</button></div><DataWorkspace key={view} config={configs[view]} /></div>;
}
