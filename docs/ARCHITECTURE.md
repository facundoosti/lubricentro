# Arquitectura del Sistema - Lubricentro 🚗

## 🏗️ **Visión General**

Sistema de gestión para lubricentro construido con arquitectura API-First, separando completamente el backend (Rails API) del frontend (React SPA).

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐    SQL    ┌─────────────────┐
│   Frontend      │ ◄─────────────► │   Backend       │ ◄───────► │   Database      │
│   React SPA     │                 │   Rails API     │           │   PostgreSQL    │
│   Port: 5173    │                 │   Port: 3000    │           │   (SQLite dev)  │
└─────────────────┘                 └─────────────────┘           └─────────────────┘
```

## 🎯 **Principios Arquitectónicos**

### 1. **API-First Design**
- Backend expone API REST completa
- Frontend consume API via HTTP/JSON
- Separación total de responsabilidades
- Escalabilidad independiente

### 2. **Single Page Application (SPA)**
- React Router para navegación
- Estado del servidor via React Query
- Estado local solo para UI
- Navegación sin recargas

### 3. **Mobile-First Responsive**
- Tailwind CSS v4 para estilos
- Breakpoints: mobile → tablet → desktop
- Touch-friendly interfaces
- Progressive Web App ready

## 🏛️ **Backend Architecture (Rails API)**

### **Estructura de Capas**
```
┌─────────────────────────────────────┐
│           Controllers               │ ← API Endpoints
├─────────────────────────────────────┤
│           Serializers               │ ← JSON Response Format
├─────────────────────────────────────┤
│           Services                  │ ← Business Logic
├─────────────────────────────────────┤
│           Models                    │ ← Data & Validations
├─────────────────────────────────────┤
│           Database                  │ ← PostgreSQL/SQLite
└─────────────────────────────────────┘
```

### **API Design Patterns**

#### **Response Format (Consistente)**
```json
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "errors": ["Error details"],
  "message": "Error occurred"
}
```

#### **Controller Structure**
```ruby
class Api::V1::EntityController < ApplicationController
  before_action :authenticate_user!
  before_action :set_entity, only: [:show, :update, :destroy]
  
  def index
    @pagy, @entities = pagy(Entity.includes(:associations))
    render json: {
      success: true,
      data: {
        entities: EntitySerializer.render_as_hash(@entities),
        pagination: pagy_metadata(@pagy)
      }
    }
  end
end
```

#### **Serialization (Blueprinter)**
```ruby
class EntitySerializer < Blueprinter::Base
  identifier :id
  fields :name, :description, :created_at
  
  view :with_associations do
    association :related_entities, blueprint: RelatedEntitySerializer
  end
end
```

### **Authentication & Authorization**
- **JWT Tokens** para autenticación
- **ApplicationController** valida tokens
- **Protected routes** por defecto
- **User context** disponible en controllers

### **Database Design**
- **PostgreSQL** en producción
- **SQLite3** en desarrollo
- **ActiveRecord** ORM
- **Migraciones** para cambios de schema
- **Seeds** para datos iniciales

## 🎨 **Frontend Architecture (React SPA)**

### **Estructura de Componentes**
```
src/
├── components/
│   ├── layout/          # Layout, Navigation, Header
│   ├── common/          # Button, Modal, Table, Form
│   └── features/        # Por dominio: customers/, vehicles/, etc.
├── hooks/               # Custom hooks reutilizables
├── services/            # API calls con axios
├── contexts/            # Estado global (solo auth)
├── pages/               # Páginas principales
├── utils/               # Utilidades
└── assets/              # Imágenes, iconos, etc.
```

### **State Management Strategy**

#### **Server State (React Query)**
```javascript
// Cache de datos del servidor
const { data, isLoading, error } = useQuery(['customers'], fetchCustomers);
const { mutate } = useMutation(createCustomer, {
  onSuccess: () => queryClient.invalidateQueries(['customers'])
});
```

#### **Client State (useState/useReducer)**
```javascript
// Solo para estado de UI
const [isModalOpen, setIsModalOpen] = useState(false);
const [formData, setFormData] = useState({});
```

#### **Global State (Context)**
```javascript
// Solo para autenticación
const { user, login, logout } = useAuth();
```

### **Component Patterns**

#### **Container/View Pattern**
```javascript
// Container: Lógica y estado
const CustomersContainer = () => {
  const { data: customers, isLoading } = useQuery(['customers'], fetchCustomers);
  const { mutate: deleteCustomer } = useMutation(deleteCustomer);
  
  return <CustomersView 
    customers={customers} 
    isLoading={isLoading}
    onDelete={deleteCustomer}
  />;
};

