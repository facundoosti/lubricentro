// QA visual de los quick-fixes de docs/PENDIENTES.md (2026-11-06).
// Correr: QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs docs/qa/2026-11-06-pendientes-quick-fix.qa.mjs

// Contraste WCAG entre dos colores computados ("rgb(r, g, b)")
const contrastFn = `(a, b) => {
  const lum = (c) => {
    const [r, g, bb] = c.match(/[\\d.]+/g).slice(0, 3).map(Number).map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bb;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return +((hi + 0.05) / (lo + 0.05)).toFixed(2);
}`;

const errorColor = (page) =>
  page.evaluate(() => {
    const el = document.createElement('div');
    el.className = 'border border-error';
    document.body.appendChild(el);
    const c = getComputedStyle(el).borderTopColor;
    el.remove();
    return c;
  });

export default {
  slug: 'pendientes-quick-fix',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-01',
      path: '/dashboard',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const t = page.getByText(/^Ingresos:/).first();
        await t.waitFor({ timeout: 10000 });
        const text = (await t.textContent()).trim();
        return { pass: !/NaN/.test(text) && /\$/.test(text), reason: `texto: ${text}`, facts: { text } };
      },
    },
    {
      id: 'TC-02',
      path: '/dashboard',
      steps: async (page) => {
        await page.waitForFunction(() => document.title.startsWith('Dashboard'));
        await page.getByRole('link', { name: 'Configuración' }).click();
        await page.waitForURL('**/settings');
        // waitForURL resuelve con el pushState, antes de que React desmonte el Dashboard
        await page.getByRole('switch', { name: 'Lunes' }).waitFor({ timeout: 8000 });
      },
      check: async (page) => {
        const title = await page.title();
        return { pass: !title.startsWith('Dashboard'), reason: `title: ${title}`, facts: { title } };
      },
    },
    {
      id: 'TC-03',
      path: '/customers',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const btn = page.locator('button.bg-primary-container, a.bg-primary-container').first();
        await btn.waitFor({ timeout: 10000 });
        const r = await btn.evaluate((el, fn) => {
          const contrast = eval(fn);
          const s = getComputedStyle(el);
          return { color: s.color, bg: s.backgroundColor, ratio: contrast(s.color, s.backgroundColor), text: el.textContent.trim() };
        }, contrastFn);
        return { pass: r.ratio >= 4.5, reason: `contraste ${r.ratio}`, facts: r };
      },
    },
    {
      id: 'TC-04',
      path: '/products',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const cb = page.locator('input[type="checkbox"]:not(:checked)').first();
        await cb.waitFor({ timeout: 10000 });
        const r = await cb.evaluate((el, fn) => {
          const contrast = eval(fn);
          let p = el.parentElement, bg = 'rgba(0, 0, 0, 0)';
          while (p && /rgba\(0, 0, 0, 0\)|transparent/.test(bg)) { bg = getComputedStyle(p).backgroundColor; p = p.parentElement; }
          const border = getComputedStyle(el).borderTopColor;
          return { border, bg, ratio: contrast(border, bg) };
        }, contrastFn);
        return { pass: r.ratio >= 3, reason: `contraste ${r.ratio}`, facts: r };
      },
    },
    {
      id: 'TC-05',
      path: '/dashboard',
      steps: async (page) => {
        await page.getByRole('button', { name: /Operaciones/ }).click();
        await page.waitForTimeout(400);
      },
      check: async (page) => {
        const active = await page.locator('#tour-sidebar .menu-item-active').allTextContents();
        const expanded = await page.getByRole('button', { name: /Operaciones/ }).getAttribute('aria-expanded');
        return { pass: active.length === 1 && expanded === 'true', reason: `activos: ${active}`, facts: { active, expanded } };
      },
    },
    {
      id: 'TC-06',
      path: '/dashboard',
      steps: async (page) => {
        await page.getByRole('button', { name: 'Colapsar menú' }).click();
        await page.mouse.move(1200, 500);
        await page.waitForTimeout(400);
      },
      check: async (page) => {
        const unnamed = await page.evaluate(() =>
          [...document.querySelectorAll('#tour-sidebar a, #tour-sidebar button')]
            .filter((el) => !el.getAttribute('aria-label') && !el.textContent.trim())
            .map((el) => el.outerHTML.slice(0, 80)),
        );
        const names = await page.evaluate(() =>
          [...document.querySelectorAll('#tour-sidebar [aria-label]')].map((el) => el.getAttribute('aria-label')),
        );
        // dejar el sidebar expandido para el resto
        await page.getByRole('button', { name: 'Expandir menú' }).click();
        return { pass: unnamed.length === 0, reason: `sin nombre: ${unnamed.length}`, facts: { names, unnamed } };
      },
    },
    {
      id: 'TC-07',
      path: '/appointments',
      steps: async (page) => {
        await page.getByRole('button', { name: 'Nuevo Turno' }).first().click();
        await page.getByRole('button', { name: 'Crear Turno' }).click();
        await page.getByText('Cliente es requerido').waitFor({ timeout: 5000 });
      },
      check: async (page) => {
        const err = await errorColor(page);
        const customer = await page.getByPlaceholder('Buscar cliente por nombre o email...').evaluate((el) => getComputedStyle(el).borderTopColor);
        const vehicle = await page.locator('select[name="vehicle_id"]').evaluate((el) => getComputedStyle(el).borderTopColor);
        const vehicleMsg = await page.getByText('Vehículo es requerido').isVisible();
        return {
          pass: customer === err && vehicle === err && vehicleMsg,
          reason: `cliente ${customer} · vehículo ${vehicle} · error ${err}`,
          facts: { err, customer, vehicle, vehicleMsg },
        };
      },
    },
    {
      id: 'TC-08',
      path: '/service-records/new',
      steps: async (page) => {
        await page.getByRole('button', { name: 'Registrar atención' }).click();
        await page.getByText('El cliente es obligatorio').waitFor({ timeout: 5000 });
      },
      check: async (page) => {
        const err = await errorColor(page);
        const customer = await page.getByPlaceholder('Buscar cliente...').evaluate((el) => getComputedStyle(el).borderTopColor);
        const vehicle = await page.getByPlaceholder('Primero seleccioná un cliente').evaluate((el) => getComputedStyle(el).borderTopColor);
        return { pass: customer === err && vehicle === err, reason: `cliente ${customer} · vehículo ${vehicle}`, facts: { err, customer, vehicle } };
      },
    },
    {
      id: 'TC-09',
      path: '/appointments',
      combos: ['desktop-light'],
      steps: async (page) => {
        await page.getByRole('button', { name: 'Nuevo Turno' }).first().click();
        await page.getByPlaceholder('Buscar cliente por nombre o email...').fill('Un nombre de cliente bastante largo para llenar');
      },
      check: async (page) => {
        const input = page.getByPlaceholder('Buscar cliente por nombre o email...');
        const r = await input.evaluate((el) => {
          const ir = el.getBoundingClientRect();
          const x = el.parentElement.querySelector('[aria-label="Limpiar selección"]').getBoundingClientRect();
          const pr = parseFloat(getComputedStyle(el).paddingRight);
          return { paddingRight: pr, textEnd: Math.round(ir.right - pr), clearLeft: Math.round(x.left) };
        });
        return { pass: r.textEnd <= r.clearLeft, reason: `texto termina en ${r.textEnd}, X empieza en ${r.clearLeft}`, facts: r };
      },
    },
    {
      id: 'TC-10',
      path: '/appointments',
      steps: async (page) => {
        // buscar un mes con turnos (hasta 6 meses atrás)
        for (let i = 0; i < 6 && (await page.locator('.fc-event').count()) === 0; i += 1) {
          await page.waitForTimeout(800);
          if ((await page.locator('.fc-event').count()) > 0) break;
          await page.locator('.fc-prev-button').click();
        }
        await page.locator('.fc-event').first().waitFor({ timeout: 8000 });
        const ev = page.locator('.fc-event').first();
        const box = await ev.boundingBox();
        await page.mouse.move(box.x + 5, box.y + 5);
        await page.waitForTimeout(200);
      },
      check: async (page) => {
        const tip = page.locator('div.fixed.pointer-events-none');
        const before = await tip.count();
        // cambio de mes sin mover el puntero del evento
        await page.locator('.fc-next-button').evaluate((b) => b.click());
        await page.waitForTimeout(400);
        const after = await tip.count();
        return { pass: before === 1 && after === 0, reason: `tooltip antes ${before}, después ${after}`, facts: { before, after } };
      },
    },
    {
      id: 'TC-11',
      path: '/settings',
      combos: ['desktop-light', 'desktop-dark'],
      fullPage: true,
      check: async (page) => {
        const sw = page.locator('main [role="switch"], #root [role="switch"]').filter({ hasNotText: /./ }).and(page.locator(':not(header *)'));
        await sw.first().waitFor({ timeout: 8000 });
        const states = await sw.evaluateAll((els) => els.map((e) => `${e.getAttribute('aria-label')}:${e.getAttribute('aria-checked')}`));
        const days = states.filter((x) => !x.startsWith('Modo oscuro'));
        return { pass: days.length === 7 && days.every((x) => /:(true|false)$/.test(x)), reason: `switches de días: ${days.length}`, facts: { days } };
      },
    },
    {
      id: 'TC-12',
      path: '/inbox',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const btn = page.getByRole('button', { name: /Todos/ }).first();
        await btn.waitFor({ timeout: 8000 });
        const r = await btn.evaluate((el, fn) => {
          const contrast = eval(fn);
          const s = getComputedStyle(el);
          return { color: s.color, bg: s.backgroundColor, ratio: contrast(s.color, s.backgroundColor) };
        }, contrastFn);
        return { pass: r.ratio >= 4.5, reason: `contraste ${r.ratio}`, facts: r };
      },
    },
  ],
};
