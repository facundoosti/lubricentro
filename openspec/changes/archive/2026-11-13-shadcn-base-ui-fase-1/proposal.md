## Why

Las primitivas de UI interactivas (diálogos y listas desplegables) están hechas a mano: `useDialogLayer` reimplementa pila, foco, Escape, `inert` y scroll lock, y hay **tres** selects con buscador casi idénticos (`SingleSelectSearch`, `SearchableSelect`, `MultiSelectSearch`, ~740 líneas). Varios bugs recientes vinieron de ahí (Escape, foco, posicionamiento, X del autocomplete). Adoptar **shadcn/ui sobre Base UI** delega ese comportamiento en una librería accesible y mantenida, y permite unificar componentes duplicados, **sin cambiar el diseño visual actual**.

Esta es la **fase 1** de 2. La fase 2 (otro change) migra los `<select>` nativos, los inputs de fecha/hora (input tipeable + calendario) y Switch/Checkbox/Tabs.

## What Changes

- Instalar shadcn/ui (CLI, instalación Vite, **JavaScript sin TS**, primitivas **Base UI**) con `components.json`, `jsconfig.json`, helper `cn` (`clsx` + `tailwind-merge`).
- **Capa de alias de tokens**: las variables que espera shadcn (`--color-popover`, `--color-muted`, `--color-ring`, `--color-accent`, …) apuntan a los tokens MD3 existentes de `index.css`, en modo claro y oscuro. No se renombra ningún token existente.
- Primitivas shadcn copiadas en `src/components/ui/primitives/` (archivos en minúscula, separados de los wrappers para evitar choques de mayúsculas en macOS).
- **Nuevo `Combobox`** (`@ui/Combobox`) único, simple y múltiple, con búsqueda remota (`onSearch`), `loading` y `clearable`. **BREAKING (interno)**: se eliminan `SingleSelectSearch`, `MultiSelectSearch` y `SearchableSelect`.
- **Nuevo `Select`** (`@ui/Select`) para listas sin búsqueda; reemplaza los 2 usos de `SearchableSelect` con `searchable={false}` (hora y estado del turno).
- **Nuevo `Dialog`** (`@ui/Dialog`) único que unifica `Modal` y `FormDialog` (variantes de tamaño, modo formulario con header/footer fijos, apilado). **BREAKING (interno)**: se eliminan `Modal` y `FormDialog`.
- **`ConfirmModal` → `ConfirmDialog`** sobre AlertDialog de Base UI.
- `BulkPriceModal`, `ProductImportModal` e `ImageLightbox` dejan de usar `useDialogLayer` y pasan al nuevo `Dialog`. **Se elimina `useDialogLayer`** y sus tests.
- Se mantienen todos los comportamientos de las specs `dialogos` y `formularios-dialogo`. Solo cambia cómo se garantiza que el fondo quede inerte (lo hace Base UI, no el atributo en `[data-app-content]`).

## Capabilities

### New Capabilities
- `listas-seleccion`: comportamiento común de las listas de selección (Combobox simple/múltiple con búsqueda y Select sin búsqueda): teclado, Escape dentro de diálogos, limpiar, búsqueda remota, accesibilidad.
- `base-componentes-ui`: base de shadcn/Base UI y paridad visual (tokens aliasados, tema claro/oscuro, sin cambios de diseño).

### Modified Capabilities
- `dialogos`: la pila y el fondo inerte se garantizan por comportamiento (no por el atributo `inert` en `[data-app-content]`); `ConfirmModal` pasa a llamarse `ConfirmDialog`.
- `formularios-dialogo`: los formularios usan el `Dialog` unificado (mismo layout, tamaños y apilado).

## Impact

- **Apps**: solo **frontend**. Sin backend, sin migraciones, sin cambios de API.
- **Dependencias nuevas**: `@base-ui-components/react` (o el paquete vigente de Base UI que instale el CLI), `clsx`, `tailwind-merge`, `class-variance-authority`.
- **Archivos**: `src/index.css`, `src/components/ui/*` (nuevos `Dialog`, `ConfirmDialog`, `Combobox`, `Select`, `primitives/`; se borran 6 componentes y `useDialogLayer`), unos 20 consumidores en `features/` y `pages/`, y sus tests.
- **Riesgo**: los autocompletes asíncronos `CustomerSearchInput` y `ProductSearchInput` usan su propio portal. Tienen que seguir funcionando dentro del `Dialog` (clic y Escape).

## Fuera de alcance

- `<select>` nativos (13), inputs `date`/`time` (10), Switch, Checkbox y Tabs → **fase 2**.
- Migrar `CustomerSearchInput` / `ProductSearchInput` a Autocomplete de Base UI → candidato para la fase 2 (en esta fase solo se garantiza que sigan funcionando).
- `Table`, `Pagination`, `Button`, `Badge`, `InputField`, `TextArea`.
- Toasts (Sileo), ApexCharts, FullCalendar.
- Cualquier cambio de diseño visual (colores, tamaños, tipografía).
