export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

export function colorAt(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/** Deterministic color from a string id, so a category keeps its color. */
export function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return CHART_COLORS[Math.abs(hash) % CHART_COLORS.length];
}
