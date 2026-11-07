import React, { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImageLightbox from '@ui/ImageLightbox';

const images = [
  { src: '/a.jpg', alt: 'Aceite', title: 'Aceite', subtitle: 'A1' },
  { src: '/b.jpg', alt: 'Bujía', title: 'Bujía' },
  { src: '/c.jpg', alt: 'Correa', title: 'Correa' },
];

const Harness = ({ items = images, start = 0, onClose }) => {
  const [index, setIndex] = useState(start);
  return (
    <>
      <button type="button" onClick={() => setIndex(0)}>Abrir</button>
      <ImageLightbox
        images={items}
        index={index}
        onIndexChange={setIndex}
        onClose={() => { setIndex(null); onClose?.(); }}
      />
    </>
  );
};

const counter = () => within(screen.getByRole('dialog')).getByText(/\d+ \/ \d+/).textContent;
const bigImg = () => within(screen.getByRole('dialog')).getAllByRole('img')[0];

describe('ImageLightbox', () => {
  it('no renderiza con index null o fuera de rango', () => {
    const { rerender } = render(<ImageLightbox images={images} index={null} onClose={vi.fn()} onIndexChange={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(<ImageLightbox images={images} index={7} onClose={vi.fn()} onIndexChange={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('con una sola imagen no muestra flechas, contador ni miniaturas', () => {
    render(<Harness items={[images[0]]} />);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).queryByRole('button', { name: 'Imagen siguiente' })).toBeNull();
    expect(within(dialog).queryByText(/\d+ \/ \d+/)).toBeNull();
    expect(within(dialog).queryByRole('button', { name: /^Ver / })).toBeNull();
  });

  it('navega con flechas, teclado (con vuelta) y miniaturas', () => {
    render(<Harness />);
    expect(counter()).toBe('1 / 3');
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(counter()).toBe('3 / 3');
    fireEvent.click(screen.getByRole('button', { name: 'Imagen siguiente' }));
    expect(counter()).toBe('1 / 3');
    fireEvent.click(screen.getByRole('button', { name: 'Ver Bujía' }));
    expect(counter()).toBe('2 / 3');
    expect(screen.getByRole('button', { name: 'Ver Bujía' })).toHaveAttribute('aria-current', 'true');
  });

  it('el zoom se apaga al cambiar de imagen', () => {
    render(<Harness />);
    fireEvent.click(bigImg());
    expect(bigImg().style.transform).toBe('scale(2.5)');
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(bigImg().style.transform).toBe('scale(1)');
  });

  it('cierra con clic en zona vacía pero no con clic en la imagen ni en el título', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.click(bigImg());
    fireEvent.click(screen.getByText('A1'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('bloquea el scroll y lo restaura al cerrar', () => {
    document.body.style.overflow = 'auto';
    render(<Harness />);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(document.body.style.overflow).toBe('auto');
  });

  it('enfoca Cerrar al abrir, atrapa Tab y devuelve el foco al cerrar', () => {
    render(<Harness start={null} />);
    const opener = screen.getByRole('button', { name: 'Abrir' });
    opener.focus();
    fireEvent.click(opener);
    const close = screen.getByRole('button', { name: 'Cerrar' });
    expect(close).toHaveFocus();

    const buttons = within(screen.getByRole('dialog')).getAllByRole('button');
    buttons[buttons.length - 1].focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(buttons[0]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(opener).toHaveFocus();
  });
});
