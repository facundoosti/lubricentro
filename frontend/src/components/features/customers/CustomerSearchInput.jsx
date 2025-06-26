import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCustomers, useCustomer } from '@services/customersService';
import { Search, ChevronDown, X } from 'lucide-react';

const CustomerSearchInput = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Buscar cliente por nombre o email...",
  error = null,
  disabled = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [displayValue, setDisplayValue] = useState('');
  const wrapperRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Query para buscar clientes con debounce
  const { data: customersData, isLoading } = useCustomers({
    search: debouncedSearchTerm,
    per_page: 10
  });

  // Query para obtener un cliente específico (cuando se edita)
  // Solo hacer la consulta si value es válido (no vacío, no null, no undefined)
  const isValidCustomerId = value && value !== '' && value !== null && value !== undefined;
  const { data: customerData, isLoading: isLoadingCustomer } = useCustomer(value);

  const customers = customersData?.data?.customers || [];

  // Debounce function
  const debounceSearch = useCallback((term) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(term);
    }, 300); // 300ms debounce
  }, []);

  // Efecto para manejar el valor inicial (cuando se edita)
  useEffect(() => {
    if (isValidCustomerId && customerData?.data?.customer) {
      const customer = customerData.data.customer;
      setSelectedCustomer(customer);
      setDisplayValue(`${customer.name} - ${customer.email || customer.phone || 'Sin contacto'}`);
    } else if (!isValidCustomerId) {
      setSelectedCustomer(null);
      setDisplayValue('');
    }
  }, [value, customerData, isValidCustomerId]);

  // Efecto para cerrar el dropdown cuando se hace clic fuera
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

  // Cleanup del timeout al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    setSearchTerm(newValue);
    setIsOpen(true);
    
    // Aplicar debounce a la búsqueda
    debounceSearch(newValue);
    
    // Si el usuario borra todo, limpiar la selección inmediatamente
    if (!newValue) {
      setSelectedCustomer(null);
      onChange && onChange('');
      onSelect && onSelect(null);
      setDebouncedSearchTerm('');
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setDisplayValue(`${customer.name} - ${customer.email || customer.phone || 'Sin contacto'}`);
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsOpen(false);
    
    onChange && onChange(customer.id);
    onSelect && onSelect(customer);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setDisplayValue('');
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsOpen(false);
    
    onChange && onChange('');
    onSelect && onSelect(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={isLoadingCustomer ? "Cargando cliente..." : placeholder}
          disabled={disabled || isLoadingCustomer}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled || isLoadingCustomer ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {selectedCustomer && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              Buscando clientes...
            </div>
          ) : customers.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron clientes' : 'Escribe para buscar clientes'}
            </div>
          ) : (
            <div>
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleCustomerSelect(customer)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {customer.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {customer.email || customer.phone || 'Sin contacto'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomerSearchInput; 