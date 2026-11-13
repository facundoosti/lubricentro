import { screen, fireEvent, act, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useForm } from 'react-hook-form';
import { renderWithProviders } from '@/test/utils';
import ItemsEditor from '@components/features/items/ItemsEditor';
import { emptyItem } from '@utils/items';

vi.mock('@services/productsService', () => ({ useProducts: vi.fn() }));
vi.mock('@services/servicesService', () => ({ useServices: vi.fn() }));

import { useProducts } from '@services/productsService';
import { useServices } from '@services/servicesService';

const products = [{ id: 1, name: 'Aceite 5W30', unit_price: '10000.0', iva_rate: '10.5', stock: 3 }];
const services = [{ id: 7, name: 'Lavado de motor', base_price: '5000.0' }];

let formApi;
const Harness = ({ items = [emptyItem(0)], onRemoveSaved, headerAction }) => {
  const form = useForm({ defaultValues: { items_attributes: items } });
  formApi = form;
  return (
    <form onSubmit={form.handleSubmit(() => {})}>
      <ItemsEditor
        control={form.control}
        register={form.register}
        setValue={form.setValue}
        getValues={form.getValues}
        errors={form.formState.errors.items_attributes}
        onRemoveSaved={onRemoveSaved}
        headerAction={headerAction}
      />
      <button type="submit">guardar</button>
    </form>
  );
};

const rows = () => screen.getAllByTestId('item-row');
const search = (row, text) => {
  fireEvent.change(within(row).getByRole('combobox', { name: 'Producto o servicio' }), { target: { value: text } });
  act(() => { vi.advanceTimersByTime(300); });
};

beforeEach(() => {
  vi.useFakeTimers();
  useProducts.mockReturnValue({ data: { data: { products } }, isLoading: false });
  useServices.mockReturnValue({ data: { data: { services } }, isLoading: false });
});
afterEach(() => vi.useRealTimers());

