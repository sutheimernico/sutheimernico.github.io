export type ThemeName = 'phosphor' | 'petrol' | 'amethyst' | 'solar' | 'molten' | 'daylight';

export interface Theme {
  name: ThemeName;
  label: string;
  swatch: string; // accent hex, used for the switcher dot
}

// Order = display order in the switcher; keys 1..6 map to this order.
export const THEMES: Theme[] = [
  { name: 'phosphor', label: 'Phosphor', swatch: '#45E08A' },
  { name: 'petrol',   label: 'Petrol',   swatch: '#2BD4C0' },
  { name: 'amethyst', label: 'Amethyst', swatch: '#A98BE6' },
  { name: 'solar',    label: 'Solar',    swatch: '#FF8A3D' },
  { name: 'molten',   label: 'Molten',   swatch: '#BFD0D8' },
  { name: 'daylight', label: 'Daylight', swatch: '#178A50' },
];

export const DEFAULT_THEME: ThemeName = 'phosphor';

export function resolveTheme(input: string | null | undefined): ThemeName {
  return THEMES.some(t => t.name === input) ? (input as ThemeName) : DEFAULT_THEME;
}
