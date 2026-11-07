# Diagnóstico: carga infinita al entrar sin sesión

## Lectura rápida
**Veredicto:** defecto confirmado
Si entrás sin sesión guardada (primera visita, otro navegador, después de borrar datos), la app redirige a `/dashboard` y se queda en "Cargando..." para siempre en vez de ir a `/login`.

## Explicación simple
La app, al abrir, se fija si hay alguien logueado. Cuando **no** hay nadie, termina esa revisión tan rápido que su respuesta "ya terminé" se pierde, y la pantalla se queda esperando algo que nunca va a llegar.
Mientras tanto: entrar directo a `https://app-lubricentro.up.railway.app/login`.

## Evidencia
- **Reproducción:** script con zustand 5.0.12 (la versión instalada) que imita el `init()` del store:
  - sin sesión → `{ loading: true, isAuthenticated: false }` (se queda cargando)
  - con sesión → `{ loading: false, isAuthenticated: true }` (anda bien)
- **Logs:** no se consultaron. El bug ocurre entero en el navegador y no llega a llamar al backend (sin sesión no se pide `/auth/verify`).
- **Deploy relacionado:** el código viene de `84682c4` (2026-04-01, refactor del frontend). No lo causó un deploy reciente.
- **Código:**
  - `frontend/src/stores/useAuthStore.js:6-24`: `init()` se ejecuta dentro del callback de `create`, **antes** del `return` del estado inicial.
  - `frontend/src/components/common/ProtectedRoute.jsx:8`: mientras `loading` sea `true`, muestra el spinner.
  - `frontend/src/App.jsx:45`: `/` → `/dashboard` (ruta protegida).

## Análisis técnico
**Confirmado:**
1. `init` es `async`, pero el código anterior al primer `await` corre de forma síncrona.
2. Sin `user` en localStorage no hay ningún `await`, así que el `finally { set({ loading: false }) }` corre **en el mismo tick**, mientras zustand todavía está creando el store.
3. Después zustand toma el objeto que devuelve el callback (`loading: true`) como estado inicial y **pisa** el `loading: false`.
4. Nada vuelve a poner `loading` en `false`, así que `ProtectedRoute` muestra el spinner para siempre y nunca llega al `<Navigate to="/login">`.
5. Con sesión anda bien porque `await verifyToken()` deja el `set` para después de que el store ya se creó.

**Hipótesis:** ninguna pendiente.

## Propuesta de solución
Tamaño: **acotado** (1 archivo de producción y su test).
- Mover la inicialización fuera del callback de `create`: definir el store y después llamar `useAuthStore.getState().init()` (o `init()` como acción, llamada a nivel de módulo después del `create`).
- Alternativa mínima: correr `init` en un microtask (`queueMicrotask(init)`). Funciona, pero deja el acoplamiento implícito.
- Test (Vitest) en `src/stores/__tests__/useAuthStore.test.js`: sin `authToken` ni `user` en localStorage, después de importar el store y esperar un tick, `loading === false` e `isAuthenticated === false`. Sumar el caso con sesión válida y `verifyToken` mockeado.
