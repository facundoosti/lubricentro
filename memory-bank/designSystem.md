# Design System - Sistema Lubricentro

## 🎨 **Sistema de Diseño Unificado**

Este documento define el sistema de diseño completo del Sistema Lubricentro, incluyendo colores, tipografía, navegación y patrones de UI.

## 🎯 **Filosofía de Diseño**

- **Claridad y Foco**: Interface limpia priorizando información importante
- **Eficiencia**: Flujos intuitivos, minimizando clicks para tareas comunes
- **Consistencia**: Componentes y patrones consistentes en toda la aplicación
- **Profesional y Moderno**: Estética que transmite confianza

## 🌈 **Sistema de Colores**

### **Paleta Principal (Tailwind CSS v4)**

**Fuente**: Template TailAdmin React
**Consistencia**: ✅ 100% alineado con el template original

#### **Brand Colors (Colores de Marca)**
```css
.bg-brand-25   /* #f2f7ff - Muy claro */
.bg-brand-50   /* #ecf3ff - Claro */
.bg-brand-100  /* #dde9ff - Muy suave */
.bg-brand-200  /* #c2d6ff - Suave */
.bg-brand-300  /* #9cb9ff - Medio claro */
.bg-brand-400  /* #7592ff - Medio */
.bg-brand-500  /* #465fff - Principal */
.bg-brand-600  /* #3641f5 - Hover/Activo */
.bg-brand-700  /* #2a31d8 - Presionado */
.bg-brand-800  /* #252dae - Oscuro */
.bg-brand-900  /* #262e89 - Muy oscuro */
.bg-brand-950  /* #161950 - Más oscuro */
```

#### **Gray Scale (Escala de Grises)**
```css
.bg-gray-25    /* #fcfcfd - Casi blanco */
.bg-gray-50    /* #f9fafb - Muy claro */
.bg-gray-100   /* #f2f4f7 - Claro */
.bg-gray-200   /* #e4e7ec - Suave */
.bg-gray-300   /* #d0d5dd - Medio claro */
.bg-gray-400   /* #98a2b3 - Medio */
.bg-gray-500   /* #667085 - Principal */
.bg-gray-600   /* #475467 - Medio oscuro */
.bg-gray-700   /* #344054 - Oscuro */
.bg-gray-800   /* #1d2939 - Muy oscuro */
.bg-gray-900   /* #101828 - Casi negro */
.bg-gray-950   /* #0c111d - Negro */
```

#### **Estados del Sistema**
```css
/* Success Colors */
.bg-success-500 /* #12b76a - Principal */
.bg-success-50  /* #ecfdf3 - Fondo sutil */

/* Error Colors */
.bg-error-500   /* #f04438 - Principal */
.bg-error-50    /* #fef3f2 - Fondo sutil */

/* Warning Colors */
.bg-warning-500 /* #f79009 - Principal */
.bg-warning-50  /* #fffaeb - Fondo sutil */
```

### **Guías de Uso de Colores**

#### **Jerarquía de Colores**
1. **Brand Colors**: Elementos principales de la interfaz
2. **Gray Scale**: Texto, fondos, elementos neutros
3. **Success/Error/Warning**: Estados del sistema

#### **Combinaciones Recomendadas**
```css
/* Botón principal */
.btn-primary {
  @apply bg-brand-500 text-white hover:bg-brand-600;
}

/* Botón secundario */
.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

/* Alerta de éxito */
.alert-success {
  @apply bg-success-50 text-success-700 border-success-200;
}

/* Alerta de error */
.alert-error {
  @apply bg-error-50 text-error-700 border-error-200;
}

/* Card con sombra */
.card {
  @apply bg-white border border-gray-200 shadow-theme-sm;
}
```

## 🔤 **Sistema de Tipografía**

### **Fuente Principal: Outfit**

**Configuración**:
- **Fuente**: Outfit (Google Fonts)
- **Tipo**: Variable Font (100-900 weights)
- **Import**: `@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap")`

### **Sistema de Tamaños**

#### **Títulos (Titles)**
```css
.text-title-2xl  /* 72px / 90px line-height */
.text-title-xl   /* 60px / 72px line-height */
.text-title-lg   /* 48px / 60px line-height */
.text-title-md   /* 36px / 44px line-height */
.text-title-sm   /* 30px / 38px line-height */
```

#### **Texto Temático (Theme Text)**
```css
.text-theme-xl   /* 20px / 30px line-height */
.text-theme-sm   /* 14px / 20px line-height */
.text-theme-xs   /* 12px / 18px line-height */
```

