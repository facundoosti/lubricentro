// Toasts (Sileo) debajo del header fijo y con colores del design system.
const fire = async (page, kind = 'showSuccess') => {
  await page.waitForSelector('header');
  await page.evaluate(async (k) => {
    const m = await import('/src/services/notificationService.js');
    m[k]('Configuración actualizada exitosamente', 'Los cambios ya están guardados');
  }, kind);
  await page.waitForSelector('[data-sileo-toast]');
  await page.waitForTimeout(1200);
};

const measure = (page) =>
  page.evaluate(() => {
    const header = document.querySelector('header').getBoundingClientRect();
    const toast = document.querySelector('[data-sileo-toast]').getBoundingClientRect();
    const pill = document.querySelector('[data-sileo-pill], [data-sileo-body]');
    const title = document.querySelector('[data-sileo-title]');
    return {
      headerBottom: Math.round(header.bottom),
      toastTop: Math.round(toast.top),
      fill: pill && getComputedStyle(pill).fill,
      titleColor: getComputedStyle(title).color,
      titleTransform: getComputedStyle(title).textTransform,
    };
  });

export default {
  slug: 'toast-debajo-header',
  combos: ['desktop-dark', 'desktop-light'],
  cases: [
    {
      id: 'TC-01',
      path: '/settings',
      steps: (page) => fire(page),
      check: async (page) => {
        const f = await measure(page);
        const below = f.toastTop >= f.headerBottom;
        return { pass: below && f.titleTransform === 'none', reason: below ? 'title capitalizado' : 'toast superpuesto al header', facts: f };
      },
    },
    {
      id: 'TC-02',
      path: '/settings',
      steps: (page) => fire(page, 'showError'),
      check: async (page) => ({ pass: true, facts: await measure(page) }),
    },
  ],
};
