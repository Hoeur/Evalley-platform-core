import { cn } from "@/core/utils/cn";
export function PageContainer({ className, children }: React.ComponentProps<"div">) { return <div className={cn("mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 md:p-6", className)}>{children}</div>; }
