import { ShieldAlert } from "lucide-react";
export function PermissionDenied() { return <div className="grid min-h-72 place-items-center text-center"><div><ShieldAlert className="mx-auto size-8 text-warning" /><h2 className="mt-4 text-xl font-semibold">Permission required</h2><p className="mt-1 text-sm text-muted-foreground">Your account cannot access this resource.</p></div></div>; }
