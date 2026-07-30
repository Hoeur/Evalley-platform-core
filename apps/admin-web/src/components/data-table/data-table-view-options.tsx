"use client";
import type { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/design-system/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/design-system/ui/dropdown-menu";
export function DataTableViewOptions<TData>({ table }: { table: Table<TData> }) { return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm"><SlidersHorizontal />Columns</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Toggle columns</DropdownMenuLabel>{table.getAllColumns().filter((column) => column.getCanHide()).map((column) => <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(Boolean(value))} className="capitalize">{column.id}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>; }
