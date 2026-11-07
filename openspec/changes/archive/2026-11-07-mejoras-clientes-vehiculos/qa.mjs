// QA visual de mejoras-clientes-vehiculos. Correr con:
//   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs openspec/changes/mejoras-clientes-vehiculos/qa.mjs [--only TC-20]
// Crea sus propios datos vía API (clientes "QA …", patentes al azar) en la base de dev.
const API = process.env.QA_API_URL || 'http://localhost:3000/api/v1';
const ALL = ['desktop-dark', 'desktop-light', 'mobile-dark', 'mobile-light'];

const rand = (n) => Math.random().toString().slice(2, 2 + n);
const letters = (n) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPRSTUVWXYZ'[Math.floor(Math.random() * 23)]).join('');
const newPlate = () => `${letters(2)}${rand(3)}${letters(2)}`;
const newPhone = () => `11${rand(8)}`;

// Llama a la API con el token de la sesión (ya logueada por el runner).
const api = async (page, method, path, body) => {
  const res = await page.evaluate(async ({ url, method, body }) => {
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: r.status, json: await r.json().catch(() => null) };
  }, { url: `${API}${path}`, method, body });
  if (res.status >= 400) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(res.json?.errors)}`);
  return res.json?.data;
};

const seedCustomer = (page, attrs = {}) =>
  api(page, 'POST', '/customers', { customer: { name: `QA Cliente ${rand(5)}`, phone: newPhone(), ...attrs } });

const seedVehicle = (page, customerId, attrs = {}) =>
  api(page, 'POST', '/vehicles', {
    vehicle: { brand: 'Ford', model: 'Focus', year: '2015', license_plate: newPlate(), customer_id: customerId, ...attrs },
  });

// Estado entre steps y check del mismo caso/combinación (el runner los corre en secuencia).
let ctx = {};

const overflowX = (page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

const mockLookup = (page, status, vehicle) =>
  page.route('**/api/v1/vehicles/lookup**', (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(status === 200
        ? { success: true, data: { vehicle: { status: 'found', ...vehicle } } }
        : { success: false, errors: ['x'] }),
    }));

export default {
  slug: 'mejoras-clientes-vehiculos',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-20',
      combos: ALL,
      path: '/customers',
      steps: async (page) => {
        await page.getByRole('button', { name: /Nuevo Cliente/ }).click();
        await page.getByLabel(/Nombre completo/).fill(`QA Alta ${rand(5)}`);
        await page.getByLabel(/Teléfono/).fill(newPhone());
        await page.getByRole('button', { name: 'Crear Cliente' }).click();
        await page.getByText('Cliente creado').waitFor();
      },
      check: async (page) => {
        const dialogOverflow = await overflowX(page);
        await page.getByRole('button', { name: /Agregar vehículo/ }).click();
        await page.getByRole('dialog', { name: 'Nuevo Vehículo' }).waitFor();
        const url = new URL(page.url());
        const clienteElegido = await page.getByPlaceholder(/cliente/i).inputValue();
        const pass = /^\/customers\/\d+$/.test(url.pathname) && !url.search.includes('addVehicle') && clienteElegido.startsWith('QA Alta') && !dialogOverflow;
        return { pass, reason: 'acciones al crear no llevan al perfil con el alta de vehículo abierta', facts: { path: url.pathname, search: url.search, clienteElegido, dialogOverflow } };
      },
    },
    {
      id: 'TC-21',
      combos: ['desktop-dark', 'mobile-light'],
      path: '/customers',
      steps: async (page) => {
        ctx = {};
        const phone = newPhone();
        ctx.existing = await seedCustomer(page, { name: `QA Dup ${rand(4)}`, phone });
        await page.getByRole('button', { name: /Nuevo Cliente/ }).click();
        const foto = page.locator('details', { hasText: 'Foto (opcional)' });
        ctx.fotoOpen = await foto.evaluate((d) => d.open);
        await page.getByLabel(/Teléfono/).fill(`+54 9 ${phone.slice(0, 2)} ${phone.slice(2, 6)}-${phone.slice(6)}`);
        await page.getByLabel(/Nombre completo/).click();
        await page.getByText(/Ya existe/).waitFor({ timeout: 5000 });
      },
      check: async (page) => {
        const aviso = await page.getByText(/Ya existe/).textContent();
        const href = await page.getByRole('link', { name: 'Ver perfil' }).getAttribute('href');
        const submitEnabled = await page.getByRole('button', { name: 'Crear Cliente' }).isEnabled();
        const pass = aviso.includes(ctx.existing.name) && href === `/customers/${ctx.existing.id}` && submitEnabled && ctx.fotoOpen === false;
        return { pass, reason: 'aviso de duplicado incorrecto', facts: { aviso, href, submitEnabled, fotoOpen: ctx.fotoOpen, overflow: await overflowX(page) } };
      },
    },
    {
      id: 'TC-22',
      combos: ['desktop-dark', 'mobile-light'],
      path: '/vehicles',
      steps: async (page) => {
        ctx = {};
        const owner = await seedCustomer(page, { name: `QA Dueña ${rand(4)}` });
        ctx.owner = owner;
        ctx.taken = (await seedVehicle(page, owner.id)).license_plate;
        await mockLookup(page, 200, { make: 'Toyota', model: 'Corolla', year: 2018 });
        await page.getByRole('button', { name: /Nuevo Vehículo/ }).click();
        await page.getByLabel(/Patente/).fill(newPlate());
        await page.getByText('Autocompletado').first().waitFor({ timeout: 5000 });
        ctx.auto = {
          brand: await page.getByLabel(/Marca/).inputValue(),
          model: await page.getByLabel(/Modelo/).inputValue(),
          year: await page.getByLabel(/Año/).inputValue(),
        };
        await page.getByLabel(/Patente/).fill(ctx.taken.toLowerCase());
        await page.getByRole('alert').waitFor({ timeout: 5000 });
      },
      check: async (page) => {
        const alerta = await page.getByRole('alert').textContent();
        const guardarDisabled = await page.getByRole('button', { name: 'Crear Vehículo' }).isDisabled();
        const pass = ctx.auto.brand === 'Toyota' && ctx.auto.year === '2018' && alerta.includes(ctx.owner.name) && guardarDisabled;
        return { pass, reason: 'autocompletado o aviso de patente registrada falló', facts: { auto: ctx.auto, alerta, guardarDisabled, overflow: await overflowX(page) } };
      },
    },
    {
      id: 'TC-23',
      combos: ['desktop-dark', 'mobile-light'],
      path: '/vehicles',
      allowStatus: [404, 503],
      allowConsoleErrors: true, // 404/503 del lookup simulado
      steps: async (page) => {
        ctx = {};
        await page.getByRole('button', { name: /Nuevo Vehículo/ }).click();
        await mockLookup(page, 404);
        await page.getByLabel(/Patente/).fill(newPlate());
        ctx.msg404 = await page.getByText(/No encontramos datos/).textContent({ timeout: 5000 });
        await page.unroute('**/api/v1/vehicles/lookup**');
        await mockLookup(page, 503);
        await page.getByLabel(/Patente/).fill(newPlate());
        ctx.msg503 = await page.getByText(/no responde/).textContent({ timeout: 5000 });
      },
      check: async (page) => {
        const pass = !!ctx.msg404 && !!ctx.msg503;
        return { pass, reason: 'faltan mensajes de lookup', facts: { msg404: ctx.msg404, msg503: ctx.msg503 } };
      },
    },
    {
      id: 'TC-24',
      combos: ALL,
      path: '/vehicles',
      steps: async (page) => {
        ctx = {};
        await mockLookup(page, 200, { make: 'Fiat', model: 'Uno', year: 1986 });
        await page.getByRole('button', { name: /Nuevo Vehículo/ }).click();
        ctx.plate = newPlate();
        await page.getByLabel(/Patente/).fill(ctx.plate);
        await page.getByText('Autocompletado').first().waitFor({ timeout: 5000 });
        const name = `QA Inline ${rand(5)}`;
        ctx.name = name;
        await page.getByPlaceholder(/cliente/i).fill(name);
        await page.getByRole('button', { name: new RegExp(`Crear cliente "${name}"`) }).click();
        const inner = page.getByRole('dialog', { name: 'Nuevo Cliente' });
        await inner.waitFor();
        // El panel apilado queda arriba: el elemento en el centro de la pantalla pertenece a él
        ctx.innerOnTop = await page.evaluate(() => {
          const el = document.elementFromPoint(window.innerWidth - 40, window.innerHeight / 2);
          return el?.closest('[role="dialog"]')?.getAttribute('aria-label');
        });
        ctx.focusInInner = await inner.evaluate((d) => d.contains(document.activeElement));
        ctx.nombrePrellenado = await page.getByLabel(/Nombre completo/).inputValue();
        // Escape cierra solo el de arriba
        await page.keyboard.press('Escape');
        ctx.outerAfterEsc = await page.getByRole('dialog', { name: 'Nuevo Vehículo' }).isVisible();
        ctx.innerAfterEsc = await inner.isVisible();
        // Volver a abrir y crear
        await page.getByPlaceholder(/cliente/i).fill(name);
        await page.getByRole('button', { name: new RegExp(`Crear cliente "${name}"`) }).click();
        await page.getByLabel(/Teléfono/).fill(newPhone());
        await page.getByRole('button', { name: 'Crear Cliente' }).click();
        await inner.waitFor({ state: 'hidden' });
      },
      check: async (page) => {
        const cliente = await page.getByPlaceholder(/cliente/i).inputValue();
        const year = await page.getByLabel(/Año/).inputValue();
        const plate = await page.getByLabel(/Patente/).inputValue();
        const saved = page.waitForResponse((r) => r.url().endsWith('/api/v1/vehicles') && r.request().method() === 'POST');
        await page.getByRole('button', { name: 'Crear Vehículo' }).click();
        const status = (await saved).status();
        const pass = ctx.innerOnTop === 'Nuevo Cliente' && ctx.focusInInner && ctx.nombrePrellenado === ctx.name
          && ctx.outerAfterEsc && !ctx.innerAfterEsc && cliente.startsWith(ctx.name) && year === '1986'
          && plate.toUpperCase() === ctx.plate && status === 201;
        return {
          pass,
          reason: 'flujo de cliente en línea con panel apilado falló',
          facts: { innerOnTop: ctx.innerOnTop, focusInInner: ctx.focusInInner, outerAfterEsc: ctx.outerAfterEsc, innerAfterEsc: ctx.innerAfterEsc, cliente, year, status },
        };
      },
    },
    {
      id: 'TC-25',
      combos: ALL,
      path: '/customers',
      steps: async (page) => {
        ctx = {};
        const c = await seedCustomer(page, { phone: '11 5555-1234', email: `qa${rand(6)}@example.com`, address: 'Calle QA 123' });
        const v = await seedVehicle(page, c.id);
        await api(page, 'POST', '/service_records', { service_record: { customer_id: c.id, vehicle_id: v.id, service_date: '2026-08-15', mileage: 52000 } });
        await api(page, 'POST', '/budgets', {
          budgets: { customer_id: c.id, vehicle_id: v.id, date: '2026-10-01', status: 'draft', card_surcharge_percentage: 0, items_attributes: [{ description: 'Aceite', quantity: 1, unit_price: 1000 }] },
        });
        ctx.c = c;
        ctx.v = v;
        await page.goto(`/customers/${c.id}`);
        await page.waitForLoadState('networkidle');
      },
      check: async (page) => {
        const editar = await page.getByRole('button', { name: /^Editar$/ }).count();
        const whatsapp = await page.getByRole('link', { name: 'WhatsApp' }).getAttribute('href');
        const ultimo = await page.getByText(/Último service: 15\/08\/2026 · 52\.000 km/).count();
        const presupuestar = await page.getByRole('link', { name: /Presupuestar/ }).getAttribute('href');
        const atencion = await page.getByRole('link', { name: /Nueva atención/ }).first().getAttribute('href');
        const seen = (locator) => locator.waitFor({ timeout: 8000 }).then(() => 1, () => 0);
        await page.getByRole('tab', { name: /Presupuestos/ }).click();
        const presupuestoFila = await seen(page.getByText(/· 01\/10\/2026/));
        await page.getByRole('tab', { name: /Turnos/ }).click();
        const turnos = await seen(page.getByText('No hay turnos próximos.'));
        const tabActiva = await page.locator('[role="tab"][aria-selected="true"]').textContent();
        const tabResaltada = await page.locator('[role="tab"].text-primary').allTextContents();
        const overflow = await overflowX(page);
        const layout = await page.evaluate(() => {
          const edit = document.querySelector('[aria-label^="Editar "]');
          const card = edit?.closest('li');
          const tabs = document.querySelector('[role="tablist"]');
          return {
            editDentro: !!edit && edit.getBoundingClientRect().right <= card.getBoundingClientRect().right + 0.5,
            tabsSinScroll: !!tabs && tabs.scrollWidth <= tabs.clientWidth,
          };
        });
        const q = `customer_id=${ctx.c.id}&vehicle_id=${ctx.v.id}`;
        const pass = editar === 1 && whatsapp === 'https://wa.me/5491155551234' && ultimo === 1
          && presupuestar === `/budgets/new?${q}` && atencion === `/service-records/new?${q}`
          && presupuestoFila === 1 && turnos === 1 && !overflow
          && layout.editDentro && layout.tabsSinScroll && tabActiva.includes('Turnos') && tabResaltada.length === 1 && tabResaltada[0].includes('Turnos');
        return { pass, reason: 'perfil incompleto', facts: { editar, whatsapp, ultimo, presupuestar, atencion, presupuestoFila, turnos, overflow, tabActiva, tabResaltada, ...layout } };
      },
    },
    {
      id: 'TC-26',
      path: '/customers',
      steps: async (page) => {
        ctx = {};
        const c = await seedCustomer(page, { name: `QA Presu ${rand(4)}` });
        const v = await seedVehicle(page, c.id);
        ctx.c = c;
        ctx.v = v;
        await page.goto(`/budgets/new?customer_id=${c.id}&vehicle_id=${v.id}`);
        await page.waitForLoadState('networkidle');
      },
      check: async (page) => {
        const cliente = await page.getByPlaceholder(/cliente/i).inputValue();
        const vehiculo = await page.getByLabel('Vehículo').inputValue();
        const pass = cliente.startsWith(ctx.c.name) && vehiculo === String(ctx.v.id);
        return { pass, reason: 'presupuesto no preseleccionó cliente/vehículo', facts: { cliente, vehiculo } };
      },
    },
    {
      id: 'TC-27',
      path: '/customers',
      steps: async (page) => {
        ctx = {};
        const c = await seedCustomer(page, { name: `QA Atenc ${rand(4)}` });
        const v = await seedVehicle(page, c.id);
        ctx.c = c;
        ctx.v = v;
        await page.goto(`/service-records/new?customer_id=${c.id}&vehicle_id=${v.id}`);
        await page.waitForLoadState('networkidle');
        await page.waitForFunction((name) => [...document.querySelectorAll('input')].some((i) => i.value === name), c.name, { timeout: 5000 });
      },
      check: async (page) => {
        const plate = ctx.v.license_plate;
        const vehiculo = await page.evaluate((p) => [...document.querySelectorAll('input')].filter((i) => i.value.includes(p)).length, plate);
        return { pass: vehiculo === 1, reason: 'atención no preseleccionó el vehículo', facts: { vehiculo } };
      },
    },
    {
      id: 'TC-28',
      combos: ['desktop-dark', 'mobile-light'],
      path: '/products',
      steps: async (page) => {
        ctx = {};
        await page.getByRole('button', { name: /^Nuevo$/ }).first().click();
        ctx.open = await page.getByRole('dialog').isVisible();
        ctx.overflowOpen = await page.evaluate(() => document.body.style.overflow);
        await page.keyboard.press('Escape');
      },
      check: async (page) => {
        const closed = (await page.getByRole('dialog').count()) === 0;
        const overflowAfter = await page.evaluate(() => document.body.style.overflow);
        const pass = ctx.open && ctx.overflowOpen === 'hidden' && closed && overflowAfter === '';
        return { pass, reason: 'regresión de SlideOver en productos', facts: { ...ctx, closed, overflowAfter } };
      },
    },
  ],
};
