# Fix: Configuración en dos columnas

## Lectura rápida
La página de Configuración usaba `max-w-3xl` y dejaba vacío el resto del ancho. Ahora es una grilla de 2 columnas (lg+): datos/contacto/ubicación a la izquierda; horarios de atención + planes de cuotas a la derecha.

## Error
- Síntoma: espacio desperdiciado a la derecha en notebooks.
- Causa: `frontend/src/pages/Settings.jsx` contenedor `max-w-3xl` y layout en una sola columna.
- Origen: descripción del usuario.

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (react-reviewer: sin bloqueantes; indentación corregida con Prettier)
- [x] QA visual (docs/qa/2026-11-13-configuracion-dos-columnas.md: TC-01 ✅ dark+light, TC-02 ✅)

## Solución
- Grilla `lg:grid-cols-2`. El `<form>` queda a la izquierda; la card de horarios pasa a un `<aside aria-label="Horarios y planes de cuotas">` junto con `InstallmentPlansSection` (no se anidan forms).
- Los horarios siguen en el estado de react-hook-form (setValue), así que "Guardar cambios" los sigue guardando.
- Los horarios de atención ya existían; no hubo cambio de backend.

## Verificación
- `npx vitest run src/pages/__tests__/Settings.test.jsx` → 11/11 (incluye test nuevo de columna lateral y guardado de horarios).
- `npx eslint` sobre los 2 archivos → OK.

## Seguimiento
- `Settings.jsx` supera 300 líneas (ya lo hacía): extraer `OpeningHoursCard`.
- ~~Botón Guardar en la columna izquierda~~ → movido debajo de ambas columnas con `form="settings-form"` (TC-03 ✅).
