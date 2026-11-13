import Combobox from '@ui/Combobox';
import Field from '@ui/Field';
import ProductSearchInput from '@components/features/products/ProductSearchInput';

const MultiField = ({ id, label, placeholder, value, onChange, source }) => (
  <Field id={id} label={label}>
    <Combobox
      multiple
      id={id}
      aria-labelledby={`${id}-label`}
      placeholder={placeholder}
      options={source.options}
      value={value}
      onChange={onChange}
      onSearch={source.onSearch}
      loading={source.loading}
    />
  </Field>
);

const BulkPriceFilters = ({ filters, onChange, options }) => {
  const set = (key) => (value) => onChange({ ...filters, [key]: value ?? [] });

  return (
    <section className="space-y-4" aria-labelledby="bulk-price-filters-title">
      <div>
        <h3 id="bulk-price-filters-title" className="text-sm font-semibold text-on-surface">¿Qué productos?</h3>
        <p className="text-xs text-on-surface-variant">Combiná los criterios: se ajustan los productos que cumplan todos.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MultiField
          id="bulk-price-brand"
          label="Marca"
          placeholder="Todas las marcas"
          value={filters.brands}
          onChange={set('brands')}
          source={options.brand}
        />
        <MultiField
          id="bulk-price-category"
          label="Categoría"
          placeholder="Todas las categorías"
          value={filters.categoryIds}
          onChange={set('categoryIds')}
          source={options.category}
        />
        <MultiField
          id="bulk-price-supplier"
          label="Proveedor"
          placeholder="Todos los proveedores"
          value={filters.supplierIds}
          onChange={set('supplierIds')}
          source={options.supplier}
        />
        <Field label="Nombre contiene">
          <ProductSearchInput
            value={filters.search}
            onChange={(text) => onChange({ ...filters, search: text })}
            onSelect={(product) => product && onChange({ ...filters, search: product.name })}
            placeholder="Ej: aceite, filtro..."
          />
        </Field>
      </div>
    </section>
  );
};

export default BulkPriceFilters;
