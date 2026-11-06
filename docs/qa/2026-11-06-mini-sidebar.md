# QA visual · Mini sidebar (colapsar/expandir)

- **Cambio**: pestaña redonda (− / +, sin texto) sobre el borde derecho del sidebar en la esquina inferior del bloque del logo (desktop), estado persistido (`localStorage.sidebar`), hamburguesa del header solo en mobile, hover expande el sidebar por encima del contenido sin moverlo.
- **Rama**: `feat/mini-sidebar` (sin OpenSpec)
- **Entorno**: local · `http://localhost:5173`
- **Evidencia**: `tmp/qa/mini-sidebar/`

## Escenarios

### QA-01 · Colapsar y expandir desde el sidebar
- **Pantalla**: /dashboard
- **Pasos**: 1) Con el sidebar expandido, ubicar "Colapsar menú" (sobre "Cerrar sesión") 2) Click 3) Sacar el mouse del sidebar 4) Click en el ícono "Expandir menú"
- **Resultado esperado**: colapsa a ~90px con solo íconos centrados y el contenido se reacomoda (margen 90px); el botón se lee "Expandir menú"; al expandir vuelve a 290px. Sin saltos raros ni texto cortado.
- **Viewports / temas**: desktop · oscuro + claro
- **Estado**: ✅ pasa (r2) · primer click expande 3/3 en oscuro y claro; botón sin saltos (`[12,787,65,40]`) · `QA-01-desktop-{dark,light}*-r2.png`

### QA-02 · Hover sobre el sidebar colapsado
- **Pantalla**: /customers
- **Pasos**: 1) Colapsado, pasar el mouse sobre el sidebar 2) Sacar el mouse
- **Resultado esperado**: se expande por encima del contenido (overlay) y el contenido NO se mueve; al salir vuelve a colapsar
- **Viewports / temas**: desktop · oscuro
- **Estado**: ✅ pasa · `main.left` fijo en 90 durante el hover · `QA-02-desktop-dark*.png`

### QA-03 · Persistencia al recargar
- **Pantalla**: /dashboard
- **Pasos**: 1) Colapsar 2) Recargar 3) Expandir 4) Recargar
- **Resultado esperado**: el estado se mantiene tras cada recarga; `localStorage.sidebar` = `{"state":{"isExpanded":false|true},...}`
- **Viewports / temas**: desktop · oscuro
- **Estado**: ✅ pasa · `localStorage.sidebar` persiste false/true · `QA-03-desktop-dark*.png`

### QA-04 · Header en desktop vs mobile
- **Pantalla**: /dashboard
- **Pasos**: 1) Desktop: verificar que no hay hamburguesa en el header 2) Mobile 375×812: abrir el menú con la hamburguesa, navegar a otra sección, verificar que se cierra 3) Verificar que en mobile NO aparece "Colapsar menú"
- **Resultado esperado**: hamburguesa solo en mobile con `aria-label` "Abrir menú"/"Cerrar menú"; drawer funciona como antes
- **Viewports / temas**: desktop + mobile · oscuro + claro
- **Estado**: ✅ pasa · hamburguesa `display:none` en desktop; drawer mobile OK · `QA-04-*` · ⚠️ preexistentes (ver pendientes)

### QA-05 · Regresión: submenús y tour
- **Pantalla**: /dashboard
- **Pasos**: 1) Expandido: abrir submenú "Operaciones" y navegar a Turnos 2) Colapsado: verificar ítem activo resaltado 3) Iniciar el tour y avanzar 2 pasos sobre el sidebar
- **Resultado esperado**: submenús y estado activo correctos en ambos modos; el tour resalta el sidebar sin romperse
- **Viewports / temas**: desktop · oscuro
- **Estado**: ✅ pasa (r2) · `.fc` y grilla igualan ancho en Mes/Semana al colapsar/expandir · `QA-05-desktop-dark-*-r2.png` · ⚠️ el tour no tiene pasos sobre el sidebar

### QA-06 · Pestaña − / + en el borde (rediseño pedido)
- **Pantalla**: /dashboard
- **Pasos**: 1) Colapsado: verificar "+" en la esquina inferior del bloque del logo sobre el borde 2) Click → expande 3) Expandido: verificar "−" en la misma esquina (x≈290) 4) Tema claro
- **Resultado esperado**: pestaña de 24px centrada sobre el borde derecho a la altura del borde inferior del logo (y=64), sin texto, con `aria-label`/`title`; oculta mientras el rail se expande por hover
- **Viewports / temas**: desktop · oscuro + claro
- **Estado**: ✅ pasa · rect `[278,52,24,24]` expandido (borde en 290) · `QA-06-desktop-dark-expandido.png` (colapsado), `QA-06-desktop-light-expandido.png`

## Hallazgos

Ejecución 1: 0 errores de consola · 0 requests ≥ 400. Evidencia en `tmp/qa/mini-sidebar/`.

| ID | Síntoma | Causa raíz | Fix | Estado |
|----|---------|-----------|-----|--------|
| H-01 | Con el sidebar colapsado, el primer click en "Expandir menú" no hace nada (y cae cerca de "Cerrar sesión") | Al entrar el mouse, `isHovered` muestra los labels antes de que termine la transición de ancho (300ms); en 65px se parten en 2 líneas, el botón baja de y=787 a y=747/h=60 y el click cae en el wrapper de logout | `frontend/src/index.css` · `menu-item`/`menu-dropdown-item` con `whitespace-nowrap overflow-hidden`; `Sidebar.jsx` nav con `overflow-x-hidden` | ✅ verificado (r2) |
| H-02 | FullCalendar no se reacomoda al colapsar/expandir (hueco o columna "sáb" cortada) | FullCalendar solo recalcula en `window.resize`; el margen de `Layout` cambia sin resize de ventana (preexistente, ahora más visible) | `frontend/src/pages/Appointments.jsx` · `ResizeObserver` sobre `.appointments-calendar` → `updateSize()` | ✅ verificado (r2) |

