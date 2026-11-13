import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import Tabs from '@ui/Tabs';

const ITEMS = [
  { value: 'a', label: 'Atenciones' },
  { value: 'b', label: 'Presupuestos' },
  { value: 'c', label: 'Turnos' },
];

const mounted = [];
const Panel = ({ name }) => {
  mounted.push(name);
  return <p>Panel {name}</p>;
};

const Controlled = () => {
  const [value, setValue] = useState('a');
  return (
    <Tabs items={ITEMS} value={value} onValueChange={setValue}>
      <Panel name={value} />
    </Tabs>
  );
};

describe('Tabs', () => {
  it('flecha derecha + Enter activa la segunda pestaña y muestra su panel', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    screen.getByRole('tab', { name: 'Atenciones' }).focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Presupuestos' })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(screen.getByRole('tab', { name: 'Presupuestos' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel b')).toBeInTheDocument();
  });

  it('el tabpanel se llama como la pestaña activa', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Atenciones');
    await user.click(screen.getByRole('tab', { name: 'Turnos' }));
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Turnos');
  });

  it('monta solo el panel activo', () => {
    mounted.length = 0;
    render(<Controlled />);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(new Set(mounted)).toEqual(new Set(['a']));
  });
});
