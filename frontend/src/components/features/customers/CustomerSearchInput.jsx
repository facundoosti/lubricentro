import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { useCustomers, useCustomer } from '@services/customersService';
import Autocomplete from '@ui/Autocomplete';
import { cn } from '@/lib/utils';

const formatContact = (customer) => customer.email || customer.phone || 'Sin contacto';
const formatCustomerDisplay = (customer) => (customer ? `${customer.name} - ${formatContact(customer)}` : '');

const renderCustomer = (customer) => (
  <>
    <div className="font-medium text-on-surface">{customer.name}</div>
    <div className="text-sm text-on-surface-variant">{formatContact(customer)}</div>
  </>
);

const searchIcon = (
  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
    <Search className="size-4 text-secondary" />
  </div>
);

/**
 * CustomerSearchInput - búsqueda y selección de clientes (sobre @ui/Autocomplete).
 *
 * @param {string|number} props.value - ID del cliente seleccionado
 * @param {Function} props.onChange - recibe el ID ('' al limpiar)
 * @param {Function} props.onSelect - recibe el cliente completo (null al limpiar)
 * @param {string} props.placeholder
 * @param {string|boolean} props.error - mensaje de error (se muestra debajo) o `true` (solo marca el campo).
 *   Dentro de `@ui/Field` el mensaje va en Field (`<Field error={...}>`): Field le pasa `error={true}`.
 * @param {string} props.id - id del input (lo inyecta Field para asociar el label)
 * @param {string} props['aria-describedby'] - id del mensaje de error/ayuda (lo inyecta Field)
 * @param {boolean} props.disabled
 * @param {Object} props.initialCustomer - cliente completo para prellenar (edición) sin pedirlo por ID
 * @param {Function} props.onCreateNew - si se pasa, ofrece "+ Crear cliente" con el texto buscado
 */
const CustomerSearchInput = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Buscar cliente por nombre, teléfono o correo...',
  error = null,
  disabled = false,
  initialCustomer = null,
  onCreateNew = null,
  id,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(initialCustomer);

  const { data: customersData, isLoading: isLoadingSearch } = useCustomers({
    search: searchTerm,
    per_page: 10,
    enabled: searchTerm.length > 0,
  });
  const customers = useMemo(() => customersData?.data?.customers || [], [customersData]);

  const { data: initialCustomerData, isLoading: isLoadingInitialCustomer } = useCustomer(value, {
    enabled: !!value && !initialCustomer,
  });
  // GET /customers/:id devuelve el cliente directo en `data`
  const loadedCustomer = initialCustomerData?.data?.customer ?? initialCustomerData?.data ?? null;

  // Sincroniza con el valor externo: cliente inicial, carga por ID, no encontrado o vacío
  useEffect(() => {
    if (initialCustomer) {
      setSelectedCustomer(initialCustomer);
      setInputValue(formatCustomerDisplay(initialCustomer));
    } else if (value && loadedCustomer?.id) {
      setSelectedCustomer(loadedCustomer);
      setInputValue(formatCustomerDisplay(loadedCustomer));
    } else if (value && !isLoadingInitialCustomer && !loadedCustomer?.id) {
      setInputValue('Cliente no encontrado');
    } else if (!value) {
      setSelectedCustomer(null);
      setInputValue('');
    }
  }, [initialCustomer, value, loadedCustomer, isLoadingInitialCustomer]);

  const handleClear = useCallback(() => {
    setSelectedCustomer(null);
    setInputValue('');
    setSearchTerm('');
    onChange?.('');
    onSelect?.(null);
  }, [onChange, onSelect]);

  const handleInputChange = useCallback((text) => {
    if (text === '') {
      handleClear();
      return;
    }
    setInputValue(text);
    // Editar el texto deselecciona solo si ya no contiene el nombre del cliente elegido
    if (selectedCustomer && !text.includes(selectedCustomer.name)) {
      setSelectedCustomer(null);
      onChange?.('');
      onSelect?.(null);
    }
  }, [selectedCustomer, onChange, onSelect, handleClear]);

  const handleCustomerSelect = useCallback((customer) => {
    setSelectedCustomer(customer);
    setInputValue(formatCustomerDisplay(customer));
    setSearchTerm('');
    onChange?.(customer.id);
    onSelect?.(customer);
  }, [onChange, onSelect]);

  // Texto que escribió el usuario (no el de un cliente ya elegido)
  const searchText = selectedCustomer ? '' : inputValue.trim();
  const action = onCreateNew && searchText
    ? { label: `+ Crear cliente "${searchText}"`, icon: UserPlus, onSelect: () => onCreateNew(searchText) }
    : null;

  const isDisabled = disabled || isLoadingInitialCustomer;
  // El borde de error lo da aria-invalid (inputVariants); verde solo con un cliente elegido y sin error.
  const borderClass = !error && selectedCustomer && 'border-tertiary';

  return (
    <div>
      <Autocomplete
        id={id}
        aria-describedby={ariaDescribedBy}
        value={inputValue}
        onValueChange={handleInputChange}
        onSearch={setSearchTerm}
        items={searchTerm ? customers : []}
        getItemKey={(c) => c.id}
        itemToString={formatCustomerDisplay}
        renderItem={renderCustomer}
        onItemSelect={handleCustomerSelect}
        loading={isLoadingSearch && searchTerm.length > 0}
        emptyText="No se encontraron clientes"
        idleText="Escribe para buscar"
        action={action}
        onClear={handleClear}
        clearLabel="Limpiar selección"
        showTrigger
        openOnInputClick
        leading={searchIcon}
        placeholder={isLoadingInitialCustomer ? 'Cargando cliente...' : placeholder}
        disabled={isDisabled}
        error={!!error}
        inputClassName={cn('pl-9', inputValue ? 'pr-16' : 'pr-10', borderClass)}
        contentClassName="max-h-60"
        itemClassName="px-4 py-2"
      />
      {typeof error === 'string' && error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};

// Field le inyecta id, error y aria-describedby.
CustomerSearchInput.isFieldControl = true;

export default CustomerSearchInput;
