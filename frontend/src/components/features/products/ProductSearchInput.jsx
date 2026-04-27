import { useState, useEffect, useRef, useCallback } from 'react';
import { useProducts } from '@services/productsService';
import { Search, X } from 'lucide-react';

/**
 * ProductSearchInput — autocomplete de productos con debounce.
 *
 * @param {string}   value       - Texto actual del campo
 * @param {Function} onChange    - Callback con el texto libre mientras escribe
 * @param {Function} onSelect    - Callback con el producto seleccionado del dropdown
 * @param {string}   placeholder
 */
const ProductSearchInput = ({ value = '', onChange, onSelect, placeholder = 'Buscar producto...' }) => {
  const [inputValue, setInputValue] = useState(value);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const { data: productsData, isLoading } = useProducts({
    search: debouncedSearch,
    per_page: 10,
  });

  const products = debouncedSearch ? (productsData?.data?.products || []) : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = useCallback((e) => {
    const text = e.target.value;
    setInputValue(text);
    setIsOpen(true);
    onChange?.(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 300);
  }, [onChange]);

  const handleSelect = useCallback((product) => {
    setInputValue(product.name);
    setDebouncedSearch('');
    setIsOpen(false);
    onSelect?.(product);
    onChange?.(product.name);
  }, [onSelect, onChange]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setDebouncedSearch('');
    setIsOpen(false);
    onChange?.('');
    onSelect?.(null);
  }, [onChange, onSelect]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(Number(price));

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => inputValue && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface placeholder:text-secondary text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-secondary hover:text-on-surface"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 left-0 w-full bg-surface-container border border-outline-variant rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2.5 text-xs text-secondary">Buscando...</div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <button
                key={product.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(product); }}
                className="w-full px-3 py-2.5 text-left hover:bg-surface-container-high transition-colors border-b border-outline-variant last:border-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-on-surface font-medium truncate">{product.name}</span>
                  <span className="text-xs text-secondary font-mono shrink-0">{product.sku || ''}</span>
                </div>
                <div className="text-xs text-secondary mt-0.5">
                  {formatPrice(product.unit_price)}
                  {product.unit && <span className="ml-1">/ {product.unit}</span>}
                  {product.supplier_name && <span className="ml-2 text-on-surface-variant">· {product.supplier_name}</span>}
                </div>
              </button>
            ))
          ) : debouncedSearch ? (
            <div className="px-3 py-2.5 text-xs text-secondary">Sin resultados para "{debouncedSearch}"</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ProductSearchInput;
