import { StrictMode, useRef, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useDialogLayer, BASE_Z_INDEX } from '@hooks/useDialogLayer';

// Diálogo mínimo sobre el hook: capa (fondo) + panel con role="dialog"
const TestDialog = ({ isOpen, onClose = () => {}, label, closeOnEscape, withInitialFocus, children }) => {
  const initialRef = useRef(null);
  const { panelRef, layerRef, level, zIndex, isTop } = useDialogLayer({
    isOpen,
    onClose,
    closeOnEscape,
    initialFocusRef: withInitialFocus ? initialRef : undefined,
  });
  if (!isOpen) return null;
  return (
    <div ref={layerRef} data-testid={`layer-${label}`} style={{ zIndex }} data-level={level} data-top={String(isTop)}>
      <div ref={panelRef} role="dialog" aria-label={label} tabIndex={-1}>
        {withInitialFocus && <button type="button" ref={initialRef}>Inicial</button>}
        {children}
      </div>
    </div>
  );
};

const Opener = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Abrir</button>
      <TestDialog isOpen={open} onClose={() => setOpen(false)} label="Panel">
        {children}
      </TestDialog>
    </>
  );
};

afterEach(() => {
  document.body.style.overflow = '';
});

describe('useDialogLayer — pila y Escape', () => {
  it('asigna nivel y z-index crecientes y solo el de arriba es isTop', () => {
    render(
      <>
        <TestDialog isOpen label="Abajo" />
        <TestDialog isOpen label="Arriba" />
      </>,
    );
    const bottom = screen.getByTestId('layer-Abajo');
    const top = screen.getByTestId('layer-Arriba');
    expect(Number(bottom.style.zIndex)).toBe(BASE_Z_INDEX);
    expect(Number(top.style.zIndex)).toBe(BASE_Z_INDEX + 10);
    expect(bottom.dataset.top).toBe('false');
    expect(top.dataset.top).toBe('true');
  });

  it('Escape cierra solo el de arriba', () => {
    const closeBottom = vi.fn();
    const closeTop = vi.fn();
    render(
      <>
        <TestDialog isOpen onClose={closeBottom} label="Abajo" />
        <TestDialog isOpen onClose={closeTop} label="Arriba" />
      </>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeTop).toHaveBeenCalledTimes(1);
    expect(closeBottom).not.toHaveBeenCalled();
  });

  it('Escape no cierra si un hijo lo atendió (defaultPrevented)', () => {
    const close = vi.fn();
    render(
      <TestDialog isOpen onClose={close} label="Panel">
        <input aria-label="Campo" onKeyDown={(e) => e.key === 'Escape' && e.preventDefault()} />
      </TestDialog>,
    );
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Campo' }), { key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
  });

  it('closeOnEscape=false ignora el Escape', () => {
    const close = vi.fn();
    render(<TestDialog isOpen onClose={close} label="Panel" closeOnEscape={false} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
  });
});

describe('useDialogLayer — foco y scroll', () => {
  it('enfoca el panel al abrir y devuelve el foco al cerrar', () => {
    render(<Opener />);
    const trigger = screen.getByRole('button', { name: 'Abrir' });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Panel' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('con initialFocusRef enfoca ese elemento', () => {
    render(<TestDialog isOpen label="Panel" withInitialFocus />);
    expect(screen.getByRole('button', { name: 'Inicial' })).toHaveFocus();
  });

  it('bloquea el scroll y restaura el overflow previo al cerrar el último', () => {
    document.body.style.overflow = 'scroll';
    const { rerender } = render(
      <>
        <TestDialog isOpen label="Abajo" />
        <TestDialog isOpen label="Arriba" />
      </>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <>
        <TestDialog isOpen label="Abajo" />
        <TestDialog isOpen={false} label="Arriba" />
      </>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <>
        <TestDialog isOpen={false} label="Abajo" />
        <TestDialog isOpen={false} label="Arriba" />
      </>,
    );
    expect(document.body.style.overflow).toBe('scroll');
  });
});

describe('useDialogLayer — trampa de foco', () => {
  const Fields = () => (
    <>
      <button type="button">Primero</button>
      <input aria-label="Medio" />
      <button type="button" disabled>Deshabilitado</button>
      <button type="button">Último</button>
    </>
  );

  it('Tab desde el último elemento vuelve al primero', () => {
    render(<TestDialog isOpen label="Panel"><Fields /></TestDialog>);
    const last = screen.getByRole('button', { name: 'Último' });
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Primero' })).toHaveFocus();
  });

  it('Shift+Tab desde el primer elemento va al último', () => {
    render(<TestDialog isOpen label="Panel"><Fields /></TestDialog>);
    const first = screen.getByRole('button', { name: 'Primero' });
    first.focus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: 'Último' })).toHaveFocus();
  });

  it('Tab en el medio no se intercepta', () => {
    render(<TestDialog isOpen label="Panel"><Fields /></TestDialog>);
    const first = screen.getByRole('button', { name: 'Primero' });
    first.focus();
    const event = fireEvent.keyDown(first, { key: 'Tab' });
    expect(event).toBe(true); // no preventDefault
  });

  it('sin enfocables, Tab deja el foco en el panel', () => {
    render(<TestDialog isOpen label="Panel"><p>texto</p></TestDialog>);
    const panel = screen.getByRole('dialog', { name: 'Panel' });
    expect(panel).toHaveFocus();
    fireEvent.keyDown(panel, { key: 'Tab' });
    expect(panel).toHaveFocus();
    fireEvent.keyDown(panel, { key: 'Tab', shiftKey: true });
    expect(panel).toHaveFocus();
  });

  it('solo el diálogo de arriba atrapa el Tab', () => {
    render(
      <>
        <TestDialog isOpen label="Abajo"><button type="button">Abajo1</button></TestDialog>
        <TestDialog isOpen label="Arriba"><button type="button">Arriba1</button><button type="button">Arriba2</button></TestDialog>
      </>,
    );
    const lowerButton = screen.getByRole('button', { name: 'Abajo1', hidden: true });
    lowerButton.focus();
    fireEvent.keyDown(lowerButton, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Arriba1' })).toHaveFocus();
  });

  it('ignora enfocables dentro de un contenedor con display:none', () => {
    render(
      <TestDialog isOpen label="Panel">
        <button type="button">Primero</button>
        <button type="button">Último</button>
        <div style={{ display: 'none' }}>
          <button type="button">Oculto</button>
        </div>
      </TestDialog>,
    );
    const last = screen.getByRole('button', { name: 'Último' });
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Primero' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('button', { name: 'Primero' }), { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  it('no mueve el foco que está en un portal fuera de la app (ej. lista desplegable)', () => {
    const outside = document.createElement('input');
    document.body.appendChild(outside);
    render(<TestDialog isOpen label="Panel"><button type="button">Uno</button></TestDialog>);
    outside.focus();
    const event = fireEvent.keyDown(outside, { key: 'Tab' });
    expect(event).toBe(true);
    expect(outside).toHaveFocus();
    outside.remove();
  });
});

