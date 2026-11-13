// QA: formulario de planes de cuotas con labels visibles (docs/fixes/2026-11-13-form-planes-cuotas.md)
const LABELS = ['Nombre del plan', 'Cuotas', 'Recargo %', 'Orden'];

export default {
  slug: 'form-planes-cuotas',
  combos: ['desktop-dark', 'desktop-light'],
  cases: [
    {
      id: 'TC-02',
      path: '/settings',
      steps: async (page) => {
        await page.getByRole('button', { name: /Agregar plan/ }).click();
      },
      check: async (page) => {
        const form = page.getByRole('form', { name: 'Crear plan' });
        const facts = {};
        let pass = true;
        const reasons = [];
        for (const label of LABELS) {
          const input = form.getByLabel(label, { exact: true });
          const visible = await form.locator('label', { hasText: label }).isVisible();
          // Ancho útil del input vs ancho del placeholder renderizado con la misma fuente.
          const m = await input.evaluate((el) => {
            const cs = getComputedStyle(el);
            const ctx = document.createElement('canvas').getContext('2d');
            ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            const spin = el.type === 'number' ? 16 : 0;
            const rect = el.getBoundingClientRect().width; const usable = rect - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - spin;
            return { w: Math.round(rect), cw: el.clientWidth, pl: cs.paddingLeft, usable: Math.round(usable), text: Math.ceil(ctx.measureText(el.placeholder).width), placeholder: el.placeholder };
          });
          facts[label] = { visible, ...m };
          if (!visible) { pass = false; reasons.push(`label "${label}" no visible`); }
          if (m.text > m.usable) { pass = false; reasons.push(`placeholder "${m.placeholder}" cortado`); }
        }
        return { pass, reason: reasons.join('; ') || undefined, facts };
      },
    },
  ],
};
