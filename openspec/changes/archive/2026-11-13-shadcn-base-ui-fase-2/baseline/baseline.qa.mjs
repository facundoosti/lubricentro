// Línea base visual (task 0.1) — capturas ANTES de migrar los controles nativos a @ui (fase 2).
// Selectores del código previo (<select>, type="date|time|checkbox", role="switch|tablist" a mano).
// No se vuelve a correr después del change: la comparación la hace qa.mjs (mismos TC-XX) contra estas capturas.
//
//   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs \
//     openspec/changes/shadcn-base-ui-fase-2/baseline/baseline.qa.mjs --out openspec/changes/shadcn-base-ui-fase-2/baseline
//
// Datos de dev: TC-12 usa el cliente 883 (el que más atenciones tiene).
// El formulario de atención en diálogo (ServiceRecordForm) no se renderiza en ninguna pantalla (código muerto):
// no tiene captura. La atención se captura en su página (TC-09).
const BOTH = ['desktop-dark', 'desktop-light'];

// Medidas de los controles para comparar después (caja, fondo, borde, radio, tipografía).
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

export default {
  slug: 'shadcn-base-ui-fase-2-baseline',
  combos: BOTH,
  cases: [
    {
      id: 'TC-01', // Turno: fecha, hora y el Select de estado abierto
      path: '/appointments',
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo turno/i }).first().click();
        await page.getByRole('dialog').waitFor();
        await page.locator('[aria-labelledby="appointment-status-label"]').first().click();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({
        pass: true,
        facts: {
          date: await controlFacts(page, '[role="dialog"] input[type="date"]'),
          vehicle: await controlFacts(page, '[role="dialog"] select'),
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
      check: async (page) => ({ pass: true, facts: { selects: await controlFacts(page, '[role="dialog"] select') } }),
    },
    {
      id: 'TC-03', // Vehículo: año
      path: '/vehicles',
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo veh/i }).click();
        await page.getByRole('dialog').waitFor();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { selects: await controlFacts(page, '[role="dialog"] select') } }),
    },
    {
      id: 'TC-05', // Presupuesto: sección general (fecha + estado; el vehículo es select solo con cliente con vehículos)
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
      check: async (page) => ({ pass: true, facts: { selects: await controlFacts(page, '[role="dialog"] select') } }),
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
        facts: { filters: await controlFacts(page, '#tour-reminders-filters select, #tour-reminders-filters input[type="date"]') },
      }),
    },
    {
      id: 'TC-08', // Productos: 1 fila seleccionada (cabecera indeterminada) + filtro de estado
      path: '/products',
      steps: async (page) => {
        await page.locator('tbody input[type="checkbox"]').first().check();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({
        pass: true,
        facts: {
          checkboxes: await controlFacts(page, 'thead input[type="checkbox"], tbody input[type="checkbox"]'),
          activeFilter: await controlFacts(page, 'select'),
        },
      }),
    },
    {
      id: 'TC-09', // Página de atención: fecha de atención y próximo servicio
      path: '/service-records/new',
      steps: async (page) => {
        await page.locator('input[type="date"]').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({ pass: true, facts: { dates: await controlFacts(page, 'input[type="date"]') } }),
    },
    {
      id: 'TC-10', // Configuración › horarios: switches + horas
      path: '/settings',
      steps: async (page) => {
        await page.getByText('Días y Horario de Atención').scrollIntoViewIfNeeded();
        await page.locator('[role="switch"][aria-label="Domingo"]').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
      },
      check: async (page) => ({
        pass: true,
        facts: {
          switches: await controlFacts(page, 'main [role="switch"]'),
          times: await controlFacts(page, 'input[type="time"]'),
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
  ],
};
