import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DateInput from '@ui/DateInput';
import { INVALID_INPUT } from '@/lib/maskedInput';
import Dialog from '@ui/Dialog';

const Controlled = ({ initial = '', onChange = vi.fn(), ...props }) => {
  const [value, setValue] = useState(initial);
  return (
    <>
      <span id="date-label">Fecha</span>
      <DateInput
        value={value}
        onChange={(v) => { setValue(v); onChange(v); }}
        aria-labelledby="date-label"
        {...props}
      />
      <button type="button">otro</button>
    </>
  );
};

const input = () => screen.getByRole('textbox', { name: 'Fecha' });

describe('DateInput', () => {
  it('tipear una fecha válida muestra dd/mm/aaaa y entrega ISO', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await user.type(input(), '13112026');
    expect(input()).toHaveValue('13/11/2026');
    expect(onChange).toHaveBeenLastCalledWith('2026-11-13');
  });

  it('pegar una fecha con barras', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await user.click(input());
    await user.paste('05/03/2027');
    expect(input()).toHaveValue('05/03/2027');
    expect(onChange).toHaveBeenLastCalledWith('2027-03-05');
  });

  it('ignora letras', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.type(input(), '1a3');
    expect(input()).toHaveValue('13');
  });

  it('muestra el valor inicial en dd/mm/aaaa', () => {
    render(<Controlled initial="2026-10-02" />);
    expect(input()).toHaveValue('02/10/2026');
  });

  it('una fecha inexistente entrega INVALID_INPUT y queda inválida al salir, con el texto intacto', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial="2026-11-13" onChange={onChange} />);
    await user.clear(input());
    await user.type(input(), '31022026');
    expect(input()).not.toHaveAttribute('aria-invalid');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(INVALID_INPUT);
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveValue('31/02/2026');
  });

  it('una fecha fuera de min/max se trata como inválida', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} min="2026-01-01" />);
    await user.type(input(), '31122025');
    await user.tab();
    expect(onChange).not.toHaveBeenCalledWith('2025-12-31');
    expect(onChange).toHaveBeenLastCalledWith(INVALID_INPUT);
    expect(input()).toHaveAttribute('aria-invalid', 'true');
  });

  it('una fecha parcial entrega INVALID_INPUT una sola vez mientras se tipea', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await user.type(input(), '131');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(INVALID_INPUT);
  });

  it.each([['131', '13/1'], ['31022026', '31/02/2026']])(
    'un reset a vacío después de un texto inválido (%s) limpia el campo y el error',
    async (typed, shown) => {
      const user = userEvent.setup();
      const Resettable = () => {
        const [value, setValue] = useState('');
        return (
          <>
            <DateInput aria-label="Fecha" value={value} onChange={setValue} />
            <button type="button" onClick={() => setValue('')}>reset</button>
          </>
        );
      };
      render(<Resettable />);
      await user.type(input(), typed);
      await user.tab();
      expect(input()).toHaveValue(shown);
      expect(input()).toHaveAttribute('aria-invalid', 'true');
      await user.click(screen.getByRole('button', { name: 'reset' }));
      expect(input()).toHaveValue('');
      expect(input()).not.toHaveAttribute('aria-invalid');
    },
  );

  it('borrar todo entrega vacío', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial="2026-11-13" onChange={onChange} />);
    await user.clear(input());
    expect(onChange).toHaveBeenLastCalledWith('');
    await user.tab();
    expect(input()).not.toHaveAttribute('aria-invalid');
  });

  it('un cambio de valor desde afuera (reset) actualiza el texto', () => {
    const { rerender } = render(<DateInput aria-label="Fecha" value="2026-01-05" onChange={vi.fn()} />);
    expect(input()).toHaveValue('05/01/2026');
    rerender(<DateInput aria-label="Fecha" value="2027-02-06" onChange={vi.fn()} />);
    expect(input()).toHaveValue('06/02/2027');
    rerender(<DateInput aria-label="Fecha" value="" onChange={vi.fn()} />);
    expect(input()).toHaveValue('');
  });

  it('el calendario abre en el mes del valor (en español, desde el lunes)', async () => {
    const user = userEvent.setup();
    render(<Controlled initial="2026-10-02" />);
    await user.click(screen.getByRole('button', { name: 'Abrir calendario' }));
    const grid = await screen.findByRole('grid');
    expect(grid).toHaveAccessibleName(/octubre 2026/i);
    const headers = [...grid.querySelectorAll('thead th')].map((th) => (th.getAttribute('aria-label') || th.textContent).toLowerCase());
    expect(headers[0]).toMatch(/^lu/);
  });

  it('elegir un día fija la fecha, cierra el calendario y devuelve el foco al input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial="2026-11-13" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Abrir calendario' }));
    await screen.findByRole('grid');
    await user.click(screen.getByRole('button', { name: /20 de noviembre/i }));
    expect(onChange).toHaveBeenLastCalledWith('2026-11-20');
    expect(input()).toHaveValue('20/11/2026');
    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument());
    await waitFor(() => expect(input()).toHaveFocus());
  });

  it('dentro de un Dialog, Escape cierra solo el calendario', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Dialog isOpen onClose={onClose} title="Turno">
        <DateInput aria-label="Fecha" value="2026-11-13" onChange={vi.fn()} />
      </Dialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Abrir calendario' }));
    await screen.findByRole('grid');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('funciona con ref y onBlur (Controller)', async () => {
    const user = userEvent.setup();
    const ref = { current: null };
    const onBlur = vi.fn();
    render(<DateInput aria-label="Fecha" value="" onChange={vi.fn()} onBlur={onBlur} ref={ref} />);
    expect(ref.current).toBe(input());
    await user.click(input());
    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });
});

describe('DateInput — className', () => {
  it('un className con padding no pisa el pr-10 que deja lugar al botón del calendario', () => {
    render(<DateInput aria-label="Fecha" value="" onChange={() => {}} className="px-6 pr-4" />);
    const input = screen.getByRole('textbox', { name: 'Fecha' });
    // cn (tailwind-merge) conserva px-6 y agrega pr-10 después: el padding derecho queda en pr-10.
    expect(input).toHaveClass('px-6', 'pr-10');
    const classes = input.className.split(' ');
    expect(classes.indexOf('pr-10')).toBeGreaterThan(classes.indexOf('px-6'));
    expect(classes).not.toContain('pr-4');
  });
});
