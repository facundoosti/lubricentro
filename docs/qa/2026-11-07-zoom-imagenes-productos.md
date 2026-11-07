# QA visual — Zoom y carrusel de imágenes en el listado de productos

- Origen: diff (sin OpenSpec). Archivos: `frontend/src/components/ui/ImageLightbox.jsx` (nuevo), `frontend/src/components/features/products/ProductsTable.jsx`
- Script: `docs/qa/2026-11-07-zoom-imagenes-productos.qa.mjs` · capturas en `tmp/qa/zoom-imagenes-productos/`
- Ejecutado contra el frontend del worktree (`QA_BASE_URL=http://localhost:5174`) sobre el backend local, base `7efd219` + cambios sin commitear
- Datos: la base local no tiene productos con imagen → el script intercepta `GET /api/v1/products` e inyecta `image_url` (SVG generados) en los 3 primeros productos. No se escribe nada en la base.

## Riesgo: medio — nuevo componente compartido de `@ui` y nuevo comportamiento en la tabla de productos; sin tokens ni layout global

- [x] **TC-01** · must · script · desktop-dark,desktop-light · Clic en la miniatura abre el visor con la imagen del producto, título, contador "1 / 3", 3 miniaturas, imagen dentro del viewport y scroll del fondo bloqueado — *origen: diff* — ✅ `img 981×736 en (229,76)`, `count "1 / 3"`, `bodyOverflow hidden`
- [x] **TC-02** · must · script · desktop-dark · Carrusel: flecha ▶, `→`, vuelta 3→1, `←` 1→3, clic en miniatura; la miniatura activa coincide — *origen: diff* — ✅ `1→2→3→1→3→2`
- [x] **TC-03** · must · script · desktop-dark · Zoom: clic amplía ×2.5 desde el punto clickeado, el mouse recorre la imagen hasta los bordes, otro clic vuelve, navegar resetea el zoom — *origen: diff* — ✅ (tras fix H-01) `origin 25%→75%`, `afterNav scale(1)`
- [x] **TC-04** · must · script · desktop-dark · Cierre por `Esc`, botón X, clic al costado de la foto y en la franja de miniaturas; clic en la imagen NO cierra; se libera el scroll — *origen: diff* — ✅ (tras fix H-02)
- [x] **TC-05** · must · script · desktop-dark · Regresión: con datos reales (sin imágenes) la tabla muestra los íconos y no ofrece zoom, sin errores de consola ni de red — *regresión: Products* — ✅ `rows 10, buttons 0`
- [x] **TC-06** · must · vitest · Abrir, navegar, zoom, cerrar con Esc y sin imagen no hay botón (`ProductsTable.test.jsx`) — *borde* — ✅ 6/6

Resultado: **6/6 ✅** (script 6 combinaciones + vitest).

## Hallazgos

| ID | Síntoma | Causa raíz | Fix | Estado |
|---|---|---|---|---|
| H-01 | Con zoom, mover el mouse al 75% de la imagen solo panea al ~45%: no se llega a los bordes | El origen se calculaba con `getBoundingClientRect()` de la imagen **ya escalada**, cuya caja cambia con el propio origen | Se guarda la caja sin escalar al hacer zoom (`baseRectRef`) y se calcula el origen sobre ella, con clamp 0–100 — `ImageLightbox.jsx` (`handleImageClick` / `handleMouseMove`) | ✅ corregido |
| H-02 | Clic en el negro al costado de la foto o en la franja de miniaturas no cierra el visor | El contenedor de la imagen y las barras hacían `stopPropagation` en todo su ancho | Un solo `handleOverlayClick`: cierra salvo que el clic sea sobre un `button` o la `img` — `ImageLightbox.jsx` | ✅ corregido |

## Notas

- ⚠️ El botón flotante de TanStack Query Devtools (abajo a la derecha, solo en dev) queda por encima del overlay. No aparece en producción.
- El visor usa negro fijo en ambos temas (es un visor de fotos); TC-01 en claro confirma que se ve igual.

## Re-ejecución tras el review (react-reviewer)

Cambios: foco al abrir/cerrar + Tab atrapado, zoom atado al índice (sin parpadeo al navegar), la tabla guarda el id del producto en vez del índice, el clic en título/SKU no cierra, test propio `frontend/src/components/ui/__tests__/ImageLightbox.test.jsx` (7 casos).
Resultado: script **6/6 ✅** · vitest **13/13 ✅** · lint ok.
Pendiente (latente, no se corrige acá): `Modal` y `ImageLightbox` escriben `body.overflow` sin un contador compartido; solo falla si se abren uno encima del otro y se cierran fuera de orden.
