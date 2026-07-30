import { format } from "date-fns";
export function formatDate(value: string | Date) {
  return format(new Date(value), "MMM d, yyyy");
}
