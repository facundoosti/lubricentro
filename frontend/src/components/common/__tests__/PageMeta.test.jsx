import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import PageMeta from '@common/PageMeta';

describe('PageMeta', () => {
  beforeEach(() => {
    document.title = 'Sistema Lubricentro';
  });

  it('pone el título de la página', () => {
    render(<PageMeta title="Dashboard - Sistema Lubricentro" />);
    expect(document.title).toBe('Dashboard - Sistema Lubricentro');
  });

  it('restaura el título anterior al desmontarse (ej. al ir a /login)', () => {
    const { unmount } = render(<PageMeta title="Dashboard - Sistema Lubricentro" />);
    unmount();
    expect(document.title).toBe('Sistema Lubricentro');
  });
});
