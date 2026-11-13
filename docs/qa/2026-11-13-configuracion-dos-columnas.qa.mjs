export default {
  slug: 'configuracion-dos-columnas',
  cases: [
    {
      id: 'TC-01',
      path: '/settings',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        const aside = page.getByRole('complementary', { name: 'Horarios y planes de cuotas' });
        await aside.waitFor();
        const facts = await page.evaluate(() => {
          const f = document.querySelector('#settings-form').getBoundingClientRect();
          const a = document.querySelector('aside[aria-label="Horarios y planes de cuotas"]').getBoundingClientRect();
          return { formX: Math.round(f.x), formW: Math.round(f.width), asideX: Math.round(a.x), asideW: Math.round(a.width),
            sameTop: Math.abs(f.y - a.y) < 2, overflowX: document.documentElement.scrollWidth > window.innerWidth };
        });
        const hasPlans = await aside.getByRole('heading', { name: 'Planes de cuotas' }).isVisible();
        const pass = facts.asideX > facts.formX + facts.formW - 1 && facts.sameTop && !facts.overflowX && hasPlans;
        return { pass, reason: pass ? undefined : 'columnas no lado a lado', facts: { ...facts, hasPlans } };
      },
    },
    {
      id: 'TC-03',
      path: '/settings',
      combos: ['desktop-dark', 'desktop-light'],
      check: async (page) => {
        await page.getByRole('complementary', { name: 'Horarios y planes de cuotas' }).waitFor();
        const facts = await page.evaluate(() => {
          const r = (el) => el.getBoundingClientRect();
          const f = r(document.querySelector('#settings-form'));
          const a = r(document.querySelector('aside[aria-label="Horarios y planes de cuotas"]'));
          const b = r(document.querySelector('button[form="settings-form"]'));
          return { btnTop: Math.round(b.top), formBottom: Math.round(f.bottom), asideBottom: Math.round(a.bottom),
            btnRight: Math.round(b.right), asideRight: Math.round(a.right) };
        });
        const pass = facts.btnTop >= Math.max(facts.formBottom, facts.asideBottom) && Math.abs(facts.btnRight - facts.asideRight) < 2;
        return { pass, reason: pass ? undefined : 'botón no queda debajo de ambas columnas', facts };
      },
    },
  ],
};