describe('useDialogLayer — inert', () => {
  const withAppContent = () => {
    const app = document.createElement('div');
    app.setAttribute('data-app-content', '');
    document.body.appendChild(app);
    return app;
  };

  it('marca la app inert con un diálogo abierto y lo quita al cerrar el último', () => {
    const app = withAppContent();
    const { rerender } = render(<TestDialog isOpen label="Panel" />);
    expect(app).toHaveAttribute('inert');
    rerender(<TestDialog isOpen={false} label="Panel" />);
    expect(app).not.toHaveAttribute('inert');
    app.remove();
  });

  it('el diálogo de abajo queda inert mientras hay otro encima', () => {
    const app = withAppContent();
    const { rerender } = render(
      <>
        <TestDialog isOpen label="Abajo" />
        <TestDialog isOpen label="Arriba" />
      </>,
    );
    expect(screen.getByTestId('layer-Abajo')).toHaveAttribute('inert');
    expect(screen.getByTestId('layer-Arriba')).not.toHaveAttribute('inert');

    rerender(
      <>
        <TestDialog isOpen label="Abajo" />
        <TestDialog isOpen={false} label="Arriba" />
      </>,
    );
    expect(screen.getByTestId('layer-Abajo')).not.toHaveAttribute('inert');
    expect(app).toHaveAttribute('inert');

    rerender(
      <>
        <TestDialog isOpen={false} label="Abajo" />
        <TestDialog isOpen={false} label="Arriba" />
      </>,
    );
    expect(app).not.toHaveAttribute('inert');
    app.remove();
  });

  it('no marca inert a otros hijos de body (portales de listas, toasts)', () => {
    const portal = document.createElement('div');
    document.body.appendChild(portal);
    render(<TestDialog isOpen label="Panel" />);
    expect(portal).not.toHaveAttribute('inert');
    portal.remove();
  });
});

