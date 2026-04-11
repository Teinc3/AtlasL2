export function normalizePrevalence(value: number, population: number): number {
  const ratio = value / population;
  return Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
}

export function normaliseProbability(value: number): number {
  return Math.max(0, Math.min(1, value));
}
