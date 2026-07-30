import type { Id } from "@platform/shared";
import type { CrmRecord } from "../common.js";

/** What a pipeline organizes — leads or opportunities. */
export type PipelineEntityType = "lead" | "opportunity";

/** A named, ordered set of stages a lead or opportunity moves through. */
export interface Pipeline extends CrmRecord {
  readonly name: string;
  readonly entityType: PipelineEntityType;
  readonly isDefault: boolean;
  readonly isActive: boolean;
}

/**
 * A stage within a pipeline. Probability drives weighted forecasting; won/lost flags mark
 * terminal stages.
 */
export interface PipelineStage extends CrmRecord {
  readonly pipelineId: Id;
  readonly name: string;
  readonly position: number;
  readonly color?: string;
  /** 0–100 chance of winning at this stage. */
  readonly probability: number;
  readonly isWonStage: boolean;
  readonly isLostStage: boolean;
}
