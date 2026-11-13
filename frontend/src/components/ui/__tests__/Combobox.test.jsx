import { useState } from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Combobox from '@ui/Combobox';
import Dialog from '@ui/Dialog';

const CATEGORIES = [
  { value: '1', label: 'Aceites', depth: 0 },
  { value: '2', label: 'Filtros', depth: 0 },
  { value: '3', label: 'Filtros de aire', depth: 1 },
];
const BRANDS = [
  { value: 'Shell', label: 'Shell' },
  { value: 'YPF', label: 'YPF' },
  { value: 'Castrol', label: 'Castrol' },
];

const Controlled = ({ initial = null, onChange = vi.fn(), options = CATEGORIES, ...props }) => {
  const [value, setValue] = useState(initial);
  return (
    <>
      <span id="cat-label">Categoría</span>
      <Combobox
        options={options}
        value={value}
        onChange={(v) => { setValue(v); onChange(v); }}
        aria-labelledby="cat-label"
        {...props}
      />
    </>
  );
};

const openList = async (user, name = 'Categoría') => {
  await user.click(screen.getByRole('combobox', { name }));
  return screen.findByRole('listbox');
};

describe('Combobox — simple', () => {
  it('escribir filtra localmente y elegir llama onChange y muestra la etiqueta', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await openList(user);
    await user.type(screen.getByRole('combobox', { name: 'Buscar' }), 'Filt');
    expect(screen.queryByRole('option', { name: 'Aceites' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Filtros' }));
    expect(onChange).toHaveBeenLastCalledWith('2');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveTextContent('Filtros');
  });

  it('las opciones hijas se indentan y tienen el texto completo en el tooltip', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await openList(user);
    const child = screen.getByRole('option', { name: 'Filtros de aire' });
    expect(child).toHaveAttribute('title', 'Filtros de aire');
    expect(child.style.paddingLeft).toBe('26px');
  });

  it('en las hijas la guía va antes del indicador (las casillas quedan alineadas como antes)', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await openList(user);
    const child = screen.getByRole('option', { name: 'Filtros de aire' });
    expect(child.firstElementChild).toHaveAttribute('data-slot', 'combobox-item-guide');
    expect(child.children[1]).toHaveAttribute('data-slot', 'combobox-item-indicator');
    const root = screen.getByRole('option', { name: 'Aceites' });
    expect(root.querySelector('[data-slot="combobox-item-guide"]')).toBeNull();
  });

  it('"Limpiar" (clearable) llama onChange(null)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial="2" onChange={onChange} />);
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveTextContent('Filtros');
    await user.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.queryByRole('button', { name: 'Limpiar' })).not.toBeInTheDocument();
  });

  it('sin valor no muestra "Limpiar"; con clearable=false tampoco', () => {
    const { unmount } = render(<Controlled />);
    expect(screen.queryByRole('button', { name: 'Limpiar' })).not.toBeInTheDocument();
    unmount();
    render(<Controlled initial="1" clearable={false} />);
    expect(screen.queryByRole('button', { name: 'Limpiar' })).not.toBeInTheDocument();
  });

  it('error marca el borde en rojo; disabled no abre', async () => {
    const user = userEvent.setup();
    render(<Controlled error disabled />);
    const trigger = screen.getByRole('combobox', { name: 'Categoría' });
    expect(trigger).toHaveClass('border-error');
    await user.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('Combobox — búsqueda remota', () => {
  it('llama onSearch con el texto (debounce), no filtra local y al cerrar lo llama con ""', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<Controlled onSearch={onSearch} />);
    await openList(user);
    await user.type(screen.getByRole('combobox', { name: 'Buscar' }), 'acei');
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('acei'));
    expect(onSearch).not.toHaveBeenCalledWith('a');
    // filtra el backend: las opciones recibidas se muestran todas
    expect(screen.getByRole('option', { name: 'Filtros' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onSearch).toHaveBeenLastCalledWith(''));
  });

  it('elegir una opción después de buscar deja la búsqueda en "" (no queda aplicada la etiqueta)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSearch = vi.fn();
      render(<Controlled onSearch={onSearch} />);
      await openList(user);
      await user.type(screen.getByRole('combobox', { name: 'Buscar' }), 'Filt');
      await act(async () => { vi.advanceTimersByTime(400); });
      expect(onSearch).toHaveBeenLastCalledWith('Filt');
      await user.click(screen.getByRole('option', { name: 'Filtros' }));
      await act(async () => { vi.advanceTimersByTime(1000); });
      expect(onSearch).toHaveBeenLastCalledWith('');
      expect(onSearch).not.toHaveBeenCalledWith('Filtros');
    } finally {
      vi.useRealTimers();
    }
  });

  it('abrir y cerrar sin escribir no llama onSearch (no hubo búsqueda que limpiar)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSearch = vi.fn();
      render(<Controlled onSearch={onSearch} />);
      await openList(user);
      await user.keyboard('{Escape}');
      await act(async () => { vi.advanceTimersByTime(1000); });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(onSearch).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('con loading muestra "Cargando…"', async () => {
    const user = userEvent.setup();
    render(<Controlled loading onSearch={vi.fn()} />);
    await user.click(screen.getByRole('combobox', { name: 'Categoría' }));
    expect(await screen.findByText('Cargando…')).toBeInTheDocument();
  });

  it('sin opciones y sin loading muestra "Sin resultados"', async () => {
    const user = userEvent.setup();
    render(<Controlled options={[]} onSearch={vi.fn()} />);
    await user.click(screen.getByRole('combobox', { name: 'Categoría' }));
    expect(await screen.findByText('Sin resultados')).toBeInTheDocument();
  });

  it('el valor elegido conserva su etiqueta aunque ya no esté entre las opciones', () => {
    const { rerender } = render(<Combobox options={CATEGORIES} value="2" onChange={vi.fn()} onSearch={vi.fn()} />);
    rerender(<Combobox options={[]} value="2" onChange={vi.fn()} onSearch={vi.fn()} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Filtros');
  });
});

