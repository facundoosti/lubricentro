# Reglas de Importación - Sistema Lubricentro

## 🚨 Regla Principal: SIEMPRE usar alias de importación

**NUNCA** uses rutas relativas en las importaciones. **SIEMPRE** usa los alias configurados en `vite.config.js`.

## ❌ NO HACER

```javascript
// ❌ Rutas relativas - PROHIBIDO
import Button from '../../ui/Button';
import { useCustomers } from '../services/customersService';
import Table from '../../../components/ui/Table';
import Layout from '../layout/Layout';
```

## ✅ HACER

```javascript
// ✅ Alias de importación - OBLIGATORIO
import Button from '@ui/Button';
import { useCustomers } from '@services/customersService';
import Table from '@ui/Table';
import Layout from '@layout/Layout';
```

## 📋 Alias Disponibles

| Alias | Ruta | Descripción |
|-------|------|-------------|
| `@` | `./src` | Raíz del código fuente |
| `@components` | `./src/components` | Componentes generales |
| `@ui` | `./src/components/ui` | Componentes de UI reutilizables |
| `@common` | `./src/components/common` | Componentes comunes |
| `@layout` | `./src/layout` | Componentes de layout |
| `@pages` | `./src/pages` | Páginas de la aplicación |
| `@hooks` | `./src/hooks` | Custom hooks |
| `@services` | `./src/services` | Servicios de API |
| `@utils` | `./src/utils` | Utilidades |
| `@contexts` | `./src/contexts` | Contextos de React |
| `@icons` | `./src/icons` | Iconos |
| `@assets` | `./src/assets` | Assets estáticos |

## 🔧 Configuración

Los alias están configurados en `vite.config.js`:

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
    '@ui': path.resolve(__dirname, './src/components/ui'),
    // ... más alias
  },
},
```

## 🛡️ Validación Automática

ESLint está configurado para detectar y reportar rutas relativas:

```bash
npm run lint
```

Si ves este error:
```
Usa alias de importación (@ui, @services, @components, etc.) en lugar de rutas relativas.
```

**Solución**: Reemplaza la ruta relativa con el alias correspondiente.

## 💡 Beneficios

1. **Mantenibilidad**: Rutas más claras y fáciles de entender
2. **Refactoring**: Cambios de estructura más seguros
3. **Consistencia**: Patrón uniforme en todo el proyecto
4. **Legibilidad**: Importaciones más descriptivas
5. **IDE Support**: Mejor autocompletado y navegación

## 📝 Ejemplos Comunes

### Componentes UI
```javascript
// ✅ Correcto
import Button from '@ui/Button';
import Modal from '@ui/Modal';
import Table from '@ui/Table';
import Badge from '@ui/Badge';
```

### Servicios
```javascript
// ✅ Correcto
import { api } from '@services/api';
import { useCustomers } from '@services/customersService';
import { useVehicles } from '@services/vehiclesService';
```

### Páginas
```javascript
// ✅ Correcto
import Dashboard from '@pages/Dashboard';
import Customers from '@pages/Customers';
import ServiceRecords from '@pages/ServiceRecords';
```

### Layout
```javascript
// ✅ Correcto
import Layout from '@layout/Layout';
import Header from '@layout/Header';
import Sidebar from '@layout/Sidebar';
```

### Contextos
```javascript
// ✅ Correcto
import { QueryProvider } from '@contexts/QueryProvider';
import { useSidebar } from '@contexts/SidebarContext';
```

## 🚀 Comandos Útiles

### Buscar rutas relativas en el proyecto
```bash
grep -r "from '\.\./" src/
grep -r "from '\./" src/
```

### Verificar configuración de alias
```bash
npm run dev
# Si hay errores de resolución, verificar vite.config.js
```

---

**Recuerda**: Esta regla es **CRÍTICA** para mantener la consistencia del proyecto. Siempre usa alias de importación. 