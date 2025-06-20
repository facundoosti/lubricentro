# System Patterns - Arquitectura Lubricentro

## ⚠️ Regla Crítica de Flujo de Trabajo

**Para evitar errores, todos los comandos deben ejecutarse desde el directorio correcto.**

-   **Comandos de Backend (Rails)**: Deben ejecutarse desde el directorio `backend/`.
    -   `cd backend`
    -   `rails s`, `rails db:migrate`, `rspec`, etc.

-   **Comandos de Frontend (React/Bun)**: Deben ejecutarse desde el directorio `frontend/`.
    -   `cd frontend`
    -   `bun install`, `bun run dev`, `bun test`, etc.

**Esta es una restricción fundamental de la arquitectura de monorepo que hemos adoptado.**

## Arquitectura General

**Patrón**: API-First con Frontend SPA separado

```
Frontend (React + Tailwind)
        ↕ HTTP/JSON API
Backend (Rails API + JWT) ✅ COMPLETADO
        ↕ ActiveRecord ORM
Base de Datos (PostgreSQL) ✅ CONFIGURADO
```

## Modelo de Datos ✅ IMPLEMENTADO

### ⚠️ IMPORTANTE: Decisión Técnica Crítica

**TODOS los campos de base de datos, modelos, y código deben estar en INGLÉS**

- Mejores prácticas de desarrollo
- Escalabilidad internacional
- Consistencia con el stack tecnológico
- Facilita mantenimiento y colaboración

### Entidades Core ✅ TODAS IMPLEMENTADAS

```
Customer ✅
├── id, name, phone, email, address
├── created_at, updated_at
└── has_many :vehicles, :appointments, :service_records

Vehicle ✅
├── id, brand, model, license_plate, year, customer_id
├── created_at, updated_at
└── belongs_to :customer, has_many :appointments, :service_records

Appointment ✅
├── id, scheduled_at, status, notes
├── customer_id, vehicle_id
├── created_at, updated_at
└── belongs_to :customer, :vehicle

Service ✅
├── id, name, description, base_price
├── created_at, updated_at
└── has_many :service_record_services

Product ✅
├── id, name, description, unit_price, unit
├── created_at, updated_at
└── has_many :service_record_products

ServiceRecord ✅ COMPLETADO
├── id, service_date, total_amount, notes, mileage, next_service_date
├── customer_id, vehicle_id
├── created_at, updated_at
└── belongs_to :customer, :vehicle
    has_many :service_record_services, :service_record_products

ServiceRecordService (FUTURO)
├── id, service_record_id, service_id, price
└── belongs_to :service_record, :service

ServiceRecordProduct (FUTURO)
├── id, service_record_id, product_id, quantity, unit_price
└── belongs_to :service_record, :product
```

## Patrones de Backend (Rails) ✅ IMPLEMENTADOS

### Database Configuration ✅

```ruby
# config/database.yml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: lubricentro_development

test:
  <<: *default
  database: lubricentro_test

production:
  <<: *default
  url: <%= ENV['DATABASE_URL'] %>
```

### Estructura de Controllers ✅ COMPLETADA

```
app/controllers/
├── application_controller.rb (autenticación JWT preparada)
├── api/
    └── v1/
        ├── customers_controller.rb ✅
        ├── vehicles_controller.rb ✅
        ├── appointments_controller.rb ✅
        ├── services_controller.rb ✅
        ├── products_controller.rb ✅
        └── service_records_controller.rb ✅
```

### Patrón de Respuestas API ✅ IMPLEMENTADO

```ruby
# Success Response
{
  success: true,
  data: { ... },
  message: "Success message"
}

# Error Response
{
  success: false,
  errors: ["Error message"],
  message: "Error occurred"
}
```

### Validaciones y Reglas de Negocio ✅ IMPLEMENTADAS

```ruby
# En cada modelo - CAMPOS EN INGLÉS
validates :name, presence: true, uniqueness: true
validates :license_plate, presence: true, uniqueness: true
validate :custom_business_rule

# Service Objects para lógica compleja (FUTURO)
class ServiceRecordCalculator
  def calculate_total(services, products)
    # Lógica de cálculo
  end
end
```

### Serialización con Blueprint ✅ IMPLEMENTADA

```ruby
# Patrón establecido para todos los modelos
class ServiceRecordSerializer < Blueprinter::Base
  identifier :id
  
  view :default do
    field :service_date, :total_amount, :notes, :mileage
    field :customer_id, :vehicle_id
  end
  
  view :summary do
    field :total_amount, :mileage, :service_date
    exclude :notes, :created_at, :updated_at
  end
  
  view :with_details do
    field :formatted_total_amount, :formatted_service_date
    field :is_overdue, :days_until_next_service
  end
end
```

### Testing Patterns ✅ IMPLEMENTADOS

```ruby
# Model specs con shoulda-matchers
describe ServiceRecord do
  it { should belong_to(:customer).required }
  it { should belong_to(:vehicle).required }
  it { should validate_presence_of(:service_date) }
  it { should validate_numericality_of(:total_amount).is_greater_than_or_equal_to(0) }
end

# Factory patterns con traits
FactoryBot.define do
  factory :service_record do
    trait :overdue do
      next_service_date { 1.month.ago }
    end
    
    trait :upcoming do
      next_service_date { 1.month.from_now }
    end
  end
end
```

## Patrones de Frontend (React) 🚧 PENDIENTE

### Estructura de Componentes

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx
│   │   ├── Navigation.jsx
│   │   └── Header.jsx
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   └── Form/
│   └── features/
│       ├── customers/
│       ├── vehicles/
│       ├── appointments/
│       ├── services/
│       ├── products/
│       ├── service-records/
│       └── reports/
├── hooks/
├── services/ (API calls)
├── contexts/
└── utils/
```

### Patrón de Gestión de Estado

```javascript
// Context API para estado global
const AppContext = createContext();

// Custom hooks para lógica reutilizable
const useCustomers = () => { ... }
const useServiceRecord = () => { ... }

// React Query para cache de API
const { data, loading, error } = useQuery('customers', fetchCustomers);
```

### Patrón de Componentes

```jsx
// Componente Container (lógica)
const CustomersContainer = () => {
  // Lógica del componente
  return <CustomersView {...props} />;
};

// Componente Presentacional (UI)
const CustomersView = ({ customers, onAdd, onEdit }) => {
  // Solo renderizado
};
```