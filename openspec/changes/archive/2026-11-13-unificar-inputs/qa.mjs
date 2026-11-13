// QA visual del change unificar-inputs. Correr con tools/qa-runner/run.mjs.
const BOX = ['height', 'paddingLeft', 'backgroundColor', 'borderTopColor', 'borderRadius', 'fontSize'];

const styles = (loc, props = BOX) =>
  loc.evaluate((el, ps) => {
    const cs = getComputedStyle(el);
    return Object.fromEntries(ps.map((p) => [p, cs[p]]));
  }, props);

const height = (loc) => loc.evaluate((el) => Math.round(el.getBoundingClientRect().height));

const diffKeys = (a, b) => Object.keys(a).filter((k) => a[k] !== b[k]);

const openNewCustomer = async (page) => {
  await page.getByRole('button', { name: /Nuevo Cliente/ }).first().click();
  await page.getByRole('dialog').waitFor();
};

const openNewAppointment = async (page) => {
  await page.getByRole('button', { name: /Nuevo Turno/ }).first().click();
  await page.getByRole('dialog').waitFor();
};

const SEARCHES = [
  ['/customers', 'Buscar clientes...'],
  ['/vehicles', 'Buscar vehículos...'],
  ['/products', 'Buscar por nombre...'],
  ['/services', 'Buscar servicios...'],
  ['/suppliers', 'Buscar proveedor...'],
  ['/service-records', 'Buscar atenciones...'],
  ['/budgets', 'Buscar por cliente o vehículo...'],
  ['/reminders', 'Cliente o Patente...'],
];

