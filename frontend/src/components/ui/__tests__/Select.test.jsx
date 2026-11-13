import { useState } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Select from '@ui/Select';
import Dialog from '@ui/Dialog';

const HOURS = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
];

const Controlled = ({ initial = '', onChange = vi.fn(), ...props }) => {
  const [value, setValue] = useState(initial);
  return (
    <>
      <span id="time-label">Hora</span>
      <Select
        options={HOURS}
        value={value}
        onChange={(v) => { setValue(v); onChange(v); }}
        placeholder="Seleccionar hora"
        aria-labelledby="time-label"
        {...props}
      />
    </>
  );
};

describe('Select', () => {
  it('muestra el placeholder sin valor y la etiqueta del valor elegido', () => {
    const { unmount } = render(<Controlled />);
    expect(screen.getByRole('combobox', { name: 'Hora' })).toHaveTextContent('Seleccionar hora');
    unmount();
    render(<Controlled initial="09:00" />);
    expect(screen.getByRole('combobox', { name: 'Hora' })).toHaveTextContent('9:00 AM');
  });

  it('un valor que no está entre las opciones se muestra tal cual (no el placeholder)', () => {
    render(<Controlled initial="08:30" />);
    const trigger = screen.getByRole('combobox', { name: 'Hora' });
    expect(trigger).toHaveTextContent('08:30');
    expect(trigger).not.toHaveTextContent('Seleccionar hora');
  });

  it('orphanLabel reemplaza el valor crudo cuando no está entre las opciones', () => {
    const { rerender } = render(<Select aria-label="Hora" options={HOURS} value="08:30" orphanLabel="Turno viejo" />);
    expect(screen.getByRole('combobox', { name: 'Hora' })).toHaveTextContent('Turno viejo');
    rerender(<Select aria-label="Hora" options={HOURS} value="09:00" orphanLabel="Turno viejo" />);
    expect(screen.getByRole('combobox', { name: 'Hora' })).toHaveTextContent('9:00 AM');
  });

  it('el nombre accesible es el texto de la etiqueta (aria-labelledby)', () => {
    render(
      <>
        <label id="appointment-status-label">Estado</label>
        <Select options={HOURS} value="" onChange={vi.fn()} aria-labelledby="appointment-status-label" />
      </>,
    );
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Estado');
  });

  it('con teclado: Enter abre, flecha abajo y Enter elige la segunda opción', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    screen.getByRole('combobox', { name: 'Hora' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await waitFor(() => expect(screen.getByRole('option', { name: '8:00 AM' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('09:00');
    expect(screen.getByRole('combobox', { name: 'Hora' })).toHaveTextContent('9:00 AM');
  });

  it('con el mouse: click en una opción la elige', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await user.click(screen.getByRole('combobox', { name: 'Hora' }));
    await user.click(await screen.findByRole('option', { name: '10:00 AM' }));
    expect(onChange).toHaveBeenCalledWith('10:00');
  });

  it('error marca el borde en rojo; disabled no abre', async () => {
    const user = userEvent.setup();
    render(<Controlled error disabled />);
    const trigger = screen.getByRole('combobox', { name: 'Hora' });
    expect(trigger).toHaveClass('border-error');
    await user.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('dentro de un Dialog, Escape con la lista abierta cierra solo la lista; con la lista cerrada, el diálogo', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    render(
      <Dialog isOpen onClose={close} title="Turno" formId="appointment-form">
        <Controlled />
      </Dialog>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Hora' }));
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(close).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Hora' }), { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('dentro de un Dialog, click en una opción la elige y el diálogo sigue abierto', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    const onChange = vi.fn();
    render(
      <Dialog isOpen onClose={close} title="Turno" formId="appointment-form">
        <Controlled onChange={onChange} />
      </Dialog>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Hora' }));
    await user.click(await screen.findByRole('option', { name: '9:00 AM' }));
    expect(onChange).toHaveBeenCalledWith('09:00');
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Turno' })).toBeInTheDocument();
  });

  it('si las opciones cambian y el valor anterior desaparece, no avisa un null', async () => {
    const user = userEvent.setup();
    const calls = [];
    const Dynamic = () => {
      const [value, setValue] = useState('10:30');
      const options = HOURS.some((o) => o.value === value) ? HOURS : [...HOURS, { value, label: '10:30 AM' }];
      return <Select options={options} value={value} onChange={(v) => { calls.push(v); setValue(v); }} />;
    };
    render(<Dynamic />);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: '9:00 AM' }));
    expect(calls).toEqual(['09:00']);
    expect(screen.getByRole('combobox')).toHaveTextContent('9:00 AM');
  });
});

describe('Select — scroll con la lista abierta', () => {
  it('scrollear la página no la cierra (Base UI la reposiciona) y scrollear la propia lista tampoco', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('combobox', { name: 'Hora' }));
    const listbox = await screen.findByRole('listbox');
    fireEvent.scroll(window);
    fireEvent.scroll(document);
    fireEvent.scroll(listbox);
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('acepta aria-label (sin etiqueta visible) y puede ocultar la flecha', () => {
    const { container } = render(
      <Select options={HOURS} value="08:00" onChange={vi.fn()} aria-label="Estado del presupuesto #1" showIcon={false} />,
    );
    expect(screen.getByRole('combobox', { name: 'Estado del presupuesto #1' })).toHaveTextContent('8:00 AM');
    expect(container.querySelector('svg')).toBeNull();
  });
});

describe('Select — aria-describedby', () => {
  it('reenvía aria-describedby al trigger', () => {
    render(
      <>
        <Select aria-label="IVA" aria-describedby="iva-message" options={HOURS} value="" onChange={() => {}} />
        <p id="iva-message">Elegí una alícuota</p>
      </>,
    );
    expect(screen.getByRole('combobox', { name: 'IVA' })).toHaveAttribute('aria-describedby', 'iva-message');
  });
});
