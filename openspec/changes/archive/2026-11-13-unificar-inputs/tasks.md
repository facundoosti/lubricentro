## Frontend

## 1. Base: clases compartidas y componentes nuevos

- [x] 1.1 Relevar con grep los tests que dependen de clases de input (`h-11`, `inputClass`, `px-4`, `bg-surface-variant`) y anotarlos en este archivo para ajustarlos al migrar cada uno
  - `services/__tests__/ServiceForm.test.jsx`: exige `focus:outline-none` en cada campo → pasar a verificar que usan el estilo común (sin outline nativo vía `outline-none`)
  - `pages/__tests__/ServiceRecordFormPage.test.jsx`: con error exige `border-error` y no `border-outline-variant` (buscadores de cliente/vehículo, Autocomplete)
  - `appointments/__tests__/AppointmentForm.test.jsx`: `border-error` en Select, buscador de cliente y TimeInput
  - `customers/__tests__/CustomerSearchInput.test.jsx`: `border-tertiary` y `pr-16` en el input
  - `ui/__tests__/Autocomplete.test.jsx`, `Select.test.jsx`, `Combobox.test.jsx`: `border-error` con error
  - Ninguno depende de `h-11`, `px-4` ni `inputClass`
- [x] 1.2 Crear `components/ui/inputVariants.js` (cva, tamaños `default`/`sm`, error por `aria-invalid`) + test de Vitest de las clases por tamaño
- [x] 1.3 Crear `@ui/Input`, con test:
  - estilo default, `size="sm"`, override con `className` vía `cn`
  - `error` → `aria-invalid`
  - `startIcon` con `pl-9`
  - `ref` con react-hook-form
- [x] 1.4 Crear `@ui/Textarea` con `git mv` en dos pasos desde `TextArea.jsx` (choque de mayúsculas en macOS). Test: estilo, `rows`, `resize-none` por defecto, error, `ref`
- [x] 1.5 Crear `@ui/Field`, con test:
  - `getByLabelText` sin `id` explícito
  - `required` con `*`
  - `error` con `role="alert"` + `aria-invalid` en el hijo
  - `hint`
  - hijo con `id` propio
  - `labelId` para Select
- [x] 1.6 Documentar Input, Textarea y Field en `frontend/CLAUDE.md` (sección de `@ui`) y en `.claude/rules/frontend-ui.md`

## 2. Alinear controles existentes

- [x] 2.1 `primitives/select.jsx`: el trigger usa `inputVariants()` y conserva hover y estado abierto. Correr los tests de Select
- [x] 2.2 `DateInput` y `TimeInput`: `inputVariants({ size })` por defecto, combinado con `className`. Correr sus tests
- [x] 2.3 `Autocomplete`: `inputVariants` por defecto, combinado con `inputClassName`. Correr los tests de Autocomplete, CustomerSearchInput y ProductSearchInput

## 3. Migrar formularios en diálogo

- [x] 3.1 `CustomerForm` y `VehicleForm` → `Field` + `Input`. Borrar `utils/formStyles.js`. Correr sus tests
- [x] 3.2 `AppointmentForm` → `Field` + `Input` + `Textarea`; sacar `h-11 px-4` de DateInput y TimeInput. Correr sus tests
- [x] 3.3 `ServiceForm` → `Field` + `Input`/`Textarea`. Correr sus tests
- [x] 3.4 `ProductForm` → `Field` + `Input`/`Textarea`; quitar `inputClass`/`selectClass` locales. Correr sus tests
- [x] 3.5 `SupplierForm` → `Field` + `Input`; quitar `inputClass` local. Correr sus tests
- [x] 3.6 `BulkPriceModal` → `Input` (con prefijo `$`/`%` vía `startIcon` o un wrapper equivalente). Correr sus tests

## 4. Migrar páginas

- [x] 4.1 `Settings` + `InstallmentPlanForm` → `@ui/Field` + `Input`. Borrar `features/settings/SettingsField.jsx`. Correr los tests de settings y pages
- [x] 4.2 `ServiceRecordFormPage` → `Field` + `Input`/`Textarea`; quitar `fieldClass`. Correr sus tests
- [x] 4.3 `Login` → `Field` + `Input` (email, contraseña). Correr sus tests

## 5. Presupuestos e ítems

- [x] 5.1 `BudgetGeneralSection` → `Field` (quitar `labelClass` local) + `Input`/`Textarea`. Correr sus tests
- [x] 5.2 `ItemRow` → `Input size="sm"`; quitar `inputClass`. Correr los tests de items
- [x] 5.3 `ItemSearchInput` → `Input size="sm" startIcon={Search}`. Correr sus tests

## 6. Buscadores e inputs sueltos

- [x] 6.1 Buscadores de `CustomersTable`, `VehiclesTable`, `ProductsTable`, `ServicesTable`, `SuppliersTable` y `ServiceRecordsTable` → `Input startIcon={Search}`. Correr sus tests
- [x] 6.2 Buscadores de `Budgets`, `Reminders` y `CopyFromBudgetDialog` → `Input startIcon={Search}`. Correr sus tests
- [x] 6.3 `ConversationDetail` (Inbox) → `Textarea` con `ref`, conservando el autoajuste de alto. Correr sus tests

## 7. Cierre y regla de ESLint

- [x] 7.1 Agregar a `eslint.config.js` los selectores que rechazan `<textarea>` y `<input>` de texto (sin `type` o `text|number|email|password|search|tel|url`) en `features/`, `pages/` y `layout/`. Agregar un test de Vitest con `ESLint.lintText`: texto y sin type dan error; file y radio pasan
- [x] 7.2 Verificar con grep que no queden `inputClass`, `inputCls`, `fieldClass`, `formStyles`, `SettingsField` ni `@ui/TextArea`
- [x] 7.3 Correr `npm run lint` y `npx vitest run` completos en frontend, más `npm run build`

## 8. QA visual

- [x] 8.1 Escribir `openspec/changes/unificar-inputs/qa.md` (riesgo **alto**: toca todos los formularios). Casos TC-XX, cada uno con ejecutor (`vitest`/`script`) y combos dark/light a 1440×900:
  - estilos computados idénticos entre el diálogo de cliente y Configuración
  - fila mixta Input/Select/DateInput con el mismo alto en Turnos
  - buscadores de las 8 pantallas con el mismo alto y lupa
  - foco violeta
  - error en el formulario de cliente
  - ItemRow compacto
  - Login con autofill
  - textarea de Inbox
- [x] 8.2 Escribir el script `qa.mjs` y ejecutarlo con `/qa-visual` (`tools/qa-runner`, Brave headless)
- [x] 8.3 Revisar las capturas, auditar y corregir las fallas, y re-ejecutar solo los casos afectados hasta dejar todo en ✅