export default {
  slug: 'unificar-inputs',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-02',
      path: '/settings',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const settingsInput = page.getByPlaceholder('Ej: Lubricentro El Rápido');
        await settingsInput.waitFor();
        const ref = await styles(settingsInput);
        const refLabel = await styles(page.locator('label', { hasText: 'Nombre del Lubricentro' }), ['color', 'fontWeight']);
        await page.goto('/customers');
        await openNewCustomer(page);
        const dlg = page.getByRole('dialog');
        const cust = await styles(dlg.getByLabel('Nombre completo'));
        const custLabel = await styles(dlg.locator('label', { hasText: 'Nombre completo' }), ['color', 'fontWeight']);
        const diff = [...diffKeys(ref, cust), ...diffKeys(refLabel, custLabel).map((k) => `label.${k}`)];
        return { pass: diff.length === 0, reason: diff.length ? `difiere: ${diff.join(', ')}` : undefined, facts: { ref, cust, refLabel, custLabel } };
      },
    },
    {
      id: 'TC-03',
      path: '/appointments',
      steps: openNewAppointment,
      check: async (page) => {
        const dlg = page.getByRole('dialog');
        const date = dlg.locator('#appointment-date');
        const time = dlg.locator('#appointment-time');
        const status = dlg.locator('#appointment-status');
        const customer = dlg.getByLabel('Cliente');
        const items = { date, time, status, customer };
        const facts = {};
        for (const [k, loc] of Object.entries(items)) {
          facts[k] = { h: await height(loc), bg: (await styles(loc, ['backgroundColor'])).backgroundColor };
        }
        const hs = Object.values(facts).map((f) => f.h);
        const bgs = new Set(Object.values(facts).map((f) => f.bg));
        const pass = Math.max(...hs) - Math.min(...hs) <= 1 && bgs.size === 1;
        return { pass, reason: pass ? undefined : 'alto o fondo distinto entre controles', facts };
      },
    },
    {
      id: 'TC-04',
      check: async (page) => {
        const facts = {};
        for (const [path, ph] of SEARCHES) {
          await page.goto(path);
          const input = page.getByPlaceholder(ph);
          await input.waitFor();
          const m = await input.evaluate((el) => {
            const r = el.getBoundingClientRect();
            const svg = el.parentElement.querySelector('svg');
            const s = svg?.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return {
              h: Math.round(r.height),
              bg: cs.backgroundColor,
              pl: cs.paddingLeft,
              iconInside: !!s && s.left >= r.left && s.right <= r.left + parseFloat(cs.paddingLeft) + 2,
            };
          });
          facts[path] = m;
        }
        const vals = Object.values(facts);
        const hs = vals.map((v) => v.h);
        const bad = Object.entries(facts).filter(([, v]) => !v.iconInside).map(([p]) => p);
        const pass = Math.max(...hs) - Math.min(...hs) <= 1 && new Set(vals.map((v) => v.bg)).size === 1 && bad.length === 0;
        return { pass, reason: pass ? undefined : `alturas ${hs.join('/')} · lupa fuera en ${bad.join(', ') || '-'}`, facts };
      },
    },
    {
      id: 'TC-05',
      path: '/settings',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const input = page.getByPlaceholder('Ej: Lubricentro El Rápido');
        await input.waitFor();
        await page.keyboard.press('Tab');
        await input.focus();
        const before = await styles(page.getByPlaceholder('20-12345678-9'), ['borderTopColor']);
        await page.waitForTimeout(400); // transition-colors: 150ms
        const s = await styles(input, ['borderTopColor', 'boxShadow', 'outlineStyle']);
        const hasRing = / 0px 0px 0px 2px/.test(s.boxShadow);
        const borderChanged = s.borderTopColor !== before.borderTopColor;
        const pass = hasRing && borderChanged;
        return { pass, reason: pass ? undefined : `ring ${hasRing} · borde cambia ${borderChanged}`, facts: { ...s, unfocusedBorder: before.borderTopColor } };
      },
    },
    {
      id: 'TC-06',
      path: '/customers',
      steps: async (page) => {
        await openNewCustomer(page);
        await page.getByRole('dialog').getByRole('button', { name: /guardar|crear/i }).last().click();
      },
      allowStatus: [422],
      check: async (page) => {
        const dlg = page.getByRole('dialog');
        const input = dlg.getByLabel('Nombre completo');
        await page.waitForTimeout(400);
        const ok = await styles(dlg.getByLabel('Email'), ['borderTopColor']);
        const invalid = await input.getAttribute('aria-invalid');
        const border = (await styles(input, ['borderTopColor'])).borderTopColor;
        const alerts = await dlg.getByRole('alert').allTextContents();
        const describedBy = await input.getAttribute('aria-describedby');
        const pass = invalid === 'true' && alerts.length > 0 && !!describedBy && border !== ok.borderTopColor;
        return { pass, reason: pass ? undefined : 'error sin aria-invalid / alerta / describedby / borde rojo', facts: { invalid, border, okBorder: ok.borderTopColor, alerts, describedBy } };
      },
    },
    {
      id: 'TC-07',
      path: '/budgets/new',
      check: async (page) => {
        const search = page.getByRole('combobox').filter({ hasNot: page.locator('[data-slot=select-trigger]') });
        await page.waitForLoadState('networkidle');
        const inputs = page.locator('input');
        const n = await inputs.count();
        const hs = [];
        for (let i = 0; i < n; i++) {
          const el = inputs.nth(i);
          if (!(await el.isVisible())) continue;
          const ph = await el.getAttribute('placeholder');
          hs.push({ ph, h: await height(el), pl: (await styles(el, ['paddingLeft'])).paddingLeft });
        }
        const itemSearch = hs.find((x) => /producto o servicio/i.test(x.ph || ''));
        const pass = !!itemSearch && itemSearch.h >= 30 && itemSearch.h <= 34;
        return { pass, reason: pass ? undefined : 'buscador de ítems no es compacto (~34px)', facts: { hs, combos: await search.count() } };
      },
    },
    {
      id: 'TC-08',
      combos: ['desktop-dark', 'desktop-light'],
      steps: async (page) => {
        await page.goto('/settings');
        await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
        await page.context().clearCookies();
        await page.goto('/login');
      },
      check: async (page) => {
        const email = page.locator('input[type=email], input[name=email]').first();
        await email.waitFor();
        const pwd = page.locator('input[type=password]').first();
        const e = await styles(email);
        const p = await styles(pwd);
        const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        const diff = diffKeys(e, p).filter((k) => k !== 'paddingLeft');
        const pass = diff.length === 0 && !overflowX && Math.abs(parseFloat(e.height) - 38) <= 2;
        return { pass, reason: pass ? undefined : `difiere ${diff.join(',')} · overflow ${overflowX}`, facts: { e, p } };
      },
    },
    {
      id: 'TC-09',
      path: '/inbox',
      check: async (page) => {
        await page.waitForLoadState('networkidle');
        await page.getByText('541128157682').first().click();
        const ta = page.locator('textarea').first();
        await ta.waitFor({ timeout: 8000 });
        await page.waitForTimeout(300);
        const s = await styles(ta, ['backgroundColor', 'borderTopColor', 'borderRadius', 'paddingLeft', 'fontSize']);
        const pass = s.borderRadius === '8px' && s.paddingLeft === '12px' && s.fontSize === '14px';
        return { pass, reason: pass ? undefined : 'textarea sin estilo común', facts: s };
      },
    },
    {
      id: 'TC-10',
      path: '/settings',
      combos: ['desktop-dark', 'desktop-light'],
      steps: async (page) => {
        await page.getByRole('button', { name: /Agregar plan/ }).click();
      },
      check: async (page) => {
        const ref = await styles(page.getByPlaceholder('Ej: Lubricentro El Rápido'));
        const plan = await styles(page.getByRole('form', { name: 'Crear plan' }).getByLabel('Nombre del plan'));
        const diff = diffKeys(ref, plan);
        return { pass: diff.length === 0, reason: diff.length ? `difiere ${diff.join(',')}` : undefined, facts: { ref, plan } };
      },
    },
  ],
};
