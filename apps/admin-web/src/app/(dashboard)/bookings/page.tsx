import { CalendarCheck } from "lucide-react";
import { ProtectedModulePage } from "@/features/shared/protected-module-page";

export default function BookingsPage() {
  return <ProtectedModulePage module="bookings" permission="bookings.read" title="Bookings" description="Coordinate property viewings, reservations, and move-in schedules." icon={CalendarCheck} />;
}
