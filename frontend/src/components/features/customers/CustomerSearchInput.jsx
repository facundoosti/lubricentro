import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useCustomers, useCustomer } from '@services/customersService';
import { Search, ChevronDown, X, UserPlus } from 'lucide-react';

/**
 * CustomerSearchInput - Componente de búsqueda y selección de clientes
 * 
 * @param {Object} props
 * @param {string|number} props.value - ID del cliente seleccionado
 * @param {Function} props.onChange - Callback cuando cambia el ID del cliente (value)
 * @param {Function} props.onSelect - Callback cuando se selecciona un cliente completo
 * @param {string} props.placeholder - Placeholder del input
 * @param {string} props.error - Mensaje de error a mostrar
 * @param {boolean} props.disabled - Si el input está deshabilitado
 * @param {Object} props.initialCustomer - Cliente completo para prellenar (usar en edición)
 * @param {Function} props.onCreateNew - Si se pasa, ofrece "+ Crear cliente" con el texto buscado
 * 
 * @example
 * // Para creación (sin cliente inicial)
 * <CustomerSearchInput
 *   value={selectedCustomerId}
 *   onChange={setSelectedCustomerId}
 *   onSelect={handleCustomerSelect}
 * />
 * 
 * // Para edición (con cliente inicial)
 * <CustomerSearchInput
 *   value={vehicle.customer_id}
 *   onChange={setSelectedCustomerId}
 *   onSelect={handleCustomerSelect}
 *   initialCustomer={vehicle.customer}
 * />
 */
// Altura máxima de la lista (max-h-60 = 15rem = 240px) y separación con el input
const LIST_MAX_HEIGHT = 240;
const LIST_GAP = 4;
// Por encima de cualquier FormDialog apilado (50 + nivel * 10), igual que SearchableSelect
const LIST_Z_INDEX = 9999;

// Posición fija de la lista según el input: abajo, o arriba si abajo no entra y arriba hay más lugar
const calcListStyle = (anchor) => {
  if (!anchor) return {};
  const rect = anchor.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - LIST_GAP;
  const spaceAbove = rect.top - LIST_GAP;
  const openUp = spaceBelow < LIST_MAX_HEIGHT && spaceAbove > spaceBelow;
  return {
    position: 'fixed',
    left: rect.left,
    width: rect.width,
    zIndex: LIST_Z_INDEX,
    ...(openUp
      ? { bottom: window.innerHeight - rect.top + LIST_GAP }
      : { top: rect.bottom + LIST_GAP }),
  };
};

const formatCustomerDisplay = (customer) => {
  if (!customer) return '';
  return `${customer.name} - ${customer.email || customer.phone || 'Sin contacto'}`;
};

