const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

export default {
  slug: 'homologar-items',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-01',
      path: '/budgets/new',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const body = await page.locator('main').innerText();
        const facts = {
          seccion: /productos y servicios/i.test(body),
          articulos: /Artículos/.test(body),
          colProducto: body.includes('Producto / servicio'),
          colIva: body.includes('% IVA'),
          overflowX: await noOverflow(page),
        };
        return { pass: facts.seccion && !facts.articulos && facts.colProducto && facts.colIva && !facts.overflowX, reason: JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-02',
      path: '/budgets/new',
      steps: async (page) => {
        const desc = page.getByLabel('Producto o servicio').first();
        await desc.fill('Trabajo QA');
        await page.keyboard.press('Escape');
        await page.getByLabel('Cantidad línea 1').fill('1');
        await page.getByLabel('Precio unitario línea 1').fill('1000');
        await page.getByLabel('% IVA línea 1').fill('30');
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const line = (await page.getByTestId('line-total').first().innerText()).trim();
        const total = (await page.getByTestId('total-list').innerText()).trim();
        const ok = /1\.300/.test(line) && /1\.300/.test(total);
        return { pass: ok, reason: `línea=${line} total=${total}`, facts: { line, total } };
      },
    },
    {
      id: 'TC-04',
      path: '/service-records/new',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const body = await page.locator('main').innerText();
        const facts = {
          seccion: /productos y servicios/i.test(body),
          copiar: await page.getByRole('button', { name: 'Copiar desde presupuesto' }).isVisible(),
          total: body.includes('Total'),
          tarjeta: /Tarjeta de crédito/.test(body),
          viejas: /Agregar servicio|Agregar producto/.test(body),
          overflowX: await noOverflow(page),
        };
        return { pass: facts.seccion && facts.copiar && facts.total && !facts.tarjeta && !facts.viejas && !facts.overflowX, reason: JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-05',
      path: '/service-records/new',
      combos: ['desktop-dark', 'desktop-light'],
      steps: async (page) => {
        await page.getByRole('button', { name: 'Copiar desde presupuesto' }).click();
        const dialog = page.getByRole('dialog');
        await dialog.getByLabel('Buscar presupuesto').fill('Facundo');
        await page.waitForTimeout(800);
        await dialog.getByText('Presupuesto #61').click();
        await dialog.getByRole('button', { name: /^(Copiar|Reemplazar ítems)$/ }).click();
        const replace = dialog.getByRole('button', { name: 'Reemplazar ítems' });
        if (await replace.isVisible().catch(() => false)) await replace.click();
        await page.getByRole('dialog').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(400);
      },
      check: async (page) => {
        const items = await page.getByTestId('item-row').count();
        const chip = await page.getByText('Desde presupuesto #61').isVisible().catch(() => false);
        const totals = await page.locator('.sticky').last().innerText();
        const facts = { items, chip, totalOk: /250/.test(totals), overflowX: await noOverflow(page) };
        return { pass: items === 2 && chip && facts.totalOk && !facts.overflowX, reason: JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-06',
      path: '/service-records/197/edit',
      check: async (page) => {
        await page.getByTestId('item-row').first().waitFor();
        const items = await page.getByTestId('item-row').count();
        const ivas = [await page.getByLabel('% IVA línea 1').inputValue(), await page.getByLabel('% IVA línea 2').inputValue()];
        const copiar = await page.getByRole('button', { name: 'Copiar desde presupuesto' }).count();
        const facts = { items, ivas, copiar };
        return { pass: items === 2 && ivas.every((v) => v === '') && copiar === 0, reason: JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-07',
      path: '/budgets/61/print',
      check: async (page) => {
        const body = await page.locator('body').innerText();
        const facts = { filtro: /filtro aceite/i.test(body), total: /250/.test(body) };
        return { pass: facts.filtro && facts.total, reason: JSON.stringify(facts), facts };
      },
    },
  ],
};
