# Progress Report - Sistema Lubricentro

## 🧪 Backend Testing & Dashboard Metrics (Junio 2024)

- [x] Refactor y robustez en tests de DashboardStatsService (alertas, crecimiento, retención)
- [x] Integración total de asociaciones service_record_services y service_record_products en métricas y tests
- [x] Seed y factories alineados con la lógica real del sistema
- [x] Tests de backend en verde para métricas de dashboard
- [x] Documentación de patrones de testeo para datos de fechas y asociaciones explícitas
- [x] Limpieza de datos y uso de update_columns para fechas custom en tests
- [x] Validación de retención y crecimiento con datos controlados

## 📅 SISTEMA DE TURNOS COMPLETADO ✅

**Fecha**: Diciembre 2024
**Referencia**: `Appointments.jsx`, `AppointmentForm.jsx`, `AppointmentModal.jsx`

### ✅ **Funcionalidades Implementadas**
- [x] **FullCalendar integrado** con diseño del sistema
- [x] **Vistas múltiples**: Mes, Semana, Día
- [x] **Eventos interactivos**: Click para editar, selección para crear
- [x] **Colores por estado**: Azul (agendado), Verde (confirmado), Gris (completado), Rojo (cancelado)
- [x] **Localización en español** del calendario
- [x] **Responsive design** para móviles

### ✅ **Componentes Creados**
- [x] `appointmentsService.js` - Servicio completo con React Query
- [x] `AppointmentForm.jsx` - Formulario con validación y selectores
- [x] `AppointmentModal.jsx` - Modal reutilizable para CRUD
- [x] `Appointments.jsx` - Página principal con FullCalendar
- [x] **Estilos CSS FullCalendar** integrados con el tema

### ✅ **Funcionalidades CRUD**
- [x] **Crear turno**: Click en fecha del calendario
- [x] **Editar turno**: Click en evento del calendario
- [x] **Eliminar turno**: Modal de confirmación
- [x] **Estados de turno**: scheduled, confirmed, completed, cancelled
- [x] **Validaciones**: Cliente y vehículo requeridos, fecha futura

### ✅ **Integración Backend**
- [x] **API endpoints**: CRUD completo + confirmar/completar/cancelar
- [x] **Serializers**: Estructura optimizada con customer y vehicle
- [x] **Validaciones**: Fecha futura, estados válidos
- [x] **React Query**: Cache management y error handling

### ✅ **Problemas Resueltos**
- [x] **Error de importación FullCalendar**: DateSelectArg, EventClickArg
- [x] **Error vehicles.map**: Validaciones de arrays defensivas
- [x] **Nombres undefined**: Corrección de campos backend ↔ frontend
- [x] **Validaciones robustas**: Manejo de datos condicionales

## 📊 PATRÓN DE TABLAS ESTABLECIDO ✅

**Fecha**: Diciembre 2024
**Referencia**: `CustomersTable.jsx` y `ServiceRecordsTable.jsx`

### ✅ **Estructura Estándar Implementada**
- [x] Header consistente: búsqueda a la izquierda, botón crear a la derecha
- [x] Props estandarizadas: `entities`, `pagination`, `onPageChange`, `onSearch`, `onEdit`, `onDelete`, `onView`, `onCreate`, `loading`
- [x] Clases Tailwind fijas para todas las tablas
- [x] Columna de acciones estandarizada (Ver, Editar, Eliminar)
- [x] Estados de loading y empty con mensajes apropiados
- [x] Paginación usando componente `Pagination` del template
- [x] Hover effects consistentes
- [x] Responsive design mobile-first

### ✅ **Tablas Siguiendo el Patrón**
- [x] `CustomersTable.jsx` - Patrón base establecido ✅
- [x] `ServiceRecordsTable.jsx` - Actualizada al patrón ✅
- [ ] `VehiclesTable.jsx` - Pendiente actualización 🚧
- [ ] `ServicesTable.jsx` - Pendiente actualización 🚧
- [ ] `ProductsTable.jsx` - Pendiente actualización 🚧
- [ ] `AppointmentsTable.jsx` - Pendiente actualización 🚧

### ✅ **Patrones de Celdas Establecidos**
- [x] Celdas con avatar/iniciales para entidades principales
- [x] Celdas con badges para estados
- [x] Celdas con iconos y colores temáticos
- [x] Formateo consistente de fechas y monedas
- [x] Manejo de datos nulos/undefined

