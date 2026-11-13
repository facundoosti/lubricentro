// QA visual — form de turnos (pickers + Estado). Plan: docs/qa/2026-11-12-form-turnos-pickers.md
// No escribe en la base: solo abre el modal "Nuevo Turno" y lo inspecciona.

async function openNewAppointment(page) {
  await page.goto('/appointments');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Nuevo Turno/ }).first().click();
  await page.locator('form#appointment-form').waitFor();
}

const statusTrigger = (page) => page.locator('form#appointment-form').getByRole('button', { name: 'Estado', exact: true });

export default {
  slug: 'form-turnos-pickers',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-02',
      combos: ['desktop-dark', 'desktop-light'],
      steps: async (page) => {
        await openNewAppointment(page);
        await statusTrigger(page).click();
        await page.getByRole('option', { name: 'Confirmado', exact: true }).waitFor();
      },
      check: async (page, { theme }) => {
        const opt = page.getByRole('option', { name: 'Confirmado', exact: true });
        const facts = await opt.evaluate((el) => {
          const panel = el.closest('ul').parentElement;
          const cs = getComputedStyle(panel);
          const r = el.getBoundingClientRect();
          const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return {
            panelBg: cs.backgroundColor,
            zIndex: cs.zIndex,
            hasSearch: !!panel.querySelector('input'),
            optionOnTop: el.contains(top),
            surfaceContainer: getComputedStyle(document.documentElement).getPropertyValue('--color-surface-container').trim(),
          };
        });
        const rgb = facts.panelBg.match(/\d+/g).map(Number);
        const lum = (rgb[0] + rgb[1] + rgb[2]) / 3;
        const bgOk = theme === 'light' ? lum > 200 : lum < 80;
        const pass = bgOk && !facts.hasSearch && facts.optionOnTop;
        return { pass, reason: pass ? undefined : `bgOk=${bgOk} search=${facts.hasSearch} onTop=${facts.optionOnTop}`, facts };
      },
    },
    {
      id: 'TC-03',
      steps: async (page) => {
        await openNewAppointment(page);
        await statusTrigger(page).click();
        await page.getByRole('option', { name: 'Confirmado', exact: true }).click();
      },
      check: async (page) => {
        const form = page.locator('form#appointment-form');
        const triggerText = (await statusTrigger(page).innerText()).trim();
        const hTrigger = Math.round((await statusTrigger(page).boundingBox()).height);
        const hDate = Math.round((await form.locator('input[name="scheduled_date"]').boundingBox()).height);
        const pass = triggerText === 'Confirmado' && hTrigger === hDate;
        return { pass, reason: pass ? undefined : `texto=${triggerText} alto=${hTrigger} vs ${hDate}`, facts: { triggerText, hTrigger, hDate } };
      },
    },
    {
      id: 'TC-04',
      steps: async (page) => {
        await openNewAppointment(page);
        await page.getByRole('button', { name: /Crear Turno/ }).click();
        await page.getByText('Hora es requerida').waitFor();
        await page.waitForTimeout(300); // deja terminar transition-colors antes de medir
      },
      check: async (page) => {
        const form = page.locator('form#appointment-form');
        const trigger = form.getByRole('button', { name: /Hora/ });
        const facts = await trigger.evaluate((el) => {
          const probe = document.createElement('span');
          probe.className = 'border border-error';
          document.body.appendChild(probe);
          const errorColor = getComputedStyle(probe).borderTopColor;
          probe.remove();
          return { text: el.innerText.trim(), border: getComputedStyle(el).borderTopColor, errorColor };
        });
        facts.dateType = await form.locator('input[name="scheduled_date"]').getAttribute('type');
        const pass = facts.dateType === 'date' && facts.text === 'Seleccionar hora' && facts.border === facts.errorColor;
        return { pass, reason: pass ? undefined : JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-05',
      combos: ['desktop-dark', 'desktop-light'],
      steps: async (page) => {
        await openNewAppointment(page);
        await page.locator('form#appointment-form').getByRole('button', { name: /Hora/ }).click();
        await page.getByRole('listbox').waitFor();
      },
      check: async (page, { theme }) => {
        const facts = await page.getByRole('listbox').evaluate((ul) => {
          const panel = ul.parentElement;
          const labels = Array.from(ul.querySelectorAll('[role="option"]')).map((o) => o.textContent);
          return { panelBg: getComputedStyle(panel).backgroundColor, first: labels[0], last: labels.at(-1), count: labels.length, withMinutes: labels.filter((l) => l.includes(':')).length };
        });
        await page.getByRole('option', { name: '10 AM', exact: true }).click();
        facts.trigger = (await page.locator('form#appointment-form').getByRole('button', { name: /Hora/ }).innerText()).trim();
        const rgb = facts.panelBg.match(/\d+/g).map(Number);
        const lum = (rgb[0] + rgb[1] + rgb[2]) / 3;
        const bgOk = theme === 'light' ? lum > 200 : lum < 80;
        const pass = bgOk && facts.first === '8 AM' && facts.last === '8 PM' && facts.withMinutes === 0 && facts.trigger === '10 AM';
        return { pass, reason: pass ? undefined : JSON.stringify(facts), facts };
      },
    },
    {
      id: 'TC-06',
      steps: async (page) => {
        await openNewAppointment(page);
        await page.locator('form#appointment-form').getByRole('button', { name: /Hora/ }).click();
        const list = page.getByRole('listbox');
        await list.hover();
        await page.mouse.wheel(0, 2000);
        await page.waitForTimeout(300);
      },
      check: async (page) => {
        const open = await page.getByRole('listbox').count();
        const scrollTop = open ? await page.getByRole('listbox').evaluate((ul) => ul.scrollTop) : null;
        if (open) await page.getByRole('option', { name: '8 PM', exact: true }).click();
        const trigger = (await page.locator('form#appointment-form').getByRole('button', { name: /Hora/ }).innerText()).trim();
        const pass = open === 1 && scrollTop > 0 && trigger === '8 PM';
        return { pass, reason: pass ? undefined : `abierta=${open} scrollTop=${scrollTop} trigger=${trigger}`, facts: { open, scrollTop, trigger } };
      },
    },
  ],
};
