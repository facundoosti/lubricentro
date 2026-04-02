# Reglas de Negocio - Sistema Lubricentro

Sistema de gestión para lubricentro automotriz. Maneja clientes, vehículos, presupuestos, atenciones y productos/servicios.

---

## Entidades del Dominio

### Customer (Cliente)
- Campos: `name`, `phone`, `email`, `address`
- `phone` es requerido. `email` es único (case-insensitive).
- Tiene muchos vehículos, turnos y atenciones (service_records).

### Vehicle (Vehículo)
- Campos: `brand`, `model`, `license_plate`, `year`
- Pertenece a un cliente. La patente identifica al vehículo.
- Tiene muchos turnos y atenciones.

### Product (Producto)
- Catálogo de productos que se usan en atenciones y presupuestos.
- Atributos de negocio: nombre, precio de referencia, stock.

### Service (Servicio)
- Catálogo de servicios que ofrece el lubricentro.
- Atributos de negocio: nombre, precio de referencia.

### ServiceRecord (Atención)
- Registro de un servicio realizado a un vehículo.
- Pertenece a un cliente y un vehículo.
- Tiene fecha de atención y fecha sugerida del próximo servicio.
- Puede originarse de la conversión de un presupuesto aprobado.

### Budget (Presupuesto)
- Cotización emitida a un cliente para un vehículo específico.
- Pertenece a un cliente y un vehículo.
- Contiene items: servicios (`BudgetService`) y productos (`BudgetProduct`).
- El total se calcula automáticamente como la suma de todos los items.

### BudgetService / BudgetProduct (Items del Presupuesto)
- Vinculan un presupuesto con un servicio o producto.
- Campos: `quantity`, `unit_price`, `total_price`.
- `total_price = quantity × unit_price` (calculado automáticamente).

---

## Ciclo de Vida del Presupuesto

### Estados
| Estado      | Descripción                                      |
|-------------|--------------------------------------------------|
| `draft`     | Borrador editable                                |
| `sent`      | Enviado al cliente, no editable                  |
| `approved`  | Aprobado por el cliente                          |
| `rejected`  | Rechazado por el cliente                         |
| `expired`   | Vencido automáticamente por fecha                |
| `converted` | Convertido en una atención                       |

### Transiciones permitidas
```
draft → sent → approved → converted
  ↓       ↓        ↓
expired expired  expired
          ↓
        rejected
```

### Reglas por estado
- **draft**: editable (campos e items). No se puede convertir.
- **sent**: no editable. Solo se puede cambiar estado (approve / reject).
- **approved**: no editable. Solo se puede convertir en atención.
- **rejected / expired / converted**: solo lectura.

### Expiración automática
- Un presupuesto expira automáticamente si `expiry_date < fecha_actual` y no está en `converted`.
- El período de vigencia por defecto es 30 días desde la emisión.

---

## Numeración de Budgets

- Formato: `B{año}-{NNNN}` (ej: `B2025-0001`)
- El número es único e inmutable una vez creado.
- Se genera automáticamente al crear el presupuesto.

---

## Cálculo de Totales

- Cada item: `total_price = quantity × unit_price`
- Total del presupuesto: `total_amount = Σ budget_services.total_price + Σ budget_products.total_price`
- Los totales se recalculan automáticamente ante cualquier cambio en los items.

---

## Conversión de Presupuesto a Atención

**Precondición:** el presupuesto debe estar en estado `approved`.

**Proceso (transaccional):**
1. Crear un `ServiceRecord` con el mismo cliente, vehículo y total del presupuesto.
2. Copiar todos los `BudgetService` y `BudgetProduct` al nuevo `ServiceRecord`.
3. Marcar el presupuesto como `converted`.

**Postcondición:** el presupuesto queda en `converted` y no puede editarse. El `ServiceRecord` queda activo.

---

## Límites y Restricciones

- Máximo 50 items por presupuesto (servicios + productos combinados).
- Un presupuesto debe tener al menos un item para ser enviado.
- `quantity` debe ser > 0. `unit_price` debe ser ≥ 0.

---

## Relaciones entre Entidades

```
Customer ──< Vehicle ──< Budget ──< BudgetService >── Service
                    ↑          └──< BudgetProduct >── Product
                    └──< ServiceRecord ──< ServiceRecordService >── Service
                                      └──< ServiceRecordProduct >── Product
```

---

## Autenticación y Acceso

- Todas las operaciones requieren autenticación vía JWT.
- No hay diferenciación de roles en el MVP; todos los usuarios autenticados tienen acceso completo.
