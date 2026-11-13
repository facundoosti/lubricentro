// Línea base visual (task 0.1) — capturas ANTES de migrar a shadcn/Base UI.
// Selectores del código previo (Modal/FormDialog/*SelectSearch). No se vuelve a correr después del change:
// la comparación la hace qa.mjs (mismos TC-XX) contra estas capturas.
//
//   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs \
//     openspec/changes/shadcn-base-ui-fase-1/baseline/baseline.qa.mjs --out openspec/changes/shadcn-base-ui-fase-1/baseline
const BOTH = ['desktop-dark', 'desktop-light'];

const dialogFacts = async (page) => page.evaluate(() => {
  const dialogs = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')];
  return dialogs.map((d) => {
    const r = d.getBoundingClientRect();
    const cs = getComputedStyle(d);
    return {
      w: Math.round(r.width), h: Math.round(r.height),
      bg: cs.backgroundColor, radius: cs.borderRadius, border: cs.borderTopColor,
    };
  });
});

const openActions = async (page, item) => {
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: item }).click();
};

export default {
  slug: 'shadcn-base-ui-fase-1-baseline',
  combos: BOTH,
  cases: [
    {
      id: 'TC-01', // Formulario de cliente
      path: '/customers',
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo cliente/i }).click();
        await page.getByRole('dialog').waitFor();
      },
      check: async (page) => ({ pass: true, facts: { dialogs: await dialogFacts(page) } }),
    },
    {
      id: 'TC-02', // Vehículo con alta de cliente apilada
      path: '/vehicles',
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo veh/i }).click();
        await page.getByRole('dialog').waitFor();
        await page.getByPlaceholder(/buscar cliente/i).fill('Zzqa Apilado');
        await page.getByText(/\+ Crear cliente/).click();
        await page.waitForFunction(() => document.querySelectorAll('[role="dialog"]').length === 2);
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { dialogs: await dialogFacts(page) } }),
    },
    {
      id: 'TC-03', // Producto con el selector de categoría abierto
      path: '/products',
      steps: async (page) => {
        await page.getByRole('button', { name: 'Nuevo', exact: true }).click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        await dialog.getByRole('button', { name: 'Seleccionar...' }).first().click();
        await page.waitForTimeout(800);
      },
      check: async (page) => ({ pass: true, facts: { dialogs: await dialogFacts(page) } }),
    },
    {
      id: 'TC-04', // Turno con el select de estado abierto
      path: '/appointments',
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo turno/i }).first().click();
        await page.getByRole('dialog').waitFor();
        await page.locator('[aria-labelledby="appointment-status-label"]').first().click();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { dialogs: await dialogFacts(page) } }),
    },
    {
      id: 'TC-05', // Confirmación de eliminar
      path: '/customers',
      steps: async (page) => {
        await page.getByTitle('Eliminar').first().click();
        await page.getByRole('dialog').waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { dialogs: await dialogFacts(page) } }),
    },
    {
      id: 'TC-06', // Cliente creado (POST mockeado: no escribe en la BD)
      path: '/customers',
      steps: async (page) => {
        await page.route('**/api/v1/customers', (route) => {
          if (route.request().method() !== 'POST') return route.continue();
          return route.fulfill({ json: { success: true, data: { id: 999999, name: 'Cliente QA Baseline' } } });
        });
        await page.getByRole('button', { name: /nuevo cliente/i }).click();
        await page.locator('#name').fill('Cliente QA Baseline');
        await page.locator('#phone').fill('2915551234');
        await page.getByRole('button', { name: 'Crear Cliente' }).click();
        await page.getByRole('dialog', { name: 'Cliente creado' }).waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { dialogs: await dialogFacts(page) } }),
    },
    {
      id: 'TC-07', // Cambio masivo de IVA
      path: '/products',
      steps: async (page) => {
        await page.locator('tbody input[type="checkbox"]').first().check();
        await page.getByRole('button', { name: /cambiar iva/i }).click();
        await page.getByRole('dialog').waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { dialogs: await dialogFacts(page) } }),
    },
    {
      id: 'TC-08', // Cambio masivo de precios
      path: '/products',
      steps: async (page) => {
        await openActions(page, /actualizar precios/i);
        await page.getByRole('dialog').waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { dialogs: await dialogFacts(page) } }),
    },
    {
      id: 'TC-09', // Importación de productos
      path: '/products',
      steps: async (page) => {
        await openActions(page, /importar excel/i);
        await page.getByRole('dialog').waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { dialogs: await dialogFacts(page) } }),
    },
    {
      id: 'TC-10', // Visor de imágenes (único producto con imagen en dev: FLX280)
      path: '/products?search=FLX280',
      steps: async (page) => {
        await page.getByRole('button', { name: /ampliar imagen/i }).first().click();
        await page.getByRole('dialog').waitFor();
        await page.waitForTimeout(500);
      },
      check: async (page) => ({ pass: true, facts: { dialogs: await dialogFacts(page) } }),
    },
    {
      id: 'TC-11', // Listado de productos: filtro de marcas desplegado con 2 chips
      path: '/products?brand=FRAM,OSRAM',
      steps: async (page) => {
        await page.getByRole('button', { name: /FRAM.*OSRAM/ }).first().click();
        await page.waitForTimeout(800);
      },
      check: async (page) => ({ pass: true }),
    },
  ],
};
