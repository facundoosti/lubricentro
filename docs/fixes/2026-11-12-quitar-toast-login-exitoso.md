# Fix: quitar la notificación "Inicio de sesión exitoso"

## Lectura rápida
Al loguearse aparecía un toast "Inicio de sesión exitoso" que molestaba (mala UX). Se sacó; el toast de error de login se mantiene.

## Error
- Síntoma: toast de éxito al entrar al dashboard después del login.
- Causa: `showAuthSuccess("LOGIN_SUCCESS")` en `frontend/src/pages/Login.jsx:22`.
- Origen: descripción del usuario.

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (react-reviewer: sin bloqueantes)
- [x] QA visual (N/A: se elimina un toast; cubierto por Vitest, sin cambios de layout ni estilos)

## Solución
- Se eliminó la llamada a `showAuthSuccess("LOGIN_SUCCESS")` y su import en `Login.jsx`. Llegar al dashboard ya confirma el login.
- Nuevo `frontend/src/pages/__tests__/Login.test.jsx`: login ok → navega a `/dashboard` sin toast de éxito; login fallido → muestra `LOGIN_ERROR` y no navega.

## Verificación
- `npx vitest run src/pages/__tests__/Login.test.jsx` → falló antes del fix (`showAuthSuccess` llamado 1 vez) y pasó después.
- `npx vitest run src/pages/__tests__/Login.test.jsx src/services/__tests__/notificationService.test.js` → 32/32 ok.
- `npx eslint src/pages/Login.jsx src/pages/__tests__/Login.test.jsx` → ok.

## Seguimiento
- `MESSAGES.AUTH.LOGIN_SUCCESS` en `notificationService.js` quedó sin uso en la app (solo lo usa su test unitario). Se dejó para no ampliar el alcance.
- Review: el test podría espiar `sileo` en vez de mockear todo `notificationService`, para detectar cualquier toast de éxito, y usar `userEvent` en vez de `fireEvent.submit`. Son opcionales.
