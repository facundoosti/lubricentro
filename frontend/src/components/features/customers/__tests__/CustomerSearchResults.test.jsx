import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CustomerSearchResults from '@components/features/customers/CustomerSearchResults';

const customers = [
  { id: 1, name: 'Juan Pérez', email: 'juan@test.com', phone: '111' },
  { id: 2, name: 'Ana Gómez', email: null, phone: '222' },
  { id: 3, name: 'Sin Datos', email: null, phone: null },
];

const renderResults = (props = {}) => {
  const handlers = { onSelect: vi.fn(), onHighlight: vi.fn(), onCreateNew: vi.fn() };
  render(
    <CustomerSearchResults
      listRef={{ current: null }}
      style={{ position: 'fixed', top: 10 }}
      isLoading={false}
      customers={[]}
      highlightedIndex={-1}
      hasSearchTerm={false}
      canCreate={false}
      searchText=""
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

describe('CustomerSearchResults', () => {
  it('se renderiza en un portal al body con el style recibido', () => {
    renderResults();
    const list = screen.getByTestId('customer-search-results');
    expect(list.parentElement).toBe(document.body);
    expect(list).toHaveStyle({ position: 'fixed', top: '10px' });
  });

  it('muestra "Buscando..." mientras carga', () => {
    renderResults({ isLoading: true, customers });
    expect(screen.getByText('Buscando...')).toBeInTheDocument();
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
  });

  it('vacío sin término invita a escribir', () => {
    renderResults();
    expect(screen.getByText('Escribe para buscar')).toBeInTheDocument();
  });

  it('vacío con término indica que no hay resultados', () => {
    renderResults({ hasSearchTerm: true });
    expect(screen.getByText('No se encontraron clientes')).toBeInTheDocument();
  });

  it('lista los clientes con su contacto y resalta el índice', () => {
    renderResults({ customers, highlightedIndex: 1, hasSearchTerm: true });
    expect(screen.getByText('juan@test.com')).toBeInTheDocument();
    expect(screen.getByText('222')).toBeInTheDocument();
    expect(screen.getByText('Sin contacto')).toBeInTheDocument();

    const highlighted = screen.getByRole('button', { name: /Ana Gómez/ });
    expect(highlighted).toHaveClass('bg-primary/10');
    expect(screen.getByRole('button', { name: /Juan Pérez/ })).not.toHaveClass('bg-primary/10');
  });

  it('click en un cliente llama a onSelect y hover a onHighlight', async () => {
    const user = userEvent.setup();
    const { onSelect, onHighlight } = renderResults({ customers, hasSearchTerm: true });

    await user.hover(screen.getByRole('button', { name: /Sin Datos/ }));
    expect(onHighlight).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('button', { name: /Juan Pérez/ }));
    expect(onSelect).toHaveBeenCalledWith(customers[0]);
  });

  it('sin canCreate no ofrece crear cliente', () => {
    renderResults({ hasSearchTerm: true, searchText: 'Pedro' });
    expect(screen.queryByRole('button', { name: /Crear cliente/ })).not.toBeInTheDocument();
  });

  it('con canCreate ofrece "+ Crear cliente" como última opción y llama a onCreateNew', async () => {
    const user = userEvent.setup();
    const { onCreateNew, onHighlight } = renderResults({
      customers,
      hasSearchTerm: true,
      canCreate: true,
      searchText: 'Pedro',
      highlightedIndex: customers.length,
    });

    const create = screen.getByRole('button', { name: '+ Crear cliente "Pedro"' });
    const buttons = screen.getAllByRole('button');
    expect(buttons[buttons.length - 1]).toBe(create);
    expect(create).toHaveClass('bg-primary/10');

    await user.hover(create);
    expect(onHighlight).toHaveBeenCalledWith(customers.length);

    await user.click(create);
    expect(onCreateNew).toHaveBeenCalledTimes(1);
  });
});
