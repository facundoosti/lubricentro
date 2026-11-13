import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { Search } from 'lucide-react';
import { describe, it, expect, vi } from 'vitest';
import Input from '@ui/Input';

describe('Input', () => {
  it('estilo compacto por defecto', () => {
    render(<Input aria-label="Nombre" />);
    const input = screen.getByRole('textbox', { name: 'Nombre' });
    expect(input).toHaveClass('px-3', 'py-2', 'bg-surface-variant', 'border-outline-variant');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('size="sm" usa px-2 py-1.5', () => {
    render(<Input aria-label="Cant" size="sm" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-2', 'py-1.5');
    expect(input).not.toHaveClass('px-3', 'py-2');
  });

  it('className reemplaza las clases del componente (cn)', () => {
    render(<Input aria-label="X" className="px-6" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-6');
    expect(input).not.toHaveClass('px-3');
  });

  it('error → aria-invalid (el borde rojo sale de aria-invalid:border-error)', () => {
    render(<Input aria-label="Email" error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('aria-invalid:border-error');
  });

  it('sin error no marca aria-invalid', () => {
    render(<Input aria-label="Email" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('startIcon muestra el ícono a la izquierda y deja padding (pl-9)', () => {
    const { container } = render(<Input aria-label="Buscar" startIcon={Search} />);
    expect(screen.getByRole('textbox')).toHaveClass('pl-9');
    const icon = container.querySelector('svg');
    expect(icon).toHaveClass('pointer-events-none', 'left-3');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('startIcon con size="sm" usa pl-7', () => {
    render(<Input aria-label="Buscar" size="sm" startIcon={Search} />);
    expect(screen.getByRole('textbox')).toHaveClass('pl-7');
  });

  it('funciona con register de react-hook-form', async () => {
    const onSubmit = vi.fn();
    const Form = () => {
      const { register, handleSubmit } = useForm({ defaultValues: { name: '' } });
      return (
        <form onSubmit={handleSubmit((d) => onSubmit(d))}>
          <Input aria-label="Nombre" {...register('name')} />
          <button type="submit">Enviar</button>
        </form>
      );
    };
    render(<Form />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Juan');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Juan' });
  });
});
