// QA visual de shadcn-base-ui-fase-2 (task 7.2). Mismos TC-XX que baseline/baseline.qa.mjs, con los selectores
// de los controles nuevos (@ui/Select, DateInput, TimeInput, Switch, Checkbox, Tabs), más TC-13..TC-15.
//
//   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs \
//     openspec/changes/shadcn-base-ui-fase-2/qa.mjs --out tmp/qa/shadcn-base-ui-fase-2
const BOTH = ['desktop-dark', 'desktop-light'];

const controlFacts = async (page, selector) => page.evaluate((sel) => (
  [...document.querySelectorAll(sel)].slice(0, 6).map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      w: Math.round(r.width), h: Math.round(r.height),
      bg: cs.backgroundColor, border: cs.borderTopColor, radius: cs.borderRadius,
      font: `${cs.fontSize}/${cs.fontWeight}`, color: cs.color,
    };
  })
), selector);

const openActions = async (page, item) => {
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: item }).click();
};

// /appointments también tiene la grilla de FullCalendar: el calendario del DateInput se busca por su slot
const dayPicker = (page) => page.locator('[data-slot="calendar"] [role="grid"]');

const openAppointment = async (page) => {
  await page.getByRole('button', { name: /nuevo turno/i }).first().click();
  await page.getByRole('dialog').waitFor();
};

