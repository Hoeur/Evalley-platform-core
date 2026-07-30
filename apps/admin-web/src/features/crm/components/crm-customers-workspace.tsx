"use client";

import type {
  CrmContactRecord,
  CrmCustomerRecord,
  CrmCustomerStatus,
  CrmCustomerType,
} from "@platform/crm-core/api-client";
import { Building2, Pencil, Plus, Trash2, User } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Card } from "@/design-system/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/ui/dialog";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/ui/select";
import { Switch } from "@/design-system/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/design-system/ui/tabs";
import {
  deleteContactAction,
  deleteCustomerAction,
  saveContactAction,
  saveCustomerAction,
} from "../api/customer.mutations";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const customerStatusVariant: Record<
  CrmCustomerStatus,
  "default" | "secondary" | "outline"
> = {
  ACTIVE: "default",
  PROSPECT: "secondary",
  INACTIVE: "outline",
  ARCHIVED: "outline",
};

type CustomerForm = {
  customerType: CrmCustomerType;
  displayName: string;
  companyName: string;
  email: string;
  phone: string;
  website: string;
  currency: string;
  source: string;
  status: CrmCustomerStatus;
};

type ContactForm = {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  isPrimary: boolean;
};

const emptyCustomer: CustomerForm = {
  customerType: "COMPANY",
  displayName: "",
  companyName: "",
  email: "",
  phone: "",
  website: "",
  currency: "USD",
  source: "manual",
  status: "ACTIVE",
};

const emptyContact: ContactForm = {
  customerId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  isPrimary: false,
};

function clean(value: string) {
  return value.trim() ? value.trim() : undefined;
}

