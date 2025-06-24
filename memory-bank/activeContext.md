# Active Context - Sistema Lubricentro

## 🚦 Backend: Métricas y Testing Dashboard (Junio 2024)

- [x] Refactor y robustez de tests de métricas de dashboard (alertas, crecimiento, retención)
- [x] Integración total de asociaciones service_record_services y service_record_products en backend y tests
- [x] Seed y factories alineados con la lógica real del sistema
- [x] Tests de backend en verde para métricas de dashboard
- [x] Patrones de testeo para fechas y asociaciones explícitas documentados

## 🎯 **Estado Actual: Fase 10 - Sistema de Toast COMPLETADO ✅**

### **Última Actividad Completada - Sistema de Notificaciones Toast**
- ✅ **Hook personalizado creado** - `useToast.js` con funciones básicas
- ✅ **Servicio de notificaciones** - `notificationService.js` con mensajes predefinidos
- ✅ **Mensajes estandarizados** - Para todas las entidades del sistema
- ✅ **Manejo de errores API** - Extracción automática de mensajes de error
- ✅ **Configuración mejorada** - Toaster con diseño consistente y dark mode
- ✅ **Páginas actualizadas** - Todas las páginas principales usando el nuevo sistema
- ✅ **Componente de ejemplo** - `ToastExample.jsx` para demostración

### **Problemas Resueltos Recientemente**
- ✅ **Alertas inconsistentes** - Reemplazadas por sistema de toast unificado
- ✅ **Mensajes hardcodeados** - Centralizados en servicio de notificaciones
- ✅ **Manejo de errores manual** - Automatizado con `handleApiError`
- ✅ **Diseño inconsistente** - Toaster configurado con tema del sistema
- ✅ **Debug logs** - Agregados para facilitar troubleshooting futuro

### **Componentes Creados en esta Sesión**
- ✅ `useToast.js` - Hook personalizado para funciones básicas de toast
- ✅ `notificationService.js` - Servicio completo con mensajes predefinidos
- ✅ `ToastExample.jsx` - Componente de demostración del sistema
- ✅ **Configuración Toaster** - Mejorada en Layout.jsx

### **Funcionalidades Implementadas**
- ✅ **Tipos de notificación** - Success, Error, Info, Warning, Loading
- ✅ **Duración automática** - Success (3s), Error (5s), Info/Warning (4s)
- ✅ **Mensajes predefinidos** - Para clientes, vehículos, productos, servicios, turnos, atenciones
- ✅ **Manejo de errores API** - Extracción automática de mensajes de error
- ✅ **Diseño consistente** - Integrado con el tema del sistema
- ✅ **Posicionamiento** - Top-right con animaciones suaves

### **Páginas Actualizadas**
- ✅ `Customers.jsx` - Reemplazados alert() por toast notifications
- ✅ `Vehicles.jsx` - Actualizado para usar sistema de notificaciones
- ✅ `Products.jsx` - Migrado de toast directo a servicio centralizado
- ✅ `Services.jsx` - Actualizado para usar sistema de notificaciones
- ✅ `ServiceRecords.jsx` - Migrado a sistema de notificaciones
- ✅ `Appointments.jsx` - Actualizado para usar sistema de notificaciones

### **Patrón de Notificaciones Establecido**
```javascript
// Uso básico
const notification = useNotificationService();
notification.showSuccess('Mensaje de éxito');
notification.showError('Mensaje de error');

// Uso específico por entidad
notification.showCustomerSuccess('CREATED');
notification.showCustomerError('ERROR_CREATE', 'Error específico');

// Manejo de errores API
notification.handleApiError(error, 'Mensaje por defecto');
```

