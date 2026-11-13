## Context

- Fase 1 en producción: `@base-ui/react` 1.9, `components.json` (style `base-nova`, `ui → @/components/ui/primitives`), alias de tokens en `index.css`, wrappers `@ui/Dialog`, `ConfirmDialog`, `Combobox`, `Select`, y `dialogContext` (`DialogPortalContainer`, `DialogLevelContext`). ESLint ya prohíbe importar primitivas desde `features/` y `pages/`.
- Quedan controles nativos / a mano:
  - **13 `<select>`**: `BulkPriceModal`, `ProductsTable` (estado), `AppointmentForm`, `ProductForm` ×2, `ProductIvaField`, `ServiceRecordForm`, `BudgetGeneralSection` ×2, `BudgetStatusSelect`, `VehicleForm`, `IvaRateSelect`, `Reminders`. Varios usan `register` de react-hook-form (no controlados).
  - **8 `type="date"`**: `AppointmentForm` (con `showPicker()` al click), `ServiceRecordForm` ×2, `BudgetGeneralSection`, `Reminders` ×2 (filtro desde/hasta), `ServiceRecordFormPage` ×2. **2 `type="time"`** en `Settings` (horario por día).
  - **2 switches** a mano (`Header`: tema, con ícono sol/luna; `Settings`: día abierto). **2 checkboxes** en `ProductsTable` (cabecera con `indeterminate` por `ref` + filas). **1 tablist** en `CustomerHistoryCard`.
- `date-fns` 4 ya es dependencia. La app usa zona horaria Argentina (spec `zona-horaria`): las fechas de formulario son "fechas de calendario" sin hora.

## Goals / Non-Goals

**Goals:**
- Que no quede ningún `<select>`, `type="date|time"`, `type="checkbox"` ni `role="switch|tablist"` hecho a mano en `features/`, `pages/` y `layout/`.
- Fechas tipeables en `dd/mm/aaaa` con calendario opcional, y horas en `hh:mm`, con el mismo valor externo que hoy.
- Paridad visual en claro y oscuro con la línea base.

**Non-Goals:**
- Autocomplete de Base UI para `CustomerSearchInput`/`ProductSearchInput`, rangos de fechas, lista de horas, rediseños (ver proposal › Fuera de alcance).

## Decisions

### D1. Primitivas con `shadcn add --dry-run` primero
Para cada primitiva (`popover`, `calendar`, `switch`, `checkbox`, `tabs`): `npx shadcn@latest add <name> --dry-run` → revisar qué archivos escribe (en la fase 1 el `init` pisó `Button.jsx` por mayúsculas en macOS) → recién ahí `add` real. Después de cada `add`: `git status` y revertir cualquier cambio fuera de `ui/primitives/`, `package.json`/lock. Las clases shadcn (`bg-primary`, `text-primary-foreground`, `bg-secondary`) se reemplazan por tokens MD3 como en la fase 1 (CTA = `bg-primary-container text-on-primary`).
- Alternativa descartada: escribir las primitivas a mano. Perdemos la referencia shadcn para futuras actualizaciones.

