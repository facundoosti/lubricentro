# System Patterns - Arquitectura Lubricentro

## Arquitectura General

**Patrón**: API-First con Frontend SPA separado

```
Frontend (React + Tailwind)
        ↕ HTTP/JSON API
Backend (Rails API + JWT)
        ↕ ActiveRecord ORM
Base de Datos (PostgreSQL)
```

## Modelo de Datos

### ⚠️ IMPORTANTE: Decisión Técnica Crítica

**TODOS los campos de base de datos, modelos, y código deben estar en INGLÉS**

- Mejores prácticas de desarrollo
- Escalabilidad internacional
- Consistencia con el stack tecnológico
- Facilita mantenimiento y colaboración

### Entidades Core

```
Customer
├── id, name, phone, email, address
├── created_at, updated_at
└── has_many :vehicles

Vehicle
├── id, brand, model, license_plate, year, customer_id
├── created_at, updated_at
└── belongs_to :customer, has_many :appointments, :service_records

Appointment
├── id, scheduled_at, status, notes
├── customer_id, vehicle_id
├── created_at, updated_at
└── belongs_to :customer, :vehicle

Service
├── id, name, description, base_price
├── created_at, updated_at
└── has_many :service_record_services

Product
├── id, name, description, unit_price, unit
├── created_at, updated_at
└── has_many :service_record_products

ServiceRecord
├── id, service_date, total_amount, notes
├── customer_id, vehicle_id
├── created_at, updated_at
└── belongs_to :customer, :vehicle
    has_many :service_record_services, :service_record_products

ServiceRecordService
├── id, service_record_id, service_id, price
└── belongs_to :service_record, :service

ServiceRecordProduct
├── id, service_record_id, product_id, quantity, unit_price
└── belongs_to :service_record, :product
```

## Patrones de Backend (Rails)

### Database Configuration

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

### Estructura de Controllers

```
app/controllers/
├── application_controller.rb (autenticación JWT)
├── api/
    └── v1/
        ├── customers_controller.rb
        ├── vehicles_controller.rb
        ├── appointments_controller.rb
        ├── services_controller.rb
        ├── products_controller.rb
        ├── service_records_controller.rb
        └── reports_controller.rb
```

### Patrón de Respuestas API

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

### Validaciones y Reglas de Negocio

```ruby
# En cada modelo - CAMPOS EN INGLÉS
validates :name, presence: true, uniqueness: true
validates :license_plate, presence: true, uniqueness: true
validate :custom_business_rule

# Service Objects para lógica compleja
class ServiceRecordCalculator
  def calculate_total(services, products)
    # Lógica de cálculo
  end
end
```

## Patrones de Frontend (React)

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

## Patrones de Seguridad

### Autenticación JWT

```
1. Login → Backend valida → Genera JWT
2. Frontend guarda token en localStorage
3. Todas las requests incluyen: Authorization: Bearer <token>
4. Backend valida token en cada request
```

### Autorización Simple

```ruby
# Middleware en Rails
before_action :authenticate_user!
before_action :authorize_resource!
```

## Patrones de UI/UX

### Design System con Tailwind

```javascript
// Tokens de diseño consistentes
const colors = {
  primary: "blue-600",
  secondary: "gray-600",
  success: "green-600",
  danger: "red-600",
};

const spacing = {
  xs: "0.5rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
};
```

### Responsive Design

```css
/* Mobile First */
/* Base: mobile */
.class {
  ...;
}

/* Tablet */
@media (min-width: 768px) {
  ...;
}

/* Desktop */
@media (min-width: 1024px) {
  ...;
}
```

## Patrones de Testing

### Backend Testing

```ruby
# Model tests - CAMPOS EN INGLÉS
RSpec.describe Customer do
  it { should validate_presence_of(:name) }
end

RSpec.describe Vehicle do
  it { should validate_presence_of(:license_plate) }
end

# Controller tests
RSpec.describe Api::V1::CustomersController do
  describe 'GET #index' do
    it 'returns success response'
  end
end
```

### Frontend Testing

```javascript
// Component tests
test("renders customer list", () => {
  render(<CustomerList customers={mockCustomers} />);
  expect(screen.getByText("Customers")).toBeInTheDocument();
});

// Integration tests
test("creates new customer", async () => {
  // Test complete user flow
});
```

## Patrones de Performance

### Backend Optimizations

```ruby
# Eager loading
Customer.includes(:vehicles).all

# Pagination
customers = Customer.page(params[:page]).per(20)

# Caching
Rails.cache.fetch("customers_#{params[:page]}", expires_in: 5.minutes)
```

### Frontend Optimizations

```javascript
// Lazy loading
const Reports = lazy(() => import("./Reports"));

// Memoization
const expensiveCalculation = useMemo(
  () => calculateTotal(services, products),
  [services, products]
);

// Debounced search
const debouncedSearch = useDebounce(searchTerm, 300);
```
