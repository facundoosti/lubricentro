# QA visual — buscadores-autocomplete-base-ui

## Riesgo: medio — `@ui/Autocomplete` es nuevo y lo comparten 4 consumidores (turno, vehículo, presupuesto, actualización masiva); no toca tokens

Línea base: `baseline/` (antes del cambio). Script: `qa.mjs`.

- [x] **TC-01** · must · script · desktop-dark,desktop-light · Turno: input 718×44, lista debajo, mismo ancho, por encima del diálogo — *regresión visual vs baseline TC-01* → ✅ oscuro+claro · input 718×44 (y=232), lista y=281 (debajo; en baseline quedaba encimada, y=261), opción clickeable (sobre 1a95fd3 + diff)
- [x] **TC-02** · must · script · desktop-dark,desktop-light · Vehículo sin resultados: "No se encontraron clientes" + opción "+ Crear cliente" — *spec: listas-seleccion › Autocomplete › Sin resultados* → ✅ oscuro+claro · "No se encontraron clientes" + "+ Crear cliente", lista debajo (sobre 1a95fd3 + diff)
- [x] **TC-03** · must · script · desktop-dark,desktop-light · Actualización masiva: input 622×38 y lista de productos — *regresión visual vs baseline TC-03* → ✅ oscuro+claro · input 622×38, opciones 59px igual a baseline (sobre 1a95fd3 + diff)
- [x] **TC-04** · must · script · desktop-dark · ↓↓ Enter elige el 2º cliente y cierra la lista — *spec: listas-seleccion › Autocomplete › Elegir un cliente con el teclado* → ✅ eligió "Sylviana Picardi - …" (2º), lista cerrada (sobre 1a95fd3 + diff)
- [x] **TC-05** · must · script · desktop-dark · ↓ Enter elige el 1er producto — *spec: listas-seleccion › Autocomplete › Elegir un producto con el teclado* → ✅ "CH6005 FILTRO ACEITE MOTO" (1º), lista cerrada (sobre 1a95fd3 + diff)
- [x] **TC-06** · must · script · desktop-dark · Escape en el formulario de vehículo cierra solo la lista y conserva el texto — *spec: listas-seleccion › Autocomplete › Escape dentro de un diálogo* → ✅ lista cerrada, diálogo abierto, texto "a" intacto (sobre 1a95fd3 + diff)
- [x] **TC-07** · must · script · desktop-dark · ↓ Enter sobre "+ Crear cliente" abre el alta apilada con el texto — *spec: listas-seleccion › Crear cliente desde el autocomplete › Crear cliente con el teclado* → ✅ 2 diálogos, alta con "Zzqx Inexistente" precargado (sobre 1a95fd3 + diff)
- [x] **TC-08** · must · script · desktop-dark · Presupuesto nuevo (sin diálogo): lista visible, elegir y Escape suelto no borra el cliente — *regresión: BudgetGeneralSection + bloqueante del review* → ✅ lista debajo y encima de la página; Escape ×2 con cliente elegido no lo borra (sobre 1a95fd3 + diff)
- [x] Limpiar la selección · vitest (`Autocomplete.test.jsx`, `CustomerSearchInput.test.jsx`) — *spec: listas-seleccion › Autocomplete › Limpiar la selección*

## Hallazgos

- H-01 (QA): el primer chequeo de TC-01 comparaba el ancho del `listbox` (716) con el input (718); el popup tiene 1px de borde. Fix del caso (±2px), no del código. ✅
- Mejora vs baseline: la lista vieja quedaba encimada sobre el input (y=261 con input y=232+44); ahora arranca en y=281.
- Resultado: script 14/14 ok (TC-01..03 oscuro+claro, TC-04..08 oscuro) · vitest cubre "Limpiar".
