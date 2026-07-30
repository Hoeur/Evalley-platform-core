import Image from "next/image";
import { Zap } from "lucide-react";
import type { ClientPublicConfig } from "@/clients/client.types";
import { cn } from "@/core/utils/cn";

export function BrandIcon({
  brand,
  className,
}: {
  brand: ClientPublicConfig["brand"];
  className?: string;
}) {
  if (brand.icon) {
    return (
      <Image
        src={brand.icon}
        alt=""
        width={48}
        height={48}
        className={cn("size-full object-contain", className)}
      />
    );
  }

  return <Zap className={cn("size-5 fill-current", className)} />;
}
