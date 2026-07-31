import type { Customer } from "@platform/ecommerce-core";

/** Client-safe helpers + view model for the customers admin screen. */

export type CustomersView = {
  readonly customers: readonly Customer[];
  readonly total: number;
};

export function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function isEmailVerified(customer: Customer): boolean {
  return customer.emailVerifiedAt !== null;
}