### **Mensajes Predefinidos Implementados**
- ✅ **Clientes**: CREATED, UPDATED, DELETED, ERROR_CREATE, ERROR_UPDATE, ERROR_DELETE, ERROR_LOAD
- ✅ **Vehículos**: CREATED, UPDATED, DELETED, ERROR_CREATE, ERROR_UPDATE, ERROR_DELETE, ERROR_LOAD
- ✅ **Productos**: CREATED, UPDATED, DELETED, ERROR_CREATE, ERROR_UPDATE, ERROR_DELETE, ERROR_LOAD
- ✅ **Servicios**: CREATED, UPDATED, DELETED, ERROR_CREATE, ERROR_UPDATE, ERROR_DELETE, ERROR_LOAD
- ✅ **Turnos**: CREATED, UPDATED, DELETED, CONFIRMED, COMPLETED, CANCELLED, ERROR_CREATE, ERROR_UPDATE, ERROR_DELETE, ERROR_LOAD
- ✅ **Atenciones**: CREATED, UPDATED, DELETED, ERROR_CREATE, ERROR_UPDATE, ERROR_DELETE, ERROR_LOAD
- ✅ **Generales**: LOADING, SAVING, DELETING, ERROR_NETWORK, ERROR_UNKNOWN, SUCCESS_OPERATION, WARNING_OPERATION

## 🎯 **Estado Actual: Fase 9 - Corrección de Paginación COMPLETADA ✅**

### **Última Actividad Completada - Corrección de Paginación en Tablas**
- ✅ **Problema identificado** - Nombres de propiedades incorrectos en CustomersTable
- ✅ **CustomersTable corregido** - Uso de nombres correctos de paginación
- ✅ **Props faltantes agregados** - totalItems e itemsPerPage al componente Pagination
- ✅ **Condición de renderizado corregida** - pagination.total_pages > 1
- ✅ **Logs de debugging agregados** - Para troubleshooting futuro
- ✅ **Consistencia establecida** - Todas las tablas usan el mismo patrón de paginación

### **Problemas Resueltos Recientemente**
- ✅ **Paginación no visible** - Nombres de propiedades corregidos (current_page, total_pages, total_count, per_page)
- ✅ **Props faltantes** - totalItems e itemsPerPage agregados al componente Pagination
- ✅ **Inconsistencia entre tablas** - CustomersTable ahora sigue el mismo patrón que las demás
- ✅ **Debug logs** - Agregados para facilitar troubleshooting futuro

### **Componentes Corregidos en esta Sesión**
- ✅ `CustomersTable.jsx` - Paginación corregida con nombres de propiedades correctos
- ✅ `Customers.jsx` - Logs de debugging agregados para verificar datos de paginación

### **Patrón de Paginación Establecido**
```jsx
{/* Paginación */}
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
```

### **Verificación de Consistencia**
- ✅ `CustomersTable.jsx` - Corregido y consistente ✅
- ✅ `ServicesTable.jsx` - Ya estaba correcto ✅
- ✅ `VehiclesTable.jsx` - Ya estaba correcto ✅
- ✅ `ProductsTable.jsx` - Ya estaba correcto ✅
- ✅ `ServiceRecordsTable.jsx` - Ya estaba correcto ✅

## 🚀 **Próximos Pasos Inmediatos**

### **1. Completar CRUD Vehículos (Prioridad Alta - MVP)** 🚗
- [x] **Modal para crear vehículo** con formulario ✅
- [x] **Modal para editar vehículo** con datos pre-poblados ✅
- [x] **Formulario de vehículo** con validación (react-hook-form) ✅
- [x] **Selector de cliente** en formulario ✅
- [x] **Validación de patente única** en frontend ✅
- [ ] **Integrar en página principal de vehículos** (tabla existente)

### **2. Completar CRUD Productos (Prioridad Alta - MVP)** 📦
- [ ] **Modal para crear producto** con formulario
- [ ] **Modal para editar producto** con datos pre-poblados
- [ ] **Formulario de producto** con validación (react-hook-form)
- [ ] **Validación de nombre único** en frontend
- [ ] **Selector de unidades de medida** (litros, unidades, kg, etc.)

