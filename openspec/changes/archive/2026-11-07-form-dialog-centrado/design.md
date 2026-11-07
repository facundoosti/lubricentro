## Context

- `frontend/src/components/ui/SlideOver.jsx` es el contenedor de todos los formularios de alta/edición. Ya resuelve: pila de paneles abiertos (`openStack` a nivel de módulo), Escape solo para el de arriba, foco inicial y retorno de foco, bloqueo de scroll del body, portal a `body`, `role="dialog"` + `aria-modal`, footer con Cancelar/Guardar ligado al form vía `formId`.
- API pública usada por los 6 `*Modal.jsx`: `isOpen, onClose, title, subtitle, icon, formId, submitLabel, isLoading, size, submitDisabled, children`. Solo `ProductModal` pasa `size="xl"`.
- Los `*Form.jsx` ya usan `grid-cols-1 md:grid-cols-2` (y `ProductForm` `grid-cols-2`); algunos textareas no tienen `md:col-span-2`.
- Apilado real hoy: `VehicleForm` renderiza `CustomerModal` (alta rápida de cliente) dentro del formulario de vehículo.
- Existe un `Modal.jsx` genérico (usado por `ConfirmModal`, `BulkIvaModal`, `CustomerCreatedDialog`) sin pila ni manejo de foco; queda fuera de alcance.

## Goals / Non-Goals

**Goals:**
- Formularios en modal centrado de ~768px, sin scroll en 1440×900 para los formularios actuales.
- Cerrar solo por acción explícita (✕, Cancelar, Escape).
- Apilado visualmente distinguible (segundo modal más chico y fondo más oscuro).
- Cambio contenido: misma API de props para que los `*Modal.jsx` cambien solo el import/nombre.

**Non-Goals:**
- Unificar con `Modal.jsx`.
- Aviso de cambios sin guardar.
- Layout mobile/tablet específico (se mantiene `w-full` con margen, sin QA).

## Decisions

1. **Nuevo `FormDialog.jsx` que reemplaza a `SlideOver.jsx` (se borra el viejo).**
   Mantiene la misma API de props y la lógica de pila/foco/Escape. Se renombra porque "SlideOver" describiría mal el comportamiento.
   *Alternativa*: extender `Modal.jsx` → descartada, le faltan pila, foco y footer de formulario; mezclarlo ampliaría el alcance.

2. **Layout**: overlay `fixed inset-0 flex items-center justify-center p-4`; panel `w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl`; header y footer `shrink-0`; body `flex-1 overflow-y-auto`. Footer `flex justify-end gap-3` con botones de ancho natural.
   El prop `size` se conserva con mapa nuevo (`md`→`max-w-2xl`, `lg`/`xl`→`max-w-3xl`) y default `lg`, así ningún modal queda más angosto de lo pedido. `ProductModal` puede dejar de pasar `size`.

3. **Click en el fondo no cierra.** Se elimina el `div` de overlay con `onClick={onClose}`. Cierre solo por ✕, Cancelar y Escape (este último solo para el diálogo de arriba de la pila).
   *Alternativa*: confirmar si hay cambios sin guardar → requiere conocer el estado "dirty" de cada form (react-hook-form vive dentro de cada `*Form`); fuera de alcance.

4. **Apilado por profundidad.** Al abrir, el diálogo toma su nivel = posición en `openStack`. Nivel ≥ 1: panel `max-w-xl`, backdrop `bg-black/70` y `z-index` mayor que el de abajo (ej. `z-50` + nivel*10 vía style). El de abajo sigue visible detrás.
   *Alternativa*: alta de cliente inline en `VehicleForm` → descartada por el usuario (más cambio de lógica).

5. **Accesibilidad**: `aria-labelledby` apuntando al `h2` del título (en vez de `aria-label`), `aria-describedby` al subtítulo si existe. Sin trampa de foco nueva (no existe hoy; se anota como pendiente si el review lo pide).

6. **Textareas a ancho completo**: agregar `md:col-span-2` a los contenedores de textarea en `ProductForm`, `ServiceForm` (y revisar `AppointmentForm`, `CustomerForm`). `SupplierForm` y `VehicleForm` ya lo tienen.

7. **`ServiceRecordModal.jsx` se borra** (sin referencias; verificar con codegraph/grep antes).

8. **Listas desplegables en portal** (surgió en QA, TC-10). El cuerpo con `overflow-y-auto` recortaba la lista de `CustomerSearchInput` en Vehículo. La lista se renderiza en portal a `body` con `position: fixed`, `z-index` 9999, se reposiciona en scroll/resize y abre hacia arriba si abajo no entra (mismo enfoque que `SearchableSelect`). `SingleSelectSearch` (Categoría) queda dentro del cuerpo porque tiene lugar.

9. **Escape y componentes hijos** (surgió en review). Un hijo con lista abierta hace `preventDefault()` en Escape y cierra solo su lista; `FormDialog` ignora los eventos con `defaultPrevented`. Aplicado en `CustomerSearchInput` y `SingleSelectSearch`. Además, el foco previo se captura en el render en que `isOpen` pasa a true (antes de que un `autoFocus` hijo lo tome).

## Risks / Trade-offs

- [Tests que buscan markup del SlideOver o cierran con click en overlay] → actualizar `SlideOver.test.jsx` → `FormDialog.test.jsx` y correr toda la suite de Vitest.
- [Formulario de Producto (8 campos + imágenes) puede superar 90vh] → body con `overflow-y-auto`; se valida en QA a 1440×900.
- [Usuarios acostumbrados a cerrar con click afuera] → mejora intencional para no perder datos; Escape sigue disponible.
- [z-index del diálogo apilado vs. dropdowns dentro del modal] → **mitigado**: lista de clientes en portal (decisión 8); validado en QA TC-10.

## Migration Plan

Solo frontend, sin migraciones. Deploy normal; rollback = revertir el commit.
