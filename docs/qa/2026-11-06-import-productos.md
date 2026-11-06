# QA visual · Importación de productos (aviso de fin y respaldo por consulta)

Cambio: el modal "Importar Productos" ahora termina siempre (Action Cable + consulta
periódica a `GET /api/v1/products/import_status/:job_id`) y avisa con toast el resultado
(éxito / parcial / falla). Archivos: `ProductImportModal.jsx`, `ProductImportResult.jsx`,
`importResult.js`, `useImportProgress.js`, `useImportCable.js`, `productsService.js`.

Archivos de prueba (git-ignored): `tmp/qa/import-productos/`
- `qa_ok_120.xlsx` — 120 filas válidas (SKU `QA-OK-001..120`)
- `qa_parcial.xlsx` — 2 válidas + 1 sin nombre + 1 sin precio (`-`)
- `qa_todo_falla.xlsx` — 2 filas inválidas

Blast radius (`codegraph`): `ProductImportModal` solo se usa en la página `/products`;
`useImportCable` solo lo usa `useImportProgress`.

### QA-01 · Importación exitosa con progreso y toast
- **Pantalla**: /products → botón de importar
- **Precondición**: logueado con usuario QA
- **Pasos**: 1) Abrir modal de importación 2) Subir `qa_ok_120.xlsx` 3) Click "Importar" 4) Esperar fin
- **Resultado esperado**: se ve "Procesando fila X de 120" y barra de progreso (o pasa directo al resultado si es muy rápido); al terminar, bloque verde "120 producto(s) importados correctamente", toast de éxito "120 producto(s) importados exitosamente", botón "Cerrar" habilitado; al cerrar, la tabla muestra los productos `QA Import OK`
- **Viewports / temas**: desktop · oscuro
- **Estado**: ✅ pasa (r1) — `tmp/qa/import-productos/QA-01-desktop-dark.png`: progreso "Procesando fila 40 de 120" → "120 producto(s) importados correctamente"; toast de éxito (en DOM); POST 202, import_status 200

### QA-02 · Importación parcial con lista de errores
- **Pantalla**: /products → modal de importación
- **Precondición**: logueado
- **Pasos**: 1) Subir `qa_parcial.xlsx` 2) Importar 3) Esperar fin
- **Resultado esperado**: bloque verde "2 producto(s) importados correctamente"; bloque de errores "2 errores" con "Fila 4: El nombre es requerido" y "Fila 5: El precio unitario es inválido…"; toast de advertencia "2 producto(s) importados" / "2 fila(s) con errores"; "Cerrar" habilitado
- **Viewports / temas**: desktop · claro
- **Estado**: ✅ pasa (r1, y otra vez en QA-04a/b r2) — `QA-02-desktop-light.png`: 2 importados + "Fila 4/Fila 5"; toast warning

### QA-03 · Importación sin ningún producto válido
- **Pantalla**: /products → modal de importación
- **Precondición**: logueado
- **Pasos**: 1) Subir `qa_todo_falla.xlsx` 2) Importar 3) Esperar fin
- **Resultado esperado**: bloque rojo "No se importó ningún producto: todas las filas tienen errores" + lista de errores; toast de advertencia "No se importó ningún producto" / "2 fila(s) con errores"; "Cerrar" habilitado (actualizado tras la revisión: "ningún producto válido" ya no se muestra como falla del proceso)
- **Viewports / temas**: mobile 375×812 · oscuro
- **Estado**: ✅ pasa (r2) — `QA-03-mobile-dark-r2.png`: "No se importó ningún producto: todas las filas tienen errores"; toast warning visible. ⚠️ en 375px el toast arranca en x=-3 (layout top-right de Sileo)

### QA-04 · Respaldo por consulta cuando el WebSocket no conecta
- **Pantalla**: /products → modal de importación
- **Precondición**: inyectar con `initScript` (antes de cargar la app; Action Cable guarda `WebSocket` al importarse) un WebSocket que (a) se cierra solo con 1006 y (b) tira error al construirse
- **Pasos**: 1) Anular WebSocket 2) Subir `qa_parcial.xlsx` 3) Importar 4) Esperar hasta ~10 s
- **Resultado esperado**: en ambas variantes la app sigue en pie y el modal NO queda colgado en "Iniciando importación…": llega al resultado (2 importados + 2 errores) vía requests `GET /api/v1/products/import_status/<job_id>`; toast mostrado una sola vez
- **Viewports / temas**: desktop · oscuro
- **Estado**: ✅ pasa (r2) — `QA-04a-desktop-dark-r2.png` (WS 1006) y `QA-04b-desktop-dark-r2.png` (WS tira error): la app sigue en pie, resultado en ~2,9 s por `import_status` (200), toast 1 vez; solo el warn esperado de useImportCable