### ✅ **Documentación del Patrón**
- [x] Patrón documentado en `systemPatterns.md`
- [x] Reglas de implementación definidas
- [x] Ejemplos de código establecidos
- [x] Funciones helper estándar documentadas

## 🎯 Estado Actual del Proyecto

### ✅ **Fase 1: Setup y Configuración - COMPLETADA**
- [x] Estructura del proyecto Rails 8.0.2 + React
- [x] Configuración de CORS y API mode
- [x] Base de datos SQLite → PostgreSQL
- [x] Modelos principales (Customer, Vehicle, Service, Product, Appointment, ServiceRecord)
- [x] Migraciones y seeds básicos
- [x] Serializers con Blueprinter
- [x] Frontend React + Vite + Tailwind CSS v4
- [x] React Query para estado del servidor
- [x] React Router para navegación
- [x] Layout y navegación responsive

### ✅ **Fase 2: Backend API - COMPLETADA**
- [x] Controllers API con CRUD completo
- [x] Paginación con Pagy
- [x] Búsqueda y filtros
- [x] Validaciones en modelos
- [x] Manejo de errores consistente
- [x] Serializers optimizados
- [x] Tests básicos con RSpec
- [x] Métricas de dashboard robustas y testeadas

### ✅ **Fase 3: Frontend Core - COMPLETADA**
- [x] Componentes UI reutilizables
- [x] Sistema de rutas
- [x] Layout responsive
- [x] Context para estado global
- [x] Hooks personalizados
- [x] Servicios API con React Query
- [x] Manejo de errores y loading states

### ✅ **Fase 4: CRUD Clientes - COMPLETADA**
- [x] Tabla de clientes con paginación
- [x] Búsqueda de clientes
- [x] Modal para crear cliente
- [x] Modal para editar cliente
- [x] Modal de confirmación para eliminar
- [x] Formulario con validación (react-hook-form)
- [x] Servicio completo con React Query
- [x] Cache invalidation automático
- [x] Manejo de errores robusto
- [x] UI responsive y accesible

### ✅ **Fase 5: CRUD Vehículos - PARCIALMENTE COMPLETADA**
- [x] Tabla de vehículos con paginación
- [x] Búsqueda de vehículos (patente, marca, modelo)
- [x] Iconos por marca de vehículo
- [x] Servicio completo con React Query
- [x] Funcionalidad de eliminar vehículo
- [x] Integración con clientes (customer_name)
- [x] UI consistente con el diseño del sistema
- [ ] Modal para crear vehículo
- [ ] Modal para editar vehículo
- [ ] Formulario con validación
- [ ] Selector de cliente
- [ ] Validación de patente única

### ✅ **Fase 6: CRUD Productos - PARCIALMENTE COMPLETADA**
- [x] Tabla de productos con paginación
- [x] Búsqueda de productos por nombre
- [x] Iconos por tipo de producto (aceite, filtro, bujía, etc.)
- [x] Formateo de precios en pesos argentinos
- [x] Servicio completo con React Query
- [x] Funcionalidad de eliminar producto
- [x] Filtros por rango de precio
- [x] UI consistente con el diseño del sistema
- [ ] Modal para crear producto
- [ ] Modal para editar producto
- [ ] Formulario con validación
- [ ] Validación de nombre único
- [ ] Gestión de unidades de medida

### ✅ **Fase 7: CRUD Servicios - PARCIALMENTE COMPLETADA**
- [x] Tabla de servicios con paginación
- [x] Búsqueda de servicios por nombre
- [x] Iconos por tipo de servicio (aceite, filtro, frenos, etc.)
- [x] Formateo de precios en pesos argentinos
- [x] Servicio completo con React Query
- [x] Funcionalidad de eliminar servicio
- [x] Filtros por rango de precio
- [x] UI consistente con el diseño del sistema
- [ ] Modal para crear servicio
- [ ] Modal para editar servicio
- [ ] Formulario con validación
- [ ] Validación de nombre único
- [ ] Gestión de precios base

### ✅ **Fase 8: CRUD ServiceRecords (Atenciones) - COMPLETADA**
- [x] Tabla de atenciones con paginación
- [x] Búsqueda de atenciones
- [x] Servicio completo con React Query
- [x] Funcionalidad de eliminar atención
- [x] Integración con clientes y vehículos
- [x] Estados de loading y error
- [x] **Tabla actualizada al patrón establecido** ✅
- [x] Formateo de fechas y monedas
- [x] Badges para estados (Vencido, Próximo, Completado)
- [x] UI consistente con el diseño del sistema
- [ ] Modal para crear atención
- [ ] Modal para editar atención
- [ ] Formulario con validación
- [ ] Selector de cliente y vehículo
- [ ] Cálculo automático de totales

