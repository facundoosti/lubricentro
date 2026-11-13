const BIG = 97, SIMPLE = 98;
const sheetFacts = () => {
  const q = (s) => document.querySelector(s);
  const qa = (s) => [...document.querySelectorAll(s)];
  const sheet = q('#budget-print-sheet');
  const r = (el) => el && el.getBoundingClientRect();
  return {
    headers: qa('#budget-print-sheet thead th').map((t) => t.textContent.trim()),
    codes: qa('[data-testid="print-product-code"]').map((e) => e.textContent),
    installments: qa('[data-testid="print-installment"]').map((e) => e.textContent.trim()),
    legend: q('[data-testid="print-legend"]')?.textContent.trim() || null,
    fiscal: q('[data-testid="print-customer-fiscal"]')?.textContent.trim() || null,
    footer: q('[data-testid="print-footer"]')?.textContent.trim() || null,
    address: q('[data-testid="print-address"]')?.textContent.trim() || null,
    totalsBottom: r(q('[data-testid="print-totals-box"]'))?.bottom,
    legendBottom: r(q('[data-testid="print-legend"]'))?.bottom,
    footerTop: r(q('[data-testid="print-footer"]'))?.top,
    footerBottom: r(q('[data-testid="print-footer"]'))?.bottom,
    sheetBottom: r(sheet)?.bottom,
    sheetH: r(sheet)?.height,
    sheetScrollW: sheet?.scrollWidth, sheetClientW: sheet?.clientWidth,
    notes: document.body.innerText.includes('QA-NOTAS'),
  };
};
const waitSheet = (page) => page.waitForSelector('[data-testid="print-legend"]', { timeout: 15000 });

export default {
  slug: 'presupuesto-hoja-rediseno',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-01', path: `/budgets/${BIG}/print`,
      steps: waitSheet,
      check: async (page) => {
        const f = await page.evaluate(sheetFacts);
        const fails = [];
        if (f.headers.some((h) => /UNIT/i.test(h))) fails.push('hay columna P. UNIT.');
        if (f.codes.length !== 3) fails.push(`códigos=${f.codes.length}`);
        if (f.installments.length !== 2) fails.push(`cuotas=${f.installments.length}`);
        if (!/NO VÁLIDO COMO COMPROBANTE DE FACTURACIÓN/i.test(f.legend || '')) fails.push('sin leyenda');
        if (!/20-28456123-4/.test(f.fiscal || '') || !/B/.test(f.fiscal || '')) fails.push('fiscal mal');
        if (!/killamet\.qa@example\.com/.test(f.footer || '') || !/@killamet\.dolores/.test(f.footer || '')) fails.push('pie sin contacto');
        if (f.address && f.footer && f.footer.includes(f.address.replace(/^\W+/, '').trim())) fails.push('pie repite dirección');
        return { pass: !fails.length, reason: fails.join('; '), facts: { headers: f.headers, codes: f.codes, installments: f.installments, fiscal: f.fiscal, footer: f.footer } };
      },
    },
    {
      id: 'TC-02', path: `/budgets/${BIG}/print`,
      steps: waitSheet,
      check: async (page) => {
        const f = await page.evaluate(sheetFacts);
        const fails = [];
        if (!(f.footerTop >= f.legendBottom && f.footerTop >= f.totalsBottom)) fails.push('pie superpuesto');
        if (f.footerBottom > f.sheetBottom + 1) fails.push('pie fuera de la hoja');
        if (f.sheetScrollW > f.sheetClientW + 1) fails.push('desborde horizontal');
        if (!f.notes) fails.push('notas no visibles');
        const a4 = 297 * 96 / 25.4;
        return { pass: !fails.length, reason: fails.join('; '), facts: { totalsBottom: f.totalsBottom, legendBottom: f.legendBottom, footerTop: f.footerTop, sheetH: Math.round(f.sheetH), a4px: Math.round(a4), fitsA4: f.sheetH <= a4 + 1 } };
      },
    },
    {
      id: 'TC-03', path: `/budgets/${SIMPLE}/print`,
      steps: waitSheet,
      check: async (page) => {
        const f = await page.evaluate(sheetFacts);
        const ok = !f.fiscal && !!f.legend && (await page.locator('[data-testid="print-total-list"]').count()) === 1;
        return { pass: ok, reason: ok ? undefined : 'fiscal visible o faltan totales/leyenda', facts: { fiscal: f.fiscal, legend: !!f.legend } };
      },
    },
    {
      id: 'TC-04', path: '/settings', combos: ['desktop-dark', 'desktop-light'],
      steps: async (page) => { await page.getByText('Planes de cuotas').first().waitFor({ timeout: 15000 }); await page.getByText('Planes de cuotas').first().scrollIntoViewIfNeeded(); },
      check: async (page) => {
        const facts = await page.evaluate(() => {
          const vals = [...document.querySelectorAll('input')].map((i) => i.value);
          return {
            email: vals.includes('killamet.qa@example.com'),
            instagram: vals.some((v) => /killamet\.dolores/.test(v)),
            plans: (document.body.innerText.match(/QA VISA/g) || []).length,
            overflowX: document.documentElement.scrollWidth > window.innerWidth,
          };
        });
        const pass = facts.email && facts.instagram && facts.plans >= 2 && !facts.overflowX;
        return { pass, reason: pass ? undefined : JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-05', path: '/customers', combos: ['desktop-dark', 'desktop-light'],
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo|agregar|crear/i }).first().click();
        await page.getByRole('dialog').waitFor({ timeout: 10000 });
      },
      check: async (page) => {
        const d = page.getByRole('dialog');
        const txt = await d.innerText();
        const facts = { cuit: /CUIT/i.test(txt), tipo: /factura/i.test(txt) };
        return { pass: facts.cuit && facts.tipo, reason: 'faltan campos', facts };
      },
    },
    {
      id: 'TC-07', path: `/budgets/${BIG}/print`,
      steps: async (page) => { await waitSheet(page); await page.waitForTimeout(500); },
      check: async (page) => {
        await page.locator('#budget-print-sheet').screenshot({ path: 'tmp/qa/presupuesto-hoja-rediseno/TC-07-sheet.png' });
        return { pass: true, facts: { shot: 'tmp/qa/presupuesto-hoja-rediseno/TC-07-sheet.png' } };
      },
    },
  ],
};
