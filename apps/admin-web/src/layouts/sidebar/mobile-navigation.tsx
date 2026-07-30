"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/design-system/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/design-system/ui/sheet";
export function MobileNavigation({ brand, groups }: { brand: string; groups: { label: string; items: { key: string; label: string; href: string }[] }[] }) { return <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu /></Button></SheetTrigger><SheetContent side="left" className="w-72"><SheetHeader><SheetTitle>{brand}</SheetTitle></SheetHeader><nav className="mt-6 space-y-6">{groups.map((group) => <div key={group.label}><p className="mb-2 px-2 text-xs font-medium uppercase text-muted-foreground">{group.label}</p>{group.items.map((item) => <Button key={item.key} asChild variant="ghost" className="w-full justify-start"><Link href={item.href}>{item.label}</Link></Button>)}</div>)}</nav></SheetContent></Sheet>; }
