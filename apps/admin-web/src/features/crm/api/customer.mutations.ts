"use server";

import { revalidatePath } from "next/cache";
import type {
  CrmCustomerStatus,
  CrmCustomerType,
} from "@platform/crm-core/api-client";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getCrmCore } from "@/core/crm/crm-core.server";
import { normalizeError } from "@/core/http/normalize-error";

function fail(error: unknown) {
  return { ok: false as const, error: normalizeError(error).message };
}

export type CustomerFormPayload = {
  customerType: CrmCustomerType;
  displayName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
  currency?: string;
  source?: string;
  status?: CrmCustomerStatus;
};

export async function saveCustomerAction(
  payload: CustomerFormPayload,
  id?: string,
) {
  try {
    await requireModuleAccess(
      "crmCustomers",
      id ? "crm.customers.update" : "crm.customers.create",
    );
    const customers = getCrmCore().customers;
    const item = id
      ? await customers.update(id, payload)
      : await customers.create({
          customerType: payload.customerType,
          displayName: payload.displayName,
          companyName: payload.companyName,
          email: payload.email,
          phone: payload.phone,
          website: payload.website,
          currency: payload.currency,
          source: payload.source,
        });
    revalidatePath("/crm/customers");
    return { ok: true as const, item };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await requireModuleAccess("crmCustomers", "crm.customers.delete");
    await getCrmCore().customers.archive(id);
    revalidatePath("/crm/customers");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export type ContactFormPayload = {
  customerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  isPrimary?: boolean;
};

export async function saveContactAction(
  payload: ContactFormPayload,
  id?: string,
) {
  try {
    await requireModuleAccess(
      "crmCustomers",
      id ? "crm.contacts.update" : "crm.contacts.create",
    );
    const contacts = getCrmCore().contacts;
    const item = id
      ? await contacts.update(id, {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          jobTitle: payload.jobTitle,
          isPrimary: payload.isPrimary,
        })
      : await contacts.create(payload);
    revalidatePath("/crm/customers");
    return { ok: true as const, item };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteContactAction(id: string) {
  try {
    await requireModuleAccess("crmCustomers", "crm.contacts.delete");
    await getCrmCore().contacts.delete(id);
    revalidatePath("/crm/customers");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}
