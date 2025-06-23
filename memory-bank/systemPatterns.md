# System Patterns - Arquitectura Lubricentro

## 🎨 REGLA CRÍTICA: Tailwind CSS First

**⚠️ OBLIGATORIO: Todo el CSS debe usar Tailwind CSS y sus convenciones**

### Principios Fundamentales

1. **🚫 NUNCA escribir CSS personalizado** sin justificación técnica
2. **✅ SIEMPRE usar clases de Tailwind** para estilos
3. **🎯 Usar el sistema `@theme`** para definir colores y variables
4. **📦 Evitar archivos CSS adicionales** - todo en `index.css` con `@theme`

### Sistema de Colores (Tailwind v4)

```css
/* frontend/src/index.css - ÚNICO lugar para definir colores */
@theme {
  --color-gray-50: #f9fafb;    /* bg-gray-50 */
  --color-gray-100: #f2f4f7;   /* bg-gray-100 */
  --color-brand-500: #465fff;  /* bg-brand-500 */
  --color-success-500: #12b76a; /* bg-success-500 */
  --color-error-500: #f04438;   /* bg-error-500 */
  --color-warning-500: #f79009; /* bg-warning-500 */
}
```

### Patrones de Uso

**✅ CORRECTO:**
```jsx
<div className="bg-gray-50 text-gray-800 p-4 rounded-lg shadow-theme-sm">
  <h2 className="text-title-md font-semibold mb-2">Título</h2>
  <p className="text-theme-sm text-gray-600">Contenido</p>
</div>
```

**❌ INCORRECTO:**
```jsx
<div style={{ backgroundColor: '#f9fafb', padding: '1rem' }}>
  <h2 style={{ fontSize: '36px', fontWeight: 'bold' }}>Título</h2>
</div>
```

### Estructura de Archivos CSS

```
frontend/src/
├── index.css          # ÚNICO archivo CSS con @theme
├── components/        # Solo JSX con className
├── pages/            # Solo JSX con className
└── layout/           # Solo JSX con className
```

### Clases Tailwind Disponibles

**Colores de Fondo:**
- `bg-gray-50`, `bg-gray-100`, `bg-gray-200`... hasta `bg-gray-950`
- `bg-brand-25`, `bg-brand-50`, `bg-brand-500`... hasta `bg-brand-950`
- `bg-success-500`, `bg-error-500`, `bg-warning-500`
- `bg-blue-light-50`, `bg-blue-light-500`... hasta `bg-blue-light-950`
- `bg-orange-50`, `bg-orange-500`... hasta `bg-orange-950`
- `bg-theme-pink-500`, `bg-theme-purple-500`

**Colores de Texto:**
- `text-gray-800`, `text-gray-600`, `text-gray-400`
- `text-brand-500`, `text-success-500`, `text-error-500`
- `text-blue-light-500`, `text-orange-500`
- `text-theme-pink-500`, `text-theme-purple-500`

**Tamaños de Texto:**
- `text-title-2xl`, `text-title-xl`, `text-title-lg`, `text-title-md`
- `text-theme-xl`, `text-theme-sm`, `text-theme-xs`
- **Line-height automático** incluido en cada tamaño

**Sombras:**
- `shadow-theme-sm`, `shadow-theme-md`, `shadow-theme-lg`, `shadow-theme-xl`
- `shadow-theme-xs`, `shadow-datepicker`, `shadow-focus-ring`
- `shadow-slider-navigation`, `shadow-tooltip`
- `drop-shadow-4xl`

**Z-index:**
- `z-1`, `z-9`, `z-99`, `z-999`, `z-9999`, `z-99999`, `z-999999`

**Breakpoints Personalizados:**
- `2xsm:375px`, `xsm:425px`, `3xl:2000px`
- `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`

**Utilities Personalizadas:**
- `menu-item`, `menu-item-active`, `menu-item-inactive`
- `menu-item-icon`, `menu-item-icon-active`, `menu-item-icon-inactive`
- `menu-item-arrow`, `menu-item-arrow-active`, `menu-item-arrow-inactive`
- `menu-dropdown-item`, `menu-dropdown-item-active`, `menu-dropdown-item-inactive`
- `menu-dropdown-badge`, `menu-dropdown-badge-active`, `menu-dropdown-badge-inactive`
- `no-scrollbar`, `custom-scrollbar`

**Dark Mode:**
- `dark:bg-gray-900`, `dark:text-gray-300`
- `dark:bg-brand-500/[0.12]`, `dark:text-brand-400`
- Soporte completo para modo oscuro