### **3. Completar CRUD Servicios (Prioridad Alta - MVP)** 🔧
- [ ] **Modal para crear servicio** con formulario
- [ ] **Modal para editar servicio** con datos pre-poblados
- [ ] **Formulario de servicio** con validación (react-hook-form)
- [ ] **Validación de nombre único** en frontend
- [ ] **Gestión de precios base** con validación

### **4. Sistema de ServiceRecords (Prioridad Media - MVP)** 📋
- [ ] **Modal para crear atención** con formulario
- [ ] **Modal para editar atención** con datos pre-poblados
- [ ] **Formulario de atención** con validación (react-hook-form)
- [ ] **Selector de cliente y vehículo** en formulario
- [ ] **Cálculo automático de totales**

### **5. IA por Voz (Prioridad Baja - Post-MVP)** 🎤
- [ ] **Instalar react-speech-recognition** en frontend
- [ ] **Voice Controller** en Rails API
- [ ] **Voice AI Service** para procesamiento
- [ ] **Configuración de Claude API** y MCP Server
- [ ] **Comandos básicos de voz** (clientes, vehículos, turnos)

## 🎤 **IA por Voz - Arquitectura (Post-MVP)**

### **Stack Tecnológico**
- **Frontend**: `react-speech-recognition` para transcripción
- **Backend**: Rails API + Voice Controller
- **IA Cloud**: Claude (Anthropic) + MCP Server
- **Comunicación**: HTTP/REST entre componentes

### **Flujo de Datos**
```
Usuario habla → react-speech-recognition → Rails API → Claude AI → MCP Server → Rails API → Respuesta
```

### **Comandos de Voz Planificados**
- **Clientes**: "crear cliente [nombre]", "buscar cliente [nombre]"
- **Vehículos**: "agregar vehículo [patente] para [cliente]"
- **Turnos**: "agendar turno para [cliente] el [fecha]"
- **Servicios**: "listar servicios", "agregar servicio [nombre]"

### **Estados del Botón de Voz**
```javascript
const states = {
  idle: 'sparkles',           // Icono normal
  listening: 'microphone',    // Escuchando
  processing: 'loading',      // Procesando
  success: 'check',           // Éxito
  error: 'alert'              // Error
};
```

**Nota**: Esta funcionalidad está documentada y preparada para implementación futura, pero no es parte del MVP actual.

## 🔧 **Patrones Establecidos**

### **Servicios React Query**
```javascript
// Patrón establecido para todos los servicios
export const useCreateEntity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      console.log("API call with:", data);
      const response = await api.post('/endpoint', { entity: data });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
    },
    onError: (error) => {
      console.error('Error:', error);
      throw error;
    },
  });
};
```

### **Tablas con CRUD**
```javascript
// Patrón establecido para todas las tablas
const EntityTable = ({ 
  entities, 
  pagination, 
  onPageChange, 
  onSearch, 
  onEdit, 
  onDelete, 
  onCreate, 
  loading 
}) => {
  // Implementación consistente
};
```

### **Formularios con Validación**
```javascript
// Patrón establecido para todos los formularios
const EntityForm = ({ onSubmit, initialData, isLoading, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || { /* campos */ }
  });
  // Validación y manejo de errores consistente
};
```

### **Páginas de Perfil**
```javascript
// Patrón establecido para páginas de perfil
const EntityProfile = () => {
  const { id } = useParams();
  const { data: entityData } = useEntity(id);
  const entity = entityData?.data;
  
  // Estado local como respaldo para actualizaciones
  const [localEntity, setLocalEntity] = useState(null);
  
  // Múltiples estrategias de actualización
  const handleUpdate = async (data) => {
    await updateMutation.mutateAsync({ id, data });
    setLocalEntity(prev => ({ ...prev, ...data }));
    await refetchEntity();
  };
};
```

## 📊 **Métricas Actuales**

