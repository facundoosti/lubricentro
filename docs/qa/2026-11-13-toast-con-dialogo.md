# QA visual — toast usable con un diálogo abierto (re-test del TC-17 de shadcn-base-ui-fase-1)

## Riesgo: bajo — solo verificación de comportamiento ya implementado (Dialog.jsx `isToastEvent` + z-index del toast), sin cambios de código

Origen: `openspec/changes/archive/2026-11-13-shadcn-base-ui-fase-1/qa.md` (TC-17) · *spec: dialogos › Contenido de fondo inerte › Toast usable con diálogo abierto*

Nota: **Sileo no tiene botón de cerrar.** El cierre manual es un swipe vertical (>30 px) y el hover pausa el timer. El caso se prueba con esas interacciones, con el mouse real (CDP), sin eventos sintéticos.

- [x] **TC-17** · must · script · desktop-dark · Cambio masivo de precios → "Vista previa" sin valor → toast "Valor requerido": hover lo pausa (sigue a los 5 s), click no cierra el diálogo, swipe lo descarta y el diálogo sigue abierto — ✅ `cc12954` · `toastOnTop: true`, `afterHover5s.toasts: 1`, `afterSwipe: {toasts: 0, dialogs: 1}`
- [x] **TC-17b** · must · script · desktop-dark · Igual con la confirmación de borrado de cliente (cierra con click en el fondo → ejercita `isToastEvent`); el toast se dispara con `notificationService.showError` desde la página — ✅ `cc12954` · mismos `facts`, `afterSwipe: {toasts: 0, dialogs: 1}`

Script: `docs/qa/2026-11-13-toast-con-dialogo.qa.mjs` · capturas en `tmp/qa/toast-con-dialogo/`

## Hallazgos

- Ninguno que corregir.
- Gap de spec (corregido): el escenario decía "click en el botón de cerrar del toast", que Sileo no tiene. Reformulado en `openspec/specs/dialogos/spec.md` (hover, click, swipe).
- Observación: los formularios CRUD (`useModalError`) cierran el modal al fallar la API, así que el toast de error casi nunca convive con un diálogo; los que sí (cambio masivo de precios/IVA, importación) tienen `closeOnBackdrop={false}`.
