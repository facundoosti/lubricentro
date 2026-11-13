# QA visual — shadcn-base-ui-fase-2

**Riesgo: medio-alto.** Cambia el control de 13 listas, 8 fechas, 2 horas, 2 switches, los checkboxes de productos y las pestañas del perfil de cliente, en formularios y filtros de uso diario. El objetivo es **paridad visual** con `baseline/` (mismas medidas, fondos, bordes y tipografía) más el comportamiento nuevo (calendario en popover, lista con tema, fecha inválida).

- Desktop 1440×900, temas **oscuro y claro** (salvo donde se indica).
- Script: `openspec/changes/shadcn-base-ui-fase-2/qa.mjs` (mismos `TC-XX` que `baseline/baseline.qa.mjs`). Línea base: `baseline/*.jpg` + `baseline/results.json` (`facts` medidos antes del change).
- Correr: `QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs openspec/changes/shadcn-base-ui-fase-2/qa.mjs --out tmp/qa/shadcn-base-ui-fase-2`
- Datos de dev: TC-12 usa el cliente 883 (el que más atenciones tiene). No escribe en la BD.
- **No hay TC-04**: el formulario de atención en diálogo (`ServiceRecordForm`) no se renderiza en ninguna pantalla (código muerto); se migró y se cubre con Vitest. La atención se prueba en su página (TC-09).

## Paridad visual contra `baseline/` (captura + `facts`: ancho/alto, fondo, borde, radio, tipografía)

| ID | Pantalla | Executor | Esperado |
|---|---|---|---|
| TC-01 | Formulario de turno (fecha, hora, vehículo) con el Select de estado abierto | script | Igual a `baseline/TC-01-*`: fecha 351×44 con el texto `dd/mm/aaaa` y el ícono de calendario a la derecha; vehículo 718×44 |
| TC-02 | Formulario de producto: proveedor, unidad e IVA | script | Igual a `baseline/TC-02-*`: tres triggers 351px, fondo transparente, texto 16px |
| TC-03 | Formulario de vehículo: año | script | Igual a `baseline/TC-03-*`: 349×44, fondo `surface-variant` |
| TC-05 | Presupuesto › datos generales: fecha + estado | script | Igual a `baseline/TC-05-*`: ambos 483×38 |
| TC-06 | Cambio masivo de precios: proveedor | script | Igual a `baseline/TC-06-*`: 622×38 |
| TC-07 | Recordatorios: estado + desde/hasta | script | Igual a `baseline/TC-07-*`: 42px de alto, fondo `surface-container-lowest`, fechas ~160px |
| TC-08 | Productos con 1 fila seleccionada (cabecera indeterminada) + filtro de stock | script | Cabecera `aria-checked="mixed"`, casillas 16px radio 4px, marcadas en violeta `primary-container` |
| TC-09 | Página de atención: fecha de atención y próximo servicio | script | Igual a `baseline/TC-09-*`: ambas 419×38 |
| TC-10 | Configuración › horarios: switches + horas | script | Igual a `baseline/TC-10-*`: switches 44×24 violeta/gris; horas tipeables `hh:mm` |
| TC-11 | Encabezado: switch de tema | script | Igual a `baseline/TC-11-*`: 44×24 con thumb violeta 16px e ícono sol/luna |
| TC-12 | Perfil de cliente: historial con pestañas | script | Igual a `baseline/TC-12-*`: pestañas 119/136/90 × 38, activa con borde y texto `primary` |

## Comportamiento que no cubre Vitest

| ID | Caso | Executor | Esperado |
|---|---|---|---|
| TC-13 | Calendario abierto dentro del formulario de turno | script | Popover con el mes en español ("noviembre 2026"), semana desde lunes, dentro del panel del diálogo y por encima (`elementFromPoint` sobre un día); Escape cierra solo el calendario y el diálogo sigue abierto |
| TC-14 | Lista del Select abierta en modo oscuro (filtro de Recordatorios) — solo oscuro | script | Fondo de la lista `surface-container` oscuro (`rgb(18, 18, 21)`) |
| TC-15 | Fecha inválida marcada en rojo (turno: tipear 31022026 y salir) | script | El campo sigue mostrando `31/02/2026`, `aria-invalid="true"` y borde `error` |

