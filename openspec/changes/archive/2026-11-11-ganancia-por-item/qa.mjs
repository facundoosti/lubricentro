const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
const barText = (page) => page.locator('.sticky').last().innerText();

export default {
  slug: 'ganancia-por-item',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-01', path: '/budgets/new', combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const body = await page.locator('main').innerText();
        const opts = await page.getByLabel('% IVA línea 1').locator('option').allInnerTexts();
        const facts = { ganancia: body.includes('% Ganancia'), importe: body.includes('Importe final'), opts, overflowX: await overflow(page) };
        const ok = facts.ganancia && facts.importe && opts.join('|') === '21%|10,5%|Sin IVA' && !facts.overflowX;
        return { pass: ok, reason: JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-02', path: '/budgets/new',
      steps: async (page) => {
        await page.getByLabel('Producto o servicio').first().fill('Trabajo QA');
        await page.keyboard.press('Escape');
        await page.getByLabel('Precio unitario línea 1').fill('1000');
        await page.getByLabel('% IVA línea 1').selectOption('21');
        await page.getByLabel('% Ganancia línea 1').fill('30');
        await page.getByRole('button', { name: /Desglose/ }).click();
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const line = (await page.getByTestId('line-total').first().innerText()).trim();
        const bar = await barText(page);
        const facts = { line, total: /1\.510/.test(bar), ganancia: /Ganancia[\s\S]*\$300/.test(bar) };
        return { pass: line === '$1.510' && facts.total && facts.ganancia, reason: JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-03', path: '/budgets/new',
      steps: async (page) => {
        await page.getByLabel('Producto o servicio').first().fill('Filtro 1.5');
        await page.getByRole('option', { name: /Filtro 1\.5/ }).first().click();
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const margin = await page.getByLabel('% Ganancia línea 1').inputValue();
        const line = (await page.getByTestId('line-total').first().innerText()).trim();
        return { pass: Number(margin) === 30 && line === '$1.510', reason: `margin=${margin} line=${line}`, facts: { margin, line } };
      },
    },
    {
      id: 'TC-04', path: '/service-records/new', combos: ['desktop-dark', 'desktop-light'],
      steps: async (page) => {
        await page.getByRole('button', { name: 'Copiar desde presupuesto' }).click();
        const dialog = page.getByRole('dialog');
        await dialog.getByLabel('Buscar presupuesto').fill('QA margen');
        await page.waitForTimeout(800);
        await dialog.getByText('Presupuesto #96').click();
        await dialog.getByRole('button', { name: /^(Copiar|Reemplazar ítems)$/ }).click();
        const replace = dialog.getByRole('button', { name: 'Reemplazar ítems' });
        if (await replace.isVisible().catch(() => false)) await replace.click();
        await page.getByRole('dialog').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(400);
      },
      check: async (page) => {
        const margin = await page.getByLabel('% Ganancia línea 1').inputValue();
        const bar = await barText(page);
        const facts = { margin, total: /1\.510/.test(bar), tarjeta: /Tarjeta/.test(bar), overflowX: await overflow(page) };
        return { pass: Number(margin) === 30 && facts.total && !facts.tarjeta && !facts.overflowX, reason: JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-05', path: '/budgets/96/print', combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const body = await page.locator('body').innerText();
        const facts = {
          final: (body.match(/\$1\.510/g) || []).length,
          iva: /IVA 21%\s*\$210/.test(body),
          tarjeta: /\$1\.661/.test(body),
          ganancia: /ganancia/i.test(body), m300: /\$300/.test(body), subtotal: /subtotal/i.test(body), base: /s\/ \$/.test(body),
        };
        const ok = facts.final >= 3 && facts.iva && facts.tarjeta && !facts.ganancia && !facts.m300 && !facts.subtotal && !facts.base;
        return { pass: ok, reason: JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-06', path: '/budgets/61/print',
      check: async (page) => {
        const body = await page.locator('body').innerText();
        const facts = { total: /\$250/.test(body), iva: /IVA \d/.test(body), subtotal: /subtotal/i.test(body) };
        return { pass: facts.total && !facts.iva && !facts.subtotal, reason: JSON.stringify(facts), facts };
      },
    },
  ],
};
