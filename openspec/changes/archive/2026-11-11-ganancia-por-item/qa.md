# QA visual — ganancia-por-item

## Riesgo: alto — cambia cálculo de totales (flujo de datos) en el componente compartido por presupuesto y atención, y la impresión que ve el cliente

Datos de dev: presupuesto #96 (1 × $1.000, IVA 21%, ganancia 30%, recargo 10% → $1.510 / $1.661), presupuesto #61 (2 ítems sin IVA ni ganancia, $250), producto "Filtro 1.5" ($1.000, 21%).

- [x] **TC-01** · must · script · desktop-dark,desktop-light · Nuevo presupuesto: columnas "% Ganancia" e "Importe final"; el IVA es un select con 21% · 10,5% · Sin IVA; sin scroll horizontal — *spec: ganancia-items › Columna "% Ganancia"; presupuesto-iva › Alícuota inicial* → ✅ dark+light · opciones 21%|10,5%|Sin IVA, sin overflow
- [x] **TC-02** · must · script · desktop-dark · Texto libre 1 × $1.000, 21%, ganancia 30% → importe $1.510, total $1.510, desglose Ganancia $300 — *spec: ganancia-items › Fórmula sumada › Vista previa* → ✅ dark · línea $1.510, Ganancia $300 en desglose
- [x] **TC-03** · must · script · desktop-dark · Elegir el producto "Filtro 1.5" → ganancia 30% e importe $1.510 — *spec: ganancia-items › Elegir un producto* → ✅ dark · producto → ganancia 30, $1.510
- [x] **TC-04** · must · script · desktop-dark,desktop-light · Atención nueva: columna "% Ganancia"; copiar el presupuesto #96 → línea con ganancia 30 y Total $1.510 — *spec: copiar-presupuesto-a-atencion › Copiar una línea con ganancia* → ✅ dark+light · ganancia 30 copiada, Total $1.510, sin Tarjeta
- [x] **TC-05** · must · script · desktop-dark,desktop-light · Impresión del #96: P. unit. e importe $1.510, "IVA 21%" $210, Efectivo $1.510, Tarjeta $1.661, sin "Ganancia", "$300" ni "Subtotal" — *spec: ganancia-items › Ganancia oculta › Imprimir* → ✅ dark+light · 3× $1.510, IVA 21% $210, $1.661; sin ganancia/$300/subtotal/base · tmp/qa/ganancia-por-item/TC-05-desktop-light.jpg
- [x] **TC-06** · must · script · desktop-dark · Regresión: impresión del #61 (sin IVA) solo con totales $250 — *spec: presupuesto-iva › Impresión › Presupuesto viejo* → ✅ dark · solo totales $250
- [x] **TC-07** · must · vitest · Redondeos en centavos, "(anterior)" estable, payload sin "0", WhatsApp sin ganancia — *borde (budgetMath, IvaRateSelect, budget, whatsapp tests)* → ✅ vitest 535/535

## Hallazgos

- **H-01** · ⚠️ should · fuera de alcance · El buscador de "Copiar desde presupuesto" dice "Buscar por cliente, vehículo o notas" pero `Budget.by_search` solo busca en cliente y `vehicle_description`. Viene del change anterior. Sin fix.
- (Fallos iniciales de TC-04/TC-05 eran del script/datos de prueba: descripción con la palabra "ganancia" y regex del IVA; no del producto.)