describe('ItemsEditor', () => {
  it('se titula "Productos y Servicios" con sus columnas', () => {
    renderWithProviders(<Harness />);
    expect(screen.getByRole('heading', { name: /Productos y Servicios/ })).toHaveTextContent('(1)');
    expect(screen.getByText('Producto / servicio', { selector: 'span[class]' })).toBeInTheDocument();
    const header = screen.getByText('Cant.').parentElement;
    expect([...header.children].map((c) => c.textContent)).toEqual([
      'Cant.', 'Producto / servicio', 'Precio unit. s/IVA', '% Ganancia', 'IVA', 'Importe final', '',
    ]);
    expect(document.body.textContent).not.toMatch(/Artículos/);
  });

  it('muestra la acción extra de la cabecera', () => {
    renderWithProviders(<Harness headerAction={<button type="button">extra</button>} />);
    expect(screen.getByRole('button', { name: 'extra' })).toBeInTheDocument();
  });

  it('al elegir un producto guarda precio, % IVA, ganancia 30% y product_id', () => {
    renderWithProviders(<Harness />);
    expect(within(rows()[0]).getByLabelText('% Ganancia línea 1')).toHaveValue(0);
    search(rows()[0], 'ace');
    fireEvent.mouseDown(screen.getByRole('option', { name: /Aceite 5W30/ }));

    expect(within(rows()[0]).getByRole('combobox', { name: '% IVA línea 1' })).toHaveTextContent('10,5%');
    expect(within(rows()[0]).getByLabelText('% Ganancia línea 1')).toHaveValue(30);
    // 10.000 + 30% ganancia (3.000) + 10,5% IVA (1.050)
    expect(within(rows()[0]).getByTestId('line-total')).toHaveTextContent('$14.050');
    expect(formApi.getValues('items_attributes.0')).toMatchObject({
      description: 'Aceite 5W30', unit_price: 10000, iva_rate: '10.5', margin_percentage: 30, product_id: 1, service_id: null,
    });
  });

  it('al elegir un servicio queda "Sin IVA", sin ganancia y guarda service_id', () => {
    renderWithProviders(<Harness items={[{ ...emptyItem(0), margin_percentage: 30 }]} />);
    search(rows()[0], 'lav');
    fireEvent.mouseDown(screen.getByRole('option', { name: /Lavado de motor/ }));

    expect(within(rows()[0]).getByRole('combobox', { name: '% IVA línea 1' })).toHaveTextContent('Sin IVA');
    expect(within(rows()[0]).getByLabelText('% Ganancia línea 1')).toHaveValue(0);
    expect(formApi.getValues('items_attributes.0')).toMatchObject({ margin_percentage: 0, product_id: null, service_id: 7 });
  });

  it('el texto libre no cambia la ganancia (línea nueva = 0)', () => {
    renderWithProviders(<Harness />);
    search(rows()[0], 'Mano de obra');
    expect(formApi.getValues('items_attributes.0')).toMatchObject({ description: 'Mano de obra', margin_percentage: 0 });
  });

  it('cambiar la alícuota recalcula el importe de la línea', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const pickIva = async (label) => {
      await user.click(within(rows()[0]).getByRole('combobox', { name: '% IVA línea 1' }));
      await user.click(await screen.findByRole('option', { name: label }));
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    };
    renderWithProviders(<Harness items={[{ ...emptyItem(0), description: 'Mano de obra', unit_price: 1000 }]} />);
    expect(within(rows()[0]).getByTestId('line-total')).toHaveTextContent('$1.210');
    await pickIva('10,5%');
    expect(within(rows()[0]).getByTestId('line-total')).toHaveTextContent('$1.105');
    await pickIva('Sin IVA');
    expect(within(rows()[0]).getByTestId('line-total')).toHaveTextContent('$1.000');
    expect(formApi.getValues('items_attributes.0.iva_rate')).toBe('');
  });

  it('la ganancia se suma al importe final (1 × $1.000, 21%, 30% → $1.510)', () => {
    renderWithProviders(<Harness items={[{ ...emptyItem(0), description: 'Filtro', unit_price: 1000 }]} />);
    const margin = within(rows()[0]).getByLabelText('% Ganancia línea 1');
    expect(margin).toHaveValue(0);
    expect(margin).toHaveAttribute('step', '0.01');
    fireEvent.change(margin, { target: { value: '30' } });
    expect(within(rows()[0]).getByTestId('line-total')).toHaveTextContent('$1.510');
    fireEvent.change(margin, { target: { value: '' } });
    expect(within(rows()[0]).getByTestId('line-total')).toHaveTextContent('$1.210');
  });

  it('muestra un % guardado fuera de la lista como "(anterior)"', () => {
    renderWithProviders(<Harness items={[{ ...emptyItem(0), description: 'Viejo', unit_price: 1000, iva_rate: '15' }]} />);
    expect(within(rows()[0]).getByRole('combobox', { name: '% IVA línea 1' })).toHaveTextContent('15% (anterior)');
    expect(within(rows()[0]).getByTestId('line-total')).toHaveTextContent('$1.150');
  });

  it('marca una ganancia fuera de rango en una línea con descripción', async () => {
    vi.useRealTimers();
    renderWithProviders(<Harness items={[{ ...emptyItem(0), description: 'Mano de obra', unit_price: 1000 }]} />);
    fireEvent.change(within(rows()[0]).getByLabelText('% Ganancia línea 1'), { target: { value: '1000' } });
    // submit directo: saltea la validación nativa del navegador (max=999.99) y prueba la del form
    fireEvent.submit(screen.getByRole('button', { name: 'guardar' }).closest('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent('% Ganancia inválido');
  });

  it('marca cantidad 0 como inválida', async () => {
    vi.useRealTimers();
    renderWithProviders(<Harness items={[{ ...emptyItem(0), description: 'Filtro', unit_price: 1000 }]} />);
    fireEvent.change(within(rows()[0]).getByLabelText('Cantidad línea 1'), { target: { value: '0' } });
    fireEvent.submit(screen.getByRole('button', { name: 'guardar' }).closest('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Cantidad inválida');
  });

  it('editar a mano la descripción de un producto elegido conserva product_id; vaciarla lo limpia', () => {
    renderWithProviders(<Harness />);
    search(rows()[0], 'ace');
    fireEvent.mouseDown(screen.getByRole('option', { name: /Aceite 5W30/ }));

    search(rows()[0], 'Aceite 5W30 sintético');
    expect(formApi.getValues('items_attributes.0')).toMatchObject({ description: 'Aceite 5W30 sintético', product_id: 1 });

    search(rows()[0], '');
    expect(formApi.getValues('items_attributes.0')).toMatchObject({ description: '', product_id: null, service_id: null });
  });

  it('avisa los ids guardados que se quitan', () => {
    const onRemoveSaved = vi.fn();
    renderWithProviders(
      <Harness
        onRemoveSaved={onRemoveSaved}
        items={[{ ...emptyItem(0), id: 5, description: 'Filtro' }, { ...emptyItem(1), description: 'Aceite' }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Quitar línea 1' }));
    expect(onRemoveSaved).toHaveBeenCalledWith(5);
    expect(rows()).toHaveLength(1);
  });

  it('agrega una línea con "Agregar ítem"', () => {
    renderWithProviders(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Agregar ítem' }));
    expect(rows()).toHaveLength(2);
    expect(within(rows()[1]).getByRole('combobox', { name: '% IVA línea 2' })).toHaveTextContent('21%');
    expect(within(rows()[1]).getByLabelText('% Ganancia línea 2')).toHaveValue(0);
  });
});
