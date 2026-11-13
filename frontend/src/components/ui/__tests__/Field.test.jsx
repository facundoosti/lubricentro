import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Field from '@ui/Field';
import Input from '@ui/Input';
import Textarea from '@ui/Textarea';
import DateInput from '@ui/DateInput';
import Select from '@ui/Select';
import { useForm, Controller } from 'react-hook-form';

describe('Field', () => {
  it('asocia el label al control sin id explícito', () => {
    render(<Field label="Patente"><Input /></Field>);
    expect(screen.getByLabelText('Patente')).toBe(screen.getByRole('textbox'));
  });

  it('con Textarea y DateInput también asocia el label', () => {
    render(
      <>
        <Field label="Notas"><Textarea /></Field>
        <Field label="Fecha"><DateInput value="" onChange={() => {}} /></Field>
      </>,
    );
    expect(screen.getByLabelText('Notas').tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText('Fecha')).toHaveAttribute('placeholder', 'dd/mm/aaaa');
  });

  it('required muestra * después del label', () => {
    render(<Field label="Nombre" required><Input /></Field>);
    const star = screen.getByText('*');
    expect(star).toHaveClass('text-error');
    expect(star.closest('label')).toHaveTextContent('Nombre *');
    expect(screen.getByLabelText('Nombre *')).toBe(screen.getByRole('textbox'));
  });

  it('error muestra el mensaje con role="alert" y marca el control', () => {
    render(<Field label="Email" error="Email inválido"><Input /></Field>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Email inválido');
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', alert.id);
  });

  it('hint se muestra si no hay error', () => {
    const { rerender } = render(<Field label="Patente" hint="Sin espacios"><Input /></Field>);
    expect(screen.getByText('Sin espacios')).toHaveClass('text-on-surface-variant');
    rerender(<Field label="Patente" hint="Sin espacios" error="Requerida"><Input /></Field>);
    expect(screen.queryByText('Sin espacios')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Requerida');
  });

  it('con labelAddon lo muestra dentro del label', () => {
    render(<Field label="Marca" labelAddon={<span>Autocompletado</span>}><Input /></Field>);
    expect(screen.getByText('Autocompletado').closest('label')).toHaveTextContent('MarcaAutocompletado');
  });

  it('un contenedor DOM como hijo no se clona (el consumidor pasa el id)', () => {
    render(
      <Field id="plate" label="Patente" error="Requerida">
        <div data-testid="wrap"><Input id="plate" error /></div>
      </Field>,
    );
    expect(screen.getByTestId('wrap')).not.toHaveAttribute('id');
    expect(screen.getByLabelText('Patente')).toHaveAttribute('aria-invalid', 'true');
  });

  it('respeta el id propio del hijo', () => {
    render(<Field label="Teléfono"><Input id="phone" /></Field>);
    expect(screen.getByLabelText('Teléfono')).toHaveAttribute('id', 'phone');
  });

  it('expone labelId para controles con aria-labelledby (Select)', () => {
    render(
      <Field id="invoice" label="Tipo de factura">
        <Select aria-labelledby="invoice-label" options={[{ value: 'A', label: 'A' }]} value="" onChange={() => {}} />
      </Field>,
    );
    expect(screen.getByText('Tipo de factura').closest('label')).toHaveAttribute('id', 'invoice-label');
    expect(screen.getByRole('combobox', { name: 'Tipo de factura' })).toBeInTheDocument();
  });

  it('(a) si el hijo trae id, gana sobre el de Field y el htmlFor apunta a ese', () => {
    render(<Field id="field-id" label="Teléfono" error="Requerido"><Input id="child-id" /></Field>);
    const input = screen.getByLabelText('Teléfono');
    expect(input).toHaveAttribute('id', 'child-id');
    expect(screen.getByText('Teléfono').closest('label')).toHaveAttribute('for', 'child-id');
    expect(input).toHaveAttribute('aria-describedby', screen.getByRole('alert').id);
  });

  it('(b) a un componente genérico no le inyecta id, error ni aria-describedby', () => {
    const Generic = vi.fn(() => <span data-testid="generic" />);
    render(<Field id="g" label="Genérico" error="Mal"><Generic /></Field>);
    expect(Generic.mock.calls[0][0]).toEqual({});
  });

  it('(b) a Controller no le inyecta error ni aria-describedby (el consumidor se los pasa al control)', () => {
    const Wrapped = () => {
      const { control } = useForm({ defaultValues: { x: '' } });
      return (
        <Field id="x" label="Equis" error="Mal">
          <Controller name="x" control={control} render={({ field }) => <Input id="x" {...field} />} />
        </Field>
      );
    };
    render(<Wrapped />);
    const input = screen.getByLabelText('Equis');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('(b) a un <input> nativo solo le pone el id (sin aria-invalid ni aria-describedby)', () => {
    render(<Field label="Nativo" error="Mal"><input type="text" /></Field>);
    const input = screen.getByLabelText('Nativo');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('(b) Select recibe aria-describedby y error dentro de Field', () => {
    render(
      <Field id="iva" label="IVA" error="Elegí una alícuota">
        <Select aria-labelledby="iva-label" options={[{ value: '21', label: '21%' }]} value="" onChange={() => {}} />
      </Field>,
    );
    const trigger = screen.getByRole('combobox', { name: 'IVA' });
    expect(trigger).toHaveAttribute('aria-describedby', screen.getByRole('alert').id);
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
  });

  it('(c) sin un hijo elemento el label no lleva htmlFor', () => {
    render(<Field label="Solo texto">texto suelto</Field>);
    expect(screen.getByText('Solo texto').closest('label')).not.toHaveAttribute('for');
  });
});
