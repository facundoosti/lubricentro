## ADDED Requirements

### Requirement: Copiar un presupuesto al crear una atención
En "Nueva atención" el formulario SHALL ofrecer el botón "Copiar desde presupuesto", que abre un selector de presupuestos con buscador. Si ya hay un cliente elegido, la lista MUST filtrarse por ese cliente. Los presupuestos rechazados MUST NOT aparecer. Al elegir uno, el formulario SHALL reemplazar los ítems por los del presupuesto (descripción, cantidad, precio unitario, % de IVA y orden) y completar cliente y vehículo si el presupuesto los tiene. Todo SHALL quedar editable antes de guardar. El botón MUST NOT mostrarse al editar una atención existente.

#### Scenario: Copiar con cliente ya elegido
- **GIVEN** el usuario eligió el cliente "Juan Pérez" en una atención nueva
- **WHEN** abre "Copiar desde presupuesto"
- **THEN** solo ve presupuestos de Juan Pérez que no estén rechazados

#### Scenario: Copiar los ítems
- **GIVEN** un presupuesto con 3 ítems (uno al 21%, uno al 10,5% y uno sin IVA) y vehículo vinculado
- **WHEN** el usuario lo elige en el selector
- **THEN** la sección "Productos y Servicios" muestra esas 3 líneas con sus valores, el vehículo queda elegido y la barra muestra el mismo total efectivo/débito que el presupuesto

#### Scenario: Reemplazar ítems ya cargados
- **GIVEN** la atención nueva ya tiene una línea con datos
- **WHEN** el usuario elige un presupuesto
- **THEN** se le pide confirmar antes de reemplazar las líneas

#### Scenario: Editar después de copiar
- **GIVEN** el usuario copió un presupuesto
- **WHEN** cambia la cantidad de una línea
- **THEN** el total se recalcula y el presupuesto de origen no cambia

#### Scenario: Editar una atención existente
- **WHEN** el usuario abre una atención guardada para editar
- **THEN** no ve el botón "Copiar desde presupuesto"

### Requirement: Vínculo con el presupuesto y paso a "Aprobado"
La atención SHALL guardar el presupuesto de origen en `budget_id` (opcional). Al crear una atención con `budget_id`, el backend SHALL pasar ese presupuesto a "approved" en la misma transacción, cualquiera sea su estado previo (el selector del frontend oculta los rechazados). `budget_id` solo se acepta al crear; al editar se ignora. En el formulario, si el usuario cambia o quita el cliente y no coincide con el del presupuesto vinculado, el vínculo MUST quitarse. Si el presupuesto tiene cliente distinto al de la atención, o no existe, la API MUST responder 422 y no guardar nada. Editar la atención MUST NOT cambiar el estado del presupuesto.

#### Scenario: Crear desde un presupuesto
- **GIVEN** un presupuesto en estado "sent"
- **WHEN** se crea una atención con su `budget_id`
- **THEN** la atención queda con ese `budget_id` y el presupuesto pasa a "approved"

#### Scenario: Presupuesto de otro cliente
- **GIVEN** un presupuesto del cliente A
- **WHEN** se crea una atención del cliente B con ese `budget_id`
- **THEN** la API responde 422, no se crea la atención y el presupuesto no cambia de estado

#### Scenario: Quitar el vínculo antes de guardar
- **GIVEN** el usuario copió un presupuesto y quitó el vínculo ("Desde presupuesto #N" → quitar)
- **WHEN** guarda la atención
- **THEN** la atención se crea sin `budget_id` y el presupuesto no cambia de estado

#### Scenario: Cambiar el cliente después de copiar
- **GIVEN** el usuario copió un presupuesto del cliente A
- **WHEN** quita el cliente
- **THEN** desaparece el chip "Desde presupuesto #N" y la atención se guarda sin `budget_id`

#### Scenario: Editar con otro budget_id
- **GIVEN** una atención vinculada al presupuesto #1
- **WHEN** se actualiza enviando `budget_id` = 2
- **THEN** la atención sigue vinculada al #1

#### Scenario: Presupuesto borrado después
- **GIVEN** una atención vinculada a un presupuesto
- **WHEN** se borra el presupuesto
- **THEN** la atención sigue existiendo con `budget_id` nulo
