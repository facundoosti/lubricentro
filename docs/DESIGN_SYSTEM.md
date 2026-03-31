# Design System — Sistema Lubricentro

Basado en los mockups de Stitch (Proyecto `16249564755482626509`). Dark-first, Material Design 3 inspired.

---

## Pantallas de referencia

| Pantalla | ID Stitch |
|---|---|
| Panel de Control | `ffdd013f0b724145945b69523fa0d4c8` |
| Lista de Clientes | `f371bc4fd4ea4f3ca9c2e4404dc71c0b` |
| Detalle del Cliente | `88004cf4c6b94059bac7655b81faa554` |
| Vehículos | `3d7fac9187fc4c7995512c887082d22b` |
| Turnos | `fa5b0dd6a80c4bed954a8f269194bce4` |
| Historial de Atenciones | `f1dd53cd13844bdcaa9fd3978737c541` |
| Presupuestos | `80e71511809240fcb9ab60b6de425255` |
| Inventario y Catálogo | `3b378dbb3bc047d48c27164b67103e5d` |

---

## Tipografía

| Token | Valor |
|---|---|
| Font family | **Geist** (Google Fonts) |
| Roles | `headline`, `body`, `label` — todos Geist |

```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap" rel="stylesheet"/>
```

---

## Iconografía

Material Symbols Outlined (Google Fonts).

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

> En la app React se usa **Lucide React** como equivalente hasta que se migre a Material Symbols.

---

## Paleta de colores

Sistema semántico oscuro (dark-only). Todos los valores viven en `index.css` como CSS variables de Tailwind v4.

### Fondos / Superficies

| Token CSS | Clase Tailwind | Hex | Uso |
|---|---|---|---|
| `--color-background` | `bg-background` | `#09090b` | Fondo general de la app (`<body>`, `<html>`) |
| `--color-surface` | `bg-surface` | `#0c0c0f` | Sidebar, tarjetas base |
| `--color-surface-container-lowest` | `bg-surface-container-lowest` | `#09090b` | Igual que background |
| `--color-surface-container-low` | `bg-surface-container-low` | `#0f0f12` | — |
| `--color-surface-container` | `bg-surface-container` | `#121215` | Cards, tablas |
| `--color-surface-container-high` | `bg-surface-container-high` | `#18181b` | Header, hover de items |
| `--color-surface-container-highest` | `bg-surface-container-highest` | `#1e1e22` | Modales, popovers |
| `--color-surface-variant` | `bg-surface-variant` | `#18181b` | Search bar, inputs |
| `--color-surface-bright` | `bg-surface-bright` | `#18181b` | — |
| `--color-surface-dim` | `bg-surface-dim` | `#0c0c0f` | — |

### Primario (violeta/púrpura)

| Token CSS | Clase Tailwind | Hex | Uso |
|---|---|---|---|
| `--color-primary` | `text-primary` / `bg-primary` | `#a78bfa` | Texto activo, íconos primarios, accent |
| `--color-primary-container` | `bg-primary-container` | `#7c3aed` | Botones CTA, logo background |
| `--color-on-primary` | `text-on-primary` | `#0a0012` | Texto sobre primary-container |
| `--color-on-primary-container` | `text-on-primary-container` | `#ede9fe` | Texto dentro de primary-container |
| `--color-primary-fixed` | — | `#ede9fe` | — |
| `--color-primary-fixed-dim` | — | `#c4b5fd` | — |
| `--color-on-primary-fixed` | — | `#2e1065` | — |
| `--color-on-primary-fixed-variant` | — | `#5b21b6` | — |
| `--color-inverse-primary` | — | `#5b21b6` | — |
| `--color-surface-tint` | — | `#a78bfa` | — |

### Secundario (grises zinc)

| Token CSS | Clase Tailwind | Hex | Uso |
|---|---|---|---|
| `--color-secondary` | `text-secondary` | `#71717a` | Textos secundarios, placeholders, labels |
| `--color-secondary-container` | `bg-secondary-container` | `#27272a` | Chips, badges secundarios |
| `--color-on-secondary` | `text-on-secondary` | `#09090b` | — |
| `--color-on-secondary-container` | `text-on-secondary-container` | `#a1a1aa` | — |
| `--color-secondary-fixed` | — | `#a1a1aa` | — |
| `--color-secondary-fixed-dim` | — | `#71717a` | — |
| `--color-on-secondary-fixed` | — | `#18181b` | — |
| `--color-on-secondary-fixed-variant` | — | `#3f3f46` | — |

