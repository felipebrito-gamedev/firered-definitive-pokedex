import { describe, expect, it } from 'vitest';
import { statFillPercent, statIntensity } from './stat-bar';

describe('stat bars', () => {
  it('maps values onto a 255-point bar', () => {
    expect(statFillPercent(0)).toBe(0);
    expect(statFillPercent(255)).toBe(100);
    expect(statFillPercent(128)).toBe(50);
  });

  it('classifies low, medium, and high intensities', () => {
    expect(statIntensity(45)).toBe('low');
    expect(statIntensity(80)).toBe('medium');
    expect(statIntensity(150)).toBe('high');
  });
});
