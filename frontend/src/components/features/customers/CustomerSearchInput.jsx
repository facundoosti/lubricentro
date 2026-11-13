import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCustomers, useCustomer } from '@services/customersService';
import { useFloatingPosition } from '@hooks/useFloatingPosition';
import { Search, ChevronDown, X } from 'lucide-react';
import CustomerSearchResults from '@components/features/customers/CustomerSearchResults';

// Altura máxima de la lista (max-h-60 = 15rem = 240px) y separación con el input
const LIST_MAX_HEIGHT = 240;
const LIST_GAP = 4;
// Por encima de cualquier FormDialog apilado (50 + nivel * 10), igual que SearchableSelect
const LIST_Z_INDEX = 9999;

const formatCustomerDisplay = (customer) => {
  if (!customer) return '';
  return `${customer.name} - ${customer.email || customer.phone || 'Sin contacto'}`;
};

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
 * // Edición: pasar initialCustomer para prellenar sin pedir el cliente por ID
 * <CustomerSearchInput value={vehicle.customer_id} onChange={setId} onSelect={onSelect} initialCustomer={vehicle.customer} />
 */
const CustomerSearchInput = ({ 
  value, // ID del cliente
  onChange, 
  onSelect, 
  placeholder = "Buscar cliente por nombre, teléfono o correo...",
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

  // Cierra la lista y descarta la opción destacada
  const closeList = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

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
      setSelectedCustomer(loadedCustomer);
      setInputValue(formatCustomerDisplay(loadedCustomer));
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
    const displayValue = formatCustomerDisplay(selectedCustomer);
    if (selectedCustomer && inputValue !== displayValue) setInputValue(displayValue);
  }, [selectedCustomer, inputValue]);

  // Limpia el debounce pendiente al desmontar
  useEffect(() => () => clearTimeout(debounceTimeoutRef.current), []);

  // Efecto para cerrar el dropdown al hacer clic fuera (la lista vive en un portal, fuera del wrapper)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inWrapper = wrapperRef.current?.contains(event.target);
      const inList = listRef.current?.contains(event.target);
      if (wrapperRef.current && !inWrapper && !inList) closeList();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeList]);

  // Posicionar la lista (portal con position: fixed) y seguir al input en scroll/resize
  const { style: floatingStyle } = useFloatingPosition(anchorRef, {
    isOpen,
    maxHeight: LIST_MAX_HEIGHT,
    offset: LIST_GAP,
  });
  const listStyle = useMemo(() => ({ ...floatingStyle, zIndex: LIST_Z_INDEX }), [floatingStyle]);

  // Resetear índice destacado cuando cambian los resultados
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [customers]);

  // --- HANDLERS ---
  const handleClear = useCallback(() => {
    setSelectedCustomer(null);
    setInputValue('');
    setDebouncedSearchTerm('');
    closeList();
    onChange?.('');
    onSelect?.(null);
  }, [onChange, onSelect, closeList]);

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

    // Texto distinto al cliente seleccionado: buscar, pero mantener la selección hasta confirmar
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
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(newText);
    }, 300);
  }, [selectedCustomer, onChange, onSelect, handleClear]);

  const handleCustomerSelect = useCallback((customer) => {
    setSelectedCustomer(customer);
    setInputValue(formatCustomerDisplay(customer));
    setDebouncedSearchTerm('');
    closeList();
    onChange?.(customer.id);
    onSelect?.(customer);
  }, [onChange, onSelect, closeList]);

  // Texto que escribió el usuario (no el de un cliente ya elegido)
  const searchText = selectedCustomer ? '' : inputValue.trim();
  const canCreate = Boolean(onCreateNew && searchText);
  // "+ Crear cliente" es la última opción navegable (índice customers.length)
  const optionCount = customers.length + (canCreate ? 1 : 0);

  const handleCreateNew = useCallback(() => {
    closeList();
    onCreateNew(searchText);
  }, [onCreateNew, searchText, closeList]);

  // Navegación con teclado
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      // Cierra solo la lista: el diálogo contenedor ignora un Escape ya atendido
      e.preventDefault();
      closeList();
      return;
    }
    if (optionCount === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < optionCount - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
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
  }, [isOpen, optionCount, customers, highlightedIndex, handleCustomerSelect, canCreate, handleCreateNew, closeList]);

  const isLoading = isLoadingSearch || isLoadingInitialCustomer;

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input principal */}
      <div ref={anchorRef} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-secondary" />
        </div>
        <input
          autoComplete="off"
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
      {isOpen && (
        <CustomerSearchResults
          listRef={listRef}
          style={listStyle}
          isLoading={isLoadingSearch}
          customers={customers}
          highlightedIndex={highlightedIndex}
          onHighlight={setHighlightedIndex}
          onSelect={handleCustomerSelect}
          hasSearchTerm={Boolean(debouncedSearchTerm)}
          canCreate={canCreate}
          searchText={searchText}
          onCreateNew={handleCreateNew}
        />
      )}

      {/* Mensaje de error */}
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};

export default CustomerSearchInput;