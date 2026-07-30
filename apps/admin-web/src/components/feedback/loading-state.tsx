import { Skeleton } from "@/design-system/ui/skeleton";
export function LoadingState() { return <div className="space-y-4" aria-label="Loading"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>; }
