export type ThemeName = 'phosphor' | 'amber' | 'violet' | 'cyan' | 'red' | 'mono';

export interface Theme {
  name: ThemeName;
  label: string;
  swatch: string; // accent hex, used for the switcher dot
}

// Order = display order in the switcher; keys 1..6 map to this order.
export const THEMES: Theme[] = [
  { name: 'phosphor', label: 'Phosphor', swatch: '#45E08A' },
  { name: 'amber',    label: 'Amber',    swatch: '#FFB000' },
  { name: 'violet',   label: 'Violet',   swatch: '#BD93F9' },
  { name: 'cyan',     label: 'Cyan',     swatch: '#4FD8FF' },
  { name: 'red',      label: 'Red',      swatch: '#FF4538' },
  { name: 'mono',     label: 'Mono',     swatch: '#F5F2EA' },
];

export const DEFAULT_THEME: ThemeName = 'phosphor';

export function resolveTheme(input: string | null | undefined): ThemeName {
  return THEMES.some(t => t.name === input) ? (input as ThemeName) : DEFAULT_THEME;
}
