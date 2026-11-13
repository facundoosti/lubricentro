import css from '@/index.css?raw';
import { describe, it, expect } from 'vitest';

// Contraste WCAG calculado sobre los tokens reales de src/index.css

const block = (selector) => {
  const start = css.indexOf(selector);
  return css.slice(start, css.indexOf('}', start));
};
const token = (scope, name) => {
  const m = block(scope).match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token ${name} no encontrado en ${scope}`);
  return m[1];
};
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const DARK = '@theme {';
const LIGHT = ':root:not(.dark) {';

describe('contraste de tokens del tema', () => {
  it('H-09 · oscuro: texto del CTA sobre primary-container ≥ 4.5:1', () => {
    expect(contrast(token(DARK, 'on-primary'), token(DARK, 'primary-container'))).toBeGreaterThanOrEqual(4.5);
  });

  it('claro: texto del CTA sobre primary-container ≥ 4.5:1', () => {
    expect(contrast(token(LIGHT, 'on-primary'), token(LIGHT, 'primary-container'))).toBeGreaterThanOrEqual(4.5);
  });

  it('texto sobre warning-500 (Button warning, Badge solid warning) ≥ 4.5:1', () => {
    expect(contrast(token(DARK, 'on-warning'), token(DARK, 'warning-500'))).toBeGreaterThanOrEqual(4.5);
  });

  it('H-10 · claro: borde del checkbox (outline) sobre surface-container ≥ 3:1', () => {
    expect(contrast(token(LIGHT, 'outline'), token(LIGHT, 'surface-container'))).toBeGreaterThanOrEqual(3);
  });

  it('oscuro: borde del checkbox (outline) sobre surface-container ≥ 3:1', () => {
    expect(contrast(token(DARK, 'outline'), token(DARK, 'surface-container'))).toBeGreaterThanOrEqual(3);
  });

  it('tour: la flecha del popover usa el fondo del popover, no el borde tenue', () => {
    const arrows = css.match(/\.lubricentro-tour-popover \.driver-popover-arrow-side-[a-z]+\.driver-popover-arrow\s*\{[^}]*\}/g);
    expect(arrows).toHaveLength(4);
    arrows.forEach((rule) => expect(rule).toMatch(/var\(--color-surface-container\)/));
  });
});
