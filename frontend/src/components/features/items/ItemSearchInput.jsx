import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { useProducts } from '@services/productsService';
import { useServices } from '@services/servicesService';
import { Search, X } from 'lucide-react';
import { DEFAULT_IVA_RATE, formatIvaRate, priceWithIva, toIvaRate } from '@utils/iva';
import { formatCurrency } from '@utils/money';
import { DEFAULT_PRODUCT_MARGIN } from '@utils/budgetMath';

const DEBOUNCE_MS = 300;

// Producto: precio neto + su alícuota + ganancia por defecto. Servicio: precio final (sin IVA ni ganancia). Ambos guardan
// el origen en el catálogo (product_id / service_id).
const toSelection = (item) => {
  if (item._type === 'Producto') {
    return {
      description: item.name,
      unit_price: Number(item.unit_price) || 0,
      iva_rate: toIvaRate(item.iva_rate) ?? DEFAULT_IVA_RATE,
      margin_percentage: DEFAULT_PRODUCT_MARGIN,
      stock: item.stock ?? null,
      product_id: item.id,
      service_id: null,
    };
  }
  return {
    description: item.name,
    unit_price: Number(item.base_price) || 0,
    iva_rate: null,
    margin_percentage: 0,
    stock: null,
    product_id: null,
    service_id: item.id,
  };
};

const PriceLine = ({ item }) => {
  if (item._type !== 'Producto') {
    return <span>{formatCurrency(item.base_price)} · precio final</span>;
  }
  const rate = toIvaRate(item.iva_rate) ?? DEFAULT_IVA_RATE;
  return (
    <span>
      {formatCurrency(item.unit_price)} + IVA {formatIvaRate(rate)} ={' '}
      <span className="font-medium text-on-surface">{formatCurrency(priceWithIva(item.unit_price, rate))}</span>
    </span>
  );
};

const StockBadge = ({ stock }) => {
  if (stock === null || stock === undefined) return null;
  return Number(stock) > 0 ? (
    <span className="text-xs text-secondary">Stock: {stock}</span>
  ) : (
    <span className="text-xs px-1.5 py-0.5 rounded bg-error-container text-on-error-container">Sin stock</span>
  );
};

/**
 * ItemSearchInput — busca productos y servicios para una línea de "Productos y Servicios".
 * Teclado: ↑ ↓ para moverse, Enter para elegir, Esc para cerrar.
 *
 * @param {string} value - Texto actual del campo descripción
 * @param {Function} onSelect - Callback con { description, unit_price, iva_rate, margin_percentage, stock, product_id, service_id }
 * @param {Function} onChange - Callback para edición libre del texto
 * @param {Object} inputRef - Ref opcional al <input> (para enfocarlo desde afuera)
 */
const ItemSearchInput = ({ value, onSelect, onChange, inputRef }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // No pasar `enabled` como filtro — iría como query param a la API.
  const { data: productsData, isLoading: loadingProducts, isError: productsError } = useProducts({ search: debouncedSearch, per_page: 8 });
  const { data: servicesData, isLoading: loadingServices, isError: servicesError } = useServices({ search: debouncedSearch, per_page: 8 });

  const products = debouncedSearch
    ? (productsData?.data?.products || []).map((p) => ({ ...p, _type: 'Producto' }))
    : [];
  const services = debouncedSearch
    ? (servicesData?.data?.services || []).map((s) => ({ ...s, _type: 'Servicio' }))
    : [];
  const results = [...products, ...services];
  // Se muestran los resultados de la lista que llegue primero.
  const isLoading = !!debouncedSearch && (loadingProducts || loadingServices) && results.length === 0;
  const isError = !!debouncedSearch && (productsError || servicesError) && results.length === 0;
  const showList = isOpen && (isLoading || results.length > 0 || !!debouncedSearch);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = useCallback((e) => {
    const text = e.target.value;
    setInputValue(text);
    setIsOpen(true);
    setActiveIndex(-1);
    onChange?.(text);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), DEBOUNCE_MS);
  }, [onChange]);

  const handleSelect = useCallback((item) => {
    clearTimeout(debounceRef.current);
    const selection = toSelection(item);
    setInputValue(selection.description);
    setDebouncedSearch('');
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect?.(selection);
  }, [onSelect]);

  // Limpia solo la descripción: no pisa el precio ni el IVA que haya cargado el usuario.
  const handleClear = useCallback(() => {
    clearTimeout(debounceRef.current);
    setInputValue('');
    setDebouncedSearch('');
    setIsOpen(false);
    onChange?.('');
  }, [onChange]);

  const handleKeyDown = (e) => {
    // Enter nunca envía el formulario desde el buscador.
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && activeIndex >= 0 && results[activeIndex]) handleSelect(results[activeIndex]);
      return;
    }
    if (e.key === 'Escape') {
      if (isOpen) e.stopPropagation();
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  };

  const optionId = (index) => `${listId}-opt-${index}`;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-secondary" />
        </div>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Producto o servicio"
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={showList && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar producto o servicio..."
          className="w-full pl-7 pr-6 py-1.5 bg-surface-variant border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-secondary"
        />
        {inputValue && (
          <button
            type="button"
            aria-label="Limpiar"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-1.5 flex items-center text-secondary hover:text-on-surface"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 top-full mt-1 left-0 w-full min-w-64 bg-surface-container border border-outline-variant rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <li className="px-3 py-2 text-xs text-secondary">Buscando...</li>
          ) : isError ? (
            <li className="px-3 py-2 text-xs text-error">No se pudo buscar. Probá de nuevo.</li>
          ) : results.length > 0 ? (
            results.map((item, index) => (
              <li
                key={`${item._type}-${item.id}`}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-3 py-2 cursor-pointer border-l-2 transition-colors ${
                  index === activeIndex
                    ? 'bg-primary-container/15 border-primary'
                    : 'border-transparent hover:bg-surface-container-high'
                }`}
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
                <div className="flex items-center justify-between gap-2 mt-0.5 text-xs text-secondary">
                  <PriceLine item={item} />
                  {item._type === 'Producto' && <StockBadge stock={item.stock} />}
                </div>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-xs text-secondary">Sin resultados</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ItemSearchInput;
