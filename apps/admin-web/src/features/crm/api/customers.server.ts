import "server-only";
import { getCrmCore } from "@/core/crm/crm-core.server";

export async function getCustomersWorkspace() {
  const crm = getCrmCore();
  const [customers, contacts] = await Promise.all([
    crm.customers.list({ limit: 100 }),
    crm.contacts.list(),
  ]);
  return {
    customers: customers.items,
    contacts,
    total: customers.total,
  };
}