const CustomerSearchInput = ({ 
  value, // ID del cliente
  onChange, 
  onSelect, 
  placeholder = "Buscar cliente por nombre, teléfono o email...",
  error = null,
  disabled = false,
  initialCustomer = null, // Cliente completo si está disponible
  onCreateNew = null,
}) => {
  // --- STATE MANAGEMENT ---
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(initialCustomer);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Para navegación con teclado
  
  const [listStyle, setListStyle] = useState({});

  const wrapperRef = useRef(null);
  const anchorRef = useRef(null);
  const listRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // --- DATA FETCHING ---
  // Query para buscar clientes (para el dropdown de búsqueda)
  const { data: customersData, isLoading: isLoadingSearch } = useCustomers({
    search: debouncedSearchTerm,
    per_page: 10,
    enabled: debouncedSearchTerm.length > 0 && isOpen, 
  });
  const customers = useMemo(() => customersData?.data?.customers || [], [customersData]);

  // Query para obtener el cliente inicial basado en el `value` (ID)
  const { data: initialCustomerData, isLoading: isLoadingInitialCustomer } = useCustomer(value, {
    enabled: !!value && !initialCustomer, // Solo si no tenemos initialCustomer
  });

  // GET /customers/:id devuelve el cliente directo en `data`
  const loadedCustomer = initialCustomerData?.data?.customer ?? initialCustomerData?.data ?? null;

  // --- LOGIC & SIDE EFFECTS ---

  // Efecto principal para manejar la inicialización y sincronización
  useEffect(() => {
    
    // Caso 1: Tenemos initialCustomer (edición)
    if (initialCustomer) {
      setSelectedCustomer(initialCustomer);
      setInputValue(formatCustomerDisplay(initialCustomer));
    }
    // Caso 2: Tenemos value pero no initialCustomer (carga por ID)
    else if (value && loadedCustomer?.id) {
      const customer = loadedCustomer;
      setSelectedCustomer(customer);
      setInputValue(formatCustomerDisplay(customer));
    }
    // Caso 3: Tenemos value pero no hay datos (cliente no encontrado)
    else if (value && !isLoadingInitialCustomer && !loadedCustomer?.id) {
      setInputValue("Cliente no encontrado");
    }
    // Caso 4: No hay value, limpiar todo
    else if (!value) {
      setSelectedCustomer(null);
      setInputValue('');
    }
  }, [initialCustomer, value, loadedCustomer, isLoadingInitialCustomer]);

  // Efecto para asegurar que el inputValue siempre refleje el selectedCustomer
  useEffect(() => {
    if (selectedCustomer) {
      const displayValue = formatCustomerDisplay(selectedCustomer);
      if (inputValue !== displayValue) {
        setInputValue(displayValue);
      }
    }
  }, [selectedCustomer, inputValue]);

  // Efecto para el debouncing de la búsqueda
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  
  // Efecto para cerrar el dropdown al hacer clic fuera (la lista vive en un portal, fuera del wrapper)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inWrapper = wrapperRef.current?.contains(event.target);
      const inList = listRef.current?.contains(event.target);
      if (wrapperRef.current && !inWrapper && !inList) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Posicionar la lista (portal con position: fixed) y seguir al input en scroll/resize
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const update = () => setListStyle(calcListStyle(anchorRef.current));
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  // Resetear índice destacado cuando cambian los resultados
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [customers]);

  // --- HANDLERS ---

  const handleClear = useCallback(() => {
    setSelectedCustomer(null);
    setInputValue('');
    setDebouncedSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange?.('');
    onSelect?.(null);
  }, [onChange, onSelect]);

  const handleInputChange = useCallback((e) => {
    const newText = e.target.value;
    setInputValue(newText);
    setIsOpen(true);
    setHighlightedIndex(-1);

    // Si el usuario borra el texto, limpiamos todo
    if (newText === '') {
      handleClear();
      return;
    }

    // Si el texto cambia y es diferente al cliente seleccionado, 
    // permitir búsqueda pero mantener la selección hasta que se confirme
    if (selectedCustomer && newText !== formatCustomerDisplay(selectedCustomer)) {
      // Solo limpiar la selección si el texto es completamente diferente
      // Esto permite búsquedas adicionales sin perder la selección
      if (!newText.includes(selectedCustomer.name)) {
        setSelectedCustomer(null);
        onChange?.('');
        onSelect?.(null);
      }
    }
    
    // Aplicar debounce a la búsqueda
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(newText);
    }, 300);
  }, [selectedCustomer, onChange, onSelect, handleClear]);

  const handleCustomerSelect = useCallback((customer) => {
    setSelectedCustomer(customer);
    setInputValue(formatCustomerDisplay(customer));
    setDebouncedSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    onChange?.(customer.id);
    onSelect?.(customer);
  }, [onChange, onSelect]);

  // Texto que escribió el usuario (no el de un cliente ya elegido)
  const searchText = selectedCustomer ? '' : inputValue.trim();
  const canCreate = Boolean(onCreateNew && searchText);
  // "+ Crear cliente" es la última opción navegable (índice customers.length)
  const optionCount = customers.length + (canCreate ? 1 : 0);

  const handleCreateNew = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    onCreateNew(searchText);
  }, [onCreateNew, searchText]);

  // Navegación con teclado
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      // Cierra solo la lista: el diálogo contenedor ignora un Escape ya atendido
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }
    if (optionCount === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < optionCount - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : -1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && customers[highlightedIndex]) {
          handleCustomerSelect(customers[highlightedIndex]);
        } else if (canCreate && highlightedIndex === customers.length) {
          handleCreateNew();
        }
        break;
      
      default:
        break;
    }
  }, [isOpen, optionCount, customers, highlightedIndex, handleCustomerSelect, canCreate, handleCreateNew]);

  const isLoading = isLoadingSearch || isLoadingInitialCustomer;

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input principal */}
      <div ref={anchorRef} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-secondary" />
        </div>
        
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Cargando cliente..." : placeholder}
          disabled={disabled || isLoadingInitialCustomer}
          aria-invalid={!!error}
          className={`w-full h-11 pl-10 ${inputValue ? 'pr-16' : 'pr-10'} rounded-lg bg-surface-variant border text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            error ? 'border-error' : selectedCustomer ? 'border-tertiary' : 'border-outline-variant'
          } ${disabled || isLoadingInitialCustomer ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 mr-1 text-secondary hover:text-on-surface-variant"
              aria-label="Limpiar selección"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setHighlightedIndex(-1);
            }}
            className="p-1 mr-2 text-secondary hover:text-on-surface-variant"
            aria-label="Mostrar/ocultar opciones"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown de resultados — portal al body para que el overflow del diálogo no lo recorte */}
      {isOpen && createPortal(
        <div
          ref={listRef}
          style={listStyle}
          data-testid="customer-search-results"
          className="bg-surface-container border border-outline-variant rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {isLoadingSearch ? (
            <div className="px-4 py-2 text-sm text-on-surface-variant">Buscando...</div>
          ) : customers.length > 0 ? (
            <div>
              {customers.map((customer, index) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleCustomerSelect(customer)}
                  className={`w-full px-4 py-2 text-left focus:outline-none transition-colors ${
                    index === highlightedIndex
                      ? 'bg-primary/10 text-on-surface'
                      : 'hover:bg-surface-container-high focus:bg-surface-container-high'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="font-medium text-on-surface">{customer.name}</div>
                  <div className="text-sm text-on-surface-variant">{customer.email || customer.phone || 'Sin contacto'}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-2 text-sm text-on-surface-variant">
              {debouncedSearchTerm ? 'No se encontraron clientes' : 'Escribe para buscar'}
            </div>
          )}
          {canCreate && (
            <button
              type="button"
              onClick={handleCreateNew}
              onMouseEnter={() => setHighlightedIndex(customers.length)}
              className={`flex w-full items-center gap-2 border-t border-outline-variant px-4 py-2.5 text-left text-sm font-medium text-primary ${
                highlightedIndex === customers.length ? 'bg-primary/10' : 'hover:bg-surface-container-high'
              }`}
            >
              <UserPlus className="h-4 w-4 shrink-0" />
              <span className="truncate">+ Crear cliente "{searchText}"</span>
            </button>
          )}
        </div>,
        document.body,
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default CustomerSearchInput;