export function CrmCustomersWorkspace({
  customers,
  contacts,
  canManage,
}: {
  customers: readonly CrmCustomerRecord[];
  contacts: readonly CrmContactRecord[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [customerDialog, setCustomerDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CrmCustomerRecord>();
  const [customerForm, setCustomerForm] = useState(emptyCustomer);

  const [contactDialog, setContactDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<CrmContactRecord>();
  const [contactForm, setContactForm] = useState(emptyContact);

  const customerNames = useMemo(
    () => new Map(customers.map((c) => [c.id, c.displayName])),
    [customers],
  );

  function openCustomer(customer?: CrmCustomerRecord) {
    setEditingCustomer(customer);
    setCustomerForm(
      customer
        ? {
            customerType: customer.customerType,
            displayName: customer.displayName,
            companyName: customer.companyName ?? "",
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            website: customer.website ?? "",
            currency: customer.currency,
            source: customer.source ?? "manual",
            status: customer.status,
          }
        : emptyCustomer,
    );
    setCustomerDialog(true);
  }

  function saveCustomer() {
    startTransition(async () => {
      const result = await saveCustomerAction(
        {
          customerType: customerForm.customerType,
          displayName: customerForm.displayName.trim(),
          companyName: clean(customerForm.companyName),
          email: clean(customerForm.email),
          phone: clean(customerForm.phone),
          website: clean(customerForm.website),
          currency: clean(customerForm.currency) ?? "USD",
          source: clean(customerForm.source),
          status: customerForm.status,
        },
        editingCustomer?.id,
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(editingCustomer ? "Customer updated" : "Customer created");
      setCustomerDialog(false);
      router.refresh();
    });
  }

  function removeCustomer(customer: CrmCustomerRecord) {
    if (!window.confirm(`Archive customer "${customer.displayName}"?`)) return;
    startTransition(async () => {
      const result = await deleteCustomerAction(customer.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Customer archived");
      router.refresh();
    });
  }

  function openContact(contact?: CrmContactRecord) {
    setEditingContact(contact);
    setContactForm(
      contact
        ? {
            customerId: contact.customerId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            jobTitle: contact.jobTitle ?? "",
            isPrimary: contact.isPrimary,
          }
        : { ...emptyContact, customerId: customers[0]?.id ?? "" },
    );
    setContactDialog(true);
  }

  function saveContact() {
    startTransition(async () => {
      const result = await saveContactAction(
        {
          customerId: contactForm.customerId,
          firstName: contactForm.firstName.trim(),
          lastName: contactForm.lastName.trim(),
          email: clean(contactForm.email),
          phone: clean(contactForm.phone),
          jobTitle: clean(contactForm.jobTitle),
          isPrimary: contactForm.isPrimary,
        },
        editingContact?.id,
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(editingContact ? "Contact updated" : "Contact created");
      setContactDialog(false);
      router.refresh();
    });
  }

  function removeContact(contact: CrmContactRecord) {
    if (!window.confirm(`Delete contact "${contact.firstName} ${contact.lastName}"?`))
      return;
    startTransition(async () => {
      const result = await deleteContactAction(contact.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Contact deleted");
      router.refresh();
    });
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight">
          Customers & contacts
        </h1>
        <p className="text-muted-foreground mt-1 text-xs">
          CRM accounts and their people, from core-crm-api.
        </p>
      </div>

      <Tabs defaultValue="customers">
        <TabsList>
          <TabsTrigger value="customers">
            <Building2 className="size-4" /> Customers ({customers.length})
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <User className="size-4" /> Contacts ({contacts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-4">
          <Card className="overflow-hidden rounded-2xl shadow-none">
            <div className="flex items-center justify-between border-b p-4">
              <p className="font-semibold">Accounts</p>
              {canManage && (
                <Button onClick={() => openCustomer()}>
                  <Plus /> Add customer
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.displayName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {customer.customerType === "COMPANY"
                          ? "Company"
                          : "Individual"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {customer.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {customer.phone ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customerStatusVariant[customer.status]}>
                        {customer.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${customer.displayName}`}
                            onClick={() => openCustomer(customer)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Archive ${customer.displayName}`}
                            disabled={pending}
                            onClick={() => removeCustomer(customer)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground h-24 text-center"
                    >
                      No customers yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <Card className="overflow-hidden rounded-2xl shadow-none">
            <div className="flex items-center justify-between border-b p-4">
              <p className="font-semibold">People</p>
              {canManage && (
                <Button
                  disabled={customers.length === 0}
                  onClick={() => openContact()}
                >
                  <Plus /> Add contact
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Job title</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      {contact.firstName} {contact.lastName}
                    </TableCell>
                    <TableCell className="text-xs">
                      {customerNames.get(contact.customerId) ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {contact.jobTitle ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {contact.email ?? "—"}
                    </TableCell>
                    <TableCell>
                      {contact.isPrimary ? (
                        <Badge variant="secondary">Primary</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${contact.firstName}`}
                            onClick={() => openContact(contact)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${contact.firstName}`}
                            disabled={pending}
                            onClick={() => removeContact(contact)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {contacts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground h-24 text-center"
                    >
                      No contacts yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer dialog */}
      <Dialog open={customerDialog} onOpenChange={setCustomerDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit customer" : "Add customer"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <Select
                  value={customerForm.customerType}
                  onValueChange={(customerType: CrmCustomerType) =>
                    setCustomerForm((f) => ({ ...f, customerType }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPANY">Company</SelectItem>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={customerForm.status}
                  onValueChange={(status: CrmCustomerStatus) =>
                    setCustomerForm((f) => ({ ...f, status }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PROSPECT">Prospect</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Display name">
              <Input
                value={customerForm.displayName}
                onChange={(event) =>
                  setCustomerForm((f) => ({
                    ...f,
                    displayName: event.target.value,
                  }))
                }
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name">
                <Input
                  value={customerForm.companyName}
                  onChange={(event) =>
                    setCustomerForm((f) => ({
                      ...f,
                      companyName: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={customerForm.email}
                  onChange={(event) =>
                    setCustomerForm((f) => ({ ...f, email: event.target.value }))
                  }
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={customerForm.phone}
                  onChange={(event) =>
                    setCustomerForm((f) => ({ ...f, phone: event.target.value }))
                  }
                />
              </Field>
              <Field label="Website">
                <Input
                  type="url"
                  value={customerForm.website}
                  onChange={(event) =>
                    setCustomerForm((f) => ({
                      ...f,
                      website: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Currency">
                <Input
                  maxLength={3}
                  value={customerForm.currency}
                  onChange={(event) =>
                    setCustomerForm((f) => ({
                      ...f,
                      currency: event.target.value.toUpperCase(),
                    }))
                  }
                />
              </Field>
              <Field label="Source">
                <Input
                  value={customerForm.source}
                  onChange={(event) =>
                    setCustomerForm((f) => ({
                      ...f,
                      source: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={pending || !customerForm.displayName.trim()}
              onClick={saveCustomer}
            >
              {pending ? "Saving..." : "Save customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact dialog */}
      <Dialog open={contactDialog} onOpenChange={setContactDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit contact" : "Add contact"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Customer">
              <Select
                value={contactForm.customerId}
                onValueChange={(customerId) =>
                  setContactForm((f) => ({ ...f, customerId }))
                }
                disabled={Boolean(editingContact)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <Input
                  value={contactForm.firstName}
                  onChange={(event) =>
                    setContactForm((f) => ({
                      ...f,
                      firstName: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Last name">
                <Input
                  value={contactForm.lastName}
                  onChange={(event) =>
                    setContactForm((f) => ({
                      ...f,
                      lastName: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(event) =>
                    setContactForm((f) => ({ ...f, email: event.target.value }))
                  }
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={contactForm.phone}
                  onChange={(event) =>
                    setContactForm((f) => ({ ...f, phone: event.target.value }))
                  }
                />
              </Field>
              <Field label="Job title">
                <Input
                  value={contactForm.jobTitle}
                  onChange={(event) =>
                    setContactForm((f) => ({
                      ...f,
                      jobTitle: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Primary contact</Label>
                <p className="text-muted-foreground text-xs">
                  Main point of contact for this customer.
                </p>
              </div>
              <Switch
                checked={contactForm.isPrimary}
                onCheckedChange={(isPrimary) =>
                  setContactForm((f) => ({ ...f, isPrimary }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                pending ||
                !contactForm.customerId ||
                !contactForm.firstName.trim() ||
                !contactForm.lastName.trim()
              }
              onClick={saveContact}
            >
              {pending ? "Saving..." : "Save contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
