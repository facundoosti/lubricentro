## ADDED Requirements

### Requirement: Componente de diálogo único
Los formularios y los diálogos libres (informativos, acciones masivas, importación, visor de imágenes) SHALL usar el mismo componente `Dialog` de `@ui`: en modo formulario (con `formId`) renderiza el header y el footer fijos con Cancelar/Guardar; en modo libre el contenido lo define el consumidor. NO SHALL existir otros componentes de diálogo en `@ui` salvo `ConfirmDialog`.

#### Scenario: Modo formulario
- **GIVEN** un `Dialog` con `formId="customer-form"` y `submitLabel="Guardar"`
- **WHEN** se renderiza
- **THEN** el footer muestra Cancelar y un botón Guardar con `type="submit"` y `form="customer-form"`

#### Scenario: Modo libre
- **GIVEN** un `Dialog` sin `formId` con contenido propio
- **WHEN** se renderiza
- **THEN** no muestra el footer de Cancelar/Guardar y sí muestra el contenido del consumidor y el botón ✕

#### Scenario: Paridad de tamaño
- **GIVEN** el formulario de producto abierto en un viewport de 1440×900
- **WHEN** se mide el panel del diálogo
- **THEN** su ancho máximo es 768px (`max-w-3xl`), igual que antes de la migración
