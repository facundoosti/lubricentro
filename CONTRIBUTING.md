# Guía de Contribución - Sistema Lubricentro 🚗

## 🎯 Antes de Empezar

### 1. Lee la Documentación
- **`.cursorrules`** - Patrones y reglas del proyecto (OBLIGATORIO)
- **`backend/BLUEPRINT_GUIDE.md`** - Si trabajas en backend
- **`frontend/IMPORT_RULES.md`** - Si trabajas en frontend
- **`DOCKER_README.md`** - Para deployment y Docker

### 2. Configura tu Entorno
```bash
# Clonar el repositorio
git clone <repository-url>
cd lubricentro

# Levantar con Docker (recomendado)
docker-compose up -d

# O desarrollo local
cd backend && bundle install && rails db:migrate && rails s
cd frontend && npm install && npm run dev
```

## 🚀 Workflow de Desarrollo

### 1. Crear Branch
```bash
git checkout -b feature/nombre-descriptivo
# Ejemplos:
# feature/customer-search
# fix/appointment-validation
# docs/update-readme
```

### 2. Desarrollar
- Sigue los patrones de `.cursorrules`
- Usa alias de importación en frontend (`@ui`, `@services`, etc.)
- Mantén componentes <300 líneas
- Usa Tailwind CSS v4 exclusivamente

### 3. Testing
```bash
# Backend
cd backend && rspec

# Frontend
cd frontend && npm test

# Todo
make test
```

### 4. Commit
```bash
git add .
git commit -m "feat: add customer search functionality"
# Usa conventional commits: feat, fix, docs, style, refactor, test, chore
```

### 5. Push y PR
```bash
git push origin feature/nombre-descriptivo
# Crear PR en GitHub con descripción clara
```

## 📋 Patrones de Código

### Backend (Rails)
```ruby
# Response Pattern (OBLIGATORIO)
render json: {
  success: true,
  data: { ... },
  message: "Success message"
}

# Error Pattern
render json: {
  success: false,
  errors: ["Error details"],
  message: "Error occurred"
}

# Controller Structure
class Api::V1::EntityController < ApplicationController
  before_action :set_entity, only: [:show, :update, :destroy]
  
  def index
    @pagy, @entities = pagy(Entity.all)
    render json: { success: true, data: { entities: EntitySerializer.render_as_hash(@entities), pagination: pagy_metadata(@pagy) } }
  end
end
```

### Frontend (React)
```javascript
// Import Alias Rules (OBLIGATORIO)
import Button from '@ui/Button';
import { useCustomers } from '@services/customersService';
import Layout from '@layout/Layout';

// Container/View Pattern
const EntityContainer = () => {
  const { data, isLoading, error } = useQuery(['entities'], fetchEntities);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <EntityView entities={data} />;
};

// Component Structure
const EntityView = ({ entities, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {/* UI con Tailwind CSS v4 */}
    </div>
  );
};
```

## 🎨 UI/UX Guidelines

### Tailwind CSS v4 (OBLIGATORIO)
```css
/* Usar colores del sistema */
bg-brand-500    /* Acciones principales */
text-gray-500   /* Elementos secundarios */
bg-success-500  /* Estados exitosos */
bg-error-500    /* Errores */
bg-warning-500  /* Alertas */

/* Mobile-first responsive */
sm: md: lg: xl:
```

### Componentes Reutilizables
- **Button**: Estados loading, disabled, variants
- **Modal**: Confirmaciones y formularios
- **Table**: Paginación, filtros, acciones
- **Form**: Validación con react-hook-form

## 🧪 Testing

### Backend (RSpec)
```ruby
# Model specs
describe Customer do
  it { should validate_presence_of(:name) }
  it { should have_many(:vehicles) }
end

# Controller specs
describe Api::V1::CustomersController do
  describe 'GET #index' do
    it 'returns success response' do
      get :index
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
    end
  end
end
```

### Frontend (Vitest)
```javascript
// Component testing
test('renders customer list', () => {
  render(<CustomerList customers={mockCustomers} />);
  expect(screen.getByText('Customers')).toBeInTheDocument();
});

// Hook testing
test('useCustomers hook', () => {
  const { result } = renderHook(() => useCustomers());
  expect(result.current.isLoading).toBe(true);
});
```

## ⚠️ Reglas Críticas

### NUNCA hacer:
- ❌ Editar `schema.rb` directamente
- ❌ Usar rutas relativas en imports (`../../ui/Button`)
- ❌ CSS custom sin justificación
- ❌ `fetch` directo (usar React Query)
- ❌ Componentes >300 líneas
- ❌ Controllers sin validación de params

### SIEMPRE hacer:
- ✅ Usar patrones de `.cursorrules`
- ✅ Validar datos en backend Y frontend
- ✅ Manejar estados de loading y error
- ✅ Mobile-first responsive design
- ✅ Usar alias de importación
- ✅ Testing para nuevas funcionalidades

## 🚀 Comandos Útiles

### Desarrollo
```bash
# Levantar todo
make dev
# o
docker-compose up -d

# Solo backend
cd backend && rails s

# Solo frontend
cd frontend && npm run dev
```

### Testing
```bash
# Backend
make test-backend
# o
cd backend && rspec

# Frontend
make test-frontend
# o
cd frontend && npm test

# Todo
make test
```

### Database
```bash
# Migraciones
cd backend && rails db:migrate

# Seed data
cd backend && rails db:seed

# Console
cd backend && rails console
```

### Build
```bash
# Frontend build
cd frontend && npm run build

# Docker build
docker-compose build
```

## 📝 Conventional Commits

Usa este formato para commits:
```
type(scope): description

feat: add customer search functionality
fix: resolve appointment validation issue
docs: update README with new commands
style: format code with prettier
refactor: extract common table logic
test: add unit tests for customer service
chore: update dependencies
```

## 🔍 Code Review

### Checklist para PRs:
- [ ] Sigue patrones de `.cursorrules`
- [ ] Usa alias de importación en frontend
- [ ] Tests pasan (`make test`)
- [ ] No hay linter errors
- [ ] Mobile responsive
- [ ] Manejo de errores implementado
- [ ] Loading states incluidos
- [ ] Documentación actualizada si es necesario

### Checklist para Reviewers:
- [ ] Código sigue patrones establecidos
- [ ] Tests son adecuados
- [ ] UI/UX es consistente
- [ ] Performance es aceptable
- [ ] Seguridad no comprometida

## 🆘 Ayuda

### Con Cursor AI:
- Usa `@` para referenciar archivos: `@README.md`, `@.cursorrules`
- Cmd+K para editar con contexto
- Cmd+L para chat con contexto del archivo actual
- Cmd+I para Composer (editar múltiples archivos)

### Documentación:
- **Patrones**: `.cursorrules`
- **Backend**: `backend/BLUEPRINT_GUIDE.md`
- **Frontend**: `frontend/IMPORT_RULES.md`
- **Deploy**: `DOCKER_README.md`

### Issues:
- Crea issue en GitHub con etiquetas apropiadas
- Incluye pasos para reproducir
- Especifica entorno y versión

---

**¡Gracias por contribuir al Sistema Lubricentro!** 🚗

**Última actualización**: Diciembre 2025
