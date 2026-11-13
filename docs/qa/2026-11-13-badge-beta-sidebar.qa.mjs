// QA: badge "Beta" en Inbox y Recordatorios del sidebar.
const BOTH = ['desktop-dark', 'desktop-light'];

const badgeFacts = (page) =>
  page.evaluate(() => {
    const links = [...document.querySelectorAll('aside a')];
    const out = {};
    for (const name of ['Inbox', 'Recordatorios', 'Dashboard']) {
      const a = links.find((l) => l.textContent.includes(name));
      const b = a && [...a.querySelectorAll('span')].find((s) => s.textContent.trim() === 'Beta');
      if (!b) { out[name] = null; continue; }
      const cs = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      out[name] = { bg: cs.backgroundColor, color: cs.color, text: b.innerText, h: Math.round(r.height), insideLink: r.right <= ar.right && r.top >= ar.top && r.bottom <= ar.bottom };
    }
    return out;
  });

// Contraste WCAG entre dos rgb()
function contrast(a, b) {
  const lum = (c) => {
    const [r, g, bl] = c.match(/\d+/g).slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return +((l1 + 0.05) / (l2 + 0.05)).toFixed(2);
}

export default {
  slug: 'badge-beta-sidebar',
  cases: [
    {
      id: 'TC-01',
      path: '/dashboard',
      combos: BOTH,
      check: async (page) => {
        const f = await badgeFacts(page);
        const ok = ['Inbox', 'Recordatorios'].every((n) => f[n] && f[n].insideLink && contrast(f[n].bg, f[n].color) >= 4.5) && f.Dashboard === null;
        return { pass: ok, reason: ok ? undefined : 'badge ausente, fuera del ítem o contraste < 4.5', facts: { ...f, contrast: f.Inbox && contrast(f.Inbox.bg, f.Inbox.color) } };
      },
    },
    {
      id: 'TC-02',
      path: '/inbox',
      combos: ['desktop-dark'],
      check: async (page) => {
        const f = await badgeFacts(page);
        return { pass: !!f.Inbox?.insideLink, reason: 'badge no visible con el ítem activo', facts: { Inbox: f.Inbox } };
      },
    },
    {
      id: 'TC-03',
      path: '/dashboard',
      combos: ['desktop-dark'],
      steps: async (page) => {
        await page.evaluate(() => localStorage.setItem('sidebar-expanded', 'false'));
        await page.getByRole('button', { name: /colapsar|contraer|expandir/i }).first().click().catch(() => {});
        await page.mouse.move(900, 450);
        await page.waitForTimeout(400);
      },
      check: async (page) => {
        const w = await page.evaluate(() => Math.round(document.querySelector('aside').getBoundingClientRect().width));
        const f = await badgeFacts(page);
        const collapsed = w < 120;
        return { pass: collapsed && f.Inbox === null, reason: collapsed ? 'badge visible con el sidebar colapsado' : `no se pudo colapsar (ancho ${w})`, facts: { width: w, Inbox: f.Inbox } };
      },
    },
  ],
};
