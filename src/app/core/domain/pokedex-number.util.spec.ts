import { formatDexNumber } from './pokedex-number.util';

describe('formatDexNumber', () => {
  it('should pad single-digit numbers to 3 digits', () => {
    expect(formatDexNumber(1)).toBe('#001');
    expect(formatDexNumber(9)).toBe('#009');
  });

  it('should pad double-digit numbers to 3 digits', () => {
    expect(formatDexNumber(10)).toBe('#010');
    expect(formatDexNumber(99)).toBe('#099');
  });

  it('should format triple-digit numbers without extra padding', () => {
    expect(formatDexNumber(100)).toBe('#100');
    expect(formatDexNumber(386)).toBe('#386');
  });

  it('should throw for numbers less than 1', () => {
    expect(() => formatDexNumber(0)).toThrow();
    expect(() => formatDexNumber(-5)).toThrow();
  });

  it('should throw for numbers greater than 386', () => {
    expect(() => formatDexNumber(387)).toThrow();
    expect(() => formatDexNumber(999)).toThrow();
  });

  it('should throw for non-integer values', () => {
    expect(() => formatDexNumber(1.5)).toThrow();
    expect(() => formatDexNumber(NaN)).toThrow();
  });
});