- **CRUD Clientes**: 100% completado ✅
- **Vista de Perfil de Cliente**: 100% completado ✅
- **CRUD Vehículos**: 90% completado (tabla + eliminar + modal + formulario)
- **CRUD Productos**: 50% completado (tabla + eliminar + servicio)
- **CRUD Servicios**: 50% completado (tabla + eliminar + servicio)
- **Sistema de Turnos**: 100% completado ✅
- **CRUD ServiceRecords**: 50% completado (tabla + eliminar + servicio)
- **Componentes UI**: 95% completado
- **Servicios API**: 95% completado
- **Integración Backend-Frontend**: 95% completado
- **IA por Voz**: 10% completado (Post-MVP - Prioridad Baja)

## 🎨 **Sistema de Diseño Consolidado**

### **Colores (Tailwind v4)**
- Primary: `blue-600` / `blue-700`
- Success: `green-600` / `green-700`
- Error: `red-600` / `red-700`
- Warning: `yellow-600` / `yellow-700`
- **IA por Voz**: `blue-600` / `blue-400` (dark mode)

### **Componentes Base**
- Inputs con estados (normal, error, success, disabled)
- Botones con variantes y loading
- Modales con backdrop y escape key
- Tablas responsive con hover states
- Paginación accesible
- **Cards de perfil** - MetaCard, InfoCard, VehiclesCard
- **Botón de voz** con tooltip y estados

## 🔄 **Estado de Integración**

### **Backend ↔ Frontend**
- ✅ API endpoints funcionando
- ✅ Serializers optimizados
- ✅ Cache management mejorado
- ✅ Actualizaciones en tiempo real

## 🎯 **Objetivos para la Próxima Sesión**

1. **Completar formulario de vehículos** (2-3 horas)
2. **Completar formulario de productos** (2-3 horas)
3. **Completar formulario de servicios** (2-3 horas)
4. **Implementar selector de cliente** (1-2 horas)
5. **Agregar validación de patente única** (1 hora)
6. **Testing del CRUD completo** (1 hora)

## 🔐 **Variables de Entorno Necesarias**

### **Para MVP (Funcionalidades Core)**
```bash
# Backend
DATABASE_URL=postgresql://...
RAILS_MASTER_KEY=...
CORS_ORIGINS=http://localhost:3000,https://tu-dominio.com

# Frontend
VITE_API_URL=http://localhost:3000/api/v1
```

### **Para IA por Voz (Post-MVP)**
```bash
# Frontend
REACT_APP_VOICE_AI_ENABLED=true

# Backend
VOICE_AI_SERVICE_URL=https://tu-servicio-ia.com
AI_SERVICE_TOKEN=token_de_autenticacion

# Servicio de IA
ANTHROPIC_API_KEY=tu_api_key_de_claude
RAILS_API_URL=https://tu-api-rails.com
RAILS_API_TOKEN=token_de_autenticacion
```

---

**Última actualización**: 20 de Junio 2024
**Próxima revisión**: Al completar CRUD vehículos, productos y servicios (MVP)

## 🎯 Estado Actual (Diciembre 2024)

### ✅ **Logro Reciente: Patrón de Tablas Establecido**

**Fecha**: Diciembre 2024
**Logro**: Establecimiento de patrón consistente para todas las tablas del sistema

**Cambios Implementados:**
- ✅ Análisis completo de `CustomersTable.jsx` como referencia base
- ✅ Actualización de `ServiceRecordsTable.jsx` al patrón establecido
- ✅ Documentación completa del patrón en `systemPatterns.md`
- ✅ Actualización del progreso en `progress.md`

**Patrón Establecido:**
```jsx
// Estructura obligatoria para todas las tablas
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
  // Header consistente: búsqueda + botón crear
  // Tabla con clases Tailwind fijas
  // Columna de acciones estandarizada
  // Paginación con componente del template
}
```

### 📊 **Estado de Tablas**

**✅ Siguiendo el Patrón:**
- `CustomersTable.jsx` - Patrón base establecido
- `ServiceRecordsTable.jsx` - Actualizada al patrón

