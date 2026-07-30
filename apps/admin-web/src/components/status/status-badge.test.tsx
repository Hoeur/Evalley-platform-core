import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";
describe("StatusBadge", () => { it("renders a controlled semantic variant", () => { render(<StatusBadge variant="success">Active</StatusBadge>); expect(screen.getByText("Active")).toHaveClass("text-success"); }); });
