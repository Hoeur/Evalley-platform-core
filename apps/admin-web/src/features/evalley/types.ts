export type WorkspaceValue = string | number;

export type WorkspaceRow = {
  id: string;
  status?: string;
  [key: string]: WorkspaceValue | undefined;
};

export type WorkspaceColumn = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  format?: "status" | "money" | "mono" | "number";
};

export type WorkspaceMetric = {
  label: string;
  value: string;
  change?: string;
};

export type WorkspaceConfig = {
  title: string;
  description: string;
  primaryAction: string;
  searchPlaceholder: string;
  metrics?: WorkspaceMetric[];
  columns: WorkspaceColumn[];
  rows: WorkspaceRow[];
  linkPrefix?: string;
  readOnly?: boolean;
  sourceLabel?: string;
};

export type ReviewView = {
  readonly id: string;
  readonly author: string;
  readonly product: string;
  readonly rating: number;
  readonly text: string;
  readonly status: string;
  readonly time: string;
};
