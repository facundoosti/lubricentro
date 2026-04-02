import { useState, useEffect, useRef, useCallback } from 'react';
import { useProducts } from '@services/productsService';
import { useServices } from '@services/servicesService';
import { Search, X } from 'lucide-react';

/**
 * ItemSearchInput — busca productos y servicios para ítems de presupuesto.
 * El dropdown aparece por encima del input.
 *
 * @param {string} value - Texto actual del campo descripción
 * @param {Function} onSelect - Callback con { description, unit_price } al seleccionar
 * @param {Function} onChange - Callback para edición libre del texto
 */
const ItemSearchInput = ({ value, onSelect, onChange }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // No pasar `enabled` como filtro — iría como query param a la API.
  // Controlamos la visibilidad del dropdown con `isOpen` y `debouncedSearch`.
  const { data: productsData, isLoading: loadingProducts } = useProducts({
    search: debouncedSearch,
    per_page: 8,
  });
  const { data: servicesData, isLoading: loadingServices } = useServices({
    search: debouncedSearch,
    per_page: 8,
  });

  const products = debouncedSearch
    ? (productsData?.data?.products || []).map((p) => ({ ...p, _type: 'Producto' }))
    : [];
  const services = debouncedSearch
    ? (servicesData?.data?.services || []).map((s) => ({ ...s, _type: 'Servicio' }))
    : [];
  const results = [...products, ...services];
  const isLoading = debouncedSearch && (loadingProducts || loadingServices);

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

  const handleSelect = useCallback((item) => {
    const description = item.name;
    const unit_price = item._type === 'Producto'
      ? Number(item.unit_price) || 0
      : Number(item.base_price) || 0;
    setInputValue(description);
    setDebouncedSearch('');
    setIsOpen(false);
    onSelect?.({ description, unit_price });
  }, [onSelect]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setDebouncedSearch('');
    setIsOpen(false);
    onChange?.('');
    onSelect?.({ description: '', unit_price: 0 });
  }, [onChange, onSelect]);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-secondary" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar producto o servicio..."
          className="w-full pl-7 pr-6 py-1.5 bg-surface-variant border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-secondary"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-1.5 flex items-center text-secondary hover:text-on-surface"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Dropdown — por debajo del input */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-1 left-0 w-full min-w-56 bg-surface-container border border-outline-variant rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-xs text-secondary">Buscando...</div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <button
                key={`${item._type}-${item.id}`}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                className="w-full px-3 py-2 text-left hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-on-surface font-medium truncate">{item.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                    item._type === 'Producto'
                      ? 'bg-primary-container/20 text-primary'
                      : 'bg-tertiary-container/20 text-tertiary'
                  }`}>
                    {item._type}
                  </span>
                </div>
                {(item.unit_price != null || item.base_price != null) && (
                  <div className="text-xs text-secondary mt-0.5">
                    ${Number(item.unit_price ?? item.base_price).toLocaleString('es-AR')}
                  </div>
                )}
              </button>
            ))
          ) : debouncedSearch ? (
            <div className="px-3 py-2 text-xs text-secondary">Sin resultados</div>
          ) : null}
        </div>
      )}

    </div>
  );
};

export default ItemSearchInput;
