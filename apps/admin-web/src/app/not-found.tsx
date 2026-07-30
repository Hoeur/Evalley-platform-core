import Link from "next/link";
import { Button } from "@/design-system/ui/button";
export default function NotFound() { return <main className="grid min-h-screen place-items-center p-6"><div className="text-center"><p className="text-sm font-medium text-primary">404</p><h1 className="mt-2 text-3xl font-semibold">Page not found</h1><p className="mt-2 text-muted-foreground">The page may have moved or is unavailable.</p><Button asChild className="mt-6"><Link href="/dashboard">Back to dashboard</Link></Button></div></main>; }
