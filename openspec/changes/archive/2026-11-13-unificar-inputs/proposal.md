## Why

Los campos de texto se ven distintos según la pantalla. Hoy hay unas 7 definiciones de clases de input copiadas a mano:
- `utils/formStyles.js`
- `ProductForm`, `SupplierForm`, `ServiceRecordFormPage`, `ItemRow`
- `SettingsField`, `BudgetGeneralSection`
- más los buscadores de cada tabla

Varían en alto (38 vs 44px), padding, fondo, foco y estilo de label, y la misma pantalla puede mezclar dos estilos (pasó en Configuración con los planes de cuotas). Cada formulario nuevo copia una variante distinta.

## What Changes

- **Nuevo `@ui/Input`.** Estilo compacto (~38px, `px-3 py-2`, `bg-surface-variant`, borde `outline-variant`, foco con borde + anillo suave violeta).
  - Tamaño `sm` (~34px) para filas densas (ítems).
  - Estado de error (`aria-invalid` + borde `error`).
  - Slot de ícono a la izquierda para buscadores.
  - `ref` reenviado, para que funcione con `register` de react-hook-form.
- **Nuevo `@ui/Textarea`.** Mismo estilo que el input, con alto por filas.
- **Nuevo `@ui/Field`.** Label + control + texto de ayuda o error. Asocia el label al control (`htmlFor`/`id` automático) y marca los obligatorios. El estilo de label es uno solo.
- **Alineación de controles existentes.** `@ui/DateInput`, `@ui/TimeInput`, `@ui/Autocomplete` y el trigger de `@ui/Select` toman el mismo alto, fondo y foco, desde una sola fuente de clases.
- **Migración de todos los formularios y buscadores:**
  - Clientes, Vehículos, Turnos, Servicios, Productos, Proveedores
  - Atención, Presupuesto, Ítems, Configuración y planes de cuotas
  - Login
  - Buscadores de tablas, Presupuestos, Recordatorios e Inbox
  - Precio por lote y copiar desde presupuesto
- **Se eliminan** `utils/formStyles.js`, `components/features/settings/SettingsField.jsx`, `@ui/TextArea` (componente viejo de plantilla) y las constantes `inputClass`/`inputCls`/`fieldClass` locales.
- **Regla de ESLint.** En `features/`, `pages/` y `layout/` se rechazan `<input>` de texto (sin `type`, o `text|number|email|password|search|tel|url`) y `<textarea>` nativos. Radio y file siguen permitidos.
- **Cambio visual:** los formularios en diálogo (Clientes, Vehículos, Turnos) bajan de 44px a ~38px por campo. Los labels pasan a un único estilo.

## Capabilities

### New Capabilities
- `campos-texto`: componentes `@ui/Input`, `@ui/Textarea` y `@ui/Field` como única forma de renderizar campos de texto. Cubre:
  - estilo, tamaños, error, ícono y asociación label↔control
  - alineación de DateInput/TimeInput/Autocomplete/Select
  - la regla de ESLint que impide inputs nativos de texto

### Modified Capabilities
<!-- Ninguna: los requisitos de controles-ui (Select, Switch, Checkbox, Tabs, fechas) no cambian de comportamiento; solo su estilo se alinea. -->

## Impact

- **Apps:** solo frontend. Sin backend, sin migraciones, sin cambios de API.
- **Código:**
  - Nuevos: `components/ui/Input.jsx`, `Textarea.jsx`, `Field.jsx` y un archivo de clases compartidas.
  - Se tocan unos 25 archivos de `features/` y `pages/`, más `DateInput`, `TimeInput`, `Autocomplete`, `primitives/select.jsx` y `eslint.config.js`.
- **Tests:** los tests existentes que buscan inputs por label o placeholder deberían seguir pasando. Los que dependan de clases CSS se ajustan.
- **Riesgo visual alto:** toca todos los formularios. Se valida con QA visual en dark y light a 1440×900.

## Fuera de alcance

- Inputs de archivo (`ImageUpload`, `PhotosUpload`, `ProductImportModal`) y radios (`CopyFromBudgetDialog`).
- Cambiar validaciones, textos o el comportamiento de cualquier formulario.
- Botones, Select, Switch, Checkbox y Tabs más allá de alinear alto, fondo y foco del trigger.
- Rediseñar el layout de los formularios (columnas, orden de campos).
- Backend.
