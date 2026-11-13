## Context

Los campos de texto se arman con `<input>` nativos y clases copiadas en cada archivo. Las variantes que conviven hoy:

| Origen | Alto | Padding | Fondo | Foco | Usado en |
|---|---|---|---|---|---|
| `utils/formStyles.js` | 44px (`h-11`) | `px-4` | `surface-variant` | `ring-2 primary` | CustomerForm, VehicleForm |
| `SettingsField.inputCls` | ~38px | `px-3 py-2` | `surface-container` | borde `primary` | Settings, InstallmentPlanForm |
| `ServiceRecordFormPage.fieldClass` | ~38px | `px-3 py-2` | `surface-variant` | borde `primary` | ServiceRecordFormPage |
| `SupplierForm.inputClass` | ~40px | `px-3 py-2` | `surface-variant` | `ring-2 primary` | SupplierForm |
| `ProductForm.inputClass` | ~40px | `px-3 py-2` | (sin fondo) | `ring-2 primary` | ProductForm |
| `ItemRow.inputClass` | ~34px | `px-2 py-1.5` | `surface-variant` | borde `primary` | ItemRow |
| clases inline (`h-11 px-4`) | 44px | `px-4` | — | — | AppointmentForm (Date/TimeInput), BudgetGeneralSection |
| buscadores (inline) | variable | `pl-10` | variable | variable | 6 tablas, Budgets, Reminders, CopyFromBudget, ItemSearchInput |

También varía el label:
- `text-secondary` en Settings
- `font-medium text-on-surface` en formStyles y Budget

`@ui/Select` (trigger) ya usa `px-3 py-2 bg-surface-variant`, que es el estilo elegido. `DateInput`, `TimeInput` y `Autocomplete` reciben las clases de afuera (`className`/`inputClassName`).

El usuario eligió el estilo **compacto ~38px** como estándar, con alcance **completo** (formularios, Textarea, buscadores e inputs sueltos).

## Goals / Non-Goals

**Goals:**
- Una sola fuente de clases para los campos (`inputVariants`), consumida por Input, Textarea, el trigger de Select, DateInput, TimeInput y Autocomplete.
- `@ui/Field` con un único estilo de label y asociación automática label↔control.
- Migrar todos los usos y borrar las variantes locales.
- Una regla de ESLint que impida volver a escribir inputs nativos de texto.

**Non-Goals:**
- Cambiar validaciones, textos, orden o layout de los formularios.
- Inputs de archivo y radio.
- Migrar formularios a react-hook-form (los que usan `useState` siguen igual).

## Decisions

### 1. `inputVariants` con `cva` en `components/ui/inputVariants.js`
Va en un archivo aparte, igual que `primitives/button-variants.js`, para no romper `react-refresh/only-export-components`.

```js
export const inputVariants = cva(
  'w-full rounded-lg border bg-surface-variant text-on-surface placeholder:text-secondary transition-colors ' +
  'border-outline-variant outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'aria-invalid:border-error aria-invalid:focus-visible:ring-error/20',
  { variants: { size: { default: 'px-3 py-2 text-sm', sm: 'px-2 py-1.5 text-sm' } }, defaultVariants: { size: 'default' } },
);
```

- **Error por `aria-invalid`, no por clase condicional.** Un solo atributo sirve para el estilo y para la accesibilidad, y DateInput ya marca `aria-invalid` al salir del campo.
- **Foco con `focus-visible` + anillo `ring-2 ring-primary/20`.** Combina los dos estilos de foco existentes y coincide con `docs/DESIGN_SYSTEM.md`.
- **Alternativa descartada: un componente con `variant` por pantalla.** Perpetúa la divergencia que este change elimina.

### 2. `@ui/Input`
- Es `forwardRef`, porque React 19 permite `ref` como prop, pero el resto de `@ui` usa `forwardRef` y conviene ser consistente.
- Props:
  - `size` (el atributo nativo `size` casi no se usa; se documenta)
  - `error`, que se traduce a `aria-invalid`
  - `startIcon`
  - `className`, que se combina con `cn(inputVariants({ size }), className)`
- Con `startIcon` lo envuelve en un `div.relative` y suma `pl-9` (`pl-7` en `sm`). El ícono va en `absolute left-3`, `size-4`, `text-secondary`, `pointer-events-none`.
- `containerClassName` controla el ancho del wrapper (mismo patrón que DateInput).

