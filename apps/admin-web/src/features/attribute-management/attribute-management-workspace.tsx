"use client";

import type { AttributeSet, AttributeValue } from "@platform/ecommerce-core";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { Badge } from "@/design-system/ui/badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent, CardHeader } from "@/design-system/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/ui/dialog";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import {
  deleteAttributeSetAction,
  deleteAttributeValueAction,
  saveAttributeSetAction,
  saveAttributeValueAction,
} from "./mutations";
import type {
  AttributeSetFormValues,
  AttributeValueFormValues,
} from "./schemas";

const emptySet: AttributeSetFormValues = {
  name: "",
  nameKm: "",
  code: "",
  order: 0,
};
const emptyValue: AttributeValueFormValues = {
  name: "",
  nameKm: "",
  order: 0,
};

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

export function AttributeManagementWorkspace({
  attributeSets,
  canManage,
}: {
  attributeSets: readonly AttributeSet[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [setDialog, setSetDialog] = useState(false);
  const [editingSet, setEditingSet] = useState<AttributeSet>();
  const [setForm, setSetForm] = useState(emptySet);
  const [valueDialog, setValueDialog] = useState(false);
  const [valueSet, setValueSet] = useState<AttributeSet>();
  const [editingValue, setEditingValue] = useState<AttributeValue>();
  const [valueForm, setValueForm] = useState(emptyValue);

  const visibleSets = useMemo(
    () =>
      attributeSets.filter((set) =>
        `${set.name} ${set.code} ${set.values.map((value) => value.name).join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [attributeSets, query],
  );

  function openSet(set?: AttributeSet) {
    setEditingSet(set);
    setSetForm(
      set
        ? {
            name: set.name,
            nameKm: set.translations.km?.name ?? "",
            code: set.code,
            order: set.order,
          }
        : emptySet,
    );
    setSetDialog(true);
  }

  function openValue(set: AttributeSet, value?: AttributeValue) {
    setValueSet(set);
    setEditingValue(value);
    setValueForm(
      value
        ? {
            name: value.name,
            nameKm: value.translations.km?.name ?? "",
            order: value.order,
          }
        : emptyValue,
    );
    setValueDialog(true);
  }

  function saveSet() {
    startTransition(async () => {
      const result = await saveAttributeSetAction(setForm, editingSet?.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(editingSet ? "Attribute updated" : "Attribute created");
      setSetDialog(false);
      router.refresh();
    });
  }

  function saveValue() {
    if (!valueSet) return;
    startTransition(async () => {
      const result = await saveAttributeValueAction(
        valueSet.id,
        valueForm,
        editingValue?.id,
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        editingValue ? "Attribute value updated" : "Attribute value created",
      );
      setValueDialog(false);
      router.refresh();
    });
  }

  function removeSet(set: AttributeSet) {
    if (
      !window.confirm(
        `Delete attribute "${set.name}"? Sets with values cannot be deleted.`,
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteAttributeSetAction(set.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Attribute deleted");
      router.refresh();
    });
  }

  function removeValue(set: AttributeSet, value: AttributeValue) {
    if (!window.confirm(`Delete value "${value.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteAttributeValueAction(set.id, value.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Attribute value deleted");
      router.refresh();
    });
  }

  return (
    <PageContainer className="max-w-[1296px] gap-4 py-5 md:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold">
            Attributes & options
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Manage reusable attribute sets and values through the catalog API.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => openSet()}>
            <Plus /> New attribute
          </Button>
        )}
      </div>

      <div className="relative max-w-xl">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search attributes or values"
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleSets.map((set) => (
          <Card key={set.id} className="rounded-2xl shadow-none">
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-semibold">{set.name}</h2>
                  <Badge variant="secondary">{set.values.length} values</Badge>
                </div>
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  {set.code} · order {set.order}
                </p>
              </div>
              {canManage && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${set.name}`}
                    onClick={() => openSet(set)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${set.name}`}
                    disabled={pending}
                    onClick={() => removeSet(set)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {set.values.map((value) => (
                  <div
                    key={value.id}
                    className="bg-muted/30 flex items-center rounded-lg border pl-3"
                  >
                    <span className="text-sm">{value.name}</span>
                    <span className="text-muted-foreground ml-2 text-[10px]">
                      #{value.order}
                    </span>
                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${value.name}`}
                          onClick={() => openValue(set, value)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${value.name}`}
                          disabled={pending}
                          onClick={() => removeValue(set, value)}
                        >
                          <Trash2 />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
                {set.values.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No values configured.
                  </p>
                )}
              </div>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => openValue(set)}
                >
                  <Plus /> Add value
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {visibleSets.length === 0 && (
          <Card className="col-span-full rounded-2xl shadow-none">
            <CardContent className="text-muted-foreground py-16 text-center text-sm">
              No attribute sets found.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={setDialog} onOpenChange={setSetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSet ? "Edit attribute" : "New attribute"}
            </DialogTitle>
            <DialogDescription>
              Maps to code, order, and English/Khmer translations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="English name">
                <Input
                  value={setForm.name}
                  onChange={(event) =>
                    setSetForm((value) => ({
                      ...value,
                      name: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Khmer name">
                <Input
                  value={setForm.nameKm}
                  onChange={(event) =>
                    setSetForm((value) => ({
                      ...value,
                      nameKm: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Code">
                <Input
                  value={setForm.code}
                  onChange={(event) =>
                    setSetForm((value) => ({
                      ...value,
                      code: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Order">
                <Input
                  type="number"
                  min={0}
                  value={setForm.order}
                  onChange={(event) =>
                    setSetForm((value) => ({
                      ...value,
                      order: Number(event.target.value),
                    }))
                  }
                />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={pending || !setForm.name.trim() || !setForm.code.trim()}
              onClick={saveSet}
            >
              {pending ? "Saving..." : "Save attribute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={valueDialog} onOpenChange={setValueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingValue ? "Edit value" : `Add value to ${valueSet?.name}`}
            </DialogTitle>
            <DialogDescription>
              Maps to order and English/Khmer translations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="English value">
              <Input
                value={valueForm.name}
                onChange={(event) =>
                  setValueForm((value) => ({
                    ...value,
                    name: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Khmer value">
              <Input
                value={valueForm.nameKm}
                onChange={(event) =>
                  setValueForm((value) => ({
                    ...value,
                    nameKm: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Order">
              <Input
                type="number"
                min={0}
                value={valueForm.order}
                onChange={(event) =>
                  setValueForm((value) => ({
                    ...value,
                    order: Number(event.target.value),
                  }))
                }
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setValueDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={pending || !valueForm.name.trim()}
              onClick={saveValue}
            >
              {pending ? "Saving..." : "Save value"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