**🚧 Pendientes de Actualización:**
- `VehiclesTable.jsx` - Necesita alineación
- `ServicesTable.jsx` - Necesita alineación
- `ProductsTable.jsx` - Necesita alineación
- `AppointmentsTable.jsx` - Necesita alineación

## 🎯 Próximos Pasos Inmediatos

### Prioridad Alta (Esta Semana)

1. **Actualizar Tablas Restantes** 🚧
   - Actualizar `VehiclesTable.jsx` al patrón establecido
   - Actualizar `ServicesTable.jsx` al patrón establecido
   - Actualizar `ProductsTable.jsx` al patrón establecido
   - Actualizar `AppointmentsTable.jsx` al patrón establecido

2. **Implementar Formularios Básicos** 🚧
   - CustomerForm con validación (ya existe, verificar)
   - VehicleForm con validación
   - ServiceForm con validación
   - ProductForm con validación

3. **Testing Frontend** 🚧
   - Component testing con Jest
   - Integration testing
   - E2E testing básico

### Prioridad Media (Próximas 2 Semanas)

1. **Autenticación Completa**
   - Login/Logout
   - Protected routes
   - User management

2. **Formularios Restantes**
   - AppointmentForm
   - ServiceRecordForm

3. **Reportes Básicos**
   - Dashboard avanzado
   - Exportación de datos

## 🔧 Contexto Técnico Actual

### Backend Status ✅
- **API completa**: Todos los endpoints CRUD funcionando
- **Testing**: Tests en verde, cobertura buena
- **Base de datos**: PostgreSQL configurado y optimizado
- **Serializers**: Blueprinter funcionando correctamente

### Frontend Status 🚧
- **Componentes UI**: Base sólida establecida
- **Patrón de tablas**: ✅ Establecido y documentado
- **Servicios API**: React Query funcionando
- **Routing**: Configurado y funcionando
- **Formularios**: Pendiente implementación completa

### Arquitectura Status ✅
- **Monorepo**: Estructura establecida
- **Import aliases**: Configurados y funcionando
- **Tailwind CSS**: Sistema de diseño establecido
- **Patrones**: Documentados y siendo seguidos

## 📋 Decisiones Técnicas Activas

### Patrón de Tablas ✅ DECIDIDO
- **Referencia**: `CustomersTable.jsx`
- **Estructura**: Header + Tabla + Paginación
- **Props**: Estandarizadas para todas las tablas
- **Clases**: Tailwind fijas para consistencia
- **Acciones**: Ver, Editar, Eliminar siempre presentes

### Import Aliases ✅ DECIDIDO
- **Regla**: NUNCA usar rutas relativas
- **Aliases**: `@ui`, `@components`, `@services`, etc.
- **Enforcement**: ESLint configurado para detectar violaciones

### Tailwind CSS ✅ DECIDIDO
- **Regla**: Solo Tailwind, sin CSS personalizado
- **Tema**: Sistema de colores establecido
- **Responsive**: Mobile-first design

## 🚨 Issues Conocidos

### Resueltos ✅
- ✅ Import aliases funcionando correctamente
- ✅ ServiceRecordsTable alineada con patrón de tablas
- ✅ Patrón de tablas documentado y establecido

### Pendientes 🚧
- 🚧 Algunas tablas no siguen el patrón establecido
- 🚧 Formularios de creación/edición pendientes
- 🚧 Testing frontend pendiente

## 📈 Métricas de Progreso

**Backend**: 100% ✅
**Frontend**: 85% 🚧
**Testing**: 70% 🚧
**Documentation**: 95% ✅
**Overall**: 87% 🚧

## 🎉 Próximo Milestone

**Objetivo**: Todas las tablas siguiendo el patrón establecido
**Timeline**: Esta semana
**Criterio de éxito**: 6/6 tablas alineadas al patrón

---

**Última actualización**: Diciembre 2024
**Próxima revisión**: Al completar actualización de tablas restantes
