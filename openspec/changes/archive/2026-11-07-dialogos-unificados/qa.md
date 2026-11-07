# QA visual — dialogos-unificados

## Riesgo: alto — primitiva compartida por todos los diálogos y contenedor global de la app (`App.jsx`, `inert`, `isolate`)

Entorno: Vite del worktree en `http://localhost:5174` (proxy `/api` → :3000). Desktop 1440×900. Script: `openspec/changes/dialogos-unificados/qa.mjs`. Regresión: `openspec/changes/archive/2026-11-07-form-dialog-centrado/qa.mjs`.

## Casos

- [x] **TC-01** · must · script · desktop-dark,desktop-light · ConfirmModal queda por encima de header, sidebar y toggle del sidebar — *spec: dialogos › Pila única › Confirmación sobre un formulario* + riesgo z-index → ✅ header/sidebar/toggle bajo la capa del diálogo (dark+light) · `b571a3c`+wip
- [x] **TC-02** · must · script · desktop-dark · ConfirmModal cierra con click en el fondo y con Escape; al cancelar el foco vuelve a "Eliminar" — *spec: dialogos › Click en el fondo… › Confirmación cierra / Retorno de foco tras confirmar* → ✅ fondo y Escape cierran; foco vuelve a "Eliminar" · `b571a3c`+wip
- [x] **TC-03** · must · script · desktop-dark · Tab y Shift+Tab (30 veces c/u) no sacan el foco del diálogo — *spec: dialogos › Trampa de foco* → ✅ 60 pulsaciones, 0 fugas · `b571a3c`+wip
- [x] **TC-04** · must · script · desktop-dark · `[data-app-content]` inert solo con diálogo abierto; el viewport de toasts no queda inerte — *spec: dialogos › Contenido de fondo inerte › App inerte* → ✅ inert false→true→false; viewport de toasts no montado en ese momento (garantía estructural: `<Toaster>` fuera de `[data-app-content]` en App.jsx) · `b571a3c`+wip
- [x] **TC-05** · must · script · desktop-dark · Cambio masivo de precios no cierra con el fondo y conserva el valor; Escape cierra — *spec: dialogos › … › Cambio masivo de precios* → ✅ abierto con valor 15; Escape cierra · `b571a3c`+wip
- [x] **TC-06** · must · script · desktop-dark · Cambio de IVA no cierra con el fondo; Escape cierra — *spec: dialogos › Click en el fondo según el tipo* → ✅ fondo no cierra; Escape cierra · `b571a3c`+wip
- [x] **TC-07** · must · script · desktop-dark · Importar Excel no cierra con el fondo; Escape cierra (sin subida) — *spec: dialogos › Click en el fondo según el tipo* → ✅ fondo no cierra; Escape cierra · `b571a3c`+wip
- [ ] **TC-08** · must · script · desktop-dark · Visor de imágenes: foco en Cerrar, → cambia de imagen, Escape cierra y el foco vuelve a la miniatura — *regresión: ImageLightbox* → 🚧 blocked: la base de dev no tiene productos con imagen; cubierto por `ImageLightbox.test.jsx` (foco en Cerrar, ←/→, Escape) · `b571a3c`+wip
- [x] **TC-09** · must · script · desktop-dark · Cliente sobre Vehículo: la capa de abajo queda inerte y se libera al cerrar la de arriba — *spec: dialogos › … › Diálogo inferior inerte* → ✅ capa inferior inert, se libera al cerrar la de arriba · `b571a3c`+wip
- [x] **TC-10** · must · script · desktop-dark,desktop-light · Regresión form-dialog-centrado TC-01, TC-05, TC-07, TC-09, TC-10 (incluye lista desplegable usable dentro del diálogo) — *spec: dialogos › … › Lista desplegable usable* → ✅ regresión 7/7 (click en "+ Crear cliente" del portal funciona con la app inerte) · `b571a3c`+wip
- [x] **TC-11** · must · vitest · Escape no cierra Import mientras sube; Escape con lista de SearchableSelect/MultiSelectSearch cierra solo la lista — *spec: dialogos › Escape respeta a los hijos* → ✅ vitest 455/455 (ProductImportModal, SearchableSelect, MultiSelectSearch, ProductSearchInput) · `b571a3c`+wip

## Resultados

10/11 must ✅, 0 ❌, 1 🚧 (TC-08, aceptado por el usuario: probar el visor en prod o con una imagen en dev).

## Hallazgos

- Sin fallos de producto. TC-08 bloqueado por datos (sin imágenes en dev); la sesión cacheada del runner de form-dialog-centrado había expirado (401) y se regeneró.