### QA-05 · Consola y red limpias
- **Pantalla**: /products
- **Precondición**: durante QA-01 y QA-02
- **Pasos**: revisar consola y red
- **Resultado esperado**: sin errores en consola; `POST /products/import` → 202; `import_status` → 200; sin 4xx/5xx inesperados (en QA-04 los errores de WebSocket son esperados)
- **Viewports / temas**: —
- **Estado**: ✅ pasa — sin errores de consola ni 4xx/5xx en el flujo normal (r1 y r2); el único aviso es preexistente ("form field … id or name")

### QA-06 · Cerrar el modal durante la importación
- **Pantalla**: /products → modal de importación
- **Precondición**: logueado
- **Pasos**: 1) Subir `qa_ok_120.xlsx` 2) Importar 3) Apenas aparece el progreso, click en "Cerrar" 4) Esperar ~10 s sin reabrir 5) Reabrir el modal
- **Resultado esperado**: mientras importa se ve "Podés cerrar esta ventana…" y los botones de cierre están habilitados; tras cerrar llega igual el toast de éxito; al reabrir se ve el resultado final
- **Viewports / temas**: desktop · claro
- **Estado**: ✅ pasa (r2) — `QA-06-desktop-light-r2-{progreso,cerrado,toast,reabierto}.png`: botones de cierre habilitados, toast de éxito con el modal cerrado, al reabrir muestra "120 producto(s) importados correctamente"

### QA-07 · Toast visible por encima del modal
- **Pantalla**: /products → modal de importación
- **Precondición**: logueado
- **Pasos**: 1) Importar `qa_parcial.xlsx` 2) ~1,5 s después del resultado, screenshot de la zona superior derecha 3) `get_css_styles` del toast y del overlay del modal
- **Resultado esperado**: el toast se ve nítido, sin blur, por encima del overlay oscuro del modal
- **Viewports / temas**: desktop · oscuro y claro
- **Estado**: ✅ pasa (r2) — `QA-07-desktop-{dark,light}-r2-{0.5s,1.5s,3s}.png`: toast nítido encima del overlay (z-index 9999 vs 50, sin stacking contexts intermedios); lo borroso de r1 era la animación de entrada

## Hallazgos

| ID | Síntoma | Causa raíz | Fix | Estado |
|----|---------|-----------|-----|--------|
| QA-04b | Si `new WebSocket` tira error al suscribirse (ej. `ws://` desde `https`, bloqueado), toda la app queda en negro | `consumer.subscriptions.create` sin try/catch en un `useEffect`: el error sincrónico tumba el árbol de React y el polling nunca arranca | `frontend/src/hooks/useImportCable.js:17` try/catch + `console.warn`; test `src/hooks/__tests__/useImportCable.test.js` | ✅ corregido y verificado (QA-04b r2) |
| QA-03 | Texto esperado desactualizado | Cambió el resultado "ningún producto válido" (outcome `none`) tras la revisión de código | Actualizado este plan | — |
| QA-01/02/03 | Toast poco visible en capturas (borroso arriba a la derecha) | Capturas tomadas durante la animación de entrada de Sileo (opacity 0→1, filtro gooey); no hay problema de capas | Ninguno necesario | ✅ descartado (QA-07) |
| — | Título del toast en "Capitalize" ("Producto(S) Importados") | `sileo/dist/styles.css:234` aplica `text-transform: capitalize` a todos los toasts | Fuera de alcance: afecta a toda la app, se consulta al usuario | ⚠️ reportado |
| QA-03 | En mobile 375px el toast arranca en x=-3 y queda pegado al borde | Layout `top-right` de Sileo en viewports angostos (preexistente) | Fuera de alcance | ⚠️ reportado |
| — | El toast tapa ~4 s el switch de tema/avatar del header | Posición `top-right` + offset 16px (preexistente) | Fuera de alcance | ⚠️ reportado |
