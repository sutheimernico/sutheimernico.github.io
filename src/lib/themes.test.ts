import { describe, it, expect } from 'vitest';
import { THEMES, resolveTheme, DEFAULT_THEME } from './themes';

describe('themes', () => {
  it('exposes the six ported themes with unique names', () => {
    const names = THEMES.map(t => t.name);
    expect(names).toEqual(['phosphor', 'petrol', 'amethyst', 'solar', 'molten', 'daylight']);
    expect(new Set(names).size).toBe(names.length);
  });
  it('defaults to phosphor (Nico picked the green)', () => {
    expect(DEFAULT_THEME).toBe('phosphor');
  });
  it('resolveTheme falls back to default for unknown/empty input', () => {
    expect(resolveTheme(null)).toBe('phosphor');
    expect(resolveTheme('bogus')).toBe('phosphor');
    expect(resolveTheme('petrol')).toBe('petrol');
  });
});
