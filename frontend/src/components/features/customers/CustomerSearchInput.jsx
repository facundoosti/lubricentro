import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCustomers, useCustomer } from '@services/customersService';
import { Search, ChevronDown, X } from 'lucide-react';

// Helper para formatear el nombre del cliente de manera consistente
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
  disabled = false 
}) => {
  // --- STATE MANAGEMENT ---
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const wrapperRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // --- DATA FETCHING ---
  // Query para buscar clientes (para el dropdown de búsqueda)
  const { data: customersData, isLoading: isLoadingSearch } = useCustomers({
    search: debouncedSearchTerm,
    per_page: 10,
    // Solo activar la búsqueda si hay un término y el dropdown está abierto
    enabled: debouncedSearchTerm.length > 0 && isOpen, 
  });
  const customers = customersData?.data?.customers || [];

  // Query para obtener el cliente inicial basado en el `value` (ID)
  const { data: initialCustomerData, isLoading: isLoadingInitialCustomer } = useCustomer(value, {
    // Solo activar esta query si se pasa un `value` y no tenemos ya un cliente seleccionado con ese ID
    enabled: !!value && value !== selectedCustomer?.id,
  });

  // --- LOGIC & SIDE EFFECTS ---

  // Efecto para sincronizar el estado interno cuando el `value` (ID) de la prop cambia
  useEffect(() => {
    const initialCustomer = initialCustomerData?.data?.customer;
    if (value && initialCustomer && value !== selectedCustomer?.id) {
      setSelectedCustomer(initialCustomer);
      setInputValue(formatCustomerDisplay(initialCustomer));
    } else if (!value) {
      // Si el valor se limpia desde el componente padre, reseteamos el estado
      setSelectedCustomer(null);
      setInputValue('');
    }
  }, [value, initialCustomerData, selectedCustomer?.id]);

  // Efecto para el debouncing de la búsqueda
  useEffect(() => {
    // Limpia el timeout si el componente se desmonta
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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- HANDLERS (memoizados con useCallback) ---

  const handleClear = useCallback(() => {
    setSelectedCustomer(null);
    setInputValue('');
    setDebouncedSearchTerm('');
    setIsOpen(false);
    onChange?.('');
    onSelect?.(null);
  }, [onChange, onSelect]);

  const handleInputChange = useCallback((e) => {
    const newText = e.target.value;
    setInputValue(newText);
    setIsOpen(true);

    // Si el usuario borra el texto, limpiamos todo
    if (newText === '') {
      handleClear();
      return;
    }

    // Si el texto cambia, la selección anterior ya no es válida
    if (selectedCustomer) {
        setSelectedCustomer(null);
        onChange?.('');
        onSelect?.(null);
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
    
    onChange?.(customer.id);
    onSelect?.(customer);
  }, [onChange, onSelect]);

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
          placeholder={isLoading ? "Cargando cliente..." : placeholder}
          disabled={disabled || isLoadingInitialCustomer}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
            error ? 'border-red-500' : 'border-gray-300'
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
            onClick={() => setIsOpen(!isOpen)}
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
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleCustomerSelect(customer)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
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