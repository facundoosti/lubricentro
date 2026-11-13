## Context

- Frontend React 19 + Vite 6 + Tailwind v4, en **JavaScript** (sin TS). Tokens MD3 en `src/index.css` dentro de `@theme` (valores dark) con override `:root:not(.dark)` para el modo claro.
- Diálogos: `Modal` (3 consumidores, incluido `ConfirmModal`), `FormDialog` (7), y 3 diálogos armados a mano sobre `useDialogLayer` (`BulkPriceModal`, `ProductImportModal`, `ImageLightbox`). `useDialogLayer` implementa pila global, z-index por nivel, Escape del de arriba, trampa y retorno de foco, `inert` en `[data-app-content]` y scroll lock.
- Listas: `SingleSelectSearch` (ProductForm, categoría con búsqueda remota), `MultiSelectSearch` (3 filtros de ProductsTable con búsqueda remota) y `SearchableSelect` (AppointmentForm: hora y estado, ambos con `searchable={false}`). Mucho código duplicado (keyframes, Escape, posicionamiento).
- `CustomerSearchInput` / `ProductSearchInput` son autocompletes asíncronos con portal propio (`useFloatingPosition`) y z-index calculado "por encima de cualquier FormDialog apilado".
- Specs vigentes a respetar: `openspec/specs/dialogos`, `openspec/specs/formularios-dialogo`.

## Goals / Non-Goals

**Goals:**
- Base shadcn/ui + Base UI instalada y documentada, lista para la fase 2.
- Paridad visual: mismas superficies, bordes, radios, tamaños, tipografía y estados en claro y oscuro.
- Un solo `Dialog`, un `ConfirmDialog`, un `Combobox` y un `Select`, y que se borre el código hecho a mano (`useDialogLayer` y los 6 componentes).
- Mantener todos los escenarios de `dialogos` y `formularios-dialogo`.

**Non-Goals:**
- Rediseñar nada. Migrar `<select>` nativos, fechas/horas, Switch/Checkbox/Tabs (fase 2).
- Reescribir `CustomerSearchInput` / `ProductSearchInput` (solo se adaptan para que sigan funcionando).

## Decisions

### D1. shadcn con Base UI, JS, primitivas en `ui/primitives/`
- `npx shadcn@latest init` con primitivas **Base UI**, `tsx: false`, `cssVariables: true`, `baseColor: zinc`. Alias en `components.json`: `ui → @/components/ui/primitives`, `utils → @/lib/utils`.
- `jsconfig.json` con `paths: { "@/*": ["./src/*"] }` (el CLI lo necesita; Vite ya tiene los alias).
- **Por qué `primitives/`**: shadcn genera `dialog.jsx` / `select.jsx` en minúscula, y en macOS (case-insensitive) chocaría con los wrappers `Dialog.jsx` / `Select.jsx`. Las primitivas quedan como código "vendor" casi sin tocar; los wrappers de `@ui/` son la API que usan las features.
- Alternativa descartada: usar las primitivas directo en las features. Es más acoplado y repetiría la composición (header/footer, tamaños) en cada consumidor.
- `cn()` en `src/lib/utils.js` (`clsx` + `tailwind-merge`).

### D2. Alias de tokens, sin renombrar
En `index.css` se agrega un bloque `@theme inline` que mapea los nombres de shadcn a los tokens existentes. Como los valores apuntan con `var()` a los tokens MD3, el override de modo claro se hereda solo:

| shadcn | token existente |
|---|---|
| `--color-background` / `--color-foreground` | ya existe / `var(--color-on-surface)` |
| `--color-popover` / `--color-popover-foreground` | `surface-container-highest` / `on-surface` |
| `--color-card` / `--color-card-foreground` | `surface-container` / `on-surface` |
| `--color-muted` / `--color-muted-foreground` | `surface-container-high` / `on-surface-variant` |
| `--color-accent` / `--color-accent-foreground` | `surface-container-high` / `on-surface` |
| `--color-primary-foreground` | `on-primary` |
| `--color-destructive` | `error` |
| `--color-border` / `--color-input` | `outline-variant` |
| `--color-ring` | `primary` |

- ⚠️ `--color-primary` y `--color-secondary` **ya existen con otro significado** (MD3). No se redefinen. Al copiar cada primitiva se revisan sus clases (`bg-primary`, `bg-secondary`, `text-primary-foreground`) y se ajustan a los tokens del design system (por ejemplo, CTA = `bg-primary-container text-on-primary`), como hacen hoy `Button` y `.claude/rules/frontend-ui.md`.
- El `init` de shadcn reescribe `index.css`: **se descarta lo que inyecte** y se agrega solo el bloque de alias a mano.

### D3. `Dialog` unificado (`@ui/Dialog`)
Wrapper sobre `Dialog` de Base UI con la API actual de `FormDialog` + `Modal`:
- Props: `isOpen`, `onClose`, `title`, `subtitle`, `icon`, `size` (`sm|md|lg|xl|full`), `closeOnBackdrop` (default `false` para formularios, `true` para informativos), `closeOnEscape`, `showCloseButton`, `ariaLabel`, `children`.
- Modo formulario: `formId`, `submitLabel`, `isLoading`, `submitDisabled` → renderiza header y footer fijos (Cancelar/Guardar), igual que hoy `FormDialog`.
- Modo libre: sin `formId`, el `children` controla el contenido (para `CustomerCreatedDialog`, `BulkIvaModal`, `BulkPriceModal`, `ProductImportModal`).
- `ImageLightbox` usa `Dialog` con `size="full"` y un `className` propio (fondo oscuro, sin padding).
- **Apilado**: Base UI expone `data-nested` / `data-nested-dialog-open`. Con eso se replica el diálogo apilado más angosto (`max-w-xl`) y el fondo más oscuro, sin calcular z-index a mano.
- `closeOnBackdrop=false` → `disablePointerDismissal`. `closeOnEscape=false` → `onOpenChange` ignora el motivo `escape-key` (import en curso).
- Alternativa descartada: mantener `Modal` y `FormDialog` por separado cambiando solo el interior. Se mantendría la duplicación que este change quiere eliminar.

