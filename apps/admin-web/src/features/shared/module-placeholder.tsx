import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
export function ModulePlaceholder({ title, description, icon }: { title: string; description: string; icon: LucideIcon }) { return <PageContainer><PageHeader title={title} description={description} /><EmptyState icon={icon} title={`${title} foundation ready`} description="Routing, authorization, navigation, theme, loading, and error boundaries are connected. Add the backend repository when its contract is confirmed." /></PageContainer>; }
