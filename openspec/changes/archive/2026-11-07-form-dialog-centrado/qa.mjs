// QA visual de form-dialog-centrado. Correr con:
// QA_BASE_URL=http://localhost:5174 QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs openspec/changes/form-dialog-centrado/qa.mjs

const FORMS = [
  { name: 'Cliente', path: '/customers', button: /nuevo cliente/i },
  { name: 'Vehículo', path: '/vehicles', button: /nuevo vehículo/i },
  { name: 'Producto', path: '/products', button: /^\s*nuevo\s*$/i },
  { name: 'Servicio', path: '/services', button: /nuevo servicio/i },
  { name: 'Proveedor', path: '/suppliers', button: /nuevo proveedor/i },
  { name: 'Turno', path: '/appointments', button: /nuevo turno/i },
];
const byName = (n) => FORMS.find((f) => f.name === n);

async function openForm(page, form) {
  await page.goto(form.path);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: form.button }).first().click();
  await page.getByRole('dialog').first().waitFor();
}

// Medidas del diálogo de arriba: panel, cuerpo con scroll, header/footer, fondo
function measure(page) {
  return page.evaluate(() => {
    const dialogs = [...document.querySelectorAll('[role="dialog"]')];
    const d = dialogs.at(-1);
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom) }; };
    const body = d.querySelector(':scope > .overflow-y-auto');
    const [header, , footer] = d.children;
    return {
      count: dialogs.length,
      name: d.getAttribute('aria-labelledby') && document.getElementById(d.getAttribute('aria-labelledby'))?.textContent,
      panel: r(d),
      header: r(header),
      footer: r(footer),
      bodyScroll: body ? body.scrollHeight - body.clientHeight : null,
      backdrop: getComputedStyle(d.parentElement).backgroundColor,
      zIndex: getComputedStyle(d.parentElement).zIndex,
      vw: window.innerWidth,
      vh: window.innerHeight,
    };
  });
}

const centered = (m) => Math.abs(m.panel.x + m.panel.w / 2 - m.vw / 2) <= 2 && Math.abs(m.panel.y + m.panel.h / 2 - m.vh / 2) <= 2;

