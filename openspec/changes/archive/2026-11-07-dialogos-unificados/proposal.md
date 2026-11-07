## Why

Hoy conviven cinco implementaciones de diálogo con comportamientos distintos: `FormDialog` (pila, foco, Escape solo del de arriba), `Modal.jsx` (sin pila, Escape cierra todos los abiertos, sin manejo de foco, `z-99999` fijo), y tres diálogos hechos a mano (`BulkPriceModal`, `ProductImportModal`, `ImageLightbox`) con su propio Escape, scroll lock y foco. Resultado: un `ConfirmModal` abierto sobre otro diálogo puede cerrar ambos con Escape, el click afuera borra datos en `BulkPriceModal`/`BulkIvaModal`, y con Tab el foco se escapa al contenido de atrás.

## What Changes

- Nueva primitiva compartida `useDialogLayer` (hook) que concentra: pila global de diálogos, nivel y z-index, Escape solo del de arriba (respetando `defaultPrevented`), captura y retorno de foco, scroll lock con restauración, **trampa de foco con Tab** e **`inert`** en lo que queda debajo (app y diálogos inferiores).
- `FormDialog` pasa a usar la primitiva (sin cambio visible).
- `Modal.jsx` se reescribe sobre la primitiva manteniendo su API y sumando `closeOnBackdrop` (default `true`). Afecta a `ConfirmModal` (8 páginas), `BulkIvaModal` y `CustomerCreatedDialog`.
- Click en el fondo: **cierra** en confirmaciones e informativos (`ConfirmModal`, `CustomerCreatedDialog`, `ImageLightbox`); **no cierra** en diálogos con datos cargados (`FormDialog`, `BulkIvaModal`, `BulkPriceModal`, `ProductImportModal`).
- `BulkPriceModal`, `ProductImportModal` e `ImageLightbox` migran a la primitiva y eliminan su lógica propia de Escape/scroll/foco. `ProductImportModal` sigue sin cerrarse (Escape ni ✕) mientras sube el archivo. `ImageLightbox` conserva las flechas ←/→.

## Capabilities

### New Capabilities
- `dialogos`: comportamiento común de todos los diálogos (apilado, Escape, foco, trampa de foco, contenido de fondo inerte, cierre por click en el fondo según tipo, scroll lock).

### Modified Capabilities
<!-- Ninguna: formularios-dialogo no cambia sus requirements; los nuevos se agregan en `dialogos`. -->

## Impact

- **Apps**: solo **frontend**. **Sin migraciones**, sin cambios de API.
- Código: nuevo `frontend/src/hooks/useDialogLayer.js`; `ui/FormDialog.jsx`, `ui/Modal.jsx`, `ui/ImageLightbox.jsx`, `features/products/{BulkPriceModal,ProductImportModal,BulkIvaModal}.jsx`, `features/customers/CustomerCreatedDialog.jsx` (si hace falta prop), `App.jsx` (contenedor `data-app-content` para `inert`), y Escape con `preventDefault` en `ui/SearchableSelect.jsx`, `ui/MultiSelectSearch.jsx` y `features/products/ProductSearchInput.jsx`. `ConfirmModal` sin cambios de API.
- Tests: `Modal.test.jsx`, `ConfirmModal.test.jsx`, `ImageLightbox.test.jsx`, `FormDialog.test.jsx` y tests de páginas que confirman borrados.

## Fuera de alcance

- Cambios visuales de los diálogos (tamaños, colores, layout) salvo el z-index.
- Aviso de "cambios sin guardar".
- Migrar el `BudgetPrint`/vistas de página completa.
- Reemplazar `SearchableSelect`/`SingleSelectSearch` por una primitiva flotante común.