### D2. `DateInput` (`@ui/DateInput`): máscara + Popover con Calendar
- API: `value` (`'yyyy-MM-dd'` o `''`), `onChange(iso | '')`, `onBlur`, `id`, `name`, `aria-labelledby`/`aria-label`, `error`, `disabled`, `min`, `max`, `placeholder='dd/mm/aaaa'`, `className`. Compatible con `Controller` (`field.value`, `field.onChange`, `field.onBlur`, `ref` al input).
- **Tipeo**: el input muestra `dd/mm/aaaa`. Máscara simple propia (sin librería): solo dígitos, las `/` se insertan solas, máximo 8 dígitos. Cuando hay 8 dígitos se parsea con `date-fns/parse` (`dd/MM/yyyy`) + `isValid`; si es válida y está dentro de `min`/`max` → `onChange(iso)`. Texto no vacío con fecha incompleta, inexistente o fuera de `min`/`max` → `onChange(INVALID_INPUT)` (constante `'invalid'` de `src/lib/maskedInput.js`) y, al salir del campo (`blur`), se marca inválido (`aria-invalid`) y el texto se mantiene para que el usuario lo corrija. Borrar todo → `onChange('')`.
- **Entrada inválida (decisión de la ronda de review)**: se eligió un valor distinguible en `onChange` en vez de una prop `onValidityChange`, porque (a) `Controller` captura `rules` una sola vez al montar, así que un `validate` que dependa de estado externo queda viejo, mientras que validar el propio valor es puro: `rules={{ validate: validInput() }}` → "Fecha inválida"; (b) un `reset()` a `''` cambia el valor (`'invalid'` → `''`) y el campo re-sincroniza su texto (con `''` como valor de un texto inválido el reset no tenía efecto y quedaba el texto viejo en rojo); (c) mientras se tipea una fecha parcial se emite `'invalid'` una sola vez (no `''` en cada tecla), así que `required` no salta a mitad de tipeo. `INVALID_INPUT` nunca llega al backend: los formularios lo bloquean con `validate` (atención, nueva atención, presupuesto, turno) y los filtros de Recordatorios no se aplican si alguna fecha es inválida (aviso "Revisá las fechas"). En el turno (`mode: 'onChange'`) el valor parcial se guarda con `setValue` sin validar y se limpia el error; se valida al salir del campo o al enviar.
- **Fecha de hoy por defecto**: `format(new Date(), 'yyyy-MM-dd')` (local), nunca `toISOString()` (UTC: a las 21 h de Argentina ya es el día siguiente).
- Sin conversión de zona horaria: se trabaja con fechas locales (`parse`/`format` de date-fns), igual que `type="date"`.
- **Calendario**: botón con ícono `CalendarDays` (lucide) a la derecha, dentro del borde del input, `aria-label="Abrir calendario"`. Abre un `Popover` de Base UI con el `Calendar` (react-day-picker v9, `mode="single"`, locale `es` de date-fns, semana desde lunes). Elegir un día → `onChange(iso)`, cierra y devuelve el foco al input. Mes inicial = el del valor, o el actual.
- El Popover se portea en `useDialogPortalContainer()` dentro de un `Dialog` (mismo patrón que listas de la fase 1) para que acepte clicks y Escape cierre solo el calendario.
- Alternativa descartada: solo calendario (más lento para cargar fechas conocidas, decisión del usuario) o `type="date"` estilado (no se controla el popup ni el formato).

### D3. `TimeInput` (`@ui/TimeInput`)
- API: `value` (`'HH:mm'` o `''`), `onChange`, `onBlur`, `id`, `aria-label(ledby)`, `error`, `disabled`, `className`. Máscara `hh:mm`, solo dígitos, `:` automático; válida si `00–23` y `00–59` → `onChange('HH:mm')`; texto no vacío inválido → `onChange(INVALID_INPUT)` + `aria-invalid` al salir (misma decisión que D2). En Configuración, un día abierto exige `from` y `to` `HH:mm` válidos (regla yup por día; vacío o inválido → "Completá desde y hasta con una hora válida (hh:mm)" y no se guarda).
- Comparte la lógica de máscara con `DateInput` en `src/lib/maskedInput.js` (funciones puras testeadas aparte).

### D4. `Switch` (`@ui/Switch`)
- Wrapper sobre `Switch` de Base UI: `checked`, `onCheckedChange`, `aria-label`, `disabled`, `size` (`sm|md`), `thumbContent` (nodo opcional dentro del thumb), `className` / `thumbClassName`.
- Dos estilos actuales: **Header** (track `surface-container-high` con borde, thumb `primary-container` chico con ícono sol/luna) y **Settings** (track `primary-container`/`outline`, thumb `surface-container`). Se exponen como `variant="theme"` y `variant="default"` para no repetir clases en los consumidores.

### D5. `Checkbox` (`@ui/Checkbox`)
- Wrapper sobre `Checkbox` de Base UI: `checked`, `indeterminate`, `onCheckedChange(bool)`, `disabled`, `aria-label`. Indicador con `Check`/`Minus` (lucide), caja 16 px con `border-outline-variant` y marcado `bg-primary-container text-on-primary` (mismo color que hoy `accent-primary`).
- La cabecera de `ProductsTable` deja de usar `ref.indeterminate`: pasa `indeterminate={someSelected && !allPageSelected}`.

