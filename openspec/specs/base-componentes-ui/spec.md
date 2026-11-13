# base-componentes-ui Specification

## Purpose
TBD - created by archiving change shadcn-base-ui-fase-1. Update Purpose after archive.
## Requirements
### Requirement: Base shadcn/ui sobre Base UI
El frontend SHALL tener shadcn/ui configurado (`components.json`) con primitivas Base UI, en JavaScript, con las primitivas en `src/components/ui/primitives/` y el helper `cn` en `src/lib/utils.js`. Las features NO SHALL importar primitivas directamente: SHALL usar los wrappers de `@ui`.

#### Scenario: Configuración del CLI
- **GIVEN** el repo del frontend
- **WHEN** se lee `components.json`
- **THEN** tiene `tsx: false` y el alias `ui` apunta a `@/components/ui/primitives`

#### Scenario: Features sin primitivas directas
- **GIVEN** el código en `src/components/features/` y `src/pages/`
- **WHEN** se buscan imports de `@/components/ui/primitives` o `@ui/primitives`
- **THEN** no hay ninguno

#### Scenario: Helper cn
- **GIVEN** `cn('px-2', 'px-4', false && 'hidden')`
- **WHEN** se evalúa
- **THEN** devuelve `'px-4'`

### Requirement: Tokens de shadcn aliasados al design system
Los tokens que usan las primitivas de shadcn (`popover`, `card`, `muted`, `accent`, `border`, `input`, `ring`, `destructive`, `foreground`) SHALL resolverse a los tokens MD3 existentes de `index.css` en modo claro y oscuro. Los tokens existentes NO SHALL renombrarse ni cambiar de valor.

#### Scenario: Popover en modo oscuro
- **GIVEN** el tema oscuro activo
- **WHEN** se resuelve `--color-popover`
- **THEN** es igual a `--color-surface-container-highest`

#### Scenario: Popover en modo claro
- **GIVEN** el tema claro activo
- **WHEN** se resuelve `--color-popover`
- **THEN** es igual al valor claro de `--color-surface-container-highest`

#### Scenario: Tokens existentes intactos
- **GIVEN** el `index.css` después del change
- **WHEN** se comparan los valores de los tokens `--color-*` que existían antes
- **THEN** ninguno cambió

### Requirement: Paridad visual
Los diálogos, confirmaciones y listas migrados SHALL verse igual que antes de la migración (superficie, borde, radio, tipografía, colores de estado, tamaños) en tema claro y oscuro, en desktop 1440×900.

#### Scenario: Formulario de cliente
- **GIVEN** el formulario de nuevo cliente abierto en tema oscuro y en tema claro
- **WHEN** se compara con la captura de antes de la migración
- **THEN** no hay diferencias de color, radio, tamaño ni layout

#### Scenario: Lista desplegable
- **GIVEN** el filtro de categorías del listado de productos desplegado
- **WHEN** se compara con la captura de antes de la migración
- **THEN** la superficie, el borde, el ítem resaltado y los chips se ven igual

