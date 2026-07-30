"use client";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/page/page-container";
import { Button } from "@/design-system/ui/button";
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <PageContainer><ErrorState /><Button className="w-fit" onClick={reset}>Try again</Button></PageContainer>; }
