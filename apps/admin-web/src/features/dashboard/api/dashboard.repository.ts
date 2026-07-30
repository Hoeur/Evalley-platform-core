import type { DashboardData } from "../types/dashboard.types";
export interface DashboardRepository { getOverview(): Promise<DashboardData>; }
