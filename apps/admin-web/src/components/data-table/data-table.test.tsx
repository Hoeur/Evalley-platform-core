import { render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataTable } from "./data-table";
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/test", useSearchParams: () => new URLSearchParams() }));
type Row = { name: string };
const columns: ColumnDef<Row>[] = [{ accessorKey: "name", header: "Name" }];
describe("DataTable", () => { beforeEach(() => push.mockClear()); it("renders its generic empty state", () => { render(<DataTable columns={columns} data={[]} page={1} pageCount={1} limit={10} />); expect(screen.getByText("No items found")).toBeInTheDocument(); }); });
