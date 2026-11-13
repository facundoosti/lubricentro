# QA visual: formulario de planes de cuotas

Fix: `docs/fixes/2026-11-13-form-planes-cuotas.md` · Script: `docs/qa/2026-11-13-form-planes-cuotas.qa.mjs`

## Riesgo: bajo
Toca un solo componente de feature, sin cambios de tokens. Se prueba en los dos temas porque los labels son texto nuevo.

- [x] **TC-01** · must · vitest · Label visible asociado a cada campo + placeholders de ejemplo — *origen: diff*
- [x] **TC-02** · must · script · desktop-dark/light · /settings → Agregar plan: labels visibles y placeholders sin cortar — *origen: diff*
- [x] **TC-03** · must · script · desktop-dark/light · Inputs del plan con el mismo estilo computado (alto, fondo, padding, radio, fuente, sombra, color de label) que los de Datos del lubricentro — *origen: pedido del usuario*

## Resultados
Corrida del 2026-11-13 sobre el working tree (base `1be4320`):
- ✅ TC-01: 10/10 tests de `settings/`.
- ✅ TC-02: los 4 labels son visibles en los dos temas, y cada placeholder entra en el ancho útil de su campo.
  - Cuotas: placeholder de 29px en 46px útiles.
  - Recargo: placeholder de 35px en 62px útiles.
  - Orden: placeholder de 31px en 46px útiles.
- Capturas en `tmp/qa/form-planes-cuotas/`.
- ❌→✅ TC-03: antes del fix difería en alto (44 vs 38px), fondo, padding, sombra y color del label. Después del fix es idéntico en los dos temas.
