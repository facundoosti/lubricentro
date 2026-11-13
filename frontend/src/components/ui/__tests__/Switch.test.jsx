import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Switch from '@ui/Switch';

const Controlled = ({ initial = false, onChange = vi.fn(), ...props }) => {
  const [checked, setChecked] = useState(initial);
  return (
    <Switch
      aria-label="Lunes"
      checked={checked}
      onCheckedChange={(v) => { setChecked(v); onChange(v); }}
      {...props}
    />
  );
};

describe('Switch', () => {
  it('tiene rol switch, nombre y aria-checked', () => {
    render(<Controlled initial />);
    expect(screen.getByRole('switch', { name: 'Lunes' })).toHaveAttribute('aria-checked', 'true');
  });

  it('cambia con click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await user.click(screen.getByRole('switch', { name: 'Lunes' }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch', { name: 'Lunes' })).toHaveAttribute('aria-checked', 'true');
  });

  it('cambia con Espacio', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial onChange={onChange} />);
    screen.getByRole('switch', { name: 'Lunes' }).focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('switch', { name: 'Lunes' })).toHaveAttribute('aria-checked', 'false');
  });

  it('disabled no cambia', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled disabled onChange={onChange} />);
    await user.click(screen.getByRole('switch', { name: 'Lunes' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('variante theme muestra el contenido del thumb', () => {
    render(<Switch aria-label="Modo oscuro" variant="theme" checked={false} thumbContent={<span>sol</span>} />);
    expect(screen.getByRole('switch', { name: 'Modo oscuro' })).toHaveTextContent('sol');
  });
});
