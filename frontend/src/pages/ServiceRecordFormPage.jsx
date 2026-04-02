import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import SearchableSelect from '@ui/SearchableSelect';
import { ArrowLeft, Save, Plus, Trash2, Car, User, Wrench, Package, Search, X } from 'lucide-react';
import { useAppointment } from '@services/appointmentsService';
import { useServiceRecord, useCreateServiceRecord, useUpdateServiceRecord } from '@services/serviceRecordsService';
import { useServices } from '@services/servicesService';
import { useProducts } from '@services/productsService';
import { showServiceRecordSuccess, showServiceRecordError } from '@services/notificationService';
import { appointmentKeys } from '@services/appointmentsService';
import { customerKeys } from '@services/customersService';
import { vehicleKeys } from '@services/vehiclesService';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@services/api';

const today = new Date().toISOString().split('T')[0];

const formatCurrency = (value) => {
  const n = Number(value) || 0;
  return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const ServiceRecordFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');
  const isEditing = !!id;
  const queryClient = useQueryClient();

  const { data: appointmentData, isLoading: loadingAppointment } = useAppointment(appointmentId);
  const { data: existingData, isLoading: loadingExisting } = useServiceRecord(id);

  const { data: servicesData } = useServices({ per_page: 100 });
  const { data: productsData } = useProducts({ per_page: 100 });

  const allServices = servicesData?.data?.services || servicesData?.data || [];
  const allProducts = productsData?.data?.products || productsData?.data || [];

  const createMutation = useCreateServiceRecord();
  const updateMutation = useUpdateServiceRecord();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const isStandaloneCreate = !isEditing && !appointmentId;

  // Standalone creation: customer/vehicle search state
  const [customerSearch, setCustomerSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('');
  const [debouncedVehicleSearch, setDebouncedVehicleSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const customerRef = useRef(null);
  const vehicleRef = useRef(null);

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      service_date: today,
      mileage: '',
      notes: '',
      next_service_date: '',
      customer_id: '',
      vehicle_id: '',
      appointment_id: appointmentId || '',
      service_record_services_attributes: [],
      service_record_products_attributes: [],
    },
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'service_record_services_attributes',
  });

  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
    control,
    name: 'service_record_products_attributes',
  });

  const appointment = appointmentData?.data;

  // Pre-fill from appointment when creating from a turno
  useEffect(() => {
    if (appointment && !isEditing) {
      setValue('customer_id', appointment.customer?.id || '');
      setValue('vehicle_id', appointment.vehicle?.id || '');
      setValue('appointment_id', appointment.id);
      setValue('service_date', today);
    }
  }, [appointment, isEditing, setValue]);

  // Pre-fill when editing an existing service record
  useEffect(() => {
    if (isEditing && existingData?.data) {
      const r = existingData.data;
      reset({
        service_date: r.service_date || today,
        mileage: r.mileage || '',
        notes: r.notes || '',
        next_service_date: r.next_service_date || '',
        customer_id: r.customer_id || '',
        vehicle_id: r.vehicle_id || '',
        appointment_id: r.appointment_id || '',
        service_record_services_attributes: (r.service_record_services || []).map((s) => ({
          id: s.id,
          service_id: String(s.service_id),
          quantity: s.quantity,
          unit_price: s.unit_price,
        })),
        service_record_products_attributes: (r.service_record_products || []).map((p) => ({
          id: p.id,
          product_id: String(p.product_id),
          quantity: p.quantity,
          unit_price: p.unit_price,
        })),
      });
    }
  }, [isEditing, existingData, reset]);

  // Debounce para búsquedas
  useEffect(() => {
    const t = setTimeout(() => setDebouncedCustomerSearch(customerSearch), 300);
    return () => clearTimeout(t);
  }, [customerSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedVehicleSearch(vehicleSearch), 300);
    return () => clearTimeout(t);
  }, [vehicleSearch]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (customerRef.current && !customerRef.current.contains(e.target)) setShowCustomerDropdown(false);
      if (vehicleRef.current && !vehicleRef.current.contains(e.target)) setShowVehicleDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Búsqueda de clientes (solo en creación standalone)
  const { data: customerSearchData, isFetching: fetchingCustomers } = useQuery({
    queryKey: [...customerKeys.lists(), { search: debouncedCustomerSearch }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: '1', per_page: '8' });
      if (debouncedCustomerSearch) params.append('search', debouncedCustomerSearch);
      const res = await api.get(`/customers?${params}`);
      return res.data;
    },
    enabled: isStandaloneCreate && showCustomerDropdown,
    staleTime: 30_000,
  });

  // Vehículos del cliente seleccionado (solo en creación standalone)
  const { data: customerVehiclesData, isFetching: fetchingVehicles } = useQuery({
    queryKey: [...vehicleKeys.lists(), { customer_id: selectedCustomer?.id, search: debouncedVehicleSearch }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: '1', per_page: '20' });
      if (selectedCustomer?.id) params.append('customer_id', selectedCustomer.id.toString());
      if (debouncedVehicleSearch) params.append('search', debouncedVehicleSearch);
      const res = await api.get(`/vehicles?${params}`);
      return res.data;
    },
    enabled: isStandaloneCreate && !!selectedCustomer,
    staleTime: 30_000,
  });

  const customerResults = customerSearchData?.data?.customers || [];
  const vehicleResults = customerVehiclesData?.data?.vehicles || customerVehiclesData?.data || [];

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
    setValue('customer_id', customer.id);
    // Reset vehicle al cambiar cliente
    setSelectedVehicle(null);
    setVehicleSearch('');
    setValue('vehicle_id', '');
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setValue('customer_id', '');
    setSelectedVehicle(null);
    setVehicleSearch('');
    setValue('vehicle_id', '');
  };

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleSearch(`${vehicle.brand} ${vehicle.model} — ${vehicle.license_plate}`);
    setShowVehicleDropdown(false);
    setValue('vehicle_id', vehicle.id);
  };

  const handleClearVehicle = () => {
    setSelectedVehicle(null);
    setVehicleSearch('');
    setValue('vehicle_id', '');
  };

  // Live totals
  const watchedServices = watch('service_record_services_attributes') || [];
  const watchedProducts = watch('service_record_products_attributes') || [];

  const servicesTotal = watchedServices.reduce(
    (sum, s) => sum + (Number(s.quantity) || 0) * (Number(s.unit_price) || 0),
    0
  );
  const productsTotal = watchedProducts.reduce(
    (sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.unit_price) || 0),
    0
  );
  const grandTotal = servicesTotal + productsTotal;

  const handleServiceChange = (index, serviceId) => {
    const service = allServices.find((s) => String(s.id) === String(serviceId));
    if (service) {
      setValue(`service_record_services_attributes.${index}.unit_price`, service.base_price);
    }
  };

  const handleProductChange = (index, productId) => {
    const product = allProducts.find((p) => String(p.id) === String(productId));
    if (product) {
      setValue(`service_record_products_attributes.${index}.unit_price`, product.unit_price);
    }
  };

  const onSubmit = async (formData) => {
    // Strip empty nested rows
    const payload = {
      ...formData,
      mileage: formData.mileage ? parseInt(formData.mileage, 10) : null,
      next_service_date: formData.next_service_date || null,
      appointment_id: formData.appointment_id || null,
      service_record_services_attributes: formData.service_record_services_attributes
        .filter((s) => s.service_id)
        .map((s) => ({ ...s, quantity: parseInt(s.quantity, 10) || 1 })),
      service_record_products_attributes: formData.service_record_products_attributes
        .filter((p) => p.product_id)
        .map((p) => ({ ...p, quantity: parseInt(p.quantity, 10) || 1 })),
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id, data: payload });
        showServiceRecordSuccess('UPDATED');
      } else {
        await createMutation.mutateAsync(payload);
        showServiceRecordSuccess('CREATED');
        // Invalidate appointments so the has_service_record flag updates
        queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      }
      navigate(appointmentId ? '/appointments' : '/service-records');
    } catch (err) {
      const action = isEditing ? 'ERROR_UPDATE' : 'ERROR_CREATE';
      showServiceRecordError(action, err.response?.data?.message || err.message);
    }
  };

  const inputClass = 'w-full px-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-secondary';

  const isLoadingInitial = (appointmentId && loadingAppointment) || (isEditing && loadingExisting);

  if (isLoadingInitial) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Resolved customer/vehicle (from appointment or from existing record)
  const resolvedCustomer = appointment?.customer || existingData?.data?.customer;
  const resolvedVehicle = appointment?.vehicle || existingData?.data?.vehicle;
  const isLockedFromAppointment = !!appointmentId && !isEditing;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(appointmentId ? '/appointments' : '/service-records')}
          className="p-2 rounded-lg hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            {isEditing ? 'Editar Atención' : 'Nueva Atención'}
          </h1>
          <p className="text-secondary text-sm mt-0.5">
            {isEditing
              ? `Atención #${id}`
              : appointmentId
              ? `Desde turno #${appointmentId}`
              : 'Completá los datos de la atención'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos generales */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-5 space-y-4">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Datos generales
          </h2>

          {/* Cliente y Vehículo */}
          {isLockedFromAppointment || isEditing ? (
            /* Modo bloqueado: desde turno o edición */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Cliente
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-variant/50 border border-outline-variant rounded-lg opacity-70">
                  <User className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-sm text-on-surface">{resolvedCustomer?.name || '—'}</span>
                </div>
                <input type="hidden" {...register('customer_id')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Vehículo
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-variant/50 border border-outline-variant rounded-lg opacity-70">
                  <Car className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-sm text-on-surface">
                    {resolvedVehicle
                      ? `${resolvedVehicle.brand} ${resolvedVehicle.model} — ${resolvedVehicle.license_plate}`
                      : '—'}
                  </span>
                </div>
                <input type="hidden" {...register('vehicle_id')} />
              </div>
            </div>
          ) : (
            /* Modo creación standalone: buscadores */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Buscador de cliente */}
              <div ref={customerRef}>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Cliente <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-secondary pointer-events-none" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                        if (!e.target.value) handleClearCustomer();
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      placeholder="Buscar cliente..."
                      className={`${inputClass} pl-9 pr-8`}
                      readOnly={!!selectedCustomer}
                    />
                    {selectedCustomer && (
                      <button
                        type="button"
                        onClick={handleClearCustomer}
                        className="absolute right-2 p-1 rounded hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {showCustomerDropdown && !selectedCustomer && (
                    <div className="absolute z-20 mt-1 w-full bg-surface-container border border-outline-variant rounded-lg shadow-lg overflow-hidden">
                      {fetchingCustomers ? (
                        <div className="px-3 py-2 text-sm text-secondary">Buscando...</div>
                      ) : customerResults.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-secondary">Sin resultados</div>
                      ) : (
                        <ul className="max-h-48 overflow-y-auto">
                          {customerResults.map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelectCustomer(c)}
                                className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                              >
                                <span className="font-medium">{c.name}</span>
                                {c.phone && <span className="ml-2 text-secondary text-xs">{c.phone}</span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                <input type="hidden" {...register('customer_id', { required: 'El cliente es obligatorio' })} />
                {errors.customer_id && (
                  <p className="text-error text-xs mt-1">{errors.customer_id.message}</p>
                )}
              </div>

              {/* Buscador de vehículo */}
              <div ref={vehicleRef}>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Vehículo <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-secondary pointer-events-none" />
                    <input
                      type="text"
                      value={vehicleSearch}
                      onChange={(e) => {
                        setVehicleSearch(e.target.value);
                        setShowVehicleDropdown(true);
                        if (!e.target.value) handleClearVehicle();
                      }}
                      onFocus={() => { if (selectedCustomer) setShowVehicleDropdown(true); }}
                      placeholder={selectedCustomer ? 'Buscar vehículo...' : 'Primero seleccioná un cliente'}
                      disabled={!selectedCustomer}
                      className={`${inputClass} pl-9 pr-8 disabled:opacity-50 disabled:cursor-not-allowed`}
                      readOnly={!!selectedVehicle}
                    />
                    {selectedVehicle && (
                      <button
                        type="button"
                        onClick={handleClearVehicle}
                        className="absolute right-2 p-1 rounded hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {showVehicleDropdown && selectedCustomer && !selectedVehicle && (
                    <div className="absolute z-20 mt-1 w-full bg-surface-container border border-outline-variant rounded-lg shadow-lg overflow-hidden">
                      {fetchingVehicles ? (
                        <div className="px-3 py-2 text-sm text-secondary">Buscando...</div>
                      ) : vehicleResults.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-secondary">Este cliente no tiene vehículos</div>
                      ) : (
                        <ul className="max-h-48 overflow-y-auto">
                          {vehicleResults
                            .filter((v) =>
                              !debouncedVehicleSearch ||
                              `${v.brand} ${v.model} ${v.license_plate}`.toLowerCase().includes(debouncedVehicleSearch.toLowerCase())
                            )
                            .map((v) => (
                              <li key={v.id}>
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => handleSelectVehicle(v)}
                                  className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                                >
                                  <span className="font-medium">{v.brand} {v.model}</span>
                                  <span className="ml-2 text-secondary text-xs">{v.license_plate}</span>
                                  {v.year && <span className="ml-1 text-secondary text-xs">({v.year})</span>}
                                </button>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                <input type="hidden" {...register('vehicle_id', { required: 'El vehículo es obligatorio' })} />
                {errors.vehicle_id && (
                  <p className="text-error text-xs mt-1">{errors.vehicle_id.message}</p>
                )}
              </div>
            </div>
          )}

          <input type="hidden" {...register('appointment_id')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha de atención */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Fecha de atención <span className="text-error">*</span>
              </label>
              <input
                type="date"
                {...register('service_date', { required: 'La fecha es obligatoria' })}
                className={inputClass}
              />
              {errors.service_date && (
                <p className="text-error text-xs mt-1">{errors.service_date.message}</p>
              )}
            </div>

            {/* Kilometraje */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Kilometraje
              </label>
              <input
                type="number"
                min="1"
                placeholder="Ej: 85000"
                {...register('mileage', {
                  min: { value: 1, message: 'El kilometraje debe ser mayor a 0' },
                })}
                className={inputClass}
              />
              {errors.mileage && (
                <p className="text-error text-xs mt-1">{errors.mileage.message}</p>
              )}
            </div>

            {/* Próximo servicio */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Próximo servicio
              </label>
              <input
                type="date"
                {...register('next_service_date')}
                className={inputClass}
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Notas
            </label>
            <textarea
              rows={3}
              placeholder="Observaciones, trabajos realizados..."
              {...register('notes')}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Servicios */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Servicios
              </h2>
            </div>
            <button
              type="button"
              onClick={() => appendService({ service_id: '', quantity: 1, unit_price: 0 })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-container/20 text-primary rounded-lg hover:bg-primary-container/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar servicio
            </button>
          </div>

          {serviceFields.length === 0 ? (
            <p className="text-sm text-secondary text-center py-4">
              No hay servicios agregados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left pb-2 text-secondary font-medium">Servicio</th>
                    <th className="text-center pb-2 text-secondary font-medium w-20">Cant.</th>
                    <th className="text-right pb-2 text-secondary font-medium w-32">Precio Unit.</th>
                    <th className="text-right pb-2 text-secondary font-medium w-28">Subtotal</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {serviceFields.map((field, index) => {
                    const qty = Number(watchedServices[index]?.quantity) || 0;
                    const price = Number(watchedServices[index]?.unit_price) || 0;
                    return (
                      <tr key={field.id}>
                        <td className="py-2 pr-2">
                          <Controller
                            control={control}
                            name={`service_record_services_attributes.${index}.service_id`}
                            render={({ field: f }) => (
                              <SearchableSelect
                                options={allServices.map((s) => ({ value: String(s.id), label: s.name }))}
                                value={f.value}
                                onChange={(val) => {
                                  f.onChange(val);
                                  handleServiceChange(index, val);
                                }}
                                placeholder="Seleccionar servicio"
                              />
                            )}
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min="1"
                            {...register(`service_record_services_attributes.${index}.quantity`, { min: 1 })}
                            className={`${inputClass} text-center`}
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            {...register(`service_record_services_attributes.${index}.unit_price`, { min: 0 })}
                            className={`${inputClass} text-right`}
                          />
                        </td>
                        <td className="py-2 pr-2 text-right text-on-surface font-medium">
                          {formatCurrency(qty * price)}
                        </td>
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="p-1 rounded hover:bg-error-container/20 text-secondary hover:text-error transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Productos */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Productos
              </h2>
            </div>
            <button
              type="button"
              onClick={() => appendProduct({ product_id: '', quantity: 1, unit_price: 0 })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-container/20 text-primary rounded-lg hover:bg-primary-container/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar producto
            </button>
          </div>

          {productFields.length === 0 ? (
            <p className="text-sm text-secondary text-center py-4">
              No hay productos agregados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left pb-2 text-secondary font-medium">Producto</th>
                    <th className="text-center pb-2 text-secondary font-medium w-20">Cant.</th>
                    <th className="text-right pb-2 text-secondary font-medium w-32">Precio Unit.</th>
                    <th className="text-right pb-2 text-secondary font-medium w-28">Subtotal</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {productFields.map((field, index) => {
                    const qty = Number(watchedProducts[index]?.quantity) || 0;
                    const price = Number(watchedProducts[index]?.unit_price) || 0;
                    return (
                      <tr key={field.id}>
                        <td className="py-2 pr-2">
                          <Controller
                            control={control}
                            name={`service_record_products_attributes.${index}.product_id`}
                            render={({ field: f }) => (
                              <SearchableSelect
                                options={allProducts.map((p) => ({ value: String(p.id), label: p.name }))}
                                value={f.value}
                                onChange={(val) => {
                                  f.onChange(val);
                                  handleProductChange(index, val);
                                }}
                                placeholder="Seleccionar producto"
                              />
                            )}
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min="1"
                            {...register(`service_record_products_attributes.${index}.quantity`, { min: 1 })}
                            className={`${inputClass} text-center`}
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            {...register(`service_record_products_attributes.${index}.unit_price`, { min: 0 })}
                            className={`${inputClass} text-right`}
                          />
                        </td>
                        <td className="py-2 pr-2 text-right text-on-surface font-medium">
                          {formatCurrency(qty * price)}
                        </td>
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="p-1 rounded hover:bg-error-container/20 text-secondary hover:text-error transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-5">
          <div className="flex flex-col items-end gap-2">
            {servicesTotal > 0 && (
              <div className="flex items-center justify-between w-full sm:w-64 text-sm">
                <span className="text-secondary">Servicios</span>
                <span className="text-on-surface">{formatCurrency(servicesTotal)}</span>
              </div>
            )}
            {productsTotal > 0 && (
              <div className="flex items-center justify-between w-full sm:w-64 text-sm">
                <span className="text-secondary">Productos</span>
                <span className="text-on-surface">{formatCurrency(productsTotal)}</span>
              </div>
            )}
            <div className="flex items-center justify-between w-full sm:w-64 pt-2 border-t border-outline-variant">
              <span className="font-bold text-on-surface">TOTAL</span>
              <span className="font-bold text-xl text-primary">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(appointmentId ? '/appointments' : '/service-records')}
            className="px-5 py-2 rounded-lg border border-outline-variant text-secondary hover:text-on-surface hover:bg-surface-container-high text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-primary-container text-on-primary rounded-lg font-semibold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar atención'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceRecordFormPage;
