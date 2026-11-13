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
  ],
};