### D4. `ConfirmDialog` sobre AlertDialog
Misma API que `ConfirmModal` (`onConfirm`, `title`, `message`, `confirmText`, `cancelText`, `variant`, `isLoading`). Se renombra porque deja de depender de `Modal`. Mantiene el cierre con click en el fondo, que pide la spec `dialogos`.

### D5. `Combobox` único (`@ui/Combobox`)
Wrapper sobre `Combobox` de Base UI:
- Props: `options [{value,label}]`, `value`, `onChange`, `multiple` (bool), `onSearch` (búsqueda remota con debounce; si no hay, filtra local), `loading`, `clearable`, `placeholder`, `disabled`, `error`, `id`, `aria-labelledby`, `className`.
- `multiple` muestra chips como hoy `MultiSelectSearch`. Con `onSearch` se desactiva el filtrado local (`filter={null}`) porque filtra el backend.
- La lista va en el portal de Base UI, que se integra con la pila del `Dialog` (clic usable y Escape cierra solo la lista).
- **Scroll (cambia respecto de antes):** el Positioner de Base UI no cierra la lista al scrollear la página: la reposiciona pegada al trigger (`autoUpdate` sobre los ancestros con scroll). Scrollear la propia lista tampoco la cierra (igual que antes). Antes, scrollear la página la cerraba. Es no modal (`modal=false`): la página sigue scrolleando con la lista abierta. Tests: `Combobox.test.jsx` / `Select.test.jsx` ("scroll con la lista abierta"); el reposicionamiento real se ve en QA (jsdom no tiene layout).

### D6. `Select` sin búsqueda (`@ui/Select`)
Wrapper sobre `Select` de Base UI. Props: `options`, `value`, `onChange`, `placeholder`, `disabled`, `error`, `id`, `aria-labelledby`, `className`. Reemplaza los 2 usos de `SearchableSelect` con `searchable={false}`. En la fase 2 se usa para los `<select>` nativos. Mismo comportamiento de scroll que D5 (`modal={false}`: no se cierra al scrollear la página ni la lista; se reposiciona).

### D7. Autocompletes asíncronos existentes
`CustomerSearchInput` y `ProductSearchInput` siguen con su portal, que se renderiza en `document.body`. Con un `Dialog` modal de Base UI, lo de afuera del popup puede quedar no interactuable o con `aria-hidden`. Mitigación: exponer desde `@ui/Dialog` un contexto `DialogPortalContainer` (el nodo del popup) y que esos dos componentes porteen su lista ahí cuando están dentro de un diálogo. Se elimina el z-index "50 + nivel × 10".

## Risks / Trade-offs

- [El CLI de shadcn sobrescribe `index.css` o crea archivos `.tsx`] → correrlo con `tsx: false` y revisar el diff. Se revierte lo que no sean primitivas, `components.json`, `jsconfig.json` y `lib/utils.js`.
- [Diferencias visuales sutiles (radios, sombras, animaciones de shadcn)] → los wrappers fijan las clases actuales. Se agregan casos de QA visual por componente en claro y oscuro.
- [Base UI en jsdom (Vitest): animaciones, `getAnimations`, `ResizeObserver`] → agregar los polyfills mínimos en `src/test/setup.js`. Los tests prueban comportamiento (rol, foco, Escape), no animaciones.
- [Escape dentro del `Combobox` o de los autocompletes cierra también el `Dialog`] → hay escenarios de spec y tests de Vitest explícitos (heredados de los tests actuales de `*SelectSearch`).
- [Spec "Contenido de fondo inerte" asume `inert` en `[data-app-content]`] → se modifica la spec para exigir el comportamiento (el fondo no recibe foco ni clicks), no el mecanismo.
- [Bundle más grande] → Base UI es tree-shakeable. Se compara `npm run build` antes y después y se anota la diferencia en el PR/commit.

## Migration Plan

1. Base (deps, `components.json`, alias de tokens, `cn`), sin cambiar comportamiento.
2. `Dialog` + `ConfirmDialog`. Migrar consumidores de a uno con sus tests. Al final, borrar `Modal`, `FormDialog`, `ConfirmModal` y `useDialogLayer`.
3. `Combobox` + `Select`. Migrar ProductForm, ProductsTable y AppointmentForm. Borrar los 3 `*SelectSearch` y `useFloatingPosition` si queda sin uso.
4. QA visual. Deploy normal con push a `main`. **Rollback**: revert del commit, porque no hay datos ni migraciones.

## Open Questions

- ~~Nombre exacto del paquete de Base UI que instala el CLI vigente~~ **Resuelto**: `shadcn@4.23.0 init -t vite -b base -p nova` instala **`@base-ui/react` 1.9.0**.
  - El `init` además agregó `cn` (paquete npm), `shadcn`, `tw-animate-css` y `@fontsource-variable/geist`, reescribió `index.css` y **pisó `src/components/ui/Button.jsx`** (macOS case-insensitive con su `button.jsx`). Se revirtió todo eso: quedan `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `components.json` (style `base-nova`, `baseColor: zinc`, `ui → @/components/ui/primitives`), `jsconfig.json` y `src/lib/utils.js` (reescrito con `clsx` + `tailwind-merge`).
  - Sin `tw-animate-css`: las clases `animate-in`/`fade-in` de las primitivas no generan CSS (los diálogos actuales no animan, así se mantiene la paridad).
