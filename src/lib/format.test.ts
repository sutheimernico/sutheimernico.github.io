import { describe, it, expect } from 'vitest';
import { easeOutCubic, countAt } from './format';

describe('counter formatting', () => {
  it('easeOutCubic hits endpoints', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });
  it('countAt formats with decimals and eases', () => {
    expect(countAt(17, 1, 0)).toBe('17');
    expect(countAt(4.2, 1, 1)).toBe('4.2');
    expect(countAt(17, 0, 0)).toBe('0');
  });
});
