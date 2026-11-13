import css from '@/index.css?raw';
import { describe, it, expect } from 'vitest';

// Tokens --color-* que existían antes de shadcn/Base UI: no pueden renombrarse ni cambiar de valor.
const ORIGINAL = {
  dark: {
    background: '#09090b', surface: '#0c0c0f',
    'surface-container-lowest': '#09090b', 'surface-container-low': '#0f0f12',
    'surface-container': '#121215', 'surface-container-high': '#18181b',
    'surface-container-highest': '#1e1e22', 'surface-variant': '#18181b',
    'on-surface': '#fafafa', 'on-surface-variant': '#a1a1aa',
    primary: '#a78bfa', 'primary-container': '#7c3aed', 'on-primary': '#ffffff',
    secondary: '#71717a', 'secondary-container': '#27272a',
    tertiary: '#34d399', 'tertiary-container': '#065f46',
    outline: '#71717a', 'outline-variant': '#27272a',
    error: '#ef4444', 'error-container': '#3b1111', 'on-error-container': '#fca5a5',
    'success-500': '#12b76a', 'warning-500': '#f79009',
  },
  light: {
    background: '#f4f4f5', surface: '#ffffff',
    'surface-container-lowest': '#ffffff', 'surface-container-low': '#fafafa',
    'surface-container': '#ffffff', 'surface-container-high': '#f4f4f5',
    'surface-container-highest': '#e4e4e7', 'surface-variant': '#fafafa',
    'on-surface': '#18181b', 'on-surface-variant': '#52525b',
    primary: '#7c3aed', 'primary-container': '#7c3aed', 'on-primary': '#ffffff',
    secondary: '#71717a', 'secondary-container': '#e4e4e7',
    tertiary: '#059669', 'tertiary-container': '#d1fae5',
    outline: '#71717a', 'outline-variant': '#e4e4e7',
    error: '#dc2626', 'error-container': '#fee2e2', 'on-error-container': '#991b1b',
  },
};

// Alias de shadcn → token MD3 (tabla D2 del design)
const ALIASES = {
  foreground: 'on-surface',
  popover: 'surface-container-highest',
  'popover-foreground': 'on-surface',
  card: 'surface-container',
  'card-foreground': 'on-surface',
  muted: 'surface-container-high',
  'muted-foreground': 'on-surface-variant',
  accent: 'surface-container-high',
  'accent-foreground': 'on-surface',
  'primary-foreground': 'on-primary',
  destructive: 'error',
  border: 'outline-variant',
  input: 'outline-variant',
  ring: 'primary',
};

const block = (selector) => {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`bloque ${selector} no encontrado`);
  return css.slice(start, css.indexOf('}', start));
};
const tokens = (selector) =>
  Object.fromEntries([...block(selector).matchAll(/--color-([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

const dark = tokens('@theme {');
const light = tokens(':root:not(.dark) {');
const aliases = tokens('@theme inline {');

describe('tokens del tema con alias de shadcn', () => {
  it('los tokens existentes del modo oscuro no cambiaron', () => {
    Object.entries(ORIGINAL.dark).forEach(([name, value]) => expect(dark[name], name).toBe(value));
  });

  it('los tokens existentes del modo claro no cambiaron', () => {
    Object.entries(ORIGINAL.light).forEach(([name, value]) => expect(light[name], name).toBe(value));
  });

  it('cada alias de shadcn apunta con var() al token MD3 (hereda claro y oscuro)', () => {
    Object.entries(ALIASES).forEach(([alias, target]) => {
      expect(aliases[alias], alias).toBe(`var(--color-${target})`);
    });
  });

  it('popover resuelve a surface-container-highest en oscuro y en claro', () => {
    expect(aliases.popover).toBe('var(--color-surface-container-highest)');
    expect(dark['surface-container-highest']).toBe('#1e1e22');
    expect(light['surface-container-highest']).toBe('#e4e4e7');
  });

  it('los alias no redefinen primary ni secondary (tienen significado MD3)', () => {
    expect(aliases).not.toHaveProperty('primary');
    expect(aliases).not.toHaveProperty('secondary');
    expect(light).not.toHaveProperty('popover');
  });
});
