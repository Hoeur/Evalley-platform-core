"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
import type { AttributeSet } from "@platform/ecommerce-core";

const initialSets = [
  { name: "Color", display: "Swatch", values: ["Black", "White", "Navy", "Red", "Green"] },
  { name: "Size", display: "Button", values: ["38", "40", "42", "44", "46"] },
  { name: "Material", display: "Dropdown", values: ["Leather", "Canvas", "Mesh", "Suede"] },
  { name: "Storage", display: "Button", values: ["128GB", "256GB", "512GB", "1TB"] },
];

export function AttributesWorkspace({ initialData, readOnly = false }: { initialData?: readonly AttributeSet[]; readOnly?: boolean }) {
  const apiSets = initialData?.map((set) => ({ name: set.name, display: set.code, values: set.values.map((value) => value.name) }));
  const [sets, setSets] = useState(apiSets ?? initialSets);
  const [value, setValue] = useState("");
  function addValue(index: number) { if (!value.trim()) return; setSets((current) => current.map((set, setIndex) => setIndex === index ? { ...set, values: [...set.values, value.trim()] } : set)); setValue(""); toast.success("Attribute value added"); }
  return <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7"><div className="flex items-center justify-between"><div><h1 className="font-heading text-xl font-bold">Attributes & Options</h1><p className="mt-1 text-xs text-muted-foreground">Reusable attribute sets from {readOnly ? "core-ecommerce-api" : "the local adapter"}.</p></div>{!readOnly && <Button className="h-9 rounded-[10px] text-xs" onClick={() => setSets((current) => [...current, { name: `Attribute ${current.length + 1}`, display: "Button", values: [] }])}><Plus className="size-4" />New attribute</Button>}</div><div className="grid gap-4 lg:grid-cols-2">{sets.map((set, index) => <Card key={`${set.name}-${index}`} className="rounded-2xl shadow-none"><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="font-heading text-base">{set.name}</CardTitle><p className="text-[11px] text-muted-foreground">Code: {set.display}</p></div><Badge variant="secondary">{set.values.length} values</Badge></CardHeader><CardContent><div className="flex flex-wrap gap-2">{set.values.map((item) => <Badge key={item} variant="outline" className="gap-1 rounded-lg px-3 py-1.5">{item}{!readOnly && <button type="button" aria-label={`Remove ${item}`} className="rounded-sm hover:text-destructive" onClick={() => setSets((current) => current.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, values: candidate.values.filter((existing) => existing !== item) } : candidate))}><X className="size-3" /></button>}</Badge>)}</div>{!readOnly && <div className="mt-4 flex gap-2"><Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Add a value" className="h-9" /><Button variant="outline" className="h-9" onClick={() => addValue(index)}>Add</Button></div>}</CardContent></Card>)}</div></PageContainer>;
}
