# QA visual — form-dialog-centrado

## Riesgo: alto — componente compartido por todos los formularios de alta/edición (flujo de datos)

Entorno: Vite del worktree en `http://localhost:5174` (proxy `/api` → backend :3000). Desktop 1440×900. Script: `openspec/changes/form-dialog-centrado/qa.mjs`.

## Casos

- [x] **TC-01** · must · script · desktop-dark,desktop-light · Los 6 formularios (Cliente, Vehículo, Producto, Servicio, Proveedor, Turno) abren centrados, ancho ≤ 768px, header y footer dentro del viewport — *spec: formularios-dialogo › Formularios en modal centrado › Abrir un formulario de alta* → ✅ 6 forms 768px centrados (dark+light) · `24fd8d4`+wip
- [x] **TC-02** · must · script · desktop-dark · Cliente, Vehículo, Servicio, Proveedor y Turno sin scroll en el cuerpo a 1440×900 — *spec: … › Formulario sin scroll en notebook* → ✅ bodyScroll 0 en los 5 · `24fd8d4`+wip
- [x] **TC-03** · must · script · desktop-dark · Producto: si el contenido no entra, scrollea solo el cuerpo; header y footer visibles — *spec: … › Contenido más alto que la pantalla* → ✅ panel 810px, body scroll 34px, footer 854<900 · `24fd8d4`+wip
- [x] **TC-04** · must · script · desktop-dark · Servicio: la descripción ocupa el ancho completo; Producto: descripción a ancho completo — *spec: formularios-dialogo › Layout de 2 columnas › Textarea a ancho completo* → ✅ textarea 718 = form 718 · `24fd8d4`+wip
- [x] **TC-05** · must · script · desktop-dark · Click en el fondo no cierra y conserva lo tipeado — *spec: … › Cierre solo por acción explícita › Click en el fondo* → ✅ open 1, valor conservado · `24fd8d4`+wip
- [x] **TC-06** · must · script · desktop-dark · Escape, ✕ y Cancelar cierran — *spec: … › Cerrar con Escape / Cerrar con ✕ o Cancelar* → ✅ escape/✕/cancelar cierran · `24fd8d4`+wip
- [x] **TC-07** · must · script · desktop-dark,desktop-light · Alta de cliente desde Vehículo: segundo diálogo encima, más angosto, fondo más oscuro; Escape cierra solo el de arriba — *spec: formularios-dialogo › Diálogos apilados* → ✅ top 576 vs 768, fondo 0.7 vs 0.6, z 60>50, Escape deja solo Vehículo (dark+light) · `24fd8d4`+wip
- [x] **TC-08** · must · script · desktop-dark · Retorno de foco al botón "Nuevo" al cerrar; nombre accesible = título — *spec: formularios-dialogo › Foco y accesibilidad* → ✅ foco vuelve a "Nuevo Proveedor" · `24fd8d4`+wip
- [x] **TC-09** · must · script · desktop-dark · Escape con la lista de clientes abierta (Vehículo) cierra solo la lista — *regresión: fix del review* → ✅ lista 1→0, diálogo sigue abierto · `24fd8d4`+wip
- [x] **TC-10** · must · script · desktop-dark · Dropdown de cliente (Vehículo, Turno) y de Categoría (Producto) no queda recortado por el cuerpo del diálogo — *riesgo: design › Risks* → ✅ (re-run tras fix) Vehículo lista 555–795 en portal, cuerpo sin scroll; Turno ✅; Producto/Categoría 383–640 dentro del cuerpo (bottom 779) · `24fd8d4`+wip
- [x] **TC-11** · must · vitest · Footer "Guardando..." con botones deshabilitados — *spec: … › Footer › Guardando* (`FormDialog.test.jsx`) → ✅ FormDialog.test.jsx (vitest 392/392) · `24fd8d4`+wip

## Resultados

## Hallazgos

- **TC-10** · Lista de clientes del formulario de Vehículo queda recortada por el cuerpo del diálogo (overflow-y-auto): hay que scrollear 88px para ver las últimas opciones. Causa: dropdown `absolute z-50 max-h-60` (`CustomerSearchInput.jsx:300`) dentro del body con scroll; el campo Cliente es el último antes de la foto. Fix: lista en portal a `body` con `position: fixed`, reposicionada en scroll/resize y abre hacia arriba sin espacio (`CustomerSearchInput.jsx`). Re-run TC-07, TC-09, TC-10 ✅. Estado: corregido.
