// QA visual de buscadores-autocomplete-base-ui. TC-01..03 = mismos de baseline/baseline.qa.mjs con los selectores nuevos.
//
//   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs \
//     openspec/changes/buscadores-autocomplete-base-ui/qa.mjs --out tmp/qa/buscadores-autocomplete
const BOTH = ['desktop-dark', 'desktop-light'];
const CUSTOMER = 'input[placeholder^="Buscar cliente"]';
const DLG_CUSTOMER = `[role="dialog"] ${CUSTOMER}`;
const PRODUCT = '[role="dialog"] input[placeholder^="Ej: aceite"]';

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

// La lista: debajo del input, mismo ancho, y clickeable (elementFromPoint sobre la 1ª opción cae en la lista)
const listFacts = async (page, inputSel) => {
  const input = (await boxFacts(page, inputSel))[0];
  const list = (await boxFacts(page, '[role="listbox"]'))[0];
  const options = await boxFacts(page, '[role="option"]');
  const onTop = await page.evaluate(() => {
    const o = document.querySelector('[role="option"]');
    if (!o) return null;
    const r = o.getBoundingClientRect();
    return o.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
  });
  return { input, list, options, onTop };
};
const below = (f) => f.input && f.list && f.list.y >= f.input.y + f.input.h - 1;

const openAppointment = async (page) => {
  await page.getByRole('button', { name: /nuevo turno/i }).first().click();
  await page.getByRole('dialog').waitFor();
};
const openVehicle = async (page) => {
  await page.getByRole('button', { name: /nuevo veh/i }).click();
  await page.getByRole('dialog').waitFor();
};
const openBulk = async (page) => {
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: /actualizar precios/i }).click();
  await page.getByRole('dialog').waitFor();
};
const typeAndWait = async (page, sel, text) => {
  await page.locator(sel).click();
  await page.locator(sel).pressSequentially(text, { delay: 20 });
  await page.waitForTimeout(1200);
};

export default {
  slug: 'buscadores-autocomplete',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-01', combos: BOTH, path: '/appointments',
      steps: async (page) => { await openAppointment(page); await typeAndWait(page, DLG_CUSTOMER, 'a'); },
      check: async (page) => {
        const f = await listFacts(page, DLG_CUSTOMER);
        const ok = f.input?.w === 718 && f.input?.h === 44 && below(f) && Math.abs(f.list.w - f.input.w) <= 2 && f.options.length > 0 && f.onTop;
        return { pass: !!ok, reason: ok ? undefined : 'medidas/posición', facts: f };
      },
    },
    {
      id: 'TC-02', combos: BOTH, path: '/vehicles',
      steps: async (page) => { await openVehicle(page); await typeAndWait(page, DLG_CUSTOMER, 'Zzqx Inexistente'); },
      check: async (page) => {
        const f = await listFacts(page, DLG_CUSTOMER);
        const create = await page.getByRole('option', { name: /crear cliente/i }).isVisible();
        const empty = await page.getByText('No se encontraron clientes').isVisible();
        const ok = below(f) && create && empty && f.onTop;
        return { pass: !!ok, facts: { ...f, create, empty } };
      },
    },
    {
      id: 'TC-03', combos: BOTH, path: '/products',
      steps: async (page) => { await openBulk(page); await typeAndWait(page, PRODUCT, 'aceite'); },
      check: async (page) => {
        const f = await listFacts(page, PRODUCT);
        const ok = f.input?.w === 622 && f.input?.h === 38 && below(f) && f.options.length > 0 && f.onTop;
        return { pass: !!ok, facts: f };
      },
    },
    {
      id: 'TC-04', path: '/appointments', // spec: Elegir un cliente con el teclado
      steps: async (page) => {
        await openAppointment(page); await typeAndWait(page, DLG_CUSTOMER, 'a');
        page.__second = await page.getByRole('option').nth(1).innerText();
        await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
        await page.waitForTimeout(400);
      },
      check: async (page) => {
        const value = await page.locator(DLG_CUSTOMER).inputValue();
        const name = page.__second.split('\n')[0].trim();
        const listOpen = await page.locator('[role="listbox"]').isVisible().catch(() => false);
        const ok = value.startsWith(`${name} - `) && !listOpen && await page.getByRole('dialog').isVisible();
        return { pass: ok, facts: { value, name, listOpen } };
      },
    },
    {
      id: 'TC-05', path: '/products', // spec: Elegir un producto con el teclado
      steps: async (page) => {
        await openBulk(page); await typeAndWait(page, PRODUCT, 'aceite');
        page.__first = (await page.getByRole('option').first().innerText()).split('\n')[0].trim();
        await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
        await page.waitForTimeout(400);
      },
      check: async (page) => {
        const value = await page.locator(PRODUCT).inputValue();
        const listOpen = await page.locator('[role="listbox"]').isVisible().catch(() => false);
        return { pass: value === page.__first && !listOpen, facts: { value, first: page.__first, listOpen } };
      },
    },
    {
      id: 'TC-06', path: '/vehicles', // spec: Escape dentro de un diálogo
      steps: async (page) => {
        await openVehicle(page); await typeAndWait(page, DLG_CUSTOMER, 'a');
        await page.keyboard.press('Escape'); await page.waitForTimeout(400);
      },
      check: async (page) => {
        const listOpen = await page.locator('[role="listbox"]').isVisible().catch(() => false);
        const dialogOpen = await page.getByRole('dialog').isVisible();
        const value = await page.locator(DLG_CUSTOMER).inputValue();
        return { pass: !listOpen && dialogOpen && value === 'a', facts: { listOpen, dialogOpen, value } };
      },
    },
    {
      id: 'TC-07', path: '/vehicles', // spec: Crear cliente con el teclado
      steps: async (page) => {
        await openVehicle(page); await typeAndWait(page, DLG_CUSTOMER, 'Zzqx Inexistente');
        await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
        await page.waitForTimeout(800);
      },
      check: async (page) => {
        const dialogs = await page.getByRole('dialog').count();
        const prefilled = await page.locator('[role="dialog"] input[value="Zzqx Inexistente"]').count();
        return { pass: dialogs >= 2 && prefilled > 0, facts: { dialogs, prefilled } };
      },
    },
    {
      id: 'TC-08', path: '/budgets/new', // regresión: fuera de un diálogo; Escape suelto no borra el cliente
      steps: async (page) => {
        await typeAndWait(page, CUSTOMER, 'a');
        page.__f = await listFacts(page, CUSTOMER);
        await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
        page.__chosen = await page.locator(CUSTOMER).inputValue();
        await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
      },
      check: async (page) => {
        const after = await page.locator(CUSTOMER).inputValue();
        const f = page.__f;
        const ok = below(f) && f.onTop && page.__chosen.includes(' - ') && after === page.__chosen;
        return { pass: !!ok, facts: { list: f.list, input: f.input, onTop: f.onTop, chosen: page.__chosen, after } };
      },
    },
  ],
};
