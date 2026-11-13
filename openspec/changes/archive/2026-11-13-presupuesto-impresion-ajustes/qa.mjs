// QA visual de presupuesto-impresion-ajustes (ver qa.md).
//   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs \
//     openspec/changes/presupuesto-impresion-ajustes/qa.mjs --out tmp/qa/presupuesto-impresion-ajustes
export default {
  slug: 'presupuesto-impresion-ajustes',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-06',
      path: '/budgets',
      steps: async (page) => {
        await page.locator('button[title="Imprimir"]').first().click();
        await page.waitForURL(/\/budgets\/\d+\/print/);
        await page.locator('#budget-print-sheet').waitFor();
      },
      check: async (page) => {
        const facts = await page.evaluate(() => {
          const box = (id) => {
            const el = document.querySelector(`[data-testid="${id}"]`);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { text: el.textContent, w: Math.round(r.width), overflow: el.scrollWidth > el.clientWidth };
          };
          return {
            url: location.pathname,
            day: box('print-day'), month: box('print-month'), year: box('print-year'),
            name: document.querySelector('[data-testid="print-customer-name"]')?.textContent,
            headers: [...document.querySelectorAll('#budget-print-sheet th')].map((th) => th.textContent),
          };
        });
        const problems = [];
        if (facts.year?.text && !/^\d{2}$/.test(facts.year.text)) problems.push(`año "${facts.year.text}"`);
        if (!facts.headers.includes('ARTÍCULO') || facts.headers.includes('DESCRIPCIÓN')) problems.push('encabezado');
        if ([facts.day, facts.month, facts.year].some((b) => !b || b.overflow)) problems.push('recuadro de fecha faltante o desbordado');
        if (facts.year && facts.day && Math.abs(facts.year.w - facts.day.w) > 2) problems.push('ancho del año distinto al del día');
        return { pass: problems.length === 0, reason: problems.join('; ') || undefined, facts };
      },
    },
  ],
};