export default {
  slug: 'form-dialog-centrado',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-01',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const facts = {};
        const bad = [];
        for (const f of FORMS) {
          await openForm(page, f);
          const m = await measure(page);
          facts[f.name] = { w: m.panel.w, h: m.panel.h, centered: centered(m), footerBottom: m.footer.bottom };
          if (!centered(m)) bad.push(`${f.name} no centrado`);
          if (m.panel.w > 768) bad.push(`${f.name} ancho ${m.panel.w}`);
          if (m.header.y < 0 || m.footer.bottom > m.vh) bad.push(`${f.name} header/footer fuera de pantalla`);
        }
        return { pass: bad.length === 0, reason: bad.join('; '), facts };
      },
    },
    {
      id: 'TC-02',
      check: async (page) => {
        const facts = {};
        const bad = [];
        for (const n of ['Cliente', 'Vehículo', 'Servicio', 'Proveedor', 'Turno']) {
          await openForm(page, byName(n));
          const m = await measure(page);
          facts[n] = { bodyScroll: m.bodyScroll, h: m.panel.h };
          if (m.bodyScroll > 1) bad.push(`${n} scrollea ${m.bodyScroll}px`);
        }
        return { pass: bad.length === 0, reason: bad.join('; '), facts };
      },
    },
    {
      id: 'TC-03',
      check: async (page) => {
        await openForm(page, byName('Producto'));
        const m = await measure(page);
        const ok = m.header.y >= 0 && m.footer.bottom <= m.vh && m.panel.h <= Math.ceil(m.vh * 0.9) + 1;
        return { pass: ok, reason: 'header/footer fuera o panel > 90vh', facts: { panelH: m.panel.h, bodyScroll: m.bodyScroll, footerBottom: m.footer.bottom, vh: m.vh } };
      },
    },
    {
      id: 'TC-04',
      check: async (page) => {
        const facts = {};
        const bad = [];
        for (const n of ['Servicio', 'Producto']) {
          await openForm(page, byName(n));
          const res = await page.evaluate(() => {
            const d = [...document.querySelectorAll('[role="dialog"]')].at(-1);
            const ta = d.querySelector('textarea');
            const form = d.querySelector('form');
            if (!ta || !form) return null;
            return { ta: Math.round(ta.getBoundingClientRect().width), form: Math.round(form.getBoundingClientRect().width) };
          });
          facts[n] = res;
          if (!res || res.ta < res.form * 0.95) bad.push(`${n} textarea no ocupa el ancho`);
        }
        return { pass: bad.length === 0, reason: bad.join('; '), facts };
      },
    },
    {
      id: 'TC-05',
      check: async (page) => {
        await openForm(page, byName('Cliente'));
        const input = page.getByRole('dialog').locator('input[type="text"], input:not([type])').first();
        await input.fill('QA fondo');
        await page.mouse.click(20, 20);
        const open = await page.getByRole('dialog').count();
        const value = open ? await input.inputValue() : null;
        return { pass: open === 1 && value === 'QA fondo', reason: 'el click en el fondo cerró o perdió datos', facts: { open, value } };
      },
    },
    {
      id: 'TC-06',
      check: async (page) => {
        const facts = {};
        const form = byName('Proveedor');
        await openForm(page, form);
        await page.keyboard.press('Escape');
        facts.escape = await page.getByRole('dialog').count();
        await openForm(page, form);
        await page.getByRole('dialog').getByRole('button', { name: 'Cerrar' }).click();
        facts.close = await page.getByRole('dialog').count();
        await openForm(page, form);
        await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();
        facts.cancel = await page.getByRole('dialog').count();
        return { pass: !facts.escape && !facts.close && !facts.cancel, reason: 'alguna vía no cerró', facts };
      },
    },
    {
      id: 'TC-07',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        await openForm(page, byName('Vehículo'));
        const search = page.getByRole('dialog').getByPlaceholder(/buscar cliente/i);
        await search.click();
        await search.fill('QA Zzz Apilado');
        await page.getByText(/\+ Crear cliente/).click();
        await page.waitForFunction(() => document.querySelectorAll('[role="dialog"]').length === 2);
        const top = await measure(page);
        const base = await page.evaluate(() => {
          const d = document.querySelectorAll('[role="dialog"]')[0];
          return { w: Math.round(d.getBoundingClientRect().width), backdrop: getComputedStyle(d.parentElement).backgroundColor, zIndex: getComputedStyle(d.parentElement).zIndex };
        });
        await page.keyboard.press('Escape');
        const afterEsc = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => document.getElementById(d.getAttribute('aria-labelledby'))?.textContent));
        const alpha = (c) => Number((c.match(/[\d.]+\)$/) || ['1'])[0].replace(')', ''));
        const ok = top.panel.w < base.w && alpha(top.backdrop) > alpha(base.backdrop) && Number(top.zIndex) > Number(base.zIndex) && afterEsc.length === 1 && /veh/i.test(afterEsc[0]);
        return { pass: ok, reason: 'apilado incorrecto', facts: { top: { name: top.name, w: top.panel.w, backdrop: top.backdrop, z: top.zIndex }, base, afterEsc } };
      },
    },
    {
      id: 'TC-08',
      check: async (page) => {
        const form = byName('Proveedor');
        await page.goto(form.path);
        await page.waitForLoadState('networkidle');
        const btn = page.getByRole('button', { name: form.button }).first();
        await btn.click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        const name = await page.evaluate(() => {
          const d = document.querySelector('[role="dialog"]');
          return document.getElementById(d.getAttribute('aria-labelledby'))?.textContent;
        });
        await dialog.getByRole('button', { name: 'Cancelar' }).click();
        const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
        const ok = name === 'Nuevo Proveedor' && /nuevo proveedor/i.test(focused || '');
        return { pass: ok, reason: 'foco o nombre accesible incorrecto', facts: { name, focused } };
      },
    },
    {
      id: 'TC-09',
      check: async (page) => {
        await openForm(page, byName('Vehículo'));
        const search = page.getByRole('dialog').getByPlaceholder(/buscar cliente/i);
        await search.click();
        await search.fill('a');
        const LIST = '[data-testid="customer-search-results"]';
        await page.locator(LIST).first().waitFor({ timeout: 5000 }).catch(() => {});
        const listBefore = await page.locator(LIST).count();
        await page.keyboard.press('Escape');
        const dialogs = await page.getByRole('dialog').count();
        const listAfter = await page.locator(LIST).count();
        return { pass: listBefore > 0 && dialogs === 1 && listAfter === 0, reason: 'Escape cerró el diálogo o no la lista', facts: { listBefore, dialogs, listAfter } };
      },
    },
    {
      id: 'TC-10',
      check: async (page) => {
        const facts = {};
        const bad = [];
        // La lista no debe quedar recortada: entera dentro del viewport y sin forzar scroll del cuerpo
        const probe = async () => page.evaluate(() => {
          const d = [...document.querySelectorAll('[role="dialog"]')].at(-1);
          const body = d.querySelector(':scope > .overflow-y-auto');
          const list = document.querySelector('[data-testid="customer-search-results"]') || d.querySelector('.absolute.z-50.top-full');
          if (!list) return { list: false };
          const lb = list.getBoundingClientRect();
          const bb = body.getBoundingClientRect();
          const inBody = body.contains(list);
          const clipped = inBody ? lb.bottom > bb.bottom + 1 : (lb.bottom > window.innerHeight || lb.top < 0);
          return { list: true, inBody, top: Math.round(lb.top), bottom: Math.round(lb.bottom), bodyBottom: Math.round(bb.bottom), clipped, bodyScroll: body.scrollHeight - body.clientHeight };
        });
        for (const n of ['Vehículo', 'Turno']) {
          await openForm(page, byName(n));
          const s = page.getByRole('dialog').getByPlaceholder(/buscar cliente/i);
          await s.click();
          await s.fill('a');
          await page.waitForTimeout(800);
          facts[n] = await probe();
          if (!facts[n].list) bad.push(`${n} sin lista`);
          else if (facts[n].clipped) bad.push(`${n} lista recortada`);
        }
        await openForm(page, byName('Producto'));
        await page.getByRole('dialog').getByRole('button', { name: /seleccionar/i }).first().click();
        await page.waitForTimeout(300);
        facts.Producto = await probe();
        if (!facts.Producto.list) bad.push('Producto sin lista');
        else if (facts.Producto.clipped) bad.push('Producto categoría recortada');
        return { pass: bad.length === 0, reason: bad.join('; '), facts };
      },
    },
  ],
};
