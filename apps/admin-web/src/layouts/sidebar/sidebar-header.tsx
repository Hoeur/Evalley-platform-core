import type { ClientPublicConfig } from "@/clients/client.types";
import { BrandIcon } from "@/components/brand/brand-icon";
import { SidebarLabel } from "./sidebar-frame";

export function SidebarHeader({ client }: { client: ClientPublicConfig }) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 px-5">
      <div className="bg-sidebar-primary text-sidebar-primary-foreground grid size-9 shrink-0 place-items-center overflow-hidden rounded-[10px] p-0.5 shadow-[0_4px_12px_color-mix(in_oklab,var(--sidebar-primary)_40%,transparent)]">
        <BrandIcon brand={client.brand} />
      </div>
      <SidebarLabel>
        <div className="leading-tight">
          <p className="font-heading text-sidebar-accent-foreground text-base font-bold tracking-tight">
            {client.brand.shortName}
          </p>
          <p className="text-sidebar-foreground/50 text-[9px] font-semibold tracking-[0.16em] uppercase">
            Commerce OS
          </p>
        </div>
      </SidebarLabel>
    </div>
  );
}
