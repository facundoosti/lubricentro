import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Checkbox from '@ui/Checkbox';

const Controlled = ({ initial = false, onChange = vi.fn(), ...props }) => {
  const [checked, setChecked] = useState(initial);
  return (
    <Checkbox
      aria-label="Seleccionar"
      checked={checked}
      onCheckedChange={(v) => { setChecked(v); onChange(v); }}
      {...props}
    />
  );
};

describe('Checkbox', () => {
  it('marca y desmarca con click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Seleccionar' });
    expect(box).toHaveAttribute('aria-checked', 'false');
    await user.click(box);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(box).toHaveAttribute('aria-checked', 'true');
    await user.click(box);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('indeterminado expone aria-checked="mixed"', () => {
    render(<Checkbox aria-label="Todos" checked={false} indeterminate onCheckedChange={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Todos' })).toHaveAttribute('aria-checked', 'mixed');
  });

  it('disabled no cambia', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled disabled onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Seleccionar' });
    expect(box).toHaveAttribute('aria-disabled', 'true');
    await user.click(box);
    expect(onChange).not.toHaveBeenCalled();
  });
});
