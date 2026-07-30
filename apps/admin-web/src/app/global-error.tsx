"use client";
import { Button } from "@/design-system/ui/button";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html><body className="grid min-h-screen place-items-center p-6"><main className="max-w-md text-center"><h1 className="text-2xl font-semibold">Something went wrong</h1><p className="mt-2 text-muted-foreground">The application could not recover from an unexpected error.</p><Button className="mt-6" onClick={reset}>Try again</Button></main></body></html>;
}
