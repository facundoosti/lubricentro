# QA visual — homologar-items-presupuesto-atencion

## Riesgo: alto — componente de ítems compartido por dos formularios + flujo de datos (alta/edición de atención, copiar presupuesto)

Datos de dev: presupuesto #61 (cliente con 2 ítems sin IVA, total $250), atención #197 migrada (2 ítems).

- [x] **TC-01** · must · script · desktop-dark,desktop-light · Nuevo presupuesto: sección "Productos y Servicios", columnas "Producto / servicio" y "% IVA", sin "Artículos", sin scroll horizontal — *spec: presupuesto-ux › Sección "Productos y Servicios" compartida › Abrir el formulario de presupuesto* → ✅ dark+light · {seccion:true, articulos:false, overflowX:false} (sobre f57f675 + working tree)
- [x] **TC-02** · must · script · desktop-dark · % libre: 1 × $1.000 con 30% → importe $1.300 y total efectivo actualizado — *spec: presupuesto-iva › Alícuota inicial › Cambio manual del %* → ✅ dark · línea $1.300, total $1.300 (sobre f57f675 + working tree)
- [x] **TC-03** · must · vitest · % 120 muestra "% IVA inválido (0 a 99,99)" sin burbuja nativa; cantidad 0 inválida — *borde (BudgetForm.test, ServiceRecordFormPage.test, ItemsEditor.test)* → ✅ vitest (515/515) · BudgetForm/ServiceRecordFormPage/ItemsEditor tests (sobre f57f675 + working tree)
- [x] **TC-04** · must · script · desktop-dark,desktop-light · Nueva atención: "Productos y Servicios", botón "Copiar desde presupuesto", barra con "Total" sin "Tarjeta", sin scroll horizontal — *spec: items-atencion › Sección "Productos y Servicios" en el formulario de atención* → ✅ dark+light · copiar visible, sin "Tarjeta", sin secciones viejas, sin overflow (sobre f57f675 + working tree)
- [x] **TC-05** · must · script · desktop-dark,desktop-light · Copiar presupuesto #61: diálogo lista el presupuesto, al copiar quedan 2 líneas, chip "Desde presupuesto #61" y Total $250 — *spec: copiar-presupuesto-a-atencion › Copiar los ítems* → ✅ dark+light · 2 líneas, chip #61, Total $250 · tmp/qa/homologar-items/TC-05-desktop-light.jpg (sobre f57f675 + working tree)
- [x] **TC-06** · must · script · desktop-dark · Editar atención #197 migrada: 2 líneas con % vacío, sin botón "Copiar desde presupuesto" — *spec: items-atencion › Editar una atención migrada; copiar › Editar una atención existente* → ✅ dark · 2 líneas, % vacío, sin botón copiar (sobre f57f675 + working tree)
- [x] **TC-07** · must · script · desktop-dark · Regresión: impresión del presupuesto #61 renderiza sin errores — *regresión: BudgetPrint* → ✅ dark · impresión con ítems y total $250 (sobre f57f675 + working tree)
- [x] **TC-08** · must · vitest · Payload de atención (items_attributes, _destroy, budget_id solo al crear, quitar vínculo) — *spec: copiar › Quitar el vínculo (serviceRecordsService.test, serviceRecord.test, ServiceRecordFormPage.test)* → ✅ vitest (515/515) · serviceRecordsService/serviceRecord/ServiceRecordFormPage tests (sobre f57f675 + working tree)

## Hallazgos

- **H-01** · ⚠️ should · Atención #197 (dev) tiene `total_amount` guardado $80.150 pero sus ítems suman $80.000: el formulario de edición muestra $80.000 (vista previa) y si se guarda sin tocar ítems el backend conserva $80.150. Causa: dato histórico inconsistente previo al change (el total no salía de los ítems). Gap de spec: "Editar una atención migrada → total igual al guardado" no se cumple en atenciones con total manual. Sin fix (decisión del usuario).
