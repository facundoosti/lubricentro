# Design System & UI/UX Guidelines

Este documento define la guía de estilo visual, los componentes de la interfaz de usuario y los patrones de experiencia de usuario para el Sistema Lubricentro. Se basa en los bocetos y la inspiración visual proporcionada.

## 1. Filosofía de Diseño

- **Claridad y Foco**: La interfaz debe ser limpia, priorizando la información y las acciones más importantes para el usuario.
- **Eficiencia**: Los flujos de trabajo deben ser intuitivos, minimizando el número de clics para completar tareas comunes.
- **Consistencia**: Los componentes y patrones deben ser consistentes a lo largo de toda la aplicación para crear una experiencia predecible.
- **Profesional y Moderno**: La estética debe transmitir confianza y ser visualmente agradable, utilizando un diseño moderno.

## 2. Layout Principal

La aplicación utiliza un layout de dos columnas:

1.  **Barra Lateral Fija (Sidebar)**:
    - **Tema**: Oscuro (`bg-secondary-900`).
    - **Ancho**: Fijo (aprox. `w-64` o `16rem`).
    - **Contenido**:
        - **Logo de la Empresa**: En la parte superior.
        - **Navegación Principal**: Icono + Texto. El ítem activo tiene un fondo resaltado.
        - **Navegación Secundaria (Opcional)**: Puede usarse para equipos o filtros.
        - **Perfil de Usuario**: En la parte inferior, con avatar y nombre.
    - **Comportamiento**: Fija en la vista de escritorio y oculta (desplegable) en móvil.

2.  **Área de Contenido Principal**:
    - **Tema**: Claro (`bg-gray-50` o `bg-white`).
    - **Contenido**:
        - **Header**: Puede contener el título de la página, breadcrumbs y acciones principales (ej. botón "Nuevo Cliente").
        - **Contenido Específico de la Página**: Tablas, formularios, tarjetas de datos, etc.

![Referencia Visual del Layout](https://i.imgur.com/your-image-url.png)
*Nota: Reemplazar con la URL de la imagen de referencia.*

## 3. Paleta de Colores

La paleta se divide en tema oscuro (sidebar) y tema claro (contenido).

| Uso                   | Tailwind Class (Recomendado)   | Color       | Descripción                                      |
| --------------------- | ------------------------------ | ----------- | ------------------------------------------------ |
| **Sidebar BG**        | `bg-secondary-900`             | `#0f172a`   | Fondo principal de la barra lateral.             |
| **Sidebar Text**      | `text-gray-300`                | `#d1d5db`   | Texto normal en la sidebar.                      |
| **Sidebar Text Hover**| `text-white`                   | `#ffffff`   | Texto al pasar el mouse sobre un enlace.         |
| **Sidebar Active BG** | `bg-secondary-800`             | `#1e293b`   | Fondo del enlace de navegación activo.           |
| **Sidebar Active Text**| `text-white`                  | `#ffffff`   | Texto del enlace de navegación activo.           |
| **Content BG**        | `bg-gray-100`                  | `#f3f4f6`   | Fondo del área de contenido principal.           |
| **Card/Widget BG**    | `bg-white`                     | `#ffffff`   | Fondo para tarjetas, tablas y modales.           |
| **Primary Action**    | `bg-primary-600`               | `#2563eb`   | Botones principales, enlaces importantes.        |
| **Borders**           | `border-gray-200`              | `#e5e7eb`   | Bordes sutiles para separar elementos.           |

## 4. Componentes Clave (Basado en Bocetos)

### a. Navegación

- Cada item de navegación debe tener un `Icono` y un `Texto`.
- El item activo se resalta visualmente.
- Algunos items pueden tener un `Badge` con un contador (ej. "Turnos `20+`").

### b. Dashboard

- **Tarjetas de Estadísticas (Stat Cards)**: Muestran métricas clave (ej. Total Clientes). Deben ser visualmente destacadas.
- **Acciones Rápidas**: Botones para las acciones más comunes (Nuevo Cliente, Agendar Turno).
- **Actividad Reciente**: Una lista cronológica de los últimos eventos en el sistema.

### c. Vista de Calendario (Turnos)

- **Filtros**: Permitir vistas por `Día`, `Semana`, `Mes`, `Año`.
- **Visualización**: Un grid que represente el calendario.
- **Detalle del Evento**: Al seleccionar un turno, mostrar su descripción en un panel lateral.

## 5. Experiencia de Usuario (UX)

- **Estados de Carga (Loading)**: Usar spinners o skeletons para indicar que los datos se están cargando.
- **Estados Vacíos (Empty States)**: Cuando una tabla o lista no tiene datos, mostrar un mensaje amigable con una acción (ej. "No hay clientes. [Crea el primero]").
- **Notificaciones**: Usar "toasts" o "snackbars" para confirmar acciones (ej. "Cliente guardado con éxito") o mostrar errores.
- **Modales de Confirmación**: Para acciones destructivas (ej. eliminar un registro), usar un modal que pida confirmación. 