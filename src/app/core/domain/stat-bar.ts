export type StatIntensity = 'low' | 'medium' | 'high';

const MAX_SINGLE_STAT = 255;

export function statFillPercent(value: number, max = MAX_SINGLE_STAT): number {
  if (max <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

export function statIntensity(value: number): StatIntensity {
  if (value >= 100) {
    return 'high';
  }
  if (value >= 60) {
    return 'medium';
  }
  return 'low';
}