describe('Combobox — múltiple', () => {
  it('elegir "Shell" y "YPF" llama onChange con ambos y muestra dos chips', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled multiple initial={[]} options={BRANDS} onChange={onChange} placeholder="Marcas..." />);
    await openList(user);
    await user.click(screen.getByRole('option', { name: 'Shell' }));
    await user.click(screen.getByRole('option', { name: 'YPF' }));
    expect(onChange).toHaveBeenLastCalledWith(['Shell', 'YPF']);
    expect(screen.getByRole('button', { name: 'Quitar Shell' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar YPF' })).toBeInTheDocument();
  });

  it('quitar el chip "Shell" deja solo "YPF" sin abrir la lista', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled multiple initial={['Shell', 'YPF']} options={BRANDS} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Quitar Shell' }));
    expect(onChange).toHaveBeenCalledWith(['YPF']);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Enter/Espacio sobre la ✕ de un chip lo quita sin abrir la lista', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled multiple initial={['Shell', 'YPF']} options={BRANDS} onChange={onChange} />);
    screen.getByRole('button', { name: 'Quitar Shell' }).focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['YPF']);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    screen.getByRole('button', { name: 'Quitar YPF' }).focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith([]);
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('con más de 2 elegidos muestra "N seleccionados"; "Limpiar selección" vacía', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled multiple initial={['Shell', 'YPF', 'Castrol']} options={BRANDS} onChange={onChange} />);
    expect(screen.getByText('3 seleccionados')).toBeInTheDocument();
    await openList(user);
    await user.click(screen.getByRole('button', { name: 'Limpiar selección' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('Combobox — múltiple clearable', () => {
  it('el botón "Limpiar" llama onChange([]) y desaparece', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled multiple clearable initial={['Shell', 'YPF']} options={BRANDS} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole('button', { name: 'Limpiar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Quitar/ })).not.toBeInTheDocument();
  });
});

describe('Combobox — dentro de un Dialog', () => {
  it('Escape con la lista abierta cierra solo la lista; con la lista cerrada, el diálogo', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    render(
      <Dialog isOpen onClose={close} title="Producto" formId="product-form">
        <Controlled />
      </Dialog>,
    );
    await openList(user);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(close).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Categoría' }), { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('en un diálogo apilado, click en una opción la elige y ambos diálogos siguen abiertos', async () => {
    const user = userEvent.setup();
    const closeBottom = vi.fn();
    const closeTop = vi.fn();
    const onChange = vi.fn();
    render(
      <Dialog isOpen onClose={closeBottom} title="Vehículo" formId="vehicle-form">
        <Dialog isOpen onClose={closeTop} title="Cliente" formId="customer-form">
          <Controlled onChange={onChange} />
        </Dialog>
      </Dialog>,
    );
    await openList(user);
    await user.click(screen.getByRole('option', { name: 'Aceites' }));
    expect(onChange).toHaveBeenCalledWith('1');
    expect(closeTop).not.toHaveBeenCalled();
    expect(closeBottom).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Cliente' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Vehículo', hidden: true })).toBeInTheDocument();
  });
});

describe('Combobox — scroll con la lista abierta', () => {
  it('scrollear la página no la cierra (Base UI la reposiciona) y scrollear la propia lista tampoco', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const listbox = await openList(user);
    fireEvent.scroll(window);
    fireEvent.scroll(document);
    fireEvent.scroll(listbox);
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
