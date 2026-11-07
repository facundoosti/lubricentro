## 1. Frontend — Primitiva compartida

- [x] 1.1 Crear `frontend/src/hooks/useDialogLayer.js` moviendo desde `FormDialog` la pila, nivel/z-index, Escape del tope con `defaultPrevented` y `closeOnEscape`, captura/retorno de foco (con `initialFocusRef`) y scroll lock con restauración; test `hooks/__tests__/useDialogLayer.test.jsx`
- [x] 1.2 Trampa de foco Tab/Shift+Tab en el diálogo del tope; tests de ciclo en ambos sentidos y de panel sin enfocables
- [x] 1.3 `inert`: envolver las rutas en `[data-app-content]` en `App.jsx` (fuera del `<Toaster>`), aplicar `inert` a ese contenedor y a las capas no tope; tests del atributo al abrir/apilar/cerrar
- [x] 1.4 `FormDialog` usa `useDialogLayer` sin cambio de comportamiento; `FormDialog.test.jsx` sigue en verde

## 2. Frontend — Migración de diálogos

- [x] 2.1 Reescribir `ui/Modal.jsx` sobre el hook (portal, z-index de la pila, sin `z-99999`) con la misma API + `closeOnBackdrop` (default `true`); actualizar `Modal.test.jsx` y correr `ConfirmModal.test.jsx` y tests de páginas que confirman borrados
- [x] 2.2 `BulkIvaModal` con `closeOnBackdrop={false}`; `CustomerCreatedDialog` verificado con el nuevo `Modal`; tests
- [x] 2.3 `BulkPriceModal` al hook: quitar `onClick` del backdrop y su lógica propia; tests (fondo no cierra, Escape cierra)
- [x] 2.4 `ProductImportModal` al hook con `closeOnEscape: !isUploading`; quitar listener en `window` y `onClick` del backdrop; tests (Escape no cierra mientras sube)
- [x] 2.5 `ImageLightbox` al hook con `initialFocusRef` en ✕; conservar ←/→ y click en el fondo; quitar trampa y scroll lock propios; `ImageLightbox.test.jsx` en verde

## 3. QA visual

- [x] 3.1 Escribir casos `TC-XX` en `openspec/changes/dialogos-unificados/qa.md` (1440×900, claro/oscuro): ConfirmModal sobre página y sobre FormDialog (z-index, Escape), Tab no sale del diálogo, toast clickeable con diálogo abierto, BulkPrice/BulkIva no cierran con click afuera, ConfirmModal sí, Import, Lightbox (←/→, Escape, foco), regresión de form-dialog-centrado (TC-07/09/10)
- [x] 3.2 Ejecutar con `/qa-visual` y corregir hallazgos

## 4. Cierre

- [x] 4.1 `npm run lint` y `npx vitest run` completos en `frontend/` en verde
