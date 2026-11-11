# QA visual: nombres de producto largos

Fix: `docs/fixes/2026-11-11-nombres-largos-ui-y-factories.md` · Script: `docs/qa/2026-11-11-nombres-largos.qa.mjs`

## Riesgo: medio
Toca 2 componentes compartidos (`SearchableSelect`, `ConfirmModal`) y la hoja impresa del presupuesto. No cambia colores ni tokens, así que solo se prueba `desktop-dark`.

Datos: el script reemplaza en las respuestas de la API el nombre de un producto (o la descripción de un ítem de presupuesto) por uno de unos 490 caracteres. No escribe en la base.

- [x] **TC-01** · must · vitest · Tooltip con el nombre completo en ProductsTable, SearchableSelect y BulkPriceModal — *origen: diff*
- [x] **TC-02** · must · script · desktop-dark · /products: el nombre largo ocupa como máximo 2 líneas, sin scroll horizontal en la página — *origen: diff*
- [x] **TC-03** · must · script · desktop-dark · Confirmación de borrado con nombre largo: el modal no desborda la pantalla — *regresión: ConfirmModal*
- [x] **TC-04** · must · script · desktop-dark · Vista previa de precios por lote: la celda del nombre ocupa como máximo 2 líneas — *origen: diff*
- [x] **TC-05** · must · script · desktop-dark · /service-records/new: la opción de producto ocupa como máximo 2 líneas dentro de la lista — *regresión: SearchableSelect*
- [x] **TC-06** · must · script · desktop-dark · /budgets/:id/print: el ítem largo ocupa como máximo 2 líneas y la tabla no desborda la hoja — *origen: diff*
- [ ] **TC-07** · should · manual · Imprimir o guardar en PDF un presupuesto con un ítem largo: entra en una hoja — *borde*

## Resultados
Corrida del 2026-11-11 sobre el working tree (base `52b5cc0`):
- ✅ TC-01 vitest: 245 tests de `src/components` OK (incluye los 3 de tooltip).
- ✅ TC-02: el nombre ocupa 2 líneas (40px con line-height de 20px), ancho 237px, sin scroll horizontal.
- ✅ TC-03: el modal mide 448px y queda entre los píxeles 496 y 944 de un viewport de 1440. No desborda y muestra el nombre.
- ✅ TC-04: la celda ocupa 2 líneas (40px) y mide 284px.
- ✅ TC-05: la opción ocupa 2 líneas (40px) y queda dentro de la lista (borde derecho en el píxel 923 en ambos).
- ✅ TC-06: la hoja impresa muestra el ítem en 2 líneas (33px con line-height de 17px). La tabla termina en el píxel 1224 y su contenedor en el 1262.
- ⏭️ TC-07 manual: queda para el usuario, imprimiendo un PDF real.
Capturas en `tmp/qa/nombres-largos/`.

## Hallazgos
