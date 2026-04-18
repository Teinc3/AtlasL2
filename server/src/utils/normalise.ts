export function normalizePrevalence(value: number, population: number, weight: number = 1.0): number {
  const ratio = value / population;
  // We put the weight after we clamp the ratio
  // As the speaker population may sometimes exceed total population due to rounding issues
  return Number.isFinite(ratio) ? weight * Math.max(0, Math.min(1, ratio)) : 0;
}

export function toSigFig(value: number, figures = 2): number {
  if (!Number.isFinite(value) || value === 0) {
    return 0;
  }

  return Number(value.toPrecision(figures));
}

export function normaliseProbability(value: number): number {
  return Math.max(0, Math.min(1, value));
}
