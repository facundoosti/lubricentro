# Active Context - Sistema Lubricentro

## 🚦 Backend: Métricas y Testing Dashboard (Junio 2024)

- [x] Refactor y robustez de tests de métricas de dashboard (alertas, crecimiento, retención)
- [x] Integración total de asociaciones service_record_services y service_record_products en backend y tests
- [x] Seed y factories alineados con la lógica real del sistema
- [x] Tests de backend en verde para métricas de dashboard
- [x] Patrones de testeo para fechas y asociaciones explícitas documentados

## 🎯 **Estado Actual: Fase 7 - CRUD Servicios + MVP Focus**

### **Última Actividad Completada**
- ✅ **Tabla de Servicios implementada** con paginación y búsqueda
- ✅ **Servicio de servicios** con React Query hooks completos
- ✅ **Funcionalidad de eliminar servicios** con confirmación
- ✅ **Iconos por tipo de servicio** (aceite, filtro, frenos, etc.) con colores específicos
- ✅ **Formateo de precios** en pesos argentinos
- ✅ **Filtros por rango de precio** implementados
- ✅ **Fecha de creación** mostrada en tabla
- ✅ **react-hot-toast** instalado y configurado en Layout
- ✅ **Botón de IA por voz** implementado en header (Post-MVP)
- ✅ **Documentación completa** de funcionalidad de IA por voz en `voiceAI.md` (Post-MVP)

### **Problemas Resueltos Recientemente**
- ✅ **InputField compatible con react-hook-form** (forwardRef implementado)
- ✅ **Clases CSS Tailwind v4** corregidas (error-500 → red-500, etc.)
- ✅ **Button con prop loading** agregada funcionalidad
- ✅ **Debug logs** agregados en puntos críticos del flujo
- ✅ **react-hot-toast** instalado y configurado para notificaciones
- ✅ **Icono sparkles separado** del texto en header con tooltip funcional

### **Componentes Creados en esta Sesión**
- ✅ `ServicesTable.jsx` - Tabla completa con CRUD actions
- ✅ `servicesService.js` - Servicio completo con React Query
- ✅ `Services.jsx` - Página principal de servicios actualizada
- ✅ Configuración de `Toaster` en Layout.jsx
- ✅ `SparklesIcon` en icons/index.jsx
- ✅ Botón de IA por voz en Header.jsx

## 🚀 **Próximos Pasos Inmediatos**

### **1. Completar CRUD Vehículos (Prioridad Alta - MVP)** 🚗
- [ ] **Modal para crear vehículo** con formulario
- [ ] **Modal para editar vehículo** con datos pre-poblados
- [ ] **Formulario de vehículo** con validación (react-hook-form)
- [ ] **Selector de cliente** en formulario
- [ ] **Validación de patente única** en frontend

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

### **4. Sistema de Turnos (Prioridad Media - MVP)** 📅
- [ ] **Calendario de turnos** básico
- [ ] **Crear/editar turnos** con selección de cliente y vehículo
- [ ] **Estados de turno** (scheduled, confirmed, completed, cancelled)
- [ ] **Notificaciones** básicas

### **5. IA por Voz (Prioridad Baja - Post-MVP)** 🎤
- [ ] **Instalar react-speech-recognition** en frontend
- [ ] **Voice Controller** en Rails API
- [ ] **Voice AI Service** para procesamiento
- [ ] **Configuración de Claude API** y MCP Server
- [ ] **Comandos básicos de voz** (clientes, vehículos)

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
  onView, 
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

## 📊 **Métricas Actuales**

- **CRUD Clientes**: 100% completado ✅
- **CRUD Vehículos**: 70% completado (tabla + eliminar + servicio)
- **CRUD Productos**: 50% completado (tabla + eliminar + servicio)
- **CRUD Servicios**: 50% completado (tabla + eliminar + servicio)
- **Componentes UI**: 85% completado
- **Servicios API**: 90% completado
- **Integración Backend-Frontend**: 90% completado
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
- **Botón de voz** con tooltip y estados

## 🔄 **Estado de Integración**

### **Backend ↔ Frontend**
- ✅ API endpoints funcionando
- ✅ Serializers optimizados
- ✅ Paginación sincronizada
- ✅ Búsqueda implementada
- ✅ Validaciones consistentes

### **React Query**
- ✅ Cache management automático
- ✅ Background refetch
- ✅ Optimistic updates
- ✅ Error boundaries
- ✅ Loading states

### **Notificaciones**
- ✅ react-hot-toast instalado y configurado
- ✅ Toaster configurado en Layout
- ✅ Estilos personalizados para dark theme
- ✅ Duración y colores optimizados

### **IA por Voz (Post-MVP)**
- ✅ Botón UI implementado (indicador visual)
- ✅ Tooltip funcional
- ✅ Documentación completa en `voiceAI.md`
- 📋 Integración con react-speech-recognition (pendiente - post-MVP)
- 📋 Backend Voice Controller (pendiente - post-MVP)
- 📋 Servicio de IA en la nube (pendiente - post-MVP)

## 📋 **Decisiones Técnicas Recientes**

1. **Uso de forwardRef en InputField** - Para compatibilidad con react-hook-form
2. **Clases CSS estándar** - En lugar de clases personalizadas para Tailwind v4
3. **Debug logs extensivos** - Para facilitar troubleshooting
4. **Iconos por tipo de servicio** - Para mejor UX visual (aceite, filtro, frenos, etc.)
5. **Formateo de precios** - En pesos argentinos con Intl.NumberFormat
6. **Filtros por rango de precio** - Para búsqueda avanzada de servicios
7. **react-hot-toast** - Para notificaciones consistentes en toda la app
8. **IA por voz con Claude + MCP** - Arquitectura escalable para comandos de voz
9. **Botón sparkles azul** - Indicador visual de funcionalidad en desarrollo

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
