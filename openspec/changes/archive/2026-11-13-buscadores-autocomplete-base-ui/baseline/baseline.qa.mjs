// Línea base visual (task 1.1) de los buscadores ANTES de migrarlos a @ui/Autocomplete.
//
//   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs \
//     openspec/changes/buscadores-autocomplete-base-ui/baseline/baseline.qa.mjs \
//     --out openspec/changes/buscadores-autocomplete-base-ui/baseline
const BOTH = ['desktop-dark', 'desktop-light'];
const CUSTOMER_INPUT = '[role="dialog"] input[placeholder^="Buscar cliente"]';

const boxFacts = async (page, selector) => page.evaluate((sel) => (
  [...document.querySelectorAll(sel)].slice(0, 4).map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y),
      bg: cs.backgroundColor, border: cs.borderTopColor, radius: cs.borderRadius,
      font: `${cs.fontSize}/${cs.fontWeight}`, pad: cs.padding,
    };
  })
), selector);

export default {
  slug: 'buscadores-baseline',
  combos: BOTH,
  cases: [
    {
      id: 'TC-01', // Turno: buscador de clientes con la lista abierta
      path: '/appointments',
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo turno/i }).first().click();
        await page.getByRole('dialog').waitFor();
        await page.locator(CUSTOMER_INPUT).fill('a');
        await page.waitForTimeout(1200);
      },
      check: async (page) => ({
        pass: true,
        facts: {
          input: await boxFacts(page, CUSTOMER_INPUT),
          list: await boxFacts(page, '[data-testid="customer-search-results"]'),
          option: await boxFacts(page, '[data-testid="customer-search-results"] button'),
        },
      }),
    },
    {
      id: 'TC-02', // Vehículo: sin resultados + "+ Crear cliente"
      path: '/vehicles',
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo veh/i }).click();
        await page.getByRole('dialog').waitFor();
        await page.locator(CUSTOMER_INPUT).fill('Zzqx Inexistente');
        await page.waitForTimeout(1200);
      },
      check: async (page) => ({
        pass: true,
        facts: {
          input: await boxFacts(page, CUSTOMER_INPUT),
          list: await boxFacts(page, '[data-testid="customer-search-results"]'),
          create: await boxFacts(page, '[data-testid="customer-search-results"] button'),
        },
      }),
    },
    {
      id: 'TC-03', // Actualización masiva: buscador de productos con resultados
      path: '/products',
      steps: async (page) => {
        await page.getByRole('button', { name: 'Acciones' }).click();
        await page.getByRole('button', { name: /actualizar precios/i }).click();
        await page.getByRole('dialog').waitFor();
        await page.locator('[role="dialog"] input[placeholder^="Ej: aceite"]').fill('aceite');
        await page.waitForTimeout(1200);
      },
      check: async (page) => ({
        pass: true,
        facts: {
          input: await boxFacts(page, '[role="dialog"] input[placeholder^="Ej: aceite"]'),
          option: await boxFacts(page, '[role="dialog"] .max-h-56 button'),
        },
      }),
    },
  ],
};
