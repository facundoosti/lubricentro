import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCustomers, useCustomer } from '@services/customersService';
import { Search, ChevronDown, X } from 'lucide-react';

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
const formatCustomerDisplay = (customer) => {
  if (!customer) return '';
  return `${customer.name} - ${customer.email || customer.phone || 'Sin contacto'}`;
};

const CustomerSearchInput = ({ 
  value, // ID del cliente
  onChange, 
  onSelect, 
  placeholder = "Buscar cliente por nombre o email...",
  error = null,
  disabled = false,
  initialCustomer = null // Cliente completo si está disponible
}) => {
  // --- STATE MANAGEMENT ---
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(initialCustomer);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Para navegación con teclado
  
  const wrapperRef = useRef(null);
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

  // --- LOGIC & SIDE EFFECTS ---

  // Efecto principal para manejar la inicialización y sincronización
  useEffect(() => {
    // Debug: Log para verificar que initialCustomer se está recibiendo
    if (initialCustomer) {
      console.log('CustomerSearchInput - initialCustomer recibido:', initialCustomer);
    }
    
    // Caso 1: Tenemos initialCustomer (edición)
    if (initialCustomer) {
      setSelectedCustomer(initialCustomer);
      setInputValue(formatCustomerDisplay(initialCustomer));
    }
    // Caso 2: Tenemos value pero no initialCustomer (carga por ID)
    else if (value && initialCustomerData?.data?.customer) {
      const customer = initialCustomerData.data.customer;
      setSelectedCustomer(customer);
      setInputValue(formatCustomerDisplay(customer));
    }
    // Caso 3: Tenemos value pero no hay datos (cliente no encontrado)
    else if (value && !isLoadingInitialCustomer && !initialCustomerData?.data?.customer) {
      setInputValue("Cliente no encontrado");
    }
    // Caso 4: No hay value, limpiar todo
    else if (!value) {
      setSelectedCustomer(null);
      setInputValue('');
    }
  }, [initialCustomer, value, initialCustomerData, isLoadingInitialCustomer]);

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
  
  // Efecto para cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Navegación con teclado
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || customers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < customers.length - 1 ? prev + 1 : prev
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
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      
      default:
        break;
    }
  }, [isOpen, customers, highlightedIndex, handleCustomerSelect]);

  const isLoading = isLoadingSearch || isLoadingInitialCustomer;

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input principal */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Cargando cliente..." : placeholder}
          disabled={disabled || isLoadingInitialCustomer}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
            error ? 'border-red-500' : selectedCustomer ? 'border-green-500' : 'border-gray-300'
          } ${disabled || isLoadingInitialCustomer ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
            className="p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Mostrar/ocultar opciones"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoadingSearch ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Buscando...</div>
          ) : customers.length > 0 ? (
            <div>
              {customers.map((customer, index) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleCustomerSelect(customer)}
                  className={`w-full px-4 py-2 text-left focus:outline-none transition-colors ${
                    index === highlightedIndex
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{customer.email || customer.phone || 'Sin contacto'}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              {debouncedSearchTerm ? 'No se encontraron clientes' : 'Escribe para buscar'}
            </div>
          )}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default CustomerSearchInput;