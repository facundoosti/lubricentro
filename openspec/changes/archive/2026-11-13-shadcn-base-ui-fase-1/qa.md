# QA visual — shadcn-base-ui-fase-1

**Riesgo: alto.** Cambia la base de todos los diálogos (formularios, confirmaciones, informativos, acciones masivas, importación, visor) y de las listas de selección. El objetivo es **paridad visual** con `baseline/` y que el comportamiento (pila, Escape, fondo, listas encima del diálogo) siga igual.

- Desktop 1440×900, temas **oscuro y claro** (salvo donde se indica).
- Script: `openspec/changes/shadcn-base-ui-fase-1/qa.mjs` (mismos `TC-XX`). Línea base: `baseline/*.jpg` + `baseline/results.json` (`facts` medidos antes del change).
- Correr: `QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs openspec/changes/shadcn-base-ui-fase-1/qa.mjs --out tmp/qa/shadcn-base-ui-fase-1`
- TC-06 mockea el `POST /customers` (no escribe en la BD).
- Datos de dev: TC-10 usa el único producto con imagen (`FLX280`); TC-11 usa las marcas `FRAM` y `OSRAM`.

## Paridad visual contra `baseline/` (comparar captura + `facts`: ancho/alto, fondo, radio, borde del panel)

| ID | Pantalla | Executor | Esperado |
|---|---|---|---|
| TC-01 | Formulario de nuevo cliente (`/customers` → Nuevo Cliente) | script | Igual a `baseline/TC-01-*`: panel 768px, radio 16px, header/footer fijos, mismos colores |
| TC-02 | Vehículo con alta de cliente apilada (`/vehicles` → Nuevo Vehículo → "+ Crear cliente") | script | Igual a `baseline/TC-02-*`: abajo 768px, arriba 576px (más angosto), fondo del de arriba más oscuro |
| TC-03 | Producto con el Combobox de categoría abierto | script | Igual a `baseline/TC-03-*`: trigger, buscador dentro de la lista, indicadores circulares, indentación de subcategorías, lista sobre el diálogo |
| TC-04 | Turno con el Select de estado abierto | script | Igual a `baseline/TC-04-*`: trigger `h-11`, lista debajo del trigger con su ancho, opción elegida en violeta |
| TC-05 | Confirmación de eliminar cliente | script | Igual a `baseline/TC-05-*`: panel 448px, radio 24px, ícono, ✕ redonda, botones Cancelar/Eliminar |
| TC-06 | "Cliente creado" (tras crear) | script | Igual a `baseline/TC-06-*`: panel 384px, sin ✕, tres acciones |
| TC-07 | Cambio masivo de IVA (1 producto seleccionado → Cambiar IVA) | script | Igual a `baseline/TC-07-*`: panel 448px, título simple, radios de alícuota |
| TC-08 | Cambio masivo de precios (Acciones → Actualizar precios) | script | Igual a `baseline/TC-08-*`: panel 672px, radio 12px, header con ícono |
| TC-09 | Importación de productos (Acciones → Importar Excel) | script | Igual a `baseline/TC-09-*`: panel 512px, radio 12px |
| TC-10 | Visor de imágenes (`/products?search=FLX280` → imagen) | script | Igual a `baseline/TC-10-*`: pantalla completa, fondo negro 90%, barra superior, foco en Cerrar |
| TC-11 | Listado de productos con filtro de marcas desplegado y 2 chips (`?brand=FRAM,OSRAM`) | script | Igual a `baseline/TC-11-*`: chips en el trigger, lista ~200px con casillas, "Limpiar selección" |

## Comportamiento que no cubre Vitest

| ID | Caso | Executor | Esperado |
|---|---|---|---|
| TC-12 | Apilado visual (vehículo + cliente) | script | El de arriba más angosto que el de abajo, 2 fondos (60% y 70% de opacidad) y el de arriba recibe el click (`elementFromPoint`) |
| TC-13 | Lista del Combobox por encima del formulario de producto | script | El centro de la primera opción es de la lista (`elementFromPoint`), el click la elige y el formulario sigue abierto |
| TC-14 | Escape con el Select de estado abierto (turno) | script | Se cierra solo la lista; el diálogo sigue abierto |
| TC-15 | Click en el fondo según el tipo | script | La confirmación se cierra; el cambio masivo de precios sigue abierto con el valor `15` cargado |
| TC-16 | App detrás no interactuable (solo oscuro) | script | Con el formulario de cliente abierto, un click sobre "Dashboard" del sidebar no navega y el diálogo sigue abierto |
| TC-17 | Toast usable con un diálogo abierto | mcp | Con un formulario abierto, provocar un toast (p. ej. guardar con error de API) y cerrarlo con su botón: el toast se cierra y el diálogo sigue abierto |
| TC-18 | Foco y teclado en un diálogo real | mcp | Abrir el formulario de vehículo con "Nuevo Vehículo": Tab/Shift+Tab no salen del diálogo; al cerrar con Escape el foco vuelve al botón "Nuevo Vehículo"; en el alta de cliente apilada el foco nunca va al de abajo |
| TC-19 | Lista de clientes en el alta apilada | mcp | En el formulario de vehículo, buscar un cliente existente y elegirlo con click: queda seleccionado (lista porteada dentro del panel, no recortada por el scroll del cuerpo) |

## Resultados

Base `1d26bd3` + diff sin commitear · 2026-11-13 · capturas en `tmp/qa/shadcn-base-ui-fase-1/`

- ✅ **TC-01 a TC-15** (oscuro + claro) y **TC-16** (oscuro) · script · 31/31 ok. Los `facts` (ancho, alto, fondo, radio, borde de cada panel) son **idénticos a `baseline/results.json`**. TC-03 suma la lista del Combobox como popup medido (351×257, radio 8px). TC-11 no tenía `facts` en la línea base (chips 2, lista 198px).
- ✅ **TC-18** · mcp · la trampa de foco cicla dentro del diálogo, Escape devuelve el foco a "Nuevo Vehículo" y en el apilado el foco nunca va al de abajo.
- ✅ **TC-19** · mcp · se elige un cliente existente con click y queda seleccionado. La lista está dentro del diálogo, por encima (`elementFromPoint`), y no queda recortada.
- ⚠️ **TC-17** · mcp · pass parcial: el toast queda arriba (`elementFromPoint`), recibe el click y el diálogo sigue abierto. El click fue sintético (el toast se descarta solo antes de que llegue el click real) y no se verificó el cierre por el botón del toast. Aceptado por el usuario.
  - ✅ Re-test 2026-11-13 (`cc12954`): hover, click y swipe con mouse real, el toast se descarta y el diálogo sigue abierto (también con uno que cierra con el fondo). Sileo no tiene botón de cerrar → se usa swipe. Ver `docs/qa/2026-11-13-toast-con-dialogo.md`.

## Hallazgos

- ⚠️ Cosmético (TC-03): las casillas de las subcategorías quedan ~9px más a la izquierda que en la línea base. Aceptado por el usuario (queda en Pendientes).
- ⚠️ Cosmético (TC-03/TC-11): el anillo de foco del buscador pasa de azulado (anillo nativo) a violeta (`ring`). El primer elegido aparece resaltado al abrir la lista. **El usuario confirmó el violeta como el comportamiento deseado.**
- Gap de spec: ninguno.

