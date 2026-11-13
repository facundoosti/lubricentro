// QA visual: modal "Actualizar precios por lote" con filtros de marca/categoría/proveedor.
const open = async (page) => {
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Actualizar precios' }).click();
  await page.getByRole('dialog', { name: 'Actualizar precios por lote' }).waitFor();
};
const pick = async (page, field) => {
  await page.getByRole('combobox', { name: field }).click();
  await page.getByRole('option').first().click();
  await page.keyboard.press('Escape');
};

export default {
  slug: 'bulk-price-filtros',
  combos: ['desktop-dark', 'desktop-light'],
  cases: [
    {
      id: 'TC-01',
      path: '/products',
      steps: open,
      check: async (page) => {
        const d = page.getByRole('dialog');
        const fields = await Promise.all(['Marca', 'Categoría', 'Proveedor'].map((n) => d.getByRole('combobox', { name: n }).count()));
        const disabled = await d.getByRole('button', { name: /Vista previa/ }).isDisabled();
        return { pass: fields.every((c) => c === 1) && disabled, facts: { fields, disabled } };
      },
    },
    {
      id: 'TC-02',
      path: '/products',
      steps: async (page) => {
        await open(page);
        await pick(page, 'Marca');
        await pick(page, 'Categoría');
        await page.getByPlaceholder('Ej: 15').fill('10');
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const enabled = await page.getByRole('button', { name: /Vista previa/ }).isEnabled();
        return { pass: enabled, facts: { enabled } };
      },
    },
    {
      id: 'TC-03',
      path: '/products',
      steps: async (page) => {
        await open(page);
        await pick(page, 'Marca');
        await page.getByPlaceholder('Ej: 15').fill('10');
        await page.getByRole('button', { name: /Vista previa/ }).click();
        await page.getByText(/Vista previa ·/).waitFor();
      },
      check: async (page) => {
        const summary = await page.getByText(/Productos con marca:/).count();
        const back = await page.getByRole('button', { name: 'Volver' }).count();
        return { pass: summary === 1 && back === 1, facts: { summary, back } };
      },
    },
  ],
};
