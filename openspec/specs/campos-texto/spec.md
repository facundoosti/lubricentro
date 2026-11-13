# campos-texto Specification

## Purpose
TBD - created by archiving change unificar-inputs. Update Purpose after archive.
## Requirements
### Requirement: Input común
La app SHALL tener un `Input` en `@ui` que renderiza un `<input>` con un único estilo compacto:
- alto ~38px, `px-3 py-2`, `text-sm`, `rounded-lg`
- `bg-surface-variant`, borde `outline-variant`, texto `on-surface`, placeholder `secondary`
- foco con borde `primary` y anillo `primary/20`
- deshabilitado con opacidad reducida

SHALL aceptar `size="sm"` (~34px, `px-2 py-1.5`) para filas densas. SHALL reenviar `ref` y todas las props nativas, para funcionar con `register` de react-hook-form. Las clases que recibe por `className` SHALL combinarse con `cn()` (tailwind-merge), de modo que un override de alto o padding reemplace al del componente.

#### Scenario: Estilo por defecto
- **GIVEN** un `Input` sin `size`
- **WHEN** se renderiza
- **THEN** el input tiene las clases del estilo compacto (`px-3`, `py-2`, `bg-surface-variant`, `border-outline-variant`)

#### Scenario: Tamaño chico
- **GIVEN** un `Input` con `size="sm"`
- **WHEN** se renderiza
- **THEN** el input usa `px-2 py-1.5` y no `px-3 py-2`

#### Scenario: Override de clases
- **GIVEN** un `Input` con `className="px-6"`
- **WHEN** se renderiza
- **THEN** el input tiene `px-6` y no `px-3`

#### Scenario: Funciona con react-hook-form
- **GIVEN** un formulario con `register('name')` aplicado a un `Input`
- **WHEN** el usuario escribe "Juan" y envía
- **THEN** el submit recibe `name: "Juan"`

### Requirement: Estado de error del input
`Input` y `Textarea` SHALL aceptar `error` (booleano). Con error, SHALL mostrar el borde `error` y exponer `aria-invalid="true"`.

#### Scenario: Campo inválido
- **GIVEN** un `Input` con `error`
- **WHEN** se renderiza
- **THEN** tiene `aria-invalid="true"` y la clase `border-error`

### Requirement: Ícono a la izquierda
`Input` SHALL aceptar `startIcon` (un ícono de Lucide). Cuando lo recibe, SHALL mostrarlo dentro del campo a la izquierda, sin capturar clicks, y SHALL dejar espacio para que el texto no lo pise. Los buscadores de la app SHALL usarlo.

#### Scenario: Buscador con lupa
- **GIVEN** un `Input` con `startIcon={Search}`
- **WHEN** se renderiza
- **THEN** el ícono se ve a la izquierda y el input tiene padding izquierdo para el ícono (`pl-9`)

### Requirement: Textarea común
La app SHALL tener un `Textarea` en `@ui` con el mismo estilo, foco, error y `ref` que `Input`. El alto SHALL depender de `rows`, y el textarea SHALL no ser redimensionable a mano salvo que se pase `resize`.

#### Scenario: Observaciones de un turno
- **GIVEN** el formulario de turno
- **WHEN** se renderiza el campo de observaciones
- **THEN** es un `Textarea` con fondo `bg-surface-variant` y borde `outline-variant`, igual que los inputs del formulario

### Requirement: Field con label asociado
La app SHALL tener un `Field` en `@ui` que agrupa label, control y mensaje:
- **Label:** `text-sm font-medium text-on-surface`. Si el campo es obligatorio (`required`), SHALL mostrar un `*` en `text-error`.
- **Asociación:** SHALL asociar el label al control. Si `Field` no recibe `id`, SHALL generar uno con `useId` y pasárselo a su hijo, para que `getByLabelText(label)` encuentre el control.
- **Error:** si recibe `error` (texto), SHALL mostrarlo debajo en `text-xs text-error` con `role="alert"`, y SHALL marcar el control con `error`.
- **Ayuda:** si recibe `hint` y no hay error, SHALL mostrar el hint en `text-xs text-on-surface-variant`.

#### Scenario: Label asociado sin id explícito
- **GIVEN** `<Field label="Patente"><Input /></Field>`
- **WHEN** se renderiza
- **THEN** `getByLabelText('Patente')` devuelve el input

#### Scenario: Mensaje de error
- **GIVEN** `<Field label="Email" error="Email inválido"><Input /></Field>`
- **WHEN** se renderiza
- **THEN** se ve "Email inválido" con `role="alert"` y el input tiene `aria-invalid="true"`

#### Scenario: Campo obligatorio
- **GIVEN** `<Field label="Nombre" required><Input /></Field>`
- **WHEN** se renderiza
- **THEN** el label muestra un `*` después del texto

### Requirement: Controles alineados al mismo estilo
El trigger de `@ui/Select` y los inputs de `@ui/DateInput`, `@ui/TimeInput` y `@ui/Autocomplete` SHALL tomar alto, padding, fondo, borde y foco de la misma fuente de clases que `Input`. En una misma fila, un `Input`, un `Select` y un `DateInput` SHALL medir el mismo alto.

#### Scenario: Fila mixta en el formulario de turno
- **GIVEN** el formulario de turno con fecha (`DateInput`), hora (`TimeInput`) y un `Select`
- **WHEN** se renderiza a 1440×900
- **THEN** los tres controles miden el mismo alto (±1px) y tienen el mismo color de fondo

### Requirement: Todos los formularios y buscadores usan los componentes comunes
Todos los campos de texto, número, email, contraseña, búsqueda y textarea de `features/`, `pages/` y `layout/` SHALL renderizarse con `@ui/Input`, `@ui/Textarea` y `@ui/Field`, salvo los inputs de archivo y radio. No SHALL quedar constantes locales de clases de input (`inputClass`, `inputCls`, `fieldClass`) ni `utils/formStyles.js`.

#### Scenario: Mismo estilo en diálogo y en página
- **GIVEN** el input "Nombre completo" del diálogo de cliente y el input "Nombre del Lubricentro" de Configuración
- **WHEN** se comparan sus estilos computados
- **THEN** coinciden alto, padding, fondo, borde, radio y tamaño de fuente, y también el color del label

#### Scenario: Buscadores de tablas
- **GIVEN** los buscadores de Clientes, Vehículos, Productos, Servicios, Proveedores, Atenciones, Presupuestos y Recordatorios
- **WHEN** se renderizan
- **THEN** todos tienen el mismo alto, fondo y posición del ícono de lupa

### Requirement: ESLint impide inputs de texto nativos
Una regla de ESLint (`no-restricted-syntax`) SHALL rechazar en `features/`, `pages/` y `layout/`:
- `<textarea>`
- `<input>` sin `type`, o con `type` `text|number|email|password|search|tel|url`

`<input type="radio|file|hidden">` SHALL seguir permitido.

#### Scenario: Input nativo de texto
- **GIVEN** un archivo en `features/` con `<input type="text" />`
- **WHEN** se corre `npm run lint`
- **THEN** ESLint reporta un error que sugiere `@ui/Input`

#### Scenario: Input de archivo permitido
- **GIVEN** un archivo en `features/` con `<input type="file" />`
- **WHEN** se corre `npm run lint`
- **THEN** ESLint no reporta error por ese input

