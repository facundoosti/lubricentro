# QA visual — presupuesto-impresion-ajustes

## Riesgo: bajo — ajuste visual acotado a la hoja impresa (1 página + 1 componente usado solo ahí, `codegraph impact BudgetPrintItems`), sin lógica ni datos

La hoja es independiente del tema (colores fijos para imprimir/PDF): solo `desktop-dark`.

- [x] **TC-01** · must · vitest · Año con 2 dígitos (`26`) — *spec: presupuesto-impresion › Año con dos dígitos › Presupuesto de 2026* · ✅ 664b02e+wip · `BudgetPrint.test.jsx` 9/9
- [x] **TC-02** · must · vitest · Sin fecha: día, mes y año vacíos — *spec: presupuesto-impresion › Año con dos dígitos › Presupuesto sin fecha* · ✅ 664b02e+wip · `BudgetPrint.test.jsx` 9/9
- [x] **TC-03** · must · vitest · NOMBRE muestra el cliente — *spec: presupuesto-impresion › Nombre vacío sin cliente › Con cliente* · ✅ 664b02e+wip · `BudgetPrint.test.jsx` 9/9
- [x] **TC-04** · must · vitest · Sin cliente: NOMBRE vacío y la descripción sigue en Vehículo — *spec: presupuesto-impresion › Nombre vacío sin cliente › Sin cliente con vehículo descripto* · ✅ 664b02e+wip · `BudgetPrint.test.jsx` 9/9
- [x] **TC-05** · must · vitest · Encabezado "ARTÍCULO" — *spec: presupuesto-impresion › Columna Artículo › Encabezado de la tabla* · ✅ 664b02e+wip · `BudgetPrint.test.jsx` 9/9
- [x] **TC-06** · must · script · desktop-dark · En la app real: abrir Imprimir desde /budgets, año de 2 dígitos, encabezados de la tabla y recuadros DÍA/MES/AÑO del mismo ancho sin desborde — *origen: diff (minWidth 36→22px)* · ✅ 664b02e+wip · `/budgets/96/print`: año "26", DÍA/MES/AÑO 24px sin desborde, headers CANT/ARTÍCULO/P. UNIT./IMPORTE

## Hallazgos

## Resultados
Riesgo bajo · vitest 5/5 ✅ · script 1/1 ✅ · mcp 0 · sin hallazgos ni gaps de spec. Capturas: `tmp/qa/presupuesto-impresion-ajustes/`.