### Terciario (verde esmeralda)

| Token CSS | Clase Tailwind | Hex | Uso |
|---|---|---|---|
| `--color-tertiary` | `text-tertiary` | `#34d399` | Indicadores positivos, tendencias, éxito |
| `--color-tertiary-container` | `bg-tertiary-container` | `#065f46` | Fondo badges de éxito |
| `--color-on-tertiary` | `text-on-tertiary` | `#001a12` | — |
| `--color-on-tertiary-container` | `text-on-tertiary-container` | `#bbf7d0` | — |
| `--color-tertiary-fixed` | — | `#bbf7d0` | — |
| `--color-tertiary-fixed-dim` | — | `#6ee7b7` | — |
| `--color-on-tertiary-fixed` | — | `#003318` | — |
| `--color-on-tertiary-fixed-variant` | — | `#047857` | — |

### On-Surface (texto)

| Token CSS | Clase Tailwind | Hex | Uso |
|---|---|---|---|
| `--color-on-surface` | `text-on-surface` | `#fafafa` | Texto principal |
| `--color-on-surface-variant` | `text-on-surface-variant` | `#a1a1aa` | Texto secundario levemente más claro que `secondary` |
| `--color-on-background` | `text-on-background` | `#fafafa` | — |
| `--color-inverse-surface` | — | `#fafafa` | — |
| `--color-inverse-on-surface` | — | `#09090b` | — |

### Contornos / Bordes

| Token CSS | Clase Tailwind | Hex | Uso |
|---|---|---|---|
| `--color-outline` | `border-outline` | `#52525b` | Bordes prominentes |
| `--color-outline-variant` | `border-outline-variant` | `#27272a` | Bordes sutiles (cards, separadores, header/sidebar) |

### Error

| Token CSS | Clase Tailwind | Hex | Uso |
|---|---|---|---|
| `--color-error` | `text-error` / `bg-error` | `#ef4444` | Estados de error |
| `--color-error-container` | `bg-error-container` | `#3b1111` | Fondo de error |
| `--color-on-error` | `text-on-error` | `#1a0000` | — |
| `--color-on-error-container` | `text-on-error-container` | `#fca5a5` | Texto dentro de error-container |

### Utilidades semánticas (estado)

| Token | Hex | Uso |
|---|---|---|
| `--color-success-500` | `#12b76a` | Éxito (complementa tertiary) |
| `--color-warning-500` | `#f79009` | Advertencias |

---

## Border Radius

| Token | Valor | Uso |
|---|---|---|
| Default (`rounded`) | `0.25rem` (4px) | Botones, inputs, badges |
| `rounded-lg` | `0.5rem` (8px) | Cards, dropdowns |
| `rounded-xl` | `0.75rem` (12px) | Modales, paneles grandes |
| `rounded-full` | `9999px` | Avatares, pills |

---

## Layout

### Estructura general

```
┌─────────────────────────────────────────────┐
│  Header (fixed, h-16, bg-background)        │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │  Main content                    │
│ (fixed,  │  (pt-16 pl-64)                   │
│  w-64,   │                                  │
│  bg-     │                                  │
│  surface)│                                  │
└──────────┴──────────────────────────────────┘
```

### Header

- Position: `fixed top-0 w-full z-50`
- Height: `h-16`
- Background: `bg-background` (`#09090b`)
- Border: `border-b border-outline-variant`
- Contenido: logo/título izquierda · search center · acciones + usuario derecha

### Sidebar

- Position: `fixed left-0 top-0 h-full`
- Width: `w-64` (264px) expandido / `w-[90px]` colapsado
- Background: `bg-surface` (`#0c0c0f`)
- Border: `border-r border-outline-variant`
- Offset: `pt-16` (deja espacio para el header fijo)

