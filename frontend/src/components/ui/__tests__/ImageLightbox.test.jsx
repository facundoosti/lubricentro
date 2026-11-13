import React, { useState } from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ImageLightbox from '@ui/ImageLightbox';
import Dialog from '@ui/Dialog';

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
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowLeft' });
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
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
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

  it('bloquea el scroll y lo restaura al cerrar', async () => {
    const locked = () => document.documentElement.style.overflowY === 'hidden' || document.body.style.overflowY === 'hidden';
    render(<Harness />);
    await waitFor(() => expect(locked()).toBe(true));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(locked()).toBe(false));
  });

  it('enfoca Cerrar al abrir, atrapa Tab y devuelve el foco al cerrar', async () => {
    const user = userEvent.setup();
    render(<Harness start={null} />);
    const opener = screen.getByRole('button', { name: 'Abrir' });
    await user.click(opener);
    const close = screen.getByRole('button', { name: 'Cerrar' });
    await waitFor(() => expect(close).toHaveFocus());

    const buttons = within(screen.getByRole('dialog')).getAllByRole('button');
    buttons[buttons.length - 1].focus();
    await user.tab();
    await waitFor(() => expect(buttons[0]).toHaveFocus());

    await user.keyboard('{Escape}');
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('Shift+Tab desde el primer botón va al último', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const buttons = within(screen.getByRole('dialog')).getAllByRole('button');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus());
    buttons[0].focus();
    await user.tab({ shift: true });
    await waitFor(() => expect(buttons[buttons.length - 1]).toHaveFocus());
  });

  it('con otro diálogo encima, las flechas y Escape no actúan sobre el visor', () => {
    const onClose = vi.fn();
    const closeTop = vi.fn();
    const Page = ({ topOpen }) => {
      const [index, setIndex] = useState(0);
      return (
        <>
          <ImageLightbox images={images} index={index} onIndexChange={setIndex} onClose={onClose} />
          <Dialog isOpen={topOpen} onClose={closeTop} title="Encima">contenido</Dialog>
        </>
      );
    };
    const { rerender } = render(<Page topOpen={false} />);
    rerender(<Page topOpen />);
    const viewer = screen.getByRole('dialog', { name: 'Imagen de Aceite', hidden: true });
    const top = screen.getByRole('dialog', { name: 'Encima' });
    // el foco está atrapado en el de arriba: el teclado le llega a él, no al visor
    fireEvent.keyDown(top, { key: 'ArrowRight' });
    expect(within(viewer).getByText('1 / 3')).toBeInTheDocument();
    fireEvent.keyDown(top, { key: 'Escape' });
    expect(closeTop).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});

