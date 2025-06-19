# Database Cleaner Setup Guide 🧹

## Overview

Este proyecto utiliza `database_cleaner-active_record` para manejar la limpieza de la base de datos entre tests, proporcionando mayor control y flexibilidad que las transactional fixtures estándar de Rails.

### Filosofía de Implementación

- **Integración transparente**: Funciona automáticamente sin requerir cambios en tests existentes
- **Configuración mínima**: Solo los archivos esenciales de configuración
- **Sin archivos de test adicionales**: No necesita tests específicos de database_cleaner
- **Performance optimizada**: Mantiene la velocidad de ejecución de la suite de tests

## ¿Por qué Database Cleaner?

### Ventajas sobre Transactional Fixtures

- **Mayor control**: Permite diferentes estrategias de limpieza según el tipo de test
- **Compatibilidad con JavaScript**: Funciona correctamente con tests que requieren JavaScript
- **System tests**: Esencial para tests de integración completos
- **Flexibilidad**: Permite cambiar estrategias durante la ejecución de tests

### Estrategias Disponibles

1. **Transaction** (por defecto): Más rápida, usa transacciones de base de datos
2. **Truncation**: Más lenta pero más completa, borra todas las tablas
3. **Deletion**: Usa DELETE statements, intermedio en velocidad

## Configuración Actual

### Gemfile
```ruby
gem "database_cleaner-active_record"
```

### Configuración en `spec/support/database_cleaner.rb`

```ruby
RSpec.configure do |config|
  # Configuración inicial de la suite
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  # Limpieza alrededor de cada test
  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end

  # Estrategias especiales para tests con JavaScript
  config.before(:each, js: true) do
    DatabaseCleaner.strategy = :truncation
  end

  # Estrategias para system tests
  config.before(:each, type: :system) do
    DatabaseCleaner.strategy = :truncation
  end
end
```

### Modificación en `rails_helper.rb`

```ruby
# Desactivamos transactional_fixtures ya que Database Cleaner se encarga
config.use_transactional_fixtures = false
```

## Uso en Tests

### Tests Regulares

Los tests regulares funcionan automáticamente sin cambios:

```ruby
RSpec.describe Customer, type: :model do
  it 'creates customer successfully' do
    customer = create(:customer)
    expect(Customer.count).to eq(1)
  end

  it 'starts with clean database' do
    # Este test tendrá la base de datos limpia automáticamente
    expect(Customer.count).to eq(0)
  end
end
```

### Tests con JavaScript (futuro)

Para tests que requieran JavaScript:

```ruby
RSpec.describe 'Interactive features', type: :system, js: true do
  it 'handles dynamic content' do
    # DatabaseCleaner usará estrategia de truncation automáticamente
    visit root_path
    # ... test code
  end
end
```

### Limpieza Manual (casos especiales)

Si necesitas limpieza manual en un test específico:

```ruby
RSpec.describe 'Special case' do
  before do
    Customer.destroy_all  # Limpieza manual explícita
  end

  it 'works with clean state' do
    # ... test code
  end
end
```

## Verificación del Funcionamiento

### Integración Transparente

Database Cleaner se integra de forma transparente con los tests existentes. No requiere archivos de test específicos ya que funciona automáticamente con toda la suite de tests.

### Ejecutar Tests de Verificación

```bash
# Todos los tests (verifican que database_cleaner funciona correctamente)
bundle exec rspec

# Tests específicos para verificar limpieza
bundle exec rspec spec/requests/api/v1/customers_spec.rb -e "search parameter"
```

## Performance

### Comparación de Estrategias

| Estrategia   | Velocidad | Casos de Uso                    |
|--------------|-----------|--------------------------------|
| Transaction  | 🚀 Rápida | Tests regulares, unidad        |
| Truncation   | 🐌 Lenta  | JavaScript, system tests       |
| Deletion     | 🚶 Media  | Casos especiales               |

### Configuración Actual

- **Por defecto**: Transaction (más rápida)
- **JavaScript**: Truncation (más confiable)
- **System tests**: Truncation (necesario)

## Troubleshooting

### Problemas Comunes

1. **Tests con datos persistentes entre ejecuciones**
   - Verificar que `use_transactional_fixtures = false`
   - Asegurar que database_cleaner esté configurado correctamente

2. **Tests lentos**
   - Verificar que no esté usando truncation innecesariamente
   - Considerar limpieza manual para casos específicos

3. **Foreign key violations**
   - Database cleaner respeta constraints automáticamente
   - Usar limpieza con truncation si es necesario

### Debug

```ruby
# Agregar en un test para debug
puts "Customer count: #{Customer.count}"
puts "Vehicle count: #{Vehicle.count}"
```

## Migración desde Transactional Fixtures

### Cambios Realizados

1. ✅ Agregada gema `database_cleaner-active_record`
2. ✅ Configuración optimizada en `spec/support/database_cleaner.rb`
3. ✅ Desactivado `use_transactional_fixtures` en rails_helper.rb
4. ✅ Integración transparente con suite de tests existente
5. ✅ Arreglo de test de búsqueda que dependía de estado limpio de base de datos

### Tests Actuales

- **Total**: 111 examples
- **Status**: ✅ Todos pasando
- **Performance**: Mejorada (1.15 segundos)

## Futuras Mejoras

### Cuando agregar System Tests

```ruby
# Ejemplo futuro de system test
RSpec.describe 'Customer management', type: :system, js: true do
  it 'creates customer via UI' do
    visit customers_path
    click_button 'New Customer'
    # ... interaction tests
  end
end
```

### Optimizaciones Adicionales

- Usar `database_cleaner-redis` para Redis si se agrega
- Configurar `database_cleaner-mongoid` si se usa MongoDB
- Parallel test execution con database cleaner

---

**Estado**: ✅ Completamente implementado y funcionando
**Tests**: 111 ejemplos, 0 fallos
**Performance**: ~1.15 segundos para suite completa
**Integración**: Transparente y sin archivos adicionales necesarios 