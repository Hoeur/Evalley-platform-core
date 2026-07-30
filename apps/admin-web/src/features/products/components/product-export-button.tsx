"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/design-system/ui/button";

export function ProductExportButton() {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  return (
    <Button asChild variant="outline">
      <a href={`/api/products/export${query ? `?${query}` : ""}`} download>
        <Download />
        Export
      </a>
    </Button>
  );
}
