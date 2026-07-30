import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./page-header";
describe("PageHeader", () => { it("renders title, description and actions", () => { render(<PageHeader title="Products" description="Catalog" actions={<button>Add</button>} />); expect(screen.getByRole("heading", { name: "Products" })).toBeInTheDocument(); expect(screen.getByText("Catalog")).toBeInTheDocument(); expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument(); }); });
