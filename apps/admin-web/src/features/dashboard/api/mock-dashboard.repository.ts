import { dashboardMock } from "@/mocks/dashboard.mock";
import type { DashboardRepository } from "./dashboard.repository";
export const mockDashboardRepository: DashboardRepository = { async getOverview() { return structuredClone(dashboardMock); } };
