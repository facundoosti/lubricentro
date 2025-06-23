# Sistema Lubricentro - Frontend

Frontend del Sistema de Gestión para Lubricentro desarrollado con React 18, Vite, Tailwind CSS y React Query.

## 🚀 Tecnologías

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS v4** - Framework de CSS
- **React Query** - Estado del servidor y cache
- **React Router** - Navegación
- **React Hook Form** - Formularios
- **Lucide React** - Iconos

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/              # Componentes de UI reutilizables
│   ├── common/          # Componentes comunes
│   └── features/        # Componentes por dominio
├── layout/              # Layout principal
├── pages/               # Páginas de la aplicación
├── services/            # Servicios de API
├── contexts/            # Contextos de React
├── hooks/               # Custom hooks
├── utils/               # Utilidades
└── icons/               # Iconos SVG
```

## 🚨 Reglas de Importación

**CRÍTICO**: Siempre usa alias de importación en lugar de rutas relativas.

```javascript
// ❌ NO HACER
import Button from '../../ui/Button';

// ✅ HACER
import Button from '@ui/Button';
```

Ver [IMPORT_RULES.md](./IMPORT_RULES.md) para más detalles.

## 🛠️ Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Linting
npm run lint

# Preview de producción
npm run preview
```

## 🔧 Configuración

- **Alias de importación**: Configurados en `vite.config.js`
- **ESLint**: Reglas personalizadas para detectar rutas relativas
- **Tailwind**: Configuración personalizada en `tailwind.config.js`

## 📚 Documentación

- [Reglas de Importación](./IMPORT_RULES.md)
- [Cursor Rules](../.cursorrules)
- [Memory Bank](../memory-bank/)

## 🎯 Características

- ✅ CRUD completo de clientes
- ✅ CRUD parcial de vehículos, productos, servicios
- ✅ Tabla de atenciones con estados visuales
- ✅ Dashboard con métricas
- ✅ UI responsive y accesible
- ✅ Sistema de notificaciones
- ✅ Paginación y búsqueda
- ✅ Manejo de errores robusto

---

**Desarrollado para Sistema Lubricentro** 🚗
