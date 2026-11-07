## 1. Frontend — Componente FormDialog

- [x] 1.1 Crear `frontend/src/components/ui/FormDialog.jsx` con la misma API que `SlideOver` (pila, Escape del de arriba, foco, scroll lock, portal), layout centrado `max-w-3xl max-h-[90vh]`, header/footer fijos y footer alineado a la derecha; test `FormDialog.test.jsx` (render, `aria-labelledby`, Guardando...)
- [x] 1.2 Quitar el cierre por click en el fondo; tests: click en fondo no llama `onClose`, ✕/Cancelar/Escape sí
- [x] 1.3 Apilado por profundidad (nivel ≥ 1: más angosto, fondo más oscuro, z-index mayor); tests: dos diálogos abiertos, Escape cierra solo el de arriba y el de arriba tiene clase de ancho menor
- [x] 1.4 Migrar `SlideOver.test.jsx` al nuevo componente y borrar `SlideOver.jsx` + su test

## 2. Frontend — Migración de formularios

- [x] 2.1 Reemplazar `SlideOver` por `FormDialog` en `CustomerModal`, `VehicleModal`, `ProductModal`, `ServiceModal`, `SupplierModal`, `AppointmentModal`; correr sus tests y los de las páginas que los abren
- [x] 2.2 Agregar `md:col-span-2` a los textareas que no lo tienen (`ProductForm`, `ServiceForm` y revisar `AppointmentForm`/`CustomerForm`); ajustar tests si dependen del markup
- [x] 2.3 Verificar que `ServiceRecordModal.jsx` no tiene referencias y borrarlo (con su test si existe)

## 3. QA visual

- [x] 3.1 Escribir los casos `TC-XX` en `openspec/changes/form-dialog-centrado/qa.md` (1440×900, claro/oscuro): apertura centrada de cada formulario, sin scroll, textarea a ancho completo, click en fondo no cierra, apilado cliente sobre vehículo, Escape en pila, dropdowns de `SearchableSelect` no cortados
- [x] 3.2 Ejecutar con `/qa-visual` (`tools/qa-runner` + Brave) y corregir los hallazgos

## 4. Cierre

- [x] 4.1 Correr `npm run lint` y `npx vitest run` completos en `frontend/` en verde