## 🚀 **Componentes UI Creados**

### **Formularios y Inputs**
- ✅ `InputField.jsx` - Campo de entrada con validación
- ✅ `TextArea.jsx` - Campo de texto multilínea
- ✅ `Button.jsx` - Botón con estados loading y variantes
- ✅ `CustomerForm.jsx` - Formulario de cliente con validación
- ✅ `AppointmentForm.jsx` - Formulario de turno con validación

### **Modales y Overlays**
- ✅ `Modal.jsx` - Modal reutilizable con backdrop
- ✅ `ConfirmModal.jsx` - Modal de confirmación para acciones destructivas
- ✅ `CustomerModal.jsx` - Modal para crear/editar clientes
- ✅ `AppointmentModal.jsx` - Modal para crear/editar turnos

### **Tablas y Datos**
- ✅ `Table.jsx` - Componente de tabla base
- ✅ `Pagination.jsx` - Paginación reutilizable
- ✅ `Badge.jsx` - Badges para estados
- ✅ `CustomersTable.jsx` - Tabla de clientes con CRUD
- ✅ `VehiclesTable.jsx` - Tabla de vehículos con CRUD
- ✅ `ProductsTable.jsx` - Tabla de productos con CRUD
- ✅ `ServicesTable.jsx` - Tabla de servicios con CRUD

### **Calendario y Eventos**
- ✅ `Appointments.jsx` - Página principal con FullCalendar
- ✅ **Estilos CSS FullCalendar** integrados con el tema
- ✅ **Eventos interactivos** con colores por estado
- ✅ **Vistas múltiples** (Mes, Semana, Día)

### **Layout y Navegación**
- ✅ `Layout.jsx` - Layout principal con sidebar
- ✅ `Sidebar.jsx` - Navegación lateral
- ✅ `Header.jsx` - Header con breadcrumbs

## 🔧 **Servicios API Implementados**

### **Customers Service**
- ✅ `useCustomers()` - Query con paginación y búsqueda
- ✅ `useCustomer(id)` - Query para cliente individual
- ✅ `useCreateCustomer()` - Mutation para crear
- ✅ `useUpdateCustomer()` - Mutation para actualizar
- ✅ `useDeleteCustomer()` - Mutation para eliminar
- ✅ Cache invalidation automático
- ✅ Manejo de errores centralizado

### **Vehicles Service**
- ✅ `useVehicles()` - Query con paginación y búsqueda
- ✅ `useVehicle(id)` - Query para vehículo individual
- ✅ `useCreateVehicle()` - Mutation para crear
- ✅ `useUpdateVehicle()` - Mutation para actualizar
- ✅ `useDeleteVehicle()` - Mutation para eliminar
- ✅ Filtros por cliente y marca
- ✅ Búsqueda por patente, marca, modelo

### **Products Service**
- ✅ `useProducts()` - Query con paginación y búsqueda
- ✅ `useProduct(id)` - Query para producto individual
- ✅ `useCreateProduct()` - Mutation para crear
- ✅ `useUpdateProduct()` - Mutation para actualizar
- ✅ `useDeleteProduct()` - Mutation para eliminar
- ✅ Filtros por rango de precio
- ✅ Búsqueda por nombre
- ✅ Cache invalidation automático

### **Services Service**
- ✅ `useServices()` - Query con paginación y búsqueda
- ✅ `useService(id)` - Query para servicio individual
- ✅ `useCreateService()` - Mutation para crear
- ✅ `useUpdateService()` - Mutation para actualizar
- ✅ `useDeleteService()` - Mutation para eliminar
- ✅ Filtros por rango de precio
- ✅ Búsqueda por nombre
- ✅ Cache invalidation automático

### **Appointments Service**
- ✅ `useAppointments()` - Query con paginación y filtros
- ✅ `useAppointment(id)` - Query para turno individual
- ✅ `useCreateAppointment()` - Mutation para crear
- ✅ `useUpdateAppointment()` - Mutation para actualizar
- ✅ `useDeleteAppointment()` - Mutation para eliminar
- ✅ `useConfirmAppointment()` - Mutation para confirmar
- ✅ `useCompleteAppointment()` - Mutation para completar
- ✅ `useCancelAppointment()` - Mutation para cancelar
- ✅ `useUpcomingAppointments()` - Query para turnos próximos
- ✅ Filtros por cliente, vehículo, estado y rango de fechas
- ✅ Cache invalidation automático

