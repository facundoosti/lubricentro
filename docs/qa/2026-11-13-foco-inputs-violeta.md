# QA visual — foco de inputs en violeta (sin outline azul del navegador)

## Riesgo: medio — regla global `:focus-visible` en `index.css` + 10 consumidores; toca colores → dark y light

Origen: diff (fuera de OpenSpec). Cambios sin commitear sobre `85997d6`.

- [x] **TC-01** · must · script · desktop-dark,desktop-light · Buscador de Clientes: sin outline nativo, ring violeta — *origen: diff* — ✅ `outline: none`, `ringIsPrimary: true`
- [x] **TC-02** · must · script · desktop-dark,desktop-light · Buscador de Vehículos — ✅ ídem
- [x] **TC-03** · must · script · desktop-dark,desktop-light · Buscador de Servicios — ✅ ídem
- [x] **TC-04** · must · script · desktop-dark,desktop-light · Buscador de Proveedores — ✅ ídem
- [x] **TC-05** · must · script · desktop-dark,desktop-light · Buscador de Productos — ✅ ídem
- [x] **TC-06** · must · script · desktop-dark,desktop-light · Buscador de Atenciones — ✅ ídem
- [x] **TC-07** · must · script · desktop-dark,desktop-light · Modal Nuevo producto (`ProductForm`) — ✅ ídem
- [x] **TC-08** · must · script · desktop-dark,desktop-light · Modal Nuevo proveedor (`SupplierForm`) — ✅ ídem
- [x] **TC-09** · should · script · desktop-dark,desktop-light · Textarea del Inbox (`ConversationDetail`) — ✅ `outline: none`, ring + borde violeta
- [x] **TC-10** · must · script · desktop-dark,desktop-light · Regla global: 25 Tabs en /customers, todo outline nativo es violeta — ✅ `withOutline: 23, bad: 0`
- [x] **TC-11** · must · script · desktop-dark,desktop-light · Regresión: modal Nuevo cliente (`formStyles.inputClass`) — ✅ sin cambios, ring violeta

Script: `docs/qa/2026-11-13-foco-inputs-violeta.qa.mjs` · capturas en `tmp/qa/foco-inputs-violeta/`

## Hallazgos

- Fallos de script (no de producto): TC-07 (el botón dice "Nuevo") y TC-09 (la conversación no es un `button`). Arreglé los selectores.
- TC-10, primera corrida: el sidebar daba outline gris. Causa: `transition-colors` anima `outline-color` y la medición se tomaba en el instante 0. Con 350 ms de espera da violeta. No es un bug: el usuario ve la transición de 150 ms hacia el violeta.