### **Jerarquía de Títulos**
1. **H1**: `text-title-2xl` - Páginas principales
2. **H2**: `text-title-xl` - Secciones importantes
3. **H3**: `text-title-lg` - Subsecciones
4. **H4**: `text-title-md` - Elementos de formulario
5. **H5**: `text-title-sm` - Etiquetas pequeñas

### **Pesos de Fuente**
- **400**: Normal (body text)
- **500**: Medium (énfasis ligero)
- **600**: Semibold (títulos pequeños)
- **700**: Bold (títulos principales)

## 🧭 **Sistema de Navegación**

### **Estructura del Sidebar**

El sidebar está organizado en 5 secciones principales:

#### **1. 🏠 Principal**
- **Dashboard** (`/`) - Vista general del negocio

#### **2. 📅 Operaciones**
- **Turnos** (`/appointments`) - Programación de citas
- **Atenciones** (`/service-records`) - Registro de servicios

#### **3. 👥 Clientes**
- **Clientes** (`/customers`) - Gestión de clientes
- **Vehículos** (`/vehicles`) - Gestión de vehículos

#### **4. 🛠️ Catálogo**
- **Servicios** (`/services`) - Catálogo de servicios
- **Productos** (`/products`) - Inventario de productos

#### **5. ⚙️ Administración**
- **Configuración** (`/settings`) - Ajustes del sistema

### **Flujo de Trabajo del Usuario**
1. **Dashboard** → Ver estado general
2. **Turnos** → Programar citas
3. **Atenciones** → Registrar servicios
4. **Clientes/Vehículos** → Gestionar información base
5. **Servicios/Productos** → Configurar catálogo
6. **Configuración** → Ajustes del sistema

### **Iconos Utilizados (Lucide React)**
```javascript
import {
  BarChart3,      // Dashboard
  Calendar,       // Turnos
  ClipboardList,  // Atenciones
  Users,          // Clientes
  Car,            // Vehículos
  Wrench,         // Servicios
  Package,        // Productos
  Settings,       // Configuración
} from 'lucide-react';
```

## 🎨 **Patrones de UI**

### **Layout Principal**

#### **Barra Lateral Fija (Sidebar)**
- **Tema**: Oscuro (`bg-secondary-900`)
- **Ancho**: Fijo (`w-64` o `16rem`)
- **Contenido**: Logo, navegación principal, perfil de usuario
- **Comportamiento**: Fija en desktop, colapsable en móvil

#### **Área de Contenido Principal**
- **Tema**: Claro (`bg-gray-50` o `bg-white`)
- **Contenido**: Header, contenido específico de página

### **Componentes Clave**

#### **Dashboard**
- **Tarjetas de Estadísticas**: Métricas clave visualmente destacadas
- **Acciones Rápidas**: Botones para acciones más comunes
- **Actividad Reciente**: Lista cronológica de eventos

#### **Vista de Calendario (Turnos)**
- **Filtros**: Vistas por día, semana, mes, año
- **Visualización**: Grid de calendario
- **Detalle del Evento**: Panel lateral con descripción

### **Estados de UX**
- **Estados de Carga**: Spinners o skeletons
- **Estados Vacíos**: Mensajes amigables con acciones
- **Notificaciones**: Toasts para confirmaciones
- **Modales de Confirmación**: Para acciones destructivas

## 🚨 **Regla Crítica: Tailwind CSS First**

**⚠️ OBLIGATORIO**: Todo el CSS debe usar Tailwind CSS y sus convenciones

### **Principios Fundamentales**
1. **🚫 NUNCA escribir CSS personalizado** sin justificación técnica
2. **✅ SIEMPRE usar clases de Tailwind** para estilos
3. **🎯 Usar el sistema `@theme`** para definir colores y variables
4. **📦 Evitar archivos CSS adicionales** - todo en `index.css` con `@theme`

### **Configuración Tailwind v4**
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

### **Excepciones Permitidas**
Solo se permite CSS personalizado para:
1. **Animaciones complejas** que Tailwind no cubre
2. **Integración con librerías de terceros** (charts, datepickers)
3. **Hacks específicos** para compatibilidad de navegadores

## 📱 **Responsive Design**

### **Mobile-First Approach**
- **Base styles**: mobile (320px+)
- **Breakpoints**: md:768px lg:1024px xl:1280px
- **Touch-friendly**: min 44px tap targets
- **Loading states**: visibles en mobile

### **Accesibilidad**
- **Semantic HTML**: siempre
- **Alt text**: para imágenes
- **Focus management**: en modales
- **ARIA labels**: donde sea necesario

---

**Última actualización**: Junio 2025
**Versión**: 2.0 - Sistema unificado 