## 📊 **Páginas Implementadas**

### **Dashboard**
- ✅ Métricas básicas
- ✅ Gráficos de servicios mensuales
- ✅ Estado actual del lubricentro

### **Clientes**
- ✅ Lista paginada con búsqueda
- ✅ CRUD completo con modales
- ✅ Validación de formularios
- ✅ Estados de loading y error
- ✅ Integración con vehículos (vehicles_count)

### **Vehículos**
- ✅ Lista paginada con búsqueda
- ✅ Eliminación de vehículos
- ✅ Iconos por marca
- ✅ Integración con clientes
- ✅ Estados de loading y error
- [ ] Crear vehículo (modal placeholder)
- [ ] Editar vehículo (modal placeholder)
- [ ] Formulario con validación

### **Productos**
- ✅ Lista paginada con búsqueda
- ✅ Eliminación de productos
- ✅ Iconos por tipo de producto
- ✅ Formateo de precios
- ✅ Estados de loading y error
- [ ] Crear producto (modal placeholder)
- [ ] Editar producto (modal placeholder)
- [ ] Formulario con validación

### **Servicios**
- ✅ Lista paginada con búsqueda
- ✅ Eliminación de servicios
- ✅ Iconos por tipo de servicio
- ✅ Formateo de precios
- ✅ Estados de loading y error
- [ ] Crear servicio (modal placeholder)
- [ ] Editar servicio (modal placeholder)

### **Turnos**
- ✅ **Calendario interactivo** con FullCalendar
- ✅ **Vistas múltiples**: Mes, Semana, Día
- ✅ **CRUD completo**: Crear, editar, eliminar turnos
- ✅ **Estados de turno**: Agendado, Confirmado, Completado, Cancelado
- ✅ **Eventos coloridos** por estado
- ✅ **Formulario completo** con validación
- ✅ **Selectores de cliente y vehículo** integrados
- ✅ **Localización en español**
- ✅ **Responsive design** para móviles
- ✅ **Estilos CSS personalizados** integrados con el tema

## 🎨 **Sistema de Diseño**

### **Colores (Tailwind v4)**
- ✅ Primary: `blue-600` / `blue-700`
- ✅ Success: `green-600` / `green-700`
- ✅ Error: `red-600` / `red-700`
- ✅ Warning: `yellow-600` / `yellow-700`
- ✅ Gray scale completo

### **Componentes Base**
- ✅ Inputs con estados (normal, error, success, disabled)
- ✅ Botones con variantes y loading
- ✅ Modales con backdrop y escape key
- ✅ Tablas responsive con hover states
- ✅ Paginación accesible

### **Patrones de UX**
- ✅ Loading states en todas las acciones
- ✅ Error handling con mensajes claros
- ✅ Confirmaciones para acciones destructivas
- ✅ Formularios con validación en tiempo real
- ✅ Responsive design mobile-first

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

### **Routing**
- ✅ Navegación funcional
- ✅ Breadcrumbs dinámicos
- ✅ Layout persistente
- ✅ Rutas protegidas (preparado)

## 📋 **Próximos Pasos (Prioridad Alta)**

### **1. Completar CRUD Vehículos**
- [ ] Modal para crear vehículo
- [ ] Modal para editar vehículo
- [ ] Formulario con validación
- [ ] Selector de cliente
- [ ] Validación de patente única

### **2. Completar CRUD Productos**
- [ ] Modal para crear producto
- [ ] Modal para editar producto
- [ ] Formulario con validación
- [ ] Validación de nombre único
- [ ] Selector de unidades de medida

### **3. Completar CRUD Servicios**
- [ ] Modal para crear servicio
- [ ] Modal para editar servicio
- [ ] Formulario con validación
- [ ] Validación de nombre único
- [ ] Gestión de precios base

### **4. Registro de Atenciones**
- [ ] Crear atención desde turno
- [ ] Selección de servicios y productos
- [ ] Cálculo automático de totales
- [ ] Historial de atenciones

## 🐛 **Problemas Conocidos**