### 3. `@ui/Textarea`
Usa las mismas `inputVariants`, más `resize-none` por defecto (`resize` lo habilita) y `rows` (default 3). Reemplaza a `@ui/TextArea` (viejo, solo lo usa AppointmentForm).

⚠️ En macOS, `TextArea.jsx` y `Textarea.jsx` chocan porque el sistema de archivos no distingue mayúsculas. Se hace `git mv` en dos pasos (`TextArea.jsx → TextareaTmp.jsx → Textarea.jsx`).

### 4. `@ui/Field`
```jsx
<Field label="Patente" required error={errors.plate?.message} hint="Sin espacios">
  <Input {...register('plate')} />
</Field>
```
- Hace `useId()`; si el hijo no tiene `id`, lo clona con `cloneElement` agregando `id`, más `error={!!error}` y `aria-describedby` apuntando al mensaje.
- **Alternativa descartada: context.** `cloneElement` alcanza porque el hijo es siempre un único control. También funciona con DateInput, TimeInput y Select porque todos aceptan `id`.
- Para controles que se etiquetan con `aria-labelledby` (Select, Combobox), `Field` expone `labelId` (`${id}-label`) en el `<label>`. El consumidor pasa `aria-labelledby` cuando el control no es un input.
- Label: `block text-sm font-medium text-on-surface mb-1`. El contenedor usa `space-y-1`.

### 5. Alineación de controles existentes
- `primitives/select.jsx` (trigger): reemplaza sus clases de caja por `inputVariants()` y conserva las propias (flex, `data-popup-open:border-primary`, hover).
- `DateInput`, `TimeInput` y `Autocomplete`: aplican `inputVariants({ size })` por defecto. `className`/`inputClassName` se siguen combinando con `cn`, así los usos actuales con `h-11 px-4` se limpian al migrar cada formulario.

### 6. Migración por áreas
1. **Dialogs:** Customer, Vehicle, Appointment, Service, Product, Supplier y BulkPrice.
2. **Pages:** Settings + InstallmentPlanForm, ServiceRecordFormPage, Login.
3. **Presupuestos e ítems:** BudgetGeneralSection, ItemRow (`size="sm"`), ItemSearchInput (`sm` + `startIcon`).
4. **Buscadores:**
   - las tablas Customers, Vehicles, Products, Services, Suppliers y ServiceRecords
   - Budgets, Reminders, CopyFromBudgetDialog
5. **Inbox:** el textarea de ConversationDetail. Conserva su autoajuste de alto, por eso se pasa `ref` y su `className` de alto.

Al terminar se borran `utils/formStyles.js`, `features/settings/SettingsField.jsx` y `ui/TextArea.jsx`.

### 7. Regla de ESLint
Se agregan selectores a `no-restricted-syntax` en el bloque existente de `features/`, `pages/` y `layout/`:
- `JSXOpeningElement[name.name='textarea']`
- `JSXOpeningElement[name.name='input']:not(:has(JSXAttribute[name.name='type']))`
- `JSXOpeningElement[name.name='input']:has(JSXAttribute[name.name='type'][value.value=/^(text|number|email|password|search|tel|url)$/])`

Se verifica con un test de ESLint (`RuleTester` o `ESLint.lintText` en Vitest) que cubre texto (error), sin type (error), file (ok) y radio (ok).

## Risks / Trade-offs

- **[Riesgo] Los diálogos bajan de 44 a 38px** y se ven más densos. → Fue la elección explícita del usuario. El QA visual compara antes y después.
- **[Riesgo] Tests que dependen de clases** (`h-11`, `inputClass`). → Se buscan con grep al inicio y se ajustan para que verifiquen comportamiento.
- **[Riesgo] `cloneElement` en Field con hijos que no reenvían `id`/`aria-describedby`.** → Input, Textarea, DateInput, TimeInput y Autocomplete los reenvían. Se cubre con tests de Field por tipo de hijo.
- **[Riesgo] Autofill de Chrome** pinta el fondo. → Ya hay una regla en `index.css` que respeta el tema; se verifica en QA (Login).
- **[Trade-off] Un solo tamaño default.** Formularios con mucho espacio podrían querer 44px. Si hace falta, se agrega `size="lg"` en `inputVariants` sin tocar los consumidores.
- **[Riesgo] Choque de mayúsculas `TextArea`/`Textarea` en macOS.** → `git mv` en dos pasos (decisión 3).
