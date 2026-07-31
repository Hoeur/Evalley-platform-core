"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/design-system/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/design-system/ui/alert-dialog";
import { ORDER_STATUSES, isCancellable } from "../order-status";
import { cancelOrderAction, updateOrderStatusAction } from "../api/order.mutations";

export function OrderActions({
  orderId,
  orderNumber,
  status,
}: {
  orderId: string;
  orderNumber: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function changeStatus(next: string) {
    if (next === status) return;
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, next);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Status updated to ${next}`);
      router.refresh();
    });
  }

  function cancel() {
    startTransition(async () => {
      const res = await cancelOrderAction(orderId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Order ${orderNumber} cancelled`);
      router.refresh();
    });
  }

  const knownStatus = (ORDER_STATUSES as readonly string[]).includes(status);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={knownStatus ? status : undefined}
        onValueChange={changeStatus}
        disabled={pending}
      >
        <SelectTrigger className="h-9 w-40 rounded-[10px] text-xs">
          <SelectValue placeholder={status} />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isCancellable(status) ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-[10px] text-destructive"
              disabled={pending}
            >
              <Ban className="size-4" />
              Cancel
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel order {orderNumber}?</AlertDialogTitle>
              <AlertDialogDescription>
                This sets the status to cancelled. Captured payments must be refunded
                separately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep order</AlertDialogCancel>
              <AlertDialogAction onClick={cancel}>Cancel order</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
