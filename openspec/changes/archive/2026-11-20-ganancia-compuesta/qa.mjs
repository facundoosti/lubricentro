// QA visual de ganancia-compuesta (ver qa.md).
//   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs \
//     openspec/changes/ganancia-compuesta/qa.mjs --out tmp/qa/ganancia-compuesta

// Encabezados de la grilla vs celdas de la primera fila: orden, columnas de la grilla y alineación.
const measureGrid = async (page) => {
  await page.locator('[data-testid="item-row"]').first().waitFor();
  return page.evaluate(() => {
    const row = document.querySelector('[data-testid="item-row"]');
    const header = row.parentElement.previousElementSibling;
    const spans = [...header.querySelectorAll('span')];
    const rect = (el) => (el ? el.getBoundingClientRect() : null);
    const cellOf = (sel) => {
      let el = row.querySelector(sel);
      while (el && el.parentElement !== row) el = el.parentElement;
      return el;
    };
    const headerCell = (label) => spans.find((s) => s.textContent.trim() === label);
    const pair = (label, sel) => {
      const h = rect(headerCell(label));
      const c = rect(cellOf(sel));
      return h && c ? { hLeft: Math.round(h.left), cLeft: Math.round(c.left), hRight: Math.round(h.right), cRight: Math.round(c.right) } : null;
    };
    return {
      headers: spans.map((s) => s.textContent.trim()),
      headerCols: getComputedStyle(header).gridTemplateColumns.split(' ').length,
      rowCols: getComputedStyle(row).gridTemplateColumns.split(' ').length,
      iva: pair('IVA', '[aria-label="% IVA línea 1"]'),
      margin: pair('% Ganancia', '[aria-label="% Ganancia línea 1"]'),
      total: pair('Importe final', '[data-testid="line-total"]'),
    };
  });
};

const gridCheck = (facts) => {
  const problems = [];
  const expected = ['Cant.', 'Producto / servicio', 'Precio unit. s/IVA', 'IVA', '% Ganancia', 'Importe final', ''];
  if (JSON.stringify(facts.headers) !== JSON.stringify(expected)) problems.push(`orden de encabezados: ${facts.headers.join(' | ')}`);
  if (facts.headerCols !== 7 || facts.rowCols !== 7) problems.push(`columnas header=${facts.headerCols} fila=${facts.rowCols}`);
  for (const k of ['iva', 'margin', 'total']) {
    const p = facts[k];
    if (!p) { problems.push(`${k}: celda o encabezado no encontrado`); continue; }
    // El encabezado debe caer dentro del ancho de su celda (tolerancia 2px).
    if (p.hLeft < p.cLeft - 2 || p.hRight > p.cRight + 2) problems.push(`${k} desalineado`);
  }
  return { pass: problems.length === 0, reason: problems.join('; ') || undefined, facts };
};

export default {
  slug: 'ganancia-compuesta',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-01',
      path: '/budgets/new',
      check: async (page) => gridCheck(await measureGrid(page)),
    },
    {
      id: 'TC-02',
      path: '/budgets/new',
      steps: async (page) => {
        await page.getByRole('combobox', { name: 'Producto o servicio' }).first().fill('QA ítem libre');
        await page.keyboard.press('Escape');
        await page.getByLabel('Cantidad línea 1').fill('1');
        await page.getByLabel('Precio unitario línea 1').fill('1000');
        await page.getByLabel('% Ganancia línea 1').fill('50');
        await page.getByRole('button', { name: 'Desglose' }).click();
      },
      check: async (page) => {
        const text = async (id) => (await page.locator(`[data-testid="${id}"]`).first().textContent())?.trim();
        const facts = {
          line: await text('line-total'),
          iva: await text('iva-21'),
          margin: await text('margin-total'),
          totalList: await text('total-list'),
          tip: (await page.getByText('La ganancia se calcula sobre el precio con IVA.').count()) > 0,
        };
        const has = (v, n) => (v || '').replace(/\s/g, '').includes(n);
        const ok = has(facts.line, '1.815') && has(facts.iva, '210') && has(facts.margin, '605') && has(facts.totalList, '1.815') && facts.tip;
        return { pass: ok, reason: ok ? undefined : 'montos o tip distintos a lo esperado', facts };
      },
    },
    {
      id: 'TC-03',
      path: '/service-records/new',
      check: async (page) => gridCheck(await measureGrid(page)),
    },
    {
      id: 'TC-04',
      path: '/budgets/new',
      combos: ['desktop-light'],
      check: async (page) => gridCheck(await measureGrid(page)),
    },
  ],
};
