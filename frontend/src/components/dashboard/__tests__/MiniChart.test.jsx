import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import MiniChart from '@components/dashboard/MiniChart';

describe('MiniChart', () => {
  it('suma los ingresos aunque la API los mande como string (decimal serializado)', () => {
    const data = [
      { month: 'Oct', services: 2, revenue: '1500.0' },
      { month: 'Nov', services: 1, revenue: '2500.5' },
    ];
    renderWithProviders(<MiniChart data={data} />);
    const ingresos = screen.getByText(/^Ingresos:/).textContent;
    expect(ingresos).not.toMatch(/NaN/);
    expect(ingresos).toMatch(/4\.001/);
  });

  it('sin datos muestra ingresos en cero', () => {
    renderWithProviders(<MiniChart data={[]} />);
    expect(screen.getByText(/^Ingresos:/).textContent).toMatch(/\$\s*0/);
  });
});
