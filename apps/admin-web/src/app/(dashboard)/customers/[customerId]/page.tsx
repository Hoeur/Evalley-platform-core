import { notFound } from "next/navigation";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { CustomerDetailWorkspace, evalleyCustomers } from "@/features/evalley";

export default async function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) { await requireModuleAccess("customers", "customers.read"); const { customerId } = await params; const customer = evalleyCustomers.find((item) => item.id === customerId); if (!customer) notFound(); return <CustomerDetailWorkspace customer={customer} />; }