export default {
  slug: 'shadcn-base-ui-fase-2',
  combos: BOTH,
  cases: [
    {
      id: 'TC-01', // Turno: fecha, hora y el Select de estado abierto
      path: '/appointments',
      steps: async (page) => {
        await openAppointment(page);
        await page.locator('[aria-labelledby="appointment-status-label"]').first().click();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({
        pass: true,
        facts: {
          date: await controlFacts(page, '[role="dialog"] input[aria-labelledby="appointment-date-label"]'),
          vehicle: await controlFacts(page, '[role="dialog"] [role="combobox"][aria-labelledby="appointment-vehicle-label"]'),
        },
      }),
    },
    {
      id: 'TC-02', // Producto: proveedor, unidad e IVA
      path: '/products',
      steps: async (page) => {
        await page.getByRole('button', { name: 'Nuevo', exact: true }).click();
        await page.getByRole('dialog').waitFor();
        await page.locator('#iva_rate').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { selects: await controlFacts(page, '#supplier_id, #unit, #iva_rate') } }),
    },
    {
      id: 'TC-03', // Vehículo: año
      path: '/vehicles',
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo veh/i }).click();
        await page.getByRole('dialog').waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { selects: await controlFacts(page, '#year') } }),
    },
    {
      id: 'TC-05', // Presupuesto: sección general (fecha + estado)
      path: '/budgets/new',
      steps: async (page) => {
        await page.locator('#budget-date').waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({
        pass: true,
        facts: {
          date: await controlFacts(page, '#budget-date'),
          status: await controlFacts(page, '#budget-status'),
        },
      }),
    },
    {
      id: 'TC-06', // Cambio masivo de precios: proveedor
      path: '/products',
      steps: async (page) => {
        await openActions(page, /actualizar precios/i);
        await page.getByRole('dialog').waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { selects: await controlFacts(page, '[role="dialog"] [role="combobox"]') } }),
    },
    {
      id: 'TC-07', // Recordatorios: estado + desde/hasta
      path: '/reminders',
      steps: async (page) => {
        await page.locator('#tour-reminders-filters').waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({
        pass: true,
        facts: { filters: await controlFacts(page, '#tour-reminders-filters [role="combobox"], #tour-reminders-filters input[aria-label="Desde"], #tour-reminders-filters input[aria-label="Hasta"]') },
      }),
    },
    {
      id: 'TC-08', // Productos: 1 fila seleccionada (cabecera indeterminada) + filtro de estado
      path: '/products',
      steps: async (page) => {
        await page.locator('tbody [role="checkbox"]').first().click();
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const header = await page.locator('thead [role="checkbox"]').getAttribute('aria-checked');
        return {
          pass: header === 'mixed',
          reason: header === 'mixed' ? undefined : `cabecera aria-checked=${header}`,
          facts: {
            header,
            checkboxes: await controlFacts(page, 'thead [role="checkbox"], tbody [role="checkbox"]'),
            activeFilter: await controlFacts(page, '[role="combobox"][aria-label="Filtrar por stock"]'),
          },
        };
      },
    },
    {
      id: 'TC-09', // Página de atención: fecha de atención y próximo servicio
      path: '/service-records/new',
      steps: async (page) => {
        await page.locator('input[aria-labelledby="service-date-label"]').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({
        pass: true,
        facts: { dates: await controlFacts(page, 'input[aria-labelledby="service-date-label"], input[aria-labelledby="next-service-date-label"]') },
      }),
    },
    {
      id: 'TC-10', // Configuración › horarios: switches + horas
      path: '/settings',
      steps: async (page) => {
        await page.getByText('Días y Horario de Atención').scrollIntoViewIfNeeded();
        await page.getByRole('switch', { name: 'Domingo' }).scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({
        pass: true,
        facts: {
          switches: await controlFacts(page, 'main [role="switch"]'),
          times: await controlFacts(page, 'input[aria-label$=" desde"], input[aria-label$=" hasta"]'),
        },
      }),
    },
    {
      id: 'TC-11', // Encabezado: switch de tema
      path: '/dashboard',
      steps: async (page) => {
        await page.getByRole('switch', { name: 'Modo oscuro' }).waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({
        pass: true,
        facts: { themeSwitch: await controlFacts(page, 'header [role="switch"], header [role="switch"] > span') },
      }),
    },
    {
      id: 'TC-12', // Perfil de cliente: historial con tabs
      path: '/customers/883',
      steps: async (page) => {
        await page.getByRole('tablist').scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
      },
      check: async (page) => ({ pass: true, facts: { tabs: await controlFacts(page, '[role="tab"]') } }),
    },
    {
      id: 'TC-13', // Calendario abierto dentro del formulario de turno; Escape cierra solo el calendario
      path: '/appointments',
      steps: async (page) => {
        await openAppointment(page);
        await page.getByRole('dialog').getByRole('button', { name: 'Abrir calendario' }).click();
        await dayPicker(page).waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const facts = await page.evaluate(() => {
          const grid = document.querySelector('[data-slot="calendar"] [role="grid"]');
          const popup = grid.closest('[data-slot="popover-content"]');
          const r = popup.getBoundingClientRect();
          const day = grid.querySelector('button');
          const dr = day.getBoundingClientRect();
          const top = document.elementFromPoint(dr.x + dr.width / 2, dr.y + dr.height / 2);
          const cs = getComputedStyle(popup);
          return {
            popup: { w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, border: cs.borderTopColor },
            caption: grid.getAttribute('aria-label'),
            insideDialog: !!popup.closest('[role="dialog"]'),
            dayOnTop: day.contains(top),
          };
        });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
        const gridGone = (await dayPicker(page).count()) === 0;
        const dialogOpen = (await page.getByRole('dialog').count()) === 1;
        await page.getByRole('dialog').getByRole('button', { name: 'Abrir calendario' }).click();
        await dayPicker(page).waitFor();
        await page.waitForTimeout(300);
        const ok = facts.dayOnTop && gridGone && dialogOpen;
        return {
          pass: ok,
          reason: ok ? undefined : `dayOnTop=${facts.dayOnTop} gridGone=${gridGone} dialogOpen=${dialogOpen}`,
          facts: { ...facts, gridGone, dialogOpen },
        };
      },
    },
    {
      id: 'TC-14', // Lista del Select abierta en modo oscuro (filtro de Recordatorios)
      path: '/reminders',
      combos: ['desktop-dark'],
      steps: async (page) => {
        await page.getByRole('combobox', { name: 'Estado del recordatorio' }).click();
        await page.getByRole('listbox').waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const facts = await page.evaluate(() => {
          const list = document.querySelector('[role="listbox"]');
          const popup = list.closest('[data-slot="select-content"]') || list;
          const cs = getComputedStyle(popup);
          const opt = getComputedStyle(list.querySelector('[role="option"]'));
          return { bg: cs.backgroundColor, border: cs.borderTopColor, optionColor: opt.color };
        });
        // Fondo oscuro (surface-container #121215) y texto claro
        const dark = facts.bg === 'rgb(18, 18, 21)';
        return { pass: dark, reason: dark ? undefined : `fondo de la lista ${facts.bg}`, facts };
      },
    },
    {
      id: 'TC-15', // Fecha inválida marcada en rojo (turno: 31/02/2026 y salir del campo)
      path: '/appointments',
      steps: async (page) => {
        await openAppointment(page);
        const input = page.locator('input[aria-labelledby="appointment-date-label"]');
        await input.fill('');
        await input.pressSequentially('31022026');
        await page.getByRole('dialog').getByText('Estado', { exact: true }).click();
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const input = page.locator('input[aria-labelledby="appointment-date-label"]');
        const facts = {
          value: await input.inputValue(),
          invalid: await input.getAttribute('aria-invalid'),
          border: await input.evaluate((el) => getComputedStyle(el).borderTopColor),
        };
        const ok = facts.value === '31/02/2026' && facts.invalid === 'true';
        return { pass: ok, reason: ok ? undefined : JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-16', // Recordatorios: fecha inválida → no filtra, "Revisá las fechas" y campo en rojo
      path: '/reminders',
      steps: async (page) => {
        await page.locator('#tour-reminders-filters').waitFor();
        await page.locator('input[aria-label="Desde"]').pressSequentially('3102');
        await page.getByRole('button', { name: 'Filtrar' }).click();
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const alert = page.getByRole('alert').filter({ hasText: 'Revisá las fechas' });
        const input = page.locator('input[aria-label="Desde"]');
        const facts = {
          alertVisible: await alert.isVisible(),
          alertRect: await alert.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), color: getComputedStyle(el).color }; }).catch(() => null),
          invalid: await input.getAttribute('aria-invalid'),
          border: await input.evaluate((el) => getComputedStyle(el).borderTopColor),
        };
        const ok = facts.alertVisible && facts.invalid === 'true';
        return { pass: ok, reason: ok ? undefined : JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-17', // Configuración: hora vacía en un día abierto → no guarda y muestra el mensaje
      path: '/settings',
      steps: async (page) => {
        page.__writes = [];
        page.on('request', (r) => { if (r.method() !== 'GET' && /setting/i.test(r.url())) page.__writes.push(`${r.method()} ${r.url()}`); });
        const from = page.locator('input[aria-label$=" desde"]').first();
        await from.waitFor();
        await from.fill('');
        await page.getByRole('button', { name: 'Guardar cambios' }).click();
        await page.waitForTimeout(500);
      },
      check: async (page) => {
        const msg = page.getByText('Completá desde y hasta con una hora válida (hh:mm)');
        const from = page.locator('input[aria-label$=" desde"]').first();
        const facts = {
          msgVisible: await msg.first().isVisible(),
          invalid: await from.getAttribute('aria-invalid'),
          border: await from.evaluate((el) => getComputedStyle(el).borderTopColor),
          writes: page.__writes,
        };
        const ok = facts.msgVisible && facts.invalid === 'true' && facts.writes.length === 0;
        return { pass: ok, reason: ok ? undefined : JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-18', // Producto: la lista de unidad ofrece "Sin unidad" (y la de proveedor "Sin proveedor")
      path: '/products',
      steps: async (page) => {
        await page.getByRole('button', { name: 'Nuevo', exact: true }).click();
        await page.getByRole('dialog').waitFor();
        await page.locator('#unit').scrollIntoViewIfNeeded();
        await page.locator('#unit').click();
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const opt = page.getByRole('option', { name: 'Sin unidad' });
        const facts = {
          visible: await opt.isVisible(),
          clickable: await opt.evaluate((el) => { const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return el.contains(hit); }),
        };
        const ok = facts.visible && facts.clickable;
        return { pass: ok, reason: ok ? undefined : JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-19', // Turno: fecha parcial → sin error mientras se tipea; "Fecha inválida" al salir
      path: '/appointments',
      steps: async (page) => {
        await openAppointment(page);
        const input = page.locator('input[aria-labelledby="appointment-date-label"]');
        await input.fill('');
        await input.pressSequentially('1311');
        page.__duringTyping = await page.getByRole('dialog').getByText(/Fecha (inválida|es requerida)/).count();
        await page.getByRole('dialog').getByText('Estado', { exact: true }).click();
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const facts = {
          errorsWhileTyping: page.__duringTyping,
          afterBlur: await page.getByRole('dialog').getByText('Fecha inválida').isVisible(),
          dialogOpen: await page.getByRole('dialog').isVisible(),
        };
        const ok = facts.errorsWhileTyping === 0 && facts.afterBlur && facts.dialogOpen;
        return { pass: ok, reason: ok ? undefined : JSON.stringify(facts), facts };
      },
    },
  ],
};
