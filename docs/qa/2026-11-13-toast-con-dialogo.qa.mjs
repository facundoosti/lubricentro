// QA del TC-17 de shadcn-base-ui-fase-1 (archivado): toast usable con un diálogo abierto.
// Sileo no tiene botón de cerrar: el toast se pausa con hover y se descarta con swipe vertical (>30px).
// Todo con mouse real (CDP), sin dispatchEvent.
//
//   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs docs/qa/2026-11-13-toast-con-dialogo.qa.mjs
const DIALOGS = '[role="dialog"],[role="alertdialog"]';
const LIVE_TOAST = '[data-sileo-toast][data-exiting="false"]';

const state = (page) => page.evaluate(({ DIALOGS, LIVE_TOAST }) => ({
  toasts: document.querySelectorAll(LIVE_TOAST).length,
  title: document.querySelector(LIVE_TOAST)?.querySelector('[data-sileo-title]')?.textContent ?? null,
  dialogs: document.querySelectorAll(DIALOGS).length,
}), { DIALOGS, LIVE_TOAST });

// Hover (pausa) → click → swipe, todo con el mouse real sobre el toast.
const exerciseToast = async (page) => {
  await page.locator('[data-sileo-toast][data-ready="true"]').first().waitFor({ timeout: 3000 });
  const facts = { appeared: await state(page) };
  const box = await page.locator(LIVE_TOAST).first().boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + Math.min(box.height / 2, 20);

  // 1) Hover real: pausa el timer (duración 4000 ms) → sigue visible a los 5 s
  await page.mouse.move(cx, cy, { steps: 5 });
  facts.toastOnTop = await page.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest('[data-sileo-viewport]')), { x: cx, y: cy });
  await page.waitForTimeout(5000);
  facts.afterHover5s = await state(page);

  // 2) Click real en el toast: no cuenta como click en el fondo
  await page.mouse.click(cx, cy);
  await page.waitForTimeout(400);
  facts.afterClick = await state(page);

  // 3) Swipe real (mantener, arrastrar 60 px, soltar): descarta el toast
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx, cy + 60, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(1000);
  facts.afterSwipe = await state(page);

  const pass = facts.appeared.dialogs === 1 && facts.toastOnTop
    && facts.afterHover5s.toasts === 1 && facts.afterHover5s.dialogs === 1
    && facts.afterClick.dialogs === 1
    && facts.afterSwipe.toasts === 0 && facts.afterSwipe.dialogs === 1;
  return { pass, reason: 'el toast no se pudo usar/descartar o el diálogo se cerró', facts };
};

export default {
  slug: 'toast-con-dialogo',
  combos: ['desktop-dark'],
  cases: [
    {
      // Flujo real: "Vista previa" sin valor en el cambio masivo de precios muestra el toast
      // "Valor requerido" y el diálogo queda abierto (closeOnBackdrop=false). Verifica que el diálogo
      // modal no deja el toast inerte ni tapado.
      id: 'TC-17',
      path: '/products',
      steps: async (page) => {
        await page.getByRole('button', { name: 'Acciones' }).click();
        await page.getByRole('button', { name: /actualizar precios/i }).click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        await dialog.getByRole('button', { name: /vista previa/i }).click();
      },
      check: exerciseToast,
    },
    {
      // Variante con un diálogo que SÍ cierra con click en el fondo (confirmación de borrado): ejercita
      // isToastEvent de Dialog.jsx. Ningún flujo real muestra un toast con uno de estos abierto, así que el
      // toast se dispara con el notificationService de la app (misma instancia de Sileo vía Vite).
      id: 'TC-17b',
      path: '/customers',
      steps: async (page) => {
        await page.getByTitle('Eliminar').first().click();
        await page.getByRole('alertdialog').waitFor();
        await page.evaluate(async () => {
          const { showError } = await import('/src/services/notificationService.js');
          showError('Toast QA', 'Disparado con la confirmación abierta');
        });
      },
      check: exerciseToast,
    },
  ],
};
