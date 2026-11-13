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
    {
      id: 'TC-03',
      path: '/settings',
      steps: async (page) => {
        await page.getByRole('button', { name: /Agregar plan/ }).click();
      },
      // Los inputs del plan deben verse igual que los de "Datos del lubricentro" (misma página).
      check: async (page) => {
        const props = ['height', 'backgroundColor', 'paddingLeft', 'borderRadius', 'fontSize', 'boxShadow'];
        const read = (loc) => loc.evaluate((el, ps) => Object.fromEntries(ps.map((p) => [p, getComputedStyle(el)[p]])), props);
        const ref = await read(page.getByPlaceholder('Ej: Lubricentro El Rápido'));
        const plan = await read(page.getByRole('form', { name: 'Crear plan' }).getByPlaceholder('Ej: VISA'));
        const labelColor = (loc) => loc.evaluate((el) => getComputedStyle(el).color);
        const refLabel = await labelColor(page.locator('label', { hasText: 'Nombre del Lubricentro' }));
        const planLabel = await labelColor(page.getByRole('form', { name: 'Crear plan' }).locator('label', { hasText: 'Nombre del plan' }));
        const diff = props.filter((p) => ref[p] !== plan[p]);
        if (refLabel !== planLabel) diff.push('labelColor');
        return { pass: diff.length === 0, reason: diff.length ? `difiere: ${diff.join(', ')}` : undefined, facts: { ref, plan, refLabel, planLabel } };
      },
    },
  ],
};
