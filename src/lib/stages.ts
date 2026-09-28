import type { Stage } from "./constants";
import type { Dictionary } from "./dictionaries";

export function stageLabel(stage: string, t: Dictionary): string {
  const labels: Record<Stage, string> = {
    FOUNDATIONAL: t.stageFoundational,
    PREPARATORY: t.stagePreparatory,
    MIDDLE: t.stageMiddle,
    SECONDARY: t.stageSecondary,
  };
  return labels[stage as Stage] ?? stage;
}
