# QA visual — presupuesto-hoja-rediseno

## Riesgo: medio — rediseña una pantalla completa (hoja impresa) y agrega formularios nuevos en Clientes y Configuración; colores de la hoja son fijos (no dependen del tema), las secciones nuevas sí.

Datos: presupuesto BIG (12 ítems, 3 con SKU, notas, cliente con CUIT/FACT B), presupuesto SIMPLE (sin cliente), 2 planes activos "QA VISA", settings con email/instagram (`backend/tmp/seed_qa.rb`).

- [x] **TC-01** · must · script · desktop-dark · Hoja BIG: sin P. UNIT., 3 códigos, 2 cuotas, leyenda, CUIT/FACT, pie con email/@instagram sin dirección — *spec: presupuesto-impresion (varios escenarios)* → ✅ eb3c98f+wip · headers CANT/ARTÍCULO/IMPORTE, 3 códigos, 2 cuotas, fiscal y pie ok
- [x] **TC-02** · must · script · desktop-dark · Hoja BIG: el pie no pisa totales/leyenda/notas y la hoja no desborda — *borde: muchos ítems + cuotas + notas* → ✅ eb3c98f+wip · footerTop 1225 > legendBottom 957; hoja = A4 (1123px)
- [x] **TC-03** · must · script · desktop-dark · Hoja SIMPLE sin cliente: sin bloque fiscal, totales y leyenda presentes — *spec: presupuesto-impresion › Datos fiscales › Sin datos* → ✅ eb3c98f+wip · fiscal null, leyenda ok
- [x] **TC-04** · must · script · desktop-dark,desktop-light · Configuración: campos Email/Instagram con valores y sección "Planes de cuotas" lista los planes — *spec: planes-cuotas › ABM* → ✅ eb3c98f+wip · dark+light: email/ig/2 planes, sin overflow
- [x] **TC-05** · must · script · desktop-dark,desktop-light · Cliente nuevo: campos CUIT y Tipo de factura visibles en el formulario — *spec: datos-fiscales-cliente › Carga desde el formulario* → ✅ eb3c98f+wip · dark+light: CUIT y Tipo de factura visibles
- [x] **TC-06** · must · vitest · Error de carga de planes muestra Reintentar; cuotas y leyenda en la hoja; CUIT inválido — *borde* (`InstallmentPlansSection.test.jsx`, `BudgetPrint.test.jsx`, `CustomerForm.test.jsx`) → ✅ eb3c98f+wip · vitest en verde
- [x] **TC-07** · should · script+revisión · desktop-dark · Captura de la hoja BIG comparada con el mockup aprobado — *origen: mockup* → ✅ eb3c98f+wip · tmp/qa/presupuesto-hoja-rediseno/TC-07-sheet.png — coincide con el mockup

## Hallazgos

Sin hallazgos. ⚠️ La captura del elemento se recorta por el viewport (artefacto de la captura, no de la hoja); el pie se verificó por medidas.
