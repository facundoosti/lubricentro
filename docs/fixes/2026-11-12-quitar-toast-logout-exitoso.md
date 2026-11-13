# Fix: quitar la notificación "Sesión cerrada exitosamente"

## Lectura rápida
Al cerrar sesión aparecía un toast de éxito que no aportaba nada, igual que pasaba con el login (ver `2026-11-12-quitar-toast-login-exitoso.md`). Se sacó.

## Error
- Síntoma: toast "Sesión cerrada exitosamente" al volver al login.
- Causa: `showAuthSuccess("LOGOUT_SUCCESS")` en `frontend/src/layout/Header.jsx:31`.
- Origen: descripción del usuario.

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (react-reviewer: sin bloqueantes; el logout del Sidebar ya era sin toast)
- [x] QA visual (N/A: se elimina un toast; cubierto por Vitest, sin cambios de layout ni estilos)

## Solución
- Se eliminaron la llamada a `showAuthSuccess("LOGOUT_SUCCESS")` y su import en `Header.jsx`. Llegar a la pantalla de login ya confirma el cierre de sesión.
- Nuevo `frontend/src/layout/__tests__/Header.test.jsx`: "Cerrar sesión" llama a `logout`, navega a `/login` y no muestra ningún toast de éxito.

## Verificación
- `npx vitest run src/layout/__tests__/Header.test.jsx` → falló antes del fix (spy llamado 1 vez) y pasó después.
- `npx vitest run src/layout src/pages/__tests__/Login.test.jsx src/services/__tests__/notificationService.test.js` → 40/40 ok.
- `npx eslint src/layout/Header.jsx src/layout/__tests__/Header.test.jsx` → ok.

## Seguimiento
- ✅ Resuelto: se borraron `showAuthSuccess` y `MESSAGES.AUTH.LOGIN_SUCCESS`/`LOGOUT_SUCCESS`, que ya no se usaban; también sus tests y mocks. Antes se confirmó con grep que nadie más los usaba. Con la suite completa: 537/537 tests ok, `eslint .` ok y build ok.
- Review: el test podría verificar que no se llama ningún helper de `notificationService`, no solo los de éxito. Es opcional.