describe('useDialogLayer — ciclo de vida', () => {
  const withAppContent = () => {
    const app = document.createElement('div');
    app.setAttribute('data-app-content', '');
    document.body.appendChild(app);
    return app;
  };

  const Three = ({ open }) => (
    <>
      <TestDialog isOpen={open.a} onClose={open.closeA} label="A" />
      <TestDialog isOpen={open.b} onClose={open.closeB} label="B" />
      <TestDialog isOpen={open.c} onClose={open.closeC} label="C" />
    </>
  );

  it('desmontar con el diálogo abierto restaura inert y overflow', () => {
    const app = withAppContent();
    document.body.style.overflow = 'scroll';
    const { unmount } = render(<TestDialog isOpen label="Panel" />);
    expect(app).toHaveAttribute('inert');
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(app).not.toHaveAttribute('inert');
    expect(document.body.style.overflow).toBe('scroll');
    app.remove();
  });

  it('con tres apilados, cerrar el del medio mantiene inert, isTop y Escape correctos', () => {
    const app = withAppContent();
    const closeA = vi.fn();
    const closeC = vi.fn();
    const { rerender } = render(<Three open={{ a: true, b: true, c: true, closeA, closeC }} />);
    expect(Number(screen.getByTestId('layer-C').style.zIndex)).toBe(BASE_Z_INDEX + 20);

    rerender(<Three open={{ a: true, b: false, c: true, closeA, closeC }} />);
    const layerA = screen.getByTestId('layer-A');
    const layerC = screen.getByTestId('layer-C');
    expect(screen.queryByTestId('layer-B')).not.toBeInTheDocument();
    expect(layerA).toHaveAttribute('inert');
    expect(layerC).not.toHaveAttribute('inert');
    expect(layerA.dataset.top).toBe('false');
    expect(layerC.dataset.top).toBe('true');
    expect(Number(layerC.style.zIndex)).toBeGreaterThan(Number(layerA.style.zIndex));

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeC).toHaveBeenCalledTimes(1);
    expect(closeA).not.toHaveBeenCalled();

    rerender(<Three open={{ a: true, b: false, c: false, closeA, closeC }} />);
    expect(screen.getByTestId('layer-A')).not.toHaveAttribute('inert');
    expect(screen.getByTestId('layer-A').dataset.top).toBe('true');
    expect(app).toHaveAttribute('inert');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeA).toHaveBeenCalledTimes(1);
    app.remove();
  });

  it('cerrar el de abajo deja al de arriba como isTop y sin inert', () => {
    const { rerender } = render(
      <>
        <TestDialog isOpen label="Abajo" />
        <TestDialog isOpen label="Arriba" />
      </>,
    );
    rerender(
      <>
        <TestDialog isOpen={false} label="Abajo" />
        <TestDialog isOpen label="Arriba" />
      </>,
    );
    const top = screen.getByTestId('layer-Arriba');
    expect(top.dataset.top).toBe('true');
    expect(top).not.toHaveAttribute('inert');
  });

  it('en StrictMode la pila, inert y overflow quedan consistentes al cerrar', () => {
    const app = withAppContent();
    document.body.style.overflow = 'scroll';
    const closeBottom = vi.fn();
    const closeTop = vi.fn();
    const tree = (bottom, top) => (
      <StrictMode>
        <TestDialog isOpen={bottom} onClose={closeBottom} label="Abajo" />
        <TestDialog isOpen={top} onClose={closeTop} label="Arriba" />
      </StrictMode>
    );
    const { rerender } = render(tree(true, true));
    expect(screen.getByTestId('layer-Abajo')).toHaveAttribute('inert');
    expect(screen.getByTestId('layer-Abajo').dataset.top).toBe('false');
    expect(screen.getByTestId('layer-Arriba').dataset.top).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeTop).toHaveBeenCalledTimes(1);
    expect(closeBottom).not.toHaveBeenCalled();

    rerender(tree(true, false));
    expect(screen.getByTestId('layer-Abajo')).not.toHaveAttribute('inert');
    expect(screen.getByTestId('layer-Abajo').dataset.top).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');

    rerender(tree(false, false));
    expect(app).not.toHaveAttribute('inert');
    expect(document.body.style.overflow).toBe('scroll');
    app.remove();
  });

  it('si el elemento que tenía el foco se desconectó, cerrar no rompe', () => {
    const VanishingTrigger = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          {!open && <button type="button" onClick={() => setOpen(true)}>Abrir</button>}
          <TestDialog isOpen={open} onClose={() => setOpen(false)} label="Panel" />
        </>
      );
    };
    render(<VanishingTrigger />);
    const trigger = screen.getByRole('button', { name: 'Abrir' });
    trigger.focus();
    fireEvent.click(trigger);
    expect(trigger.isConnected).toBe(false);
    expect(() => fireEvent.keyDown(document, { key: 'Escape' })).not.toThrow();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir' })).toBeInTheDocument();
  });
});
