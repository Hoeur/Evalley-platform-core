import { WalletCards } from "lucide-react";
import { ProtectedModulePage } from "@/features/shared/protected-module-page";

export default function PaymentsPage() {
  return <ProtectedModulePage module="payments" permission="payments.read" title="Payments" description="Monitor rent collection, deposits, balances, and payment history." icon={WalletCards} />;
}
