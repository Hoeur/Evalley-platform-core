"use client";

import { useState } from "react";
import { CalendarClock, Megaphone, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/design-system/ui/table";

const initialCampaigns = [
  { title: "Summer Mega Sale", status: "Active", progress: 68, time: "Ends in 2d 14h", products: 18 },
  { title: "Weekend Flash", status: "Scheduled", progress: 0, time: "Starts Jun 28", products: 12 },
  { title: "Clearance Blowout", status: "Ended", progress: 100, time: "Ended Jun 15", products: 34 },
];
const coupons = [
  { code: "SUMMER25", type: "Percentage", value: "25% off", used: "412 / 1,000", status: "Active", expiry: "Jun 30, 2026" },
  { code: "FREESHIP", type: "Free shipping", value: "$0 shipping", used: "1,893 / 5,000", status: "Active", expiry: "Jul 15, 2026" },
  { code: "WELCOME10", type: "Fixed amount", value: "$10 off", used: "256 / ∞", status: "Active", expiry: "No expiry" },
  { code: "FLASH50", type: "Percentage", value: "50% off", used: "780 / 800", status: "Expiring", expiry: "Jun 25, 2026" },
  { code: "VIPONLY", type: "Fixed amount", value: "$50 off", used: "34 / 200", status: "Paused", expiry: "Aug 01, 2026" },
];

export function PromotionsWorkspace() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  function toggle(index: number) { setCampaigns((current) => current.map((campaign, campaignIndex) => campaignIndex === index ? { ...campaign, status: campaign.status === "Active" ? "Paused" : "Active" } : campaign)); toast.success("Campaign status updated"); }
  return <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7"><div className="flex items-center justify-between"><div><h1 className="font-heading text-xl font-bold">Flash Sales & Discounts</h1><p className="mt-1 text-xs text-muted-foreground">Campaigns, promotional events and coupon codes.</p></div><Button className="h-9 rounded-[10px] text-xs" onClick={() => toast.success("Campaign builder opened in mock mode")}><Megaphone className="size-4" />New campaign</Button></div><div className="grid gap-4 md:grid-cols-3">{campaigns.map((campaign, index) => <Card key={campaign.title} className="rounded-2xl shadow-none"><CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div><CardTitle className="font-heading text-base">{campaign.title}</CardTitle><p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><CalendarClock className="size-3" />{campaign.time}</p></div><StatusBadge variant={campaign.status === "Active" ? "success" : campaign.status === "Scheduled" ? "info" : "neutral"}>{campaign.status}</StatusBadge></div></CardHeader><CardContent><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${campaign.progress}%` }} /></div><div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">{campaign.products} products</span><Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => toggle(index)}>{campaign.status === "Active" ? <Pause className="size-3" /> : <Play className="size-3" />}{campaign.status === "Active" ? "Pause" : "Activate"}</Button></div></CardContent></Card>)}</div><Card className="overflow-hidden rounded-2xl shadow-none"><CardHeader><CardTitle className="font-heading text-base">Coupon codes</CardTitle></CardHeader><div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/60"><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Used</TableHead><TableHead>Status</TableHead><TableHead>Expiry</TableHead></TableRow></TableHeader><TableBody>{coupons.map((coupon) => <TableRow key={coupon.code}><TableCell className="font-mono text-xs font-bold text-primary">{coupon.code}</TableCell><TableCell>{coupon.type}</TableCell><TableCell className="font-semibold">{coupon.value}</TableCell><TableCell>{coupon.used}</TableCell><TableCell><StatusBadge variant={coupon.status === "Active" ? "success" : coupon.status === "Expiring" ? "warning" : "neutral"}>{coupon.status}</StatusBadge></TableCell><TableCell>{coupon.expiry}</TableCell></TableRow>)}</TableBody></Table></div></Card></PageContainer>;
}