### D6. `Tabs` (`@ui/Tabs`)
- Wrapper sobre `Tabs` de Base UI: `items [{ value, label, icon }]`, `value`, `onValueChange`, `children` (panel). Mismo estilo de pestañas con borde inferior (`border-primary text-primary` activa). Base UI aporta flechas izquierda/derecha, `aria-controls`/`aria-labelledby` y `tabpanel`.
- `CustomerHistoryCard` sigue renderizando solo el panel activo (no monta los demás, para no disparar sus queries).

### D7. `<select>` → `@ui/Select`
- Los usos con `register` pasan a `<Controller name=... render={({ field }) => <Select value={field.value} onChange={field.onChange} ... />} />`. Valores siempre string (como hoy en el DOM); los que se convertían con `valueAsNumber`/`setValueAs` mantienen la conversión en el submit o en `onChange`.
- Opción vacía ("Seleccionar…", "Estado…"): pasa a `placeholder`. Si el filtro necesita volver a "todos" (`ProductsTable` estado, `Reminders`), se agrega una opción explícita "Todos". El `@ui/Select` actual ignora `null`/`''` en `onValueChange`, así que "Todos" usa un valor centinela `'all'` que el consumidor mapea a `''`. Lo mismo para las opciones que vacían un campo opcional: "Sin proveedor", "Sin unidad" (`ProductForm`), "Sin vehículo" (`BudgetGeneralSection` → `vehicle_id: null`, `vehicle_description: ''`) y "Sin IVA" usan `'none'`.
- Valor que no está entre las opciones: el trigger muestra `String(value)` salvo que el consumidor pase `orphanLabel` (el presupuesto muestra `vehicle_description` de un vehículo que ya no está entre los del cliente).
- Etiquetas visibles: `<label id=… htmlFor={id del trigger}>` además de `aria-labelledby`, para que el click en la etiqueta active la lista.
- `IvaRateSelect`, `ProductIvaField` y `BudgetStatusSelect` mantienen su API pública y usan `@ui/Select` adentro (ajustando `ProductIvaField` a `Controller`).
- Ancho: el trigger recibe la misma clase de ancho que tenía el `<select>` (`w-full`, `shrink-0`, etc.).

### D8. Lint
`no-restricted-syntax` en `features/`, `pages/` y `layout/`: `JSXOpeningElement[name.name='select']` y `JSXAttribute[name.name='type'][value.value=/^(date|time|checkbox)$/]`, con mensaje que apunta al wrapper de `@ui`.

## Risks / Trade-offs

- [Controller cambia defaults/`reset()` de formularios con `register`] → tests de cada formulario: valor inicial al editar, `reset`, validación requerida y payload enviado.
- [Máscara: pegar texto, borrar con el cursor en el medio] → la máscara se recalcula sobre los dígitos del texto completo; tests de pegar `13/11/2026`, `13112026` y texto basura. Se acepta que el cursor salte al final al editar en el medio (trade-off por no sumar librería).
- [Usuarios acostumbrados al picker nativo] → el botón de calendario queda siempre visible.
- [react-day-picker en jsdom] → tests del Calendar solo de comportamiento (rol `grid`, click en día). Paridad visual en QA.
- [Valor centinela `'all'` en filtros] → mapeo en el consumidor con test (el request sale sin el parámetro).
- [Bundle] → react-day-picker ~15 kB gzip. Se compara `npm run build` contra `baseline/bundle.txt`.

## Migration Plan

1. Línea base visual (capturas) y bundle, antes de tocar código.
2. Primitivas + wrappers con sus tests.
3. Migrar consumidores por tipo (selects, fechas/horas, switch/checkbox/tabs), cada uno con sus tests.
4. Regla de lint, docs, QA de paridad. Deploy con push a `main`. **Rollback**: revert del commit (sin datos ni migraciones).

## Open Questions

- ~~Versión exacta de `react-day-picker` que instala el CLI~~ → **`react-day-picker` 10.0.2** (el registry de shadcn pide `@latest`; misma API que v9 para `DayPicker`/`getDefaultClassNames`, depende de `date-fns` 4 + `@date-fns/tz`). Locale `es` desde `react-day-picker/locale/es`.
- El CLI resolvió el alias `utils` como el paquete npm `cn` (`import { cn } from "cn"`) e instaló ese paquete: se desinstaló y las primitivas importan `@/lib/utils`. `calendar` sumó `primitives/button.jsx` (solo para el calendario; no es `@ui/Button`).
