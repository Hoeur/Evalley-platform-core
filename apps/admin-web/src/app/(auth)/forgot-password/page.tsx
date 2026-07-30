import Link from "next/link";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
export default function ForgotPasswordPage() { return <div className="grid min-h-screen place-items-center bg-muted/40 p-6"><Card className="w-full max-w-sm"><CardHeader><CardTitle>Reset password</CardTitle><CardDescription>Enter your account email. The real auth adapter will send the reset link.</CardDescription></CardHeader><CardContent className="space-y-4"><Input type="email" placeholder="you@company.com" /><Button className="w-full">Send reset link</Button><Button asChild variant="link" className="w-full"><Link href="/login">Back to sign in</Link></Button></CardContent></Card></div>; }