**Item activo:**
```
bg-surface-container-high text-primary border-r-2 border-primary
```

**Item inactivo:**
```
text-secondary hover:text-on-surface hover:bg-surface-container-high
```

**Ícono activo:** `text-primary`
**Ícono inactivo:** `text-secondary group-hover:text-on-surface`

### Main

```jsx
<main className="md:pl-64 pt-16 min-h-screen bg-background">
  <div className="p-6 md:p-8">
    <Outlet />
  </div>
</main>
```

---

## Navegación (Sidebar)

```
┌─ Logo ─────────────────────────────┐
│  [icon]  Lubricentro               │
│          Consola Admin             │
├─ Menu ─────────────────────────────┤
│  Dashboard                         │
│  Clientes                          │
│  Vehículos                         │
│  Operaciones                       │
│    ↳ Turnos                        │
│    ↳ Historial de Atenciones       │
│  Presupuestos                      │
│  Catálogo                          │
│    ↳ Servicios                     │
│    ↳ Productos                     │
├─ Otros ────────────────────────────┤
│  Configuración                     │
│  Cerrar sesión                     │
└────────────────────────────────────┘
```

---

## Componentes

### Tarjeta de estadística (KPI Card)

```
bg-surface-container border border-outline-variant rounded-lg p-5
└── label: text-secondary text-xs font-bold uppercase tracking-wider
└── icon: text-primary
└── value: text-3xl font-bold text-on-surface
└── trend: text-tertiary text-xs (positivo) / text-error text-xs (negativo)
```

### Botón primario (CTA)

```
bg-primary-container text-on-primary px-4 py-2 rounded font-bold text-sm
hover:brightness-110 active:scale-95 transition-all
```

### Botón secundario

```
bg-surface-container-high border border-outline-variant text-on-surface
px-4 py-2 rounded font-medium text-sm hover:bg-surface-variant
```

### Tabla

```
bg-surface-container border border-outline-variant rounded-lg
- Header: text-secondary text-xs font-bold uppercase tracking-wider
- Row: border-b border-outline-variant hover:bg-surface-container-high
- Cell: text-on-surface text-sm
```

### Badge / Chip de estado

```
pendiente:   bg-secondary-container text-on-secondary-container
activo:      bg-primary-container/20 text-primary
completado:  bg-tertiary-container text-on-tertiary-container
cancelado:   bg-error-container text-on-error-container
advertencia: bg-warning/20 text-warning-500
```

### Input / Search

```
bg-surface-variant border border-outline-variant rounded-lg
px-3 py-1.5 text-on-surface text-sm
placeholder: text-secondary
focus: border-primary ring-primary/20
```

---

## Plan de implementación

### Fase 1 — Fundación (completada)
- [x] Design system documentado
- [x] `index.css` — nuevos tokens semánticos oscuros
- [x] `index.html` — fuente Geist + clase dark
- [x] `Layout.jsx` — estructura con tokens nuevos
- [x] `Sidebar.jsx` — sidebar oscuro con nuevo estilo
- [x] `Header.jsx` — header oscuro con nuevo estilo

### Fase 2 — Páginas (progresiva)
- [ ] Dashboard (`/dashboard`) — KPI cards, gráficos, actividad reciente
- [ ] Lista de Clientes (`/customers`) — tabla, filtros, búsqueda
- [ ] Detalle del Cliente (`/customers/:id`) — perfil, vehículos, historial
- [ ] Vehículos (`/vehicles`) — tabla con filtros
- [ ] Turnos (`/appointments`) — calendario y tabla
- [ ] Historial de Atenciones (`/service-records`) — tabla con timeline
- [ ] Presupuestos (`/presupuestos`) — nueva página según Stitch
- [ ] Inventario y Catálogo (`/products`, `/services`) — tabla unificada

### Fase 3 — Componentes UI base
- [ ] `Button` — variantes primary / secondary / ghost / danger
- [ ] `Badge` — variantes de estado
- [ ] `Card` — tarjeta estándar con dark tokens
- [ ] `Table` — header/row/cell con nuevo sistema
- [ ] `Input` / `SearchBar` — estilo dark
- [ ] `Modal` — overlay dark con `bg-surface-container-highest`
