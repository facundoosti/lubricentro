// Ejemplo de suite para tools/qa-runner/run.mjs.
// Copialo a openspec/changes/<change>/qa.mjs o docs/qa/<fecha>-<slug>.qa.mjs y adaptalo.
//
// Cada caso:
//   id      → mismo TC-XX que en qa.md
//   path    → ruta a abrir (opcional si steps navega)
//   combos  → ['desktop-dark', 'desktop-light', 'mobile-dark', 'mobile-light'] (default: suite.combos o desktop-dark)
//   steps   → (page, { vp, theme }) => interacción con Playwright
//   check   → (page, { vp, theme }) => ({ pass, reason?, facts? }) · facts = JSON chico con lo medido
//   allowStatus / allowConsoleErrors → excepciones explícitas (p. ej. un 422 esperado)
export default {
  slug: 'ejemplo',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-01',
      path: '/dashboard',
      combos: ['desktop-dark', 'mobile-light'],
      check: async (page, { vp }) => {
        const overflowX = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        );
        const heading = await page.getByRole('heading').first().textContent();
        return {
          pass: !overflowX,
          reason: overflowX ? `scroll horizontal en ${vp}` : undefined,
          facts: { heading, overflowX },
        };
      },
    },
    {
      id: 'TC-02',
      path: '/customers',
      steps: async (page) => {
        await page.getByRole('button', { name: /nuevo/i }).click();
        await page.getByRole('button', { name: /guardar/i }).click();
      },
      allowStatus: [422],
      check: async (page) => {
        const errors = await page.locator('[role="alert"], .text-error').count();
        return { pass: errors > 0, reason: 'no se mostró la validación', facts: { errors } };
      },
    },
  ],
};
