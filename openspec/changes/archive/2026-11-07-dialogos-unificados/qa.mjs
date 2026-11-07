// QA visual de dialogos-unificados. Correr con:
// QA_BASE_URL=http://localhost:5174 QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs openspec/changes/dialogos-unificados/qa.mjs

const topDialog = (page) => page.locator('[role="dialog"]').last();

async function go(page, path) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

async function openConfirm(page) {
  await go(page, '/customers');
  const del = page.locator('button[title="Eliminar"]').first();
  await del.click();
  await page.getByRole('dialog').waitFor();
}

const dialogCount = (page) => page.locator('[role="dialog"]').count();
const appInert = (page) => page.evaluate(() => document.querySelector('[data-app-content]')?.hasAttribute('inert') ?? null);

export default {
  slug: 'dialogos-unificados',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-01',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        await openConfirm(page);
        // Puntos sobre header, sidebar y el toggle del sidebar: lo de arriba debe ser la capa del diálogo
        const hits = await page.evaluate(() => {
          const dlg = document.querySelector('[role="dialog"]');
          const layer = dlg.parentElement;
          const toggle = document.querySelector('[data-app-content] button.fixed.top-16');
          const t = toggle?.getBoundingClientRect();
          const pts = { header: [1200, 30], sidebar: [100, 400], ...(t ? { toggle: [t.x + t.width / 2, t.y + t.height / 2] } : {}) };
          return Object.fromEntries(Object.entries(pts).map(([k, [x, y]]) => {
            const el = document.elementFromPoint(x, y);
            return [k, layer.contains(el)];
          }));
        });
        const ok = Object.values(hits).every(Boolean);
        return { pass: ok, reason: 'algo de la app queda por encima del ConfirmModal', facts: hits };
      },
    },
    {
      id: 'TC-02',
      check: async (page) => {
        const facts = {};
        await openConfirm(page);
        await page.mouse.click(20, 450);
        facts.afterBackdrop = await dialogCount(page);
        await openConfirm(page);
        await page.keyboard.press('Escape');
        facts.afterEscape = await dialogCount(page);
        await openConfirm(page);
        await topDialog(page).getByRole('button', { name: /cancelar/i }).click();
        facts.focusTitle = await page.evaluate(() => document.activeElement?.getAttribute('title'));
        const ok = facts.afterBackdrop === 0 && facts.afterEscape === 0 && facts.focusTitle === 'Eliminar';
        return { pass: ok, reason: 'ConfirmModal no cierra o el foco no vuelve', facts };
      },
    },
    {
      id: 'TC-03',
      check: async (page) => {
        await go(page, '/suppliers');
        await page.getByRole('button', { name: /nuevo proveedor/i }).first().click();
        await page.getByRole('dialog').waitFor();
        const outside = [];
        for (const key of ['Tab', 'Shift+Tab']) {
          for (let i = 0; i < 30; i++) {
            await page.keyboard.press(key);
            const inside = await page.evaluate(() => document.querySelector('[role="dialog"]').contains(document.activeElement));
            if (!inside) outside.push(`${key}#${i}`);
          }
        }
        return { pass: outside.length === 0, reason: 'el foco salió del diálogo', facts: { outside: outside.slice(0, 5) } };
      },
    },
    {
      id: 'TC-04',
      check: async (page) => {
        await go(page, '/suppliers');
        const before = await appInert(page);
        await page.getByRole('button', { name: /nuevo proveedor/i }).first().click();
        await page.getByRole('dialog').waitFor();
        const during = await appInert(page);
        const toaster = await page.evaluate(() => {
          const v = document.querySelector('[data-sileo-viewport]');
          return v ? { exists: true, inert: !!v.closest('[inert]') } : { exists: false };
        });
        await page.keyboard.press('Escape');
        const after = await appInert(page);
        const ok = before === false && during === true && after === false && (!toaster.exists || !toaster.inert);
        return { pass: ok, reason: 'inert mal aplicado o toaster inerte', facts: { before, during, after, toaster } };
      },
    },
    {
      id: 'TC-05',
      check: async (page) => {
        await go(page, '/products');
        await page.getByRole('button', { name: /acciones/i }).click();
        await page.getByRole('button', { name: /actualizar precios/i }).click();
        await page.getByRole('dialog').waitFor();
        const input = topDialog(page).getByPlaceholder('Ej: 15');
        await input.fill('15');
        await page.mouse.click(20, 450);
        const open = await dialogCount(page);
        const value = open ? await input.inputValue() : null;
        await page.keyboard.press('Escape');
        const afterEsc = await dialogCount(page);
        return { pass: open === 1 && value === '15' && afterEsc === 0, reason: 'BulkPrice cerró con el fondo o no con Escape', facts: { open, value, afterEsc } };
      },
    },
    {
      id: 'TC-06',
      check: async (page) => {
        await go(page, '/products');
        await page.locator('tbody input[type="checkbox"]').first().check();
        await page.getByRole('button', { name: /cambiar iva/i }).first().click();
        await page.getByRole('dialog').waitFor();
        await page.mouse.click(20, 450);
        const open = await dialogCount(page);
        await page.keyboard.press('Escape');
        const afterEsc = await dialogCount(page);
        return { pass: open === 1 && afterEsc === 0, reason: 'BulkIva cerró con el fondo o no con Escape', facts: { open, afterEsc } };
      },
    },
    {
      id: 'TC-07',
      check: async (page) => {
        await go(page, '/products');
        await page.getByRole('button', { name: /acciones/i }).click();
        await page.getByRole('button', { name: /importar excel/i }).click();
        await page.getByRole('dialog').waitFor();
        await page.mouse.click(20, 450);
        const open = await dialogCount(page);
        await page.keyboard.press('Escape');
        const afterEsc = await dialogCount(page);
        return { pass: open === 1 && afterEsc === 0, reason: 'Import cerró con el fondo o no con Escape', facts: { open, afterEsc } };
      },
    },
    {
      id: 'TC-08',
      check: async (page) => {
        await go(page, '/products');
        const thumbs = page.locator('button[aria-label^="Ampliar imagen de"]');
        const n = await thumbs.count();
        if (!n) return { pass: false, reason: 'sin productos con imagen (blocked)', facts: { thumbs: 0 } };
        await thumbs.first().click();
        await page.getByRole('dialog').waitFor();
        const focus = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
        const label1 = await topDialog(page).getAttribute('aria-label');
        await page.keyboard.press('ArrowRight');
        const label2 = await topDialog(page).getAttribute('aria-label');
        await page.keyboard.press('Escape');
        const afterEsc = await dialogCount(page);
        const back = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
        const ok = focus === 'Cerrar' && afterEsc === 0 && /^Ampliar imagen de/.test(back || '') && (n < 2 || label1 !== label2);
        return { pass: ok, reason: 'lightbox: foco, flechas o Escape', facts: { thumbs: n, focus, label1, label2, afterEsc, back } };
      },
    },
    {
      id: 'TC-09',
      check: async (page) => {
        await go(page, '/vehicles');
        await page.getByRole('button', { name: /nuevo vehículo/i }).first().click();
        await page.getByRole('dialog').waitFor();
        const s = topDialog(page).getByPlaceholder(/buscar cliente/i);
        await s.click();
        await s.fill('QA Zzz Inert');
        await page.getByText(/\+ Crear cliente/).click();
        await page.waitForFunction(() => document.querySelectorAll('[role="dialog"]').length === 2);
        const layers = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => ({ inert: !!d.closest('[inert]') })));
        await page.keyboard.press('Escape');
        const after = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => ({ inert: !!d.closest('[inert]') })));
        const ok = layers.length === 2 && layers[0].inert && !layers[1].inert && after.length === 1 && !after[0].inert;
        return { pass: ok, reason: 'capa inferior no inerte o no se liberó', facts: { layers, after } };
      },
    },
  ],
};
