import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TimeInput from '@ui/TimeInput';
import { INVALID_INPUT } from '@/lib/maskedInput';

const Controlled = ({ initial = '', onChange = vi.fn() }) => {
  const [value, setValue] = useState(initial);
  return <TimeInput aria-label="Desde" value={value} onChange={(v) => { setValue(v); onChange(v); }} />;
};

const input = () => screen.getByRole('textbox', { name: 'Desde' });

describe('TimeInput', () => {
  it('tipear "0830" muestra 08:30 y entrega "08:30"', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await user.type(input(), '0830');
    expect(input()).toHaveValue('08:30');
    expect(onChange).toHaveBeenLastCalledWith('08:30');
  });

  it('una hora fuera de rango entrega INVALID_INPUT y queda inválida al salir', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial="09:00" onChange={onChange} />);
    await user.clear(input());
    await user.type(input(), '2575');
    expect(onChange).not.toHaveBeenCalledWith('25:75');
    expect(onChange).toHaveBeenLastCalledWith(INVALID_INPUT);
    await user.tab();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveValue('25:75');
  });

  it('muestra el valor inicial y lo actualiza si cambia desde afuera', () => {
    const { rerender } = render(<TimeInput aria-label="Desde" value="09:00" onChange={vi.fn()} />);
    expect(input()).toHaveValue('09:00');
    rerender(<TimeInput aria-label="Desde" value="18:30" onChange={vi.fn()} />);
    expect(input()).toHaveValue('18:30');
  });

  it('borrar todo entrega vacío', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial="09:00" onChange={onChange} />);
    await user.clear(input());
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('un reset a vacío después de una hora parcial limpia el campo y el error', async () => {
    const user = userEvent.setup();
    const Resettable = () => {
      const [value, setValue] = useState('');
      return (
        <>
          <TimeInput aria-label="Desde" value={value} onChange={setValue} />
          <button type="button" onClick={() => setValue('')}>reset</button>
        </>
      );
    };
    render(<Resettable />);
    await user.type(input(), '13');
    await user.tab();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    await user.click(screen.getByRole('button', { name: 'reset' }));
    expect(input()).toHaveValue('');
    expect(input()).not.toHaveAttribute('aria-invalid');
  });

  it('el valor inicial se muestra con el formato de la máscara', () => {
    render(<TimeInput aria-label="Desde" value="0930" onChange={vi.fn()} />);
    expect(input()).toHaveValue('09:30');
  });

  it('ignora letras', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.type(input(), '1a2b');
    expect(input()).toHaveValue('12');
  });
});
