import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import ServiceForm from '@components/features/services/ServiceForm';

describe('ServiceForm — foco', () => {
  it('los campos usan solo el ring del design system (sin outline nativo)', () => {
    renderWithProviders(<ServiceForm onSubmit={vi.fn()} />);
    const fields = [...screen.getAllByRole('textbox'), ...screen.queryAllByRole('spinbutton')];
    expect(fields.length).toBeGreaterThan(0);
    fields.forEach((el) => expect(el.className).toMatch(/\bfocus:outline-none\b/));
  });
});