### Excepciones Permitidas

**Solo se permite CSS personalizado para:**
1. **Animaciones complejas** que Tailwind no cubre
2. **Integración con librerías de terceros** (charts, datepickers)
3. **Hacks específicos** para compatibilidad de navegadores

**Ejemplo de excepción válida:**
```css
/* Solo para integración con librería externa */
.apexcharts-tooltip {
  @apply !bg-gray-900 !border-gray-800;
}
```

## 📊 PATRÓN DE TABLAS ESTABLECIDO ✅

**Referencia**: `CustomersTable.jsx` y `ServiceRecordsTable.jsx`

### Estructura Obligatoria de Tablas

```jsx
const EntityTable = ({ 
  entities = [], 
  pagination = {},
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
  onView,
  onCreate,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón crear - ESTRUCTURA FIJA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </form>
        </div>
        
        <Button
          onClick={onCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Nuevo Elemento
        </Button>
      </div>

      {/* Tabla - ESTRUCTURA FIJA */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Columna 1
                </TableCell>
                {/* Más columnas... */}
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={N} className="px-5 py-8 text-center text-gray-500">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : entities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={N} className="px-5 py-8 text-center text-gray-500">
                    No se encontraron elementos
                  </TableCell>
                </TableRow>
              ) : (
                entities.map((entity) => (
                  <TableRow key={entity.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {/* Celdas con estructura consistente */}
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          {/* Icono o iniciales */}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                            {/* Texto principal */}
                          </span>
                          <span className="block text-gray-500 text-xs dark:text-gray-400">
                            {/* Texto secundario */}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Columna de acciones - ESTRUCTURA FIJA */}
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(entity)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(entity)}
                          className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(entity)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación - ESTRUCTURA FIJA */}
      {pagination && pagination.total_pages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.current_page || 1}
            totalPages={pagination.total_pages || 1}
            totalItems={pagination.total_count || 0}
            itemsPerPage={pagination.per_page || 10}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
```

### Reglas de Implementación de Tablas

**✅ OBLIGATORIO:**
1. **Estructura de props fija**: `entities`, `pagination`, `onPageChange`, `onSearch`, `onEdit`, `onDelete`, `onView`, `onCreate`, `loading`
2. **Header consistente**: Búsqueda a la izquierda, botón crear a la derecha
3. **Clases de tabla fijas**: Usar exactamente las mismas clases de Tailwind
4. **Columna de acciones**: Siempre última, con los 3 botones (Ver, Editar, Eliminar)
5. **Estados de loading y empty**: Manejar siempre con mensajes apropiados
6. **Paginación**: Usar componente `Pagination` del template
7. **Hover effects**: `hover:bg-gray-50 dark:hover:bg-gray-800/50`

**🎨 Patrones de Celdas:**
```jsx
// Celda con avatar/iniciales
<TableCell className="px-5 py-4 sm:px-6 text-start">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
      <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
        {getInitials(entity.name)}
      </span>
    </div>
    <div>
      <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
        {entity.name}
      </span>
      <span className="block text-gray-500 text-xs dark:text-gray-400">
        ID: {entity.id}
      </span>
    </div>
  </div>
</TableCell>

// Celda con badge
<TableCell className="px-4 py-3 text-start">
  <Badge size="sm" color={getStatusColor(entity)}>
    {getStatusText(entity)}
  </Badge>
</TableCell>
```

**🔧 Funciones Helper Estándar:**
```jsx
// Para iniciales
const getInitials = (name) => {
  if (!name) return '--';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Para estados
const getStatusColor = (entity) => {
  // Lógica específica por entidad
  return "success"; // o "error", "warning"
};

const getStatusText = (entity) => {
  // Texto específico por entidad
  return "Estado";
};
```

**📱 Responsive Design:**
- **Mobile-first**: `flex-col sm:flex-row` en header
- **Overflow**: `max-w-full overflow-x-auto` en contenedor de tabla
- **Spacing**: `px-5 py-4 sm:px-6` en celdas

**🎯 Ejemplos Implementados:**
- ✅ `CustomersTable.jsx` - Patrón base establecido
- ✅ `ServiceRecordsTable.jsx` - Siguiendo el patrón
- 🚧 `VehiclesTable.jsx` - Pendiente de actualización
- 🚧 `ServicesTable.jsx` - Pendiente de actualización
- 🚧 `ProductsTable.jsx` - Pendiente de actualización

