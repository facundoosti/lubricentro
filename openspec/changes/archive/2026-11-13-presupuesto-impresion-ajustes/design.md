## Context

Ajustes visuales en la hoja de presupuesto imprimible (frontend). Ver `proposal.md`.

## Decisions

- Cambios de presentación únicamente; los datos de la API no cambian.
- El renglón Vehículo no se modifica: sigue mostrando marca/modelo/año o la descripción libre.

## Risks / Trade-offs

- Si el componente de ítems o el formateo de fecha se reutilizan en otra pantalla, el cambio la afectaría: verificar consumidores antes de editar.
- El recuadro del año baja de `minWidth` 36px a 22px, igual que DÍA y MES, porque ahora tiene dos dígitos (verificado en TC-06 de `qa.md`).