### **Resueltos**
- ✅ InputField no compatible con react-hook-form → Solucionado con forwardRef
- ✅ Clases CSS incompatibles con Tailwind v4 → Actualizadas a clases estándar
- ✅ Button sin prop loading → Agregada funcionalidad
- ✅ Debug insuficiente → Agregados logs en puntos críticos

### **Pendientes**
- [ ] Campo observaciones en clientes (requiere migración)
- [ ] Validación de patente única en frontend
- [ ] Optimización de queries con includes
- [ ] Tests de frontend

## 📊 MÉTRICAS DE PROGRESO

**Fecha**: Diciembre 2024

### **Funcionalidades Core**
- **CRUD Clientes**: 100% ✅
- **CRUD Vehículos**: 70% 🚧 (tabla + eliminar + servicio)
- **CRUD Productos**: 50% 🚧 (tabla + eliminar + servicio)
- **CRUD Servicios**: 50% 🚧 (tabla + eliminar + servicio)
- **Sistema de Turnos**: 100% ✅
- **CRUD ServiceRecords**: 50% 🚧 (tabla + eliminar + servicio)

### **Componentes y UI**
- **Componentes UI**: 90% ✅
- **Servicios API**: 95% ✅
- **Integración Backend-Frontend**: 95% ✅
- **Sistema de Diseño**: 100% ✅

### **Progreso General**
**Overall**: 92% 🚀

## 🎯 LOGROS RECIENTES

**Última Actualización**: Sistema de Turnos Completado (Diciembre 2024)

### **Sistema de Turnos - COMPLETADO ✅**
- ✅ **FullCalendar integrado** con diseño del sistema
- ✅ **CRUD completo** de turnos (crear, editar, eliminar)
- ✅ **Estados de turno** (scheduled, confirmed, completed, cancelled)
- ✅ **Eventos coloridos** por estado en el calendario
- ✅ **Formulario robusto** con validaciones y selectores
- ✅ **Localización en español** del calendario
- ✅ **Responsive design** para móviles
- ✅ **Estilos CSS personalizados** integrados con el tema

### **Patrón de Tablas - ESTABLECIDO ✅**
- ✅ **Estructura estándar** para todas las tablas
- ✅ **Props estandarizadas** y consistentes
- ✅ **Componentes reutilizables** y mantenibles
- ✅ **Documentación completa** del patrón

## 🚀 ROADMAP ACTUALIZADO

### Fase Actual: Consistencia de UI (Diciembre 2024)
1. ✅ Establecer patrón de tablas
2. 🚧 Actualizar tablas restantes al patrón
3. 🚧 Implementar formularios básicos
4. 🚧 Testing frontend

### Fase Siguiente: Funcionalidad Completa (Enero 2025)
1. 🚧 Autenticación completa
2. 🚧 Formularios avanzados
3. 🚧 Reportes básicos
4. 🚧 Deploy a producción

### Fase Final: Optimización (Febrero 2025)
1. 🚧 Features avanzadas
2. 🚧 Optimizaciones de performance
3. 🚧 Documentación completa
4. 🚧 Training y handover

## 🎯 **Objetivos Semana Próxima**

1. **Completar CRUD Vehículos** (2 días)
2. **Completar CRUD Productos** (2 días)
3. **Completar CRUD Servicios** (2 días)
4. **Testing y optimización** (1 día)

## 🎯 **Acciones recomendadas**

- Para verificar endpoints rápidamente, usar curl directamente a la ruta indicada en routes.rb.

## 🎤 **IA por Voz - FUNCIONALIDAD POST-MVP**

### **Fase 1: Setup Básico - COMPLETADA** ✅
- [x] **Botón de IA por voz** implementado en header (indicador visual)
- [x] **Icono sparkles azul** con tooltip funcional
- [x] **Documentación completa** en `voiceAI.md`
- [x] **Arquitectura definida** (Claude + MCP + Rails)
- [x] **Comandos de voz planificados** para todas las entidades

### **Fase 2: Integración Frontend - PENDIENTE (Post-MVP)** 📋
- [ ] **Instalación de react-speech-recognition**
- [ ] **Hook useSpeechRecognition** configurado
- [ ] **Componente VoiceButton** con estados
- [ ] **Comandos básicos** implementados
- [ ] **Feedback visual** (animaciones, indicadores)

### **Fase 3: Integración Backend - PENDIENTE (Post-MVP)** 📋
- [ ] **Voice Controller** en Rails API
- [ ] **Voice AI Service** para procesamiento
- [ ] **Endpoints de API** para comandos de voz
- [ ] **Validación de comandos** y contexto
- [ ] **Manejo de errores** específico para voz