## ⚠️ Regla Crítica de Flujo de Trabajo

**Para evitar errores, todos los comandos deben ejecutarse desde el directorio correcto.**

-   **Comandos de Backend (Rails)**: Deben ejecutarse desde el directorio `backend/`.
    -   `cd backend`
    -   `rails s`, `rails db:migrate`, `rspec`, etc.

-   **Comandos de Frontend (React/NPM)**: Deben ejecutarse desde el directorio `frontend/`.
    -   `cd frontend`
    -   `npm install`, `npm run dev`, `npm test`, etc.

**Esta es una restricción fundamental de la arquitectura de monorepo que hemos adoptado.**

## Arquitectura General

**Patrón**: API-First con Frontend SPA separado

```
Frontend (React + Tailwind + TailAdmin Template)
        ↕ HTTP/JSON API
Backend (Rails API + JWT) ✅ COMPLETADO
        ↕ ActiveRecord ORM
Base de Datos (PostgreSQL) ✅ CONFIGURADO
```

## 🎨 Frontend Architecture Patterns

### Template Base: TailAdmin React

**Estructura de Referencia**:
```
frontend/template-analysis/     # Template original
├── src/
│   ├── components/            # Componentes UI base
│   ├── layout/               # Layouts y navegación
│   ├── pages/                # Páginas del dashboard
│   ├── icons/                # Iconos SVG
│   └── ...
└── README.md                 # Documentación completa
```

**Nuestra Adaptación**:
```
frontend/src/                  # Nuestra implementación
├── layout/                   # Layout adaptado del template
│   ├── Layout.jsx           # Estructura principal
│   ├── Header.jsx           # Header con controles
│   └── Sidebar.jsx          # Navegación específica
├── components/              # Componentes UI adaptados
│   ├── common/              # Componentes reutilizables
│   ├── ui/                  # Elementos de interfaz
│   └── features/            # Componentes específicos
├── pages/                   # Páginas del lubricentro
├── contexts/                # Contextos React
├── services/                # Servicios API
└── utils/                   # Utilidades
```

### Patrones de Componentes

**Container + View Pattern**:
```javascript
// Container: Lógica y estado
const ServicesContainer = () => {
  const { data: services, isLoading } = useServices();
  return <ServicesView services={services} loading={isLoading} />;
};

// View: Presentación
const ServicesView = ({ services, loading }) => {
  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {/* UI Components */}
    </div>
  );
};
```

**Layout Pattern**:
```javascript
// Layout principal con tema oscuro/claro
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
```

### Routing Patterns

**React Router Setup**:
```javascript
// App.jsx - Rutas específicas del lubricentro
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Dashboard />} />
    <Route path="services" element={<Services />} />
    <Route path="customers" element={<Customers />} />
    <Route path="vehicles" element={<Vehicles />} />
    <Route path="appointments" element={<Appointments />} />
    <Route path="products" element={<Products />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>
```

### State Management Patterns

**React Query para Server State**:
```javascript
// services/api.js
const api = axios.create({
  baseURL: '/api/v1',
  headers: { Authorization: `Bearer ${token}` }
});

// hooks/useServices.js
const useServices = () => {
  return useQuery('services', () => api.get('/services'));
};

const useCreateService = () => {
  return useMutation((serviceData) => api.post('/services', serviceData));
};
```

**Context solo para Auth**:
```javascript
// contexts/QueryProvider.jsx
const QueryProvider = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000 }, // 5 minutos
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};
```

### UI/UX Patterns

**Tailwind Design System**:
```javascript
// Colores consistentes (del template)
primary: 'blue-600'     // Acciones principales
secondary: 'gray-600'   // Elementos secundarios
success: 'green-600'    // Estados exitosos
danger: 'red-600'       // Errores y eliminaciones
warning: 'yellow-600'   // Alertas

// Tema oscuro/claro
dark:bg-boxdark-2 dark:text-bodydark  // Clases del template
```

**Componentes Reutilizables**:
```javascript
// Button con variantes
<Button variant="primary" size="md" loading={isLoading}>
  Guardar
</Button>

// Modal para confirmaciones
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalContent>...</ModalContent>
</Modal>

// Table con paginación
<Table data={data} columns={columns} pagination={pagination} />
```

### Form Patterns

**React Hook Form + Yup**:
```javascript
const schema = yup.object({
  name: yup.string().required('El nombre es requerido'),
  price: yup.number().positive('El precio debe ser positivo'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema)
});
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