## Casos agregados tras la ronda de fixes del review

| ID | Caso | Executor | Esperado |
|---|---|---|---|
| TC-16 | Recordatorios: fecha inválida y "Filtrar" — *spec: campos-fecha-hora* | script | No filtra, "Revisá las fechas" visible y campo con `aria-invalid` + borde `error` |
| TC-17 | Configuración: "desde" vacío en un día abierto y "Guardar cambios" — *spec: campos-fecha-hora › Hora tipeable* | script | Mensaje "Completá desde y hasta…", campo en rojo y **ningún** request de escritura |
| TC-18 | Producto: la lista de unidad ofrece "Sin unidad" — *spec: listas-seleccion* | script | Opción visible y clickeable dentro del diálogo |
| TC-19 | Turno: fecha parcial "13/11" — *spec: campos-fecha-hora* | script | Sin errores mientras se tipea; "Fecha inválida" al salir; el diálogo sigue abierto |
| TC-20 | Presupuesto: "Sin vehículo" quita el vehículo guardado | vitest | `pages/__tests__/BudgetForm.test.jsx` › "Sin vehículo" quita el vehículo guardado |

## Resultados

Base `16455c5` + diff sin commitear · 2026-11-13 · capturas en `tmp/qa/shadcn-base-ui-fase-2/`

- ✅ **Re-corrida tras los fixes** · base `16455c5` + diff · script · **35/35 ok** (TC-01..TC-19, oscuro + claro; TC-14 solo oscuro). Diferencias contra `baseline/results.json`: solo las ya listadas en Hallazgos (TC-01 fondo del vehículo deshabilitado, TC-02 +1px, TC-07 +8px, TC-08 cabecera indeterminada, TC-10 horas 80px). TC-20 ✅ vitest (suite 661/661).
- ✅ **Primera corrida (pre-fixes): TC-01 a TC-15** (oscuro + claro; TC-14 solo oscuro) · script · 27/27 ok (TC-13 re-corrido tras corregir el selector: `/appointments` también tiene la grilla de FullCalendar).
- Medidas iguales a `baseline/results.json` en TC-01 (fecha), TC-02, TC-03, TC-05, TC-06, TC-09, TC-10 (switches), TC-11 y TC-12.

## Hallazgos

**Corregidos tras la Parada 3** (el usuario pidió igualar todo a la línea base; re-corridos TC-01, 02, 07, 08, 10, 11, 14 → 13/13 ok, medidas iguales a `baseline/results.json`):
- TC-01 vehículo deshabilitado transparente y texto pleno (`AppointmentForm.jsx`); TC-02 selects 41px (`ProductForm.jsx` `selectClass`); TC-07 estado 165px y fechas 161px (`Reminders.jsx`); TC-08 cabecera indeterminada con fondo de superficie + borde violeta + guion `on-surface` (`primitives/checkbox.jsx`) y filtro de stock 112px (`ProductsTable.jsx`); TC-10 horas 124×31 (`Settings.jsx`).
- Única diferencia que queda: el guion indeterminado en claro es oscuro (en la línea base era blanco sobre `#f4f4f5`, casi invisible). Formato de hora 24 h por spec.

**Registro original (antes de corregir):**

- ⚠️ TC-01: el Select de vehículo deshabilitado ("Primero selecciona un cliente") ahora se ve atenuado (opacidad 50%) y con fondo `surface-variant`; el `<select>` nativo era transparente y con texto pleno. Es el mismo aspecto que ya tenía el Select de hora de la fase 1.
- ⚠️ TC-02: los triggers miden 42px de alto (el `<select>` nativo, 41px).
- ⚠️ TC-07: el Select de estado mide 173px (antes 165px) por la flecha del trigger.
- ⚠️ TC-08: la cabecera indeterminada pasa a caja violeta llena con un guion blanco (antes, borde violeta con guion sobre fondo oscuro), igual que una casilla marcada.
- ⚠️ TC-10: las horas se muestran en 24 h (`09:00`, antes `09:00 a.m.` según el idioma del navegador) y la caja es más angosta (80px); es lo que pide la spec (`hh:mm`).
- Bundle: +130 kB (+39,5 kB gzip, +5,9 %) — ver `baseline/bundle.txt`.