### **Fase 4: Servicio de IA - PENDIENTE (Post-MVP)** 📋
- [ ] **Configuración de Claude API**
- [ ] **MCP Server** para Rails API
- [ ] **Despliegue en la nube** (Railway/Render)
- [ ] **Variables de entorno** configuradas
- [ ] **Testing del servicio** de IA

### **Comandos de Voz Planificados**
- **Clientes**: "crear cliente [nombre]", "buscar cliente [nombre]", "listar clientes"
- **Vehículos**: "agregar vehículo [patente] para [cliente]", "buscar vehículo [patente]"
- **Turnos**: "agendar turno para [cliente] el [fecha]", "cancelar turno de [cliente]"
- **Servicios**: "listar servicios", "agregar servicio [nombre]", "buscar servicio [nombre]"
- **Generales**: "ayuda", "limpiar", "detener"

### **Stack Tecnológico IA por Voz**
- **Frontend**: `react-speech-recognition` para transcripción
- **Backend**: Rails API + Voice Controller
- **IA Cloud**: Claude (Anthropic) + MCP Server
- **Comunicación**: HTTP/REST entre componentes
- **Despliegue**: Railway/Render para servicio de IA

**Nota**: Esta funcionalidad está completamente documentada y preparada para implementación futura, pero no es parte del MVP actual. El enfoque actual debe estar en completar las funcionalidades core del sistema.

## 🎯 **Próximas Funcionalidades**

### **Reportes y Analytics**
- [ ] Reportes de servicios
- [ ] Analytics de clientes
- [ ] Métricas de negocio
- [ ] Exportación de datos

### **Notificaciones**
- [ ] Sistema de notificaciones push
- [ ] Emails automáticos
- [ ] Recordatorios de turnos
- [ ] Alertas de stock

## 🎨 **Sistema de Diseño**

### **Colores Implementados**
- Primary: `blue-600` / `blue-700`
- Success: `green-600` / `green-700`
- Error: `red-600` / `red-700`
- Warning: `yellow-600` / `yellow-700`
- **IA por Voz**: `blue-600` / `blue-400` (dark mode)

### **Componentes Base**
- ✅ Inputs con estados (normal, error, success, disabled)
- ✅ Botones con variantes y loading
- ✅ Modales con backdrop y escape key
- ✅ Tablas responsive con hover states
- ✅ Paginación accesible
- ✅ **Botón de voz** con tooltip y estados

### **Iconografía**
- ✅ Iconos por marca de vehículo
- ✅ Iconos por tipo de producto
- ✅ Iconos por tipo de servicio
- ✅ Iconos de navegación
- ✅ **Icono sparkles** para IA por voz

## 🔧 **Patrones Establecidos**

### **React Query Patterns**
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

## 🚀 **Estado de Despliegue**

### **Backend**
- ✅ Configurado para Railway/Heroku
- ✅ Variables de entorno documentadas
- ✅ Base de datos PostgreSQL
- ✅ CORS configurado

### **Frontend**
- ✅ Configurado para Netlify/Vercel
- ✅ Build optimizado
- ✅ Variables de entorno
- ✅ Responsive design

### **IA por Voz (Post-MVP)**
- 📋 Servicio de IA pendiente de despliegue (post-MVP)
- 📋 Variables de entorno pendientes (post-MVP)
- 📋 Configuración de Claude API pendiente (post-MVP)

## 📋 **Decisiones Técnicas Documentadas**

1. **Uso de forwardRef en InputField** - Para compatibilidad con react-hook-form
2. **Clases CSS estándar** - En lugar de clases personalizadas para Tailwind v4
3. **Debug logs extensivos** - Para facilitar troubleshooting
4. **Iconos por tipo de entidad** - Para mejor UX visual
5. **Formateo de precios** - En pesos argentinos con Intl.NumberFormat
6. **Filtros por rango de precio** - Para búsqueda avanzada
7. **react-hot-toast** - Para notificaciones consistentes
8. **IA por voz con Claude + MCP** - Arquitectura escalable para comandos de voz
9. **Botón sparkles azul** - Indicador visual de funcionalidad en desarrollo

---

**Última actualización**: 20 de Junio 2024
**Estado general**: 75% completado
**Próximo hito**: Completar CRUD vehículos, productos y servicios (MVP)