// View: Solo presentación
const CustomersView = ({ customers, isLoading, onDelete }) => {
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-4">
      {customers?.map(customer => (
        <CustomerCard key={customer.id} customer={customer} onDelete={onDelete} />
      ))}
    </div>
  );
};
```

#### **Custom Hooks Pattern**
```javascript
// Lógica reutilizable
const useCustomers = () => {
  return useQuery(['customers'], fetchCustomers);
};

const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation(createCustomer, {
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      toast.success('Cliente creado exitosamente');
    }
  });
};
```

### **Styling Strategy (Tailwind CSS v4)**

#### **Design System**
```css
/* Colores del sistema */
@theme {
  --color-brand-500: #465fff;     /* Acciones principales */
  --color-gray-500: #667085;      /* Elementos secundarios */
  --color-success-500: #12b76a;   /* Estados exitosos */
  --color-error-500: #f04438;     /* Errores */
  --color-warning-500: #f79009;   /* Alertas */
}
```

#### **Component Styling**
```javascript
// Usar clases de Tailwind consistentemente
const Button = ({ variant = 'primary', children, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-error-500 text-white hover:bg-error-600'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

## 🔄 **Data Flow**

### **Request Flow**
```
1. User Action (Frontend)
   ↓
2. API Call (Axios + React Query)
   ↓
3. HTTP Request (Backend)
   ↓
4. Controller (Rails)
   ↓
5. Service/Model (Business Logic)
   ↓
6. Database Query (ActiveRecord)
   ↓
7. Serialization (Blueprinter)
   ↓
8. JSON Response
   ↓
9. React Query Cache
   ↓
10. Component Re-render
```

### **Error Handling Flow**
```
1. Error occurs (Backend/Frontend)
   ↓
2. Error Response (JSON)
   ↓
3. React Query Error State
   ↓
4. Error Boundary (Frontend)
   ↓
5. User Notification (Toast)
   ↓
6. Fallback UI (Error State)
```

## 🚀 **Deployment Architecture**

### **Development**
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   Vite Dev      │    │   Rails Server  │
│   Port: 5173    │    │   Port: 3000    │
└─────────────────┘    └─────────────────┘
```

### **Production (Railway)**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   Railway CDN   │    │   Railway App   │    │   PostgreSQL    │
│   Static Files  │    │   Rails API     │    │   Managed DB    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 **Performance Considerations**

### **Backend Optimizations**
- **Eager Loading** para evitar N+1 queries
- **Pagination** con Pagy
- **Caching** con Redis (producción)
- **Database Indexing** en campos frecuentes

### **Frontend Optimizations**
- **Code Splitting** con React.lazy
- **Image Optimization** con Vite
- **Bundle Analysis** con Vite Bundle Analyzer
- **React Query Caching** para datos del servidor

### **Network Optimizations**
- **HTTP/2** en producción
- **Gzip Compression** habilitado
- **CDN** para assets estáticos
- **API Response Caching** con headers apropiados

## 🔒 **Security Architecture**

### **Backend Security**
- **JWT Authentication** con expiración
- **CORS** configurado para frontend
- **Input Validation** en models y controllers
- **SQL Injection** prevenido por ActiveRecord
- **XSS Protection** en responses

### **Frontend Security**
- **XSS Prevention** con React
- **CSRF Protection** via SameSite cookies
- **Content Security Policy** configurado
- **Input Sanitization** en forms

## 🧪 **Testing Architecture**

### **Backend Testing (RSpec)**
- **Unit Tests** para models
- **Integration Tests** para controllers
- **Request Tests** para API endpoints
- **Factory Bot** para test data

### **Frontend Testing (Vitest)**
- **Component Tests** con Testing Library
- **Hook Tests** para custom hooks
- **Integration Tests** para user flows
- **Mock Service Worker** para API mocking

## 📈 **Monitoring & Observability**

### **Backend Monitoring**
- **Rails Logs** estructurados
- **Performance Metrics** con New Relic
- **Error Tracking** con Sentry
- **Database Monitoring** con pg_stat_statements

### **Frontend Monitoring**
- **Error Boundaries** para error catching
- **Performance Monitoring** con Web Vitals
- **User Analytics** con Google Analytics
- **Console Logging** para debugging

## 🔧 **Development Tools**

### **Backend Tools**
- **Rails Console** para debugging
- **RSpec** para testing
- **Rubocop** para linting
- **Brakeman** para security scanning

### **Frontend Tools**
- **Vite Dev Server** con HMR
- **Vitest** para testing
- **ESLint** para linting
- **Prettier** para formatting

---

**Última actualización**: Diciembre 2025
**Versión**: 3.0 - Arquitectura optimizada para Cursor AI
