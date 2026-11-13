// QA visual del change shadcn-base-ui-fase-1 (ver qa.md). TC-01..TC-11 = mismas pantallas que
// baseline/baseline.qa.mjs (comparar capturas y `facts` contra baseline/results.json); TC-12+ = comportamiento.
//
//   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs \
//     openspec/changes/shadcn-base-ui-fase-1/qa.mjs --out tmp/qa/shadcn-base-ui-fase-1
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
  slug: 'shadcn-base-ui-fase-1',
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
        await dialog.getByRole('combobox', { name: 'Categoría' }).click();
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
        await page.getByRole('alertdialog').waitFor();
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
        await page.locator('[role="combobox"]', { hasText: 'OSRAM' }).first().click();
        await page.waitForTimeout(800);
      },
      check: async (page) => {
        const facts = await page.evaluate(() => {
          const list = document.querySelector('[role="listbox"]');
          const chips = document.querySelectorAll('[aria-label^="Quitar "]').length;
          const r = list?.getBoundingClientRect();
          return { listOpen: Boolean(list), chips, listW: r && Math.round(r.width) };
        });
        return { pass: facts.listOpen && facts.chips === 2, reason: 'lista cerrada o sin 2 chips', facts };
      },
    },
    {
      id: 'TC-12', // Apilado: el de arriba más angosto, fondo más oscuro y la lista de clientes clickeable encima
      path: '/vehicles',
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo veh/i }).click();
        await page.getByRole('dialog').waitFor();
        await page.getByPlaceholder(/buscar cliente/i).fill('Zzqa Apilado');
        await page.getByText(/\+ Crear cliente/).click();
        await page.waitForFunction(() => document.querySelectorAll('[role="dialog"]').length === 2);
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const facts = await page.evaluate(() => {
          const [bottom, top] = [...document.querySelectorAll('[role="dialog"]')];
          const backdrops = [...document.querySelectorAll('[data-testid="dialog-backdrop"]')]
            .map((b) => getComputedStyle(b).backgroundColor);
          const r = top.getBoundingClientRect();
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + 20);
          return {
            bottomW: Math.round(bottom.getBoundingClientRect().width),
            topW: Math.round(r.width),
            backdrops,
            topIsHit: top.contains(hit),
          };
        });
        const pass = facts.topW < facts.bottomW && facts.backdrops.length === 2 && facts.topIsHit;
        return { pass, reason: 'apilado incorrecto', facts };
      },
    },
    {
      id: 'TC-13', // La lista del Combobox queda por encima del diálogo y acepta el click
      path: '/products',
      steps: async (page) => {
        await page.getByRole('button', { name: 'Nuevo', exact: true }).click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        await dialog.getByRole('combobox', { name: 'Categoría' }).click();
        await page.getByRole('listbox').waitFor();
        await page.waitForTimeout(800);
      },
      check: async (page) => {
        const option = page.getByRole('listbox').getByRole('option').first();
        const label = (await option.textContent())?.trim();
        const box = await option.boundingBox();
        const onTop = await page.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest('[role="listbox"]')), { x: box.x + box.width / 2, y: box.y + box.height / 2 });
        await option.click();
        await page.waitForTimeout(300);
        const shown = await page.getByRole('combobox', { name: 'Categoría' }).textContent();
        const dialogOpen = await page.getByRole('dialog').isVisible();
        return { pass: onTop && shown.includes(label) && dialogOpen, reason: 'la opción no se pudo elegir', facts: { label, onTop, shown, dialogOpen } };
      },
    },
    {
      id: 'TC-14', // Escape con el Select de estado abierto cierra solo la lista
      path: '/appointments',
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo turno/i }).first().click();
        await page.getByRole('dialog').waitFor();
        await page.getByRole('combobox', { name: 'Estado' }).click();
        await page.getByRole('listbox').waitFor();
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
      },
      check: async (page) => {
        const facts = { listOpen: await page.getByRole('listbox').count(), dialogs: await page.getByRole('dialog').count() };
        return { pass: facts.listOpen === 0 && facts.dialogs === 1, reason: 'Escape cerró el diálogo o no la lista', facts };
      },
    },
    {
      id: 'TC-15', // Click en el fondo: la confirmación cierra; el cambio masivo de precios no
      path: '/customers',
      steps: async (page) => {
        await page.getByTitle('Eliminar').first().click();
        await page.getByRole('alertdialog').waitFor();
        await page.mouse.click(40, 450);
        await page.waitForTimeout(400);
      },
      check: async (page) => {
        const confirmOpen = await page.getByRole('alertdialog').count();
        await page.goto('/products');
        await page.waitForLoadState('networkidle');
        await openActions(page, /actualizar precios/i);
        await page.getByRole('dialog').waitFor();
        await page.getByPlaceholder('Ej: 15').fill('15');
        await page.mouse.click(40, 450);
        await page.waitForTimeout(400);
        const bulkOpen = await page.getByRole('dialog').count();
        const value = bulkOpen ? await page.getByPlaceholder('Ej: 15').inputValue() : null;
        return { pass: confirmOpen === 0 && bulkOpen === 1 && value === '15', reason: 'click en el fondo con comportamiento incorrecto', facts: { confirmOpen, bulkOpen, value } };
      },
    },
    {
      id: 'TC-16', // App detrás no interactuable: click sobre el header con un formulario abierto no navega
      path: '/customers',
      combos: ['desktop-dark'],
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo cliente/i }).click();
        await page.getByRole('dialog').waitFor();
        await page.mouse.click(90, 123); // "Dashboard" del sidebar
        await page.waitForTimeout(400);
      },
      check: async (page) => {
        const facts = { url: new URL(page.url()).pathname, dialogs: await page.getByRole('dialog').count() };
        return { pass: facts.url === '/customers' && facts.dialogs === 1, reason: 'el fondo recibió el click', facts };
      },
    },
  ],
};
