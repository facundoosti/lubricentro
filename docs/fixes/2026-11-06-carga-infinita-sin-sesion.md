# Fix: carga infinita al entrar sin sesión

## Lectura rápida
Sin sesión guardada, la app se quedaba en "Cargando..." en `/dashboard` en vez de ir a `/login`. Se movió la inicialización del store de auth para que corra después de que el store existe.

## Error
- Síntoma: primera visita → `/` → `/dashboard` → spinner infinito.
- Causa: `init()` corría dentro del callback de `create` y, sin sesión, hacía `set({ loading: false })` antes de que zustand guardara el estado inicial (`loading: true`), que lo pisaba (`frontend/src/stores/useAuthStore.js:6-24`).
- Origen: `docs/fixes/2026-11-06-carga-infinita-sin-sesion-diagnostico.md`

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (react-reviewer: 0 bloqueantes; 2 sugerencias incluidas, ver abajo)
- [x] QA visual: N/A local (la app local no estaba corriendo). Se verifica en prod después del deploy: abrir el sitio en una ventana de incógnito → debe ir a `/login`

## Solución
`init` pasó a ser una acción del store y se invoca con `useAuthStore.getState().init()` **después** de `create()`. Así el `set({ loading: false })` siempre corre sobre un store ya creado, haya o no sesión. Es el cambio mínimo: no toca rutas, `ProtectedRoute` ni la API.

Hallazgos del review, incluidos por decisión del usuario:
- **Login fallido dejaba `loading: true`**, con el mismo síntoma (spinner infinito al ir a una ruta protegida después de credenciales malas). `login()` ahora usa `try/finally`.
- **Carrera login vs init**, preexistente: si alguien se logueaba mientras `init` verificaba un token viejo, `init` terminaba haciendo `logout()` y borraba la sesión nueva del localStorage. Se agregó `sessionVersion`, que se incrementa en `login`/`logout`; `init` descarta su resultado si cambió mientras esperaba.

## Verificación
- Tests en `frontend/src/stores/__tests__/useAuthStore.test.js` (7): sin sesión, token válido, token inválido, sesión guardada corrupta, carrera login/init, login ok y login fallido.
  - antes del fix: **falla** el caso sin sesión (`loading` queda en `true`)
  - sacando la guarda de `sessionVersion`: **falla** el test de la carrera, así que el test la detecta
  - con el fix: 7/7 ✅
- `npx vitest run` (suite completa): 30 archivos, 287 tests ✅
- `npx eslint` sobre los 2 archivos tocados ✅

## Seguimiento
- `init` quedó como acción pública del store (nit del review). Hoy solo la llama el módulo.
