import { UserRoundCog } from "lucide-react";
import { ProtectedModulePage } from "@/features/shared/protected-module-page";
export default function UsersPage() { return <ProtectedModulePage module="users" permission="users.read" title="Users" description="Administrative accounts, roles, and permission assignments." icon={UserRoundCog} />; }
