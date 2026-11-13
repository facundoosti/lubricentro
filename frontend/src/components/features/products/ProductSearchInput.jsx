import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useProducts } from '@services/productsService';
import Autocomplete from '@ui/Autocomplete';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(Number(price));

const renderProduct = (product) => (
  <>
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-sm font-medium text-on-surface">{product.name}</span>
      <span className="shrink-0 font-mono text-xs text-secondary">{product.sku || ''}</span>
    </div>
    <div className="mt-0.5 text-xs text-secondary">
      {formatPrice(product.unit_price)}
      {product.unit && <span className="ml-1">/ {product.unit}</span>}
      {product.supplier_name && <span className="ml-2 text-on-surface-variant">· {product.supplier_name}</span>}
    </div>
  </>
);

const searchIcon = (
  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-secondary" />
);

/**
 * ProductSearchInput — autocomplete de productos (sobre @ui/Autocomplete): texto libre + selección.
 *
 * @param {string}   value       - Texto actual del campo
 * @param {Function} onChange    - Callback con el texto libre mientras escribe
 * @param {Function} onSelect    - Callback con el producto seleccionado (null al limpiar)
 * @param {string}   placeholder
 */
const ProductSearchInput = ({ value = '', onChange, onSelect, placeholder = 'Buscar producto...' }) => {
  const [inputValue, setInputValue] = useState(value);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const { data: productsData, isLoading } = useProducts({ search, per_page: 10 });
  const products = search ? (productsData?.data?.products || []) : [];

  const handleChange = useCallback((text) => {
    setInputValue(text);
    onChange?.(text);
  }, [onChange]);

  const handleSelect = useCallback((product) => {
    setInputValue(product.name);
    setSearch('');
    onSelect?.(product);
    onChange?.(product.name);
  }, [onSelect, onChange]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setSearch('');
    onChange?.('');
    onSelect?.(null);
  }, [onChange, onSelect]);

  return (
    <Autocomplete
      value={inputValue}
      onValueChange={handleChange}
      onSearch={setSearch}
      items={products}
      getItemKey={(p) => p.id}
      itemToString={(p) => p.name}
      renderItem={renderProduct}
      onItemSelect={handleSelect}
      loading={isLoading && search.length > 0}
      emptyText={`Sin resultados para "${search}"`}
      onClear={handleClear}
      clearLabel="Limpiar búsqueda"
      leading={searchIcon}
      placeholder={placeholder}
      inputClassName="py-2 pr-8 pl-9"
      contentClassName="max-h-56"
      itemClassName="block border-b border-outline-variant px-3 py-2.5 last:border-0"
      statusClassName="px-3 py-2.5 text-xs text-secondary"
    />
  );
};

export default ProductSearchInput;
