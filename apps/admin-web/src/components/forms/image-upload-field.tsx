"use client";
import { ImagePlus } from "lucide-react";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
export function ImageUploadField({ value, onChange }: { value?: string; onChange: (value: string) => void }) { return <div className="space-y-2 sm:col-span-2"><Label htmlFor="imageUrl">Product image</Label><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-lg border bg-muted"><ImagePlus className="size-5 text-muted-foreground" /></div><Input id="imageUrl" value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder="https://example.com/product.jpg" /></div><p className="text-xs text-muted-foreground">Upload adapter placeholder; use a browser-safe signed upload endpoint later.</p></div>; }
