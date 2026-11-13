// QA: el foco de los inputs usa el violeta del tema (ring) y no el outline azul del navegador.
const BOTH = ['desktop-dark', 'desktop-light'];

// Mide el foco del elemento activo y lo compara con --color-primary resuelto a rgb.
async function focusFacts(page) {
  return page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-primary)';
    document.body.appendChild(probe);
    const primary = getComputedStyle(probe).color;
    probe.remove();
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    const rgb = primary.match(/\d+/g).slice(0, 3).join(', ');
    return {
      tag: el.tagName.toLowerCase(),
      outlineStyle: cs.outlineStyle,
      outlineColor: cs.outlineColor,
      boxShadow: cs.boxShadow,
      primary,
      ringIsPrimary: cs.boxShadow.includes(rgb),
      borderColor: cs.borderColor,
      borderIsPrimary: cs.borderColor.includes(rgb),
    };
  });
}

// Pasa si no hay outline nativo (o es del color primario) y el ring/borde es violeta.
function verdict(f, { needRing = true } = {}) {
  const outlineOk = f.outlineStyle === 'none' || f.outlineColor.replace(/ /g, '') === f.primary.replace(/ /g, '');
  const accentOk = needRing ? f.ringIsPrimary : f.ringIsPrimary || f.borderIsPrimary;
  return {
    pass: outlineOk && accentOk,
    reason: !outlineOk ? `outline nativo ${f.outlineStyle} ${f.outlineColor}` : !accentOk ? 'sin ring/borde violeta' : undefined,
    facts: { outline: `${f.outlineStyle} ${f.outlineColor}`, ringIsPrimary: f.ringIsPrimary, borderIsPrimary: f.borderIsPrimary },
  };
}

const searchCase = (id, path, placeholder) => ({
  id,
  path,
  combos: BOTH,
  steps: async (page) => {
    await page.getByPlaceholder(placeholder).first().click();
  },
  check: async (page) => verdict(await focusFacts(page)),
});

const dialogInputCase = (id, path, buttonName) => ({
  id,
  path,
  combos: BOTH,
  steps: async (page) => {
    await page.getByRole('button', { name: buttonName }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    await dialog.locator('input[type="text"], input:not([type])').first().click();
  },
  check: async (page) => verdict(await focusFacts(page)),
});

export default {
  slug: 'foco-inputs-violeta',
  cases: [
    searchCase('TC-01', '/customers', 'Buscar clientes...'),
    searchCase('TC-02', '/vehicles', 'Buscar vehículos...'),
    searchCase('TC-03', '/services', 'Buscar servicios...'),
    searchCase('TC-04', '/suppliers', 'Buscar proveedor...'),
    searchCase('TC-05', '/products', 'Buscar por nombre...'),
    searchCase('TC-06', '/service-records', 'Buscar atenciones...'),
    dialogInputCase('TC-07', '/products', /^nuevo$/i),
    dialogInputCase('TC-08', '/suppliers', /nuevo proveedor/i),
    {
      id: 'TC-09',
      path: '/inbox',
      combos: BOTH,
      steps: async (page) => {
        await page.getByText('541128157682').first().click();
        await page.locator('textarea').first().click();
      },
      check: async (page) => verdict(await focusFacts(page), { needRing: false }),
    },
    {
      // Regla global :focus-visible: cualquier outline nativo con Tab usa el violeta.
      id: 'TC-10',
      path: '/customers',
      combos: BOTH,
      steps: async (page) => {
        await page.locator('body').click({ position: { x: 5, y: 5 } });
      },
      check: async (page) => {
        const seen = [];
        for (let i = 0; i < 25; i++) {
          await page.keyboard.press('Tab');
          await page.waitForTimeout(350); // transition-colors anima outline-color
          const f = await focusFacts(page);
          if (f.outlineStyle !== 'none') seen.push({ cls: await page.evaluate(() => document.activeElement.className.toString().slice(0, 140)), style: f.outlineStyle, tag: f.tag, color: f.outlineColor, ok: f.outlineColor.replace(/ /g, '') === f.primary.replace(/ /g, '') });
        }
        const bad = seen.filter((s) => !s.ok);
        return { pass: bad.length === 0, reason: bad.length ? `outline no violeta: ${JSON.stringify(bad.slice(0, 4))}` : undefined, facts: { withOutline: seen.length, bad: bad.length } };
      },
    },
    // Regresión: formStyles.inputClass (ya tenía outline-none) sigue igual.
    dialogInputCase('TC-11', '/customers', /nuevo cliente/i),
  ],
};
