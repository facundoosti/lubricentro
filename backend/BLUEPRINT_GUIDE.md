# Blueprint Serialization Guide

## Overview

Blueprint is a JSON serialization library for Ruby that provides a clean, simple API for serializing Ruby objects to JSON. This guide covers the implementation of Blueprint in the Lubricentro system.

## Installation

Blueprint has been added to the Gemfile:

```ruby
# JSON serialization with Blueprint
gem "blueprinter", "~> 1.0"
```

## Serializers Structure

All serializers are located in `app/serializers/` and follow a consistent pattern:

```
app/serializers/
├── customer_serializer.rb
└── vehicle_serializer.rb
```

## CustomerSerializer

The CustomerSerializer handles serialization of Customer objects with multiple views:

### Default View

```ruby
CustomerSerializer.render_as_hash(customer)
```

Includes: `id`, `name`, `phone`, `email`, `address`, `created_at`, `updated_at`

### With Vehicles View

```ruby
CustomerSerializer.render_as_hash(customer, view: :with_vehicles)
```

Includes all default fields plus:

- `vehicles`: Array of associated vehicles (using `:summary` view)
- `vehicles_count`: Count of associated vehicles

### Summary View

```ruby
CustomerSerializer.render_as_hash(customer, view: :summary)
```

Includes only: `id`, `name`, `phone`, `email`

## VehicleSerializer

The VehicleSerializer handles serialization of Vehicle objects with multiple views:

### Default View

```ruby
VehicleSerializer.render_as_hash(vehicle)
```

Includes: `id`, `brand`, `model`, `license_plate`, `year`, `customer_id`, `customer_name`, `created_at`, `updated_at`

### With Customer View

```ruby
VehicleSerializer.render_as_hash(vehicle, view: :with_customer)
```

Includes all default fields plus:

- `customer`: Associated customer object (using `:summary` view)
- `appointments_count`: Count of associated appointments (TODO)
- `service_records_count`: Count of associated service records (TODO)

### Summary View

```ruby
VehicleSerializer.render_as_hash(vehicle, view: :summary)
```

Includes only: `id`, `brand`, `model`, `license_plate`, `year`

## Controller Implementation

### API Response Pattern

All controllers maintain the standard API response pattern:

```ruby
# Success Response
{
  success: true,
  data: { ... },
  message: "Success message" # optional
}

# Error Response
{
  success: false,
  errors: ["Error message"],
  message: "Error occurred"
}
```

### Using Blueprint in Controllers

```ruby
# Index action
render json: {
  success: true,
  data: {
    customers: CustomerSerializer.render_as_hash(@customers),
    pagination: pagy_metadata(@pagy)
  }
}

# Show action with detailed view
render json: {
  success: true,
  data: CustomerSerializer.render_as_hash(@customer, view: :with_vehicles)
}

# Create/Update actions
render json: {
  success: true,
  data: CustomerSerializer.render_as_hash(@customer),
  message: "Customer created successfully"
}
```

## Benefits of Blueprint

1. **Consistency**: All serialization follows the same patterns
2. **Performance**: More efficient than manual JSON building
3. **Flexibility**: Multiple views for different use cases
4. **Maintainability**: Centralized serialization logic
5. **Testing**: Easy to test serialization logic independently

## Testing

Serializers are tested independently in `spec/serializers/`:

```ruby
RSpec.describe CustomerSerializer, type: :serializer do
  describe 'default view' do
    let(:serialized_customer) { CustomerSerializer.render_as_hash(customer) }

    it 'includes basic customer fields' do
      expect(serialized_customer).to include(
        id: customer.id,
        name: customer.name,
        # ... other fields
      )
    end
  end
end
```

## Best Practices

1. Use `render_as_hash` for consistent hash output
2. Define specific views for different use cases
3. Use `exclude` to remove unwanted fields from views
4. Test each view independently
5. Follow the established naming conventions

## Future Enhancements

When adding new models:

1. Create a new serializer in `app/serializers/`
2. Define appropriate views (default, with_associations, summary)
3. Update controllers to use the new serializer
4. Add comprehensive tests for the serializer
5. Update this documentation

## Migration from Manual JSON

The implementation replaced manual JSON building methods:

**Before:**

```ruby
def customer_json(customer)
  {
    id: customer.id,
    name: customer.name,
    # ... more fields
  }
end
```

**After:**

```ruby
CustomerSerializer.render_as_hash(customer)
```

This change eliminated ~50 lines of repetitive JSON building code while improving maintainability and consistency.
