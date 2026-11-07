# QA visual: quick-fixes de PENDIENTES (2026-11-06)

Registros: `docs/fixes/2026-11-06-{bugs-dashboard-titulo-autocomplete,errores-formularios-foco,contraste-tokens-tema,sidebar-a11y-tooltip}.md`
Script: `docs/qa/2026-11-06-pendientes-quick-fix.qa.mjs` · evidencia: `tmp/qa/pendientes-quick-fix/` · base: `155c08c` + diff sin commitear

## Riesgo: alto. Cambian tokens globales (`on-primary`, `outline`) y el sidebar, que se comparte en todas las pantallas.

- [x] **TC-01** · must · script · dark,light · Dashboard "Ingresos" sin `NaN`. ✅ `Ingresos: $ 0`. ⚠️ En dev no hay ingresos en 6 meses; el caso con decimales en string lo cubre `MiniChart.test.jsx`. *(origen: diff)*
- [x] **TC-02** · must · script · dark · Ir de Dashboard a otra página restaura el título. ✅ `Sistema Lubricentro`. *(origen: diff)*
- [x] **TC-03** · must · script · dark,light · CTA "Nuevo Cliente" con contraste ≥ 4.5. ✅ blanco sobre `#7c3aed`, 5.7:1 en los dos temas. *(H-09)*
- [x] **TC-04** · must · script · dark,light · Borde del checkbox ≥ 3:1. ✅ claro 4.83 · oscuro 3.87. *(H-10)*
- [x] **TC-05** · must · script · dark · Con Operaciones abierto en /dashboard hay un solo ítem activo. ✅ `["Dashboard"]`, `aria-expanded=true`. *(H-08)*
- [x] **TC-06** · must · script · dark · Sidebar colapsado: todos los ítems tienen nombre accesible. ✅ 8 nombres, 0 sin nombre. *(H-08)*
- [x] **TC-07** · must · script · dark · Turno vacío: "Cliente es requerido" y bordes rojos en cliente y vehículo. ✅ los dos en `rgb(239,68,68)`. *(H-07)*
- [x] **TC-08** · must · script · dark · /service-records/new vacío: buscadores de cliente y vehículo en rojo. ✅ *(H-07)*
- [x] **TC-09** · should · script · light · Autocomplete con texto largo: el texto termina antes de la X. ✅ el texto termina en 1352 y la X empieza en 1356. *(bug autocomplete)*
- [x] **TC-10** · must · script · dark · El tooltip de un turno se oculta al cambiar de mes. ✅ tooltip antes 1, después 0. Se corrió con un turno de prueba en dev que después se borró. También lo cubre `Appointments.test.jsx`. *(tooltip)*
- [x] **TC-11** · must · script · dark,light · Configuración: 7 switches de día con `aria-checked`. ✅ *(a11y)*
- [x] **TC-12** · must · script · dark,light · Regresión del Inbox: filtro activo con contraste ≥ 4.5. ✅ 5.7:1 (antes era `bg-primary`). *(regresión H-09)*
- [x] **TC-13** · must · vitest · Modal y SlideOver: `role=dialog` con nombre y X "Cerrar". ✅ `Modal.test.jsx`, `SlideOver.test.jsx`.

**Resultado:** 13 ✅ · 0 ❌ · 0 🚧.

## Hallazgos
- **TC-02 (1.ª corrida), falso negativo del script**: `waitForURL` resuelve con el `pushState`, antes de que React desmonte el Dashboard. Se agregó una espera a un elemento de /settings. Verificado con un `MutationObserver` del `<title>`: `Dashboard - …` pasa a `Sistema Lubricentro`.
- **TC-11 (1.ª corrida), error del script**: contaba también el switch "Modo oscuro" del header. Ahora filtra solo los días.
- **Revisión visual en claro** (`TC-04-desktop-light.jpg`, `TC-11-desktop-light.jpg`): con `--color-outline: #71717a` los checkboxes se distinguen y no aparecen bordes duros en tablas ni inputs.
