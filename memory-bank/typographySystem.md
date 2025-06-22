# Typography System - Sistema Lubricentro

## 🔤 Tipografía Principal: Outfit

### Configuración Base

**Fuente**: Outfit (Google Fonts)
**Tipo**: Variable Font (100-900 weights)
**Import**: `@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap")`

### Características

- **Estilo**: Moderna, geométrica, muy legible
- **Pesos**: 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Optimización**: Variable font para mejor rendimiento
- **Consistencia**: Misma fuente que el template TailAdmin

## 📏 Sistema de Tamaños

### Títulos (Titles)

```css
/* Clases Tailwind disponibles */
.text-title-2xl  /* 72px / 90px line-height */
.text-title-xl   /* 60px / 72px line-height */
.text-title-lg   /* 48px / 60px line-height */
.text-title-md   /* 36px / 44px line-height */
.text-title-sm   /* 30px / 38px line-height */
```

### Texto Temático (Theme Text)

```css
/* Clases Tailwind disponibles */
.text-theme-xl   /* 20px / 30px line-height */
.text-theme-sm   /* 14px / 20px line-height */
.text-theme-xs   /* 12px / 18px line-height */
```

### Tamaños Estándar

```css
/* Tamaños base de Tailwind */
.text-xs         /* 0.75rem */
.text-sm         /* 0.875rem */
.text-base       /* 1rem */
.text-lg         /* 1.125rem */
.text-xl         /* 1.25rem */
.text-2xl        /* 1.5rem */
```

## 🎨 Configuración en Tailwind

### Font Family

```javascript
// tailwind.config.js
fontFamily: {
  'outfit': ['Outfit', 'system-ui', 'sans-serif'],
  'sans': ['Outfit', 'system-ui', 'sans-serif'], // Default
}
```

### Uso en Componentes

```jsx
// Ejemplos de uso
<h1 className="text-title-2xl font-bold">Título Principal</h1>
<h2 className="text-title-lg font-semibold">Subtítulo</h2>
<p className="text-theme-xl">Texto de párrafo</p>
<span className="text-theme-sm">Texto pequeño</span>
```

## 🌈 Sistema de Colores

### Colores Principales

```css
/* Brand Colors (del template) */
.bg-brand-50     /* #f2f7ff */
.bg-brand-500    /* #465fff */
.bg-brand-600    /* #3641f5 */
.text-brand-500  /* #465fff */

/* Gray Scale */
.text-gray-25    /* #fcfcfd */
.text-gray-500   /* #667085 */
.text-gray-900   /* #101828 */

/* Estados */
.text-success-500 /* #12b76a */
.text-error-500   /* #f04438 */
.text-warning-500 /* #f79009 */
```

## 📱 Responsive Typography

### Breakpoints

```css
/* Mobile First */
.text-base       /* 16px base */
.md:text-lg      /* 18px en tablet */
.lg:text-xl      /* 20px en desktop */
```

### Ejemplos de Uso Responsive

```jsx
<h1 className="text-title-lg md:text-title-xl lg:text-title-2xl">
  Título Responsive
</h1>

<p className="text-theme-sm md:text-base lg:text-theme-xl">
  Párrafo que se adapta
</p>
```

## 🎯 Guías de Uso

### Jerarquía de Títulos

1. **H1**: `text-title-2xl` - Páginas principales
2. **H2**: `text-title-xl` - Secciones importantes
3. **H3**: `text-title-lg` - Subsecciones
4. **H4**: `text-title-md` - Elementos de formulario
5. **H5**: `text-title-sm` - Etiquetas pequeñas

### Pesos de Fuente

- **100-300**: Texto muy ligero (no recomendado para UI)
- **400**: Normal (body text)
- **500**: Medium (énfasis ligero)
- **600**: Semibold (títulos pequeños)
- **700**: Bold (títulos principales)
- **800-900**: Extra bold (solo para casos especiales)

### Espaciado de Líneas

```css
/* Line heights optimizados */
.leading-tight    /* 1.25 */
.leading-normal   /* 1.5 */
.leading-relaxed  /* 1.625 */
.leading-loose    /* 2 */
```

## 🔧 Implementación Técnica

### CSS Base

```css
/* frontend/src/index.css */
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap");

html {
  font-family: 'Outfit', system-ui, sans-serif;
}

body {
  font-family: 'Outfit', sans-serif;
  /* ... otros estilos */
}
```

### Tailwind Config

```javascript
// tailwind.config.js
fontSize: {
  'title-2xl': ['72px', { lineHeight: '90px' }],
  'title-xl': ['60px', { lineHeight: '72px' }],
  'title-lg': ['48px', { lineHeight: '60px' }],
  'title-md': ['36px', { lineHeight: '44px' }],
  'title-sm': ['30px', { lineHeight: '38px' }],
  'theme-xl': ['20px', { lineHeight: '30px' }],
  'theme-sm': ['14px', { lineHeight: '20px' }],
  'theme-xs': ['12px', { lineHeight: '18px' }],
}
```

## 📊 Beneficios de la Migración

### Antes (Inter)
- ✅ Excelente legibilidad
- ✅ Muy establecida
- ❌ No consistente con template

### Después (Outfit)
- ✅ Consistencia visual con template
- ✅ Fuente variable (mejor rendimiento)
- ✅ Diseño más moderno
- ✅ Sistema de tamaños optimizado
- ✅ Colores del template integrados

## 🚀 Próximos Pasos

1. **Aplicar en componentes**: Usar las nuevas clases de texto
2. **Optimizar legibilidad**: Ajustar contrastes si es necesario
3. **Testing**: Verificar en diferentes dispositivos
4. **Documentación**: Mantener guías de uso actualizadas

---

**Última actualización**: Migración completada - Outfit como fuente principal
**Próxima revisión**: Al implementar componentes principales 