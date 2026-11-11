// QA visual — nombres de producto largos (hasta 500 caracteres).
// Plan: docs/qa/2026-11-11-nombres-largos.md
//
// No escribe en la base: intercepta las respuestas de la API y reemplaza el nombre del
// primer producto (o la descripción del primer ítem de presupuesto) por uno de ~490 caracteres.

const LONG_NAME = (
  'Filtro de aire pesado WAP-203 - JOHN DEERE 9900 Algodonera JD 540 - JD 540A JD 440c - JD 540B JD 450E - ' +
  'CATERPILLAR 950 / 966 / 980 - KOMATSU WA200 / WA320 / WA380 - NEW HOLLAND W130 / W170 / W190 - ' +
  'CASE 621 / 721 / 821 - VOLVO L60 / L70 / L90 - Equivalencias MANN C 23 610, BALDWIN PA 1890, ' +
  'FLEETGUARD AF 25139, DONALDSON P18 1052, FRAM CA 5432 - Aplicación agrícola y vial, motores ' +
  'diésel turboalimentados de 6 cilindros, 1998 en adelante (verificar medidas antes de instalar)'
);

const patchFirstProduct = (json) => {
  const list = json?.data?.products || (Array.isArray(json?.data) ? json.data : null);
  if (list?.[0]) list[0].name = LONG_NAME;
  return json;
};

async function mockProducts(page) {
  await page.route((url) => url.pathname === '/api/v1/products', async (route) => {
    const res = await route.fetch();
    return route.fulfill({ response: res, json: patchFirstProduct(await res.json()) });
  });
}

// Alto de línea y alto real del elemento: "2 líneas" = alto <= 2 * line-height (+1px de redondeo).
const lines = (locator) => locator.evaluate((el) => {
  const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.5;
  const r = el.getBoundingClientRect();
  return { height: Math.round(r.height), lineHeight: Math.round(lh), lines: Math.round(r.height / lh), width: Math.round(r.width) };
});

const pageOverflowX = (page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

async function openProducts(page) {
  await mockProducts(page);
  await page.goto('/products');
  await page.waitForLoadState('networkidle');
  await page.locator('tbody tr').first().waitFor();
}

export default {
  slug: 'nombres-largos',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-02',
      steps: openProducts,
      check: async (page) => {
        const name = page.getByTitle(LONG_NAME).first();
        const m = await lines(name);
        const overflowX = await pageOverflowX(page);
        const pass = m.lines <= 2 && !overflowX;
        return { pass, reason: pass ? undefined : `líneas=${m.lines} overflowX=${overflowX}`, facts: { ...m, overflowX } };
      },
    },
    {
      id: 'TC-03',
      steps: async (page) => {
        await openProducts(page);
        await page.locator('tbody tr').first().getByTitle('Eliminar').click();
        await page.getByRole('dialog').waitFor();
      },
      check: async (page) => {
        const dlg = page.getByRole('dialog');
        const r = await dlg.evaluate((el) => {
          const b = el.getBoundingClientRect();
          return { x: Math.round(b.x), w: Math.round(b.width), right: Math.round(b.right), vw: window.innerWidth,
            scrollW: el.scrollWidth, clientW: el.clientWidth };
        });
        const hasName = (await dlg.textContent()).includes('WAP-203');
        const pass = r.right <= r.vw && r.x >= 0 && r.scrollW <= r.clientW + 1 && hasName;
        // Cerrar sin borrar
        await page.getByRole('button', { name: /cancelar/i }).click();
        return { pass, reason: pass ? undefined : 'el modal desborda o no muestra el nombre', facts: { ...r, hasName } };
      },
    },
    {
      id: 'TC-04',
      steps: async (page) => {
        await page.route((url) => url.pathname === '/api/v1/products/bulk_price_preview', async (route) => {
          const res = await route.fetch();
          const json = await res.json();
          if (json?.data?.previews?.[0]) json.data.previews[0].name = LONG_NAME;
          return route.fulfill({ response: res, json });
        });
        await openProducts(page);
        await page.locator('tbody tr').first().locator('input[type="checkbox"]').check();
        await page.getByRole('button', { name: /Actualizar precios/ }).click();
        await page.getByPlaceholder('Ej: 15').fill('10');
        await page.getByRole('button', { name: /Vista previa/ }).click();
        await page.getByTitle(LONG_NAME).first().waitFor();
      },
      check: async (page) => {
        const cell = page.getByRole('dialog').getByTitle(LONG_NAME).first();
        const m = await lines(cell);
        const scroll = await page.getByRole('dialog').evaluate((el) => ({ scrollW: el.scrollWidth, clientW: el.clientWidth }));
        const pass = m.lines <= 2;
        await page.keyboard.press('Escape');
        return { pass, reason: pass ? undefined : `líneas=${m.lines}`, facts: { ...m, ...scroll } };
      },
    },
    {
      id: 'TC-05',
      steps: async (page) => {
        await mockProducts(page);
        await page.goto('/service-records/new');
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: /Agregar producto/ }).click();
        await page.getByRole('button', { name: /Seleccionar producto/ }).first().click();
        await page.getByTitle(LONG_NAME).first().waitFor();
      },
      check: async (page) => {
        const opt = page.getByTitle(LONG_NAME).first();
        const m = await lines(opt.locator('span'));
        const box = await opt.evaluate((el) => {
          const ul = el.closest('ul').getBoundingClientRect();
          const b = el.getBoundingClientRect();
          return { optRight: Math.round(b.right), listRight: Math.round(ul.right) };
        });
        const pass = m.lines <= 2 && box.optRight <= box.listRight + 1;
        return { pass, reason: pass ? undefined : `líneas=${m.lines} ${JSON.stringify(box)}`, facts: { ...m, ...box } };
      },
    },
    {
      id: 'TC-06',
      steps: async (page) => {
        await page.route((url) => /^\/api\/v1\/budgets\/\d+$/.test(url.pathname), async (route) => {
          const res = await route.fetch();
          const json = await res.json();
          if (json?.data?.items?.[0]) json.data.items[0].description = LONG_NAME;
          return route.fulfill({ response: res, json });
        });
        const listResP = page.waitForResponse((r) => new URL(r.url()).pathname === '/api/v1/budgets' && r.request().method() === 'GET');
        await page.goto('/budgets');
        const list = await (await listResP).json().catch(() => ({}));
        const id = list?.data?.budgets?.[0]?.id;
        if (!id) throw new Error('blocked: no hay presupuestos en la base local');
        await page.goto(`/budgets/${id}/print`);
        await page.waitForLoadState('networkidle');
        await page.getByText('WAP-203', { exact: false }).first().waitFor();
      },
      check: async (page) => {
        const span = page.locator('td span', { hasText: 'WAP-203' }).first();
        const m = await lines(span);
        const table = await span.evaluate((el) => {
          const t = el.closest('table');
          const sheet = t.parentElement.getBoundingClientRect();
          const tb = t.getBoundingClientRect();
          return { tableRight: Math.round(tb.right), containerRight: Math.round(sheet.right), tableW: Math.round(tb.width) };
        });
        const pass = m.lines <= 2 && table.tableRight <= table.containerRight + 1;
        return { pass, reason: pass ? undefined : `líneas=${m.lines} ${JSON.stringify(table)}`, facts: { ...m, ...table } };
      },
    },
  ],
};
