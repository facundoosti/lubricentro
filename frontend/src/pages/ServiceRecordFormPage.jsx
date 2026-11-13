import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PhotosUpload from '@ui/PhotosUpload';
import { ArrowLeft, Car, User, Search, X, ImageIcon, FileText } from 'lucide-react';
import ItemsEditor from '@components/features/items/ItemsEditor';
import ItemsTotalsBar from '@components/features/items/ItemsTotalsBar';
import CopyFromBudgetDialog from '@components/features/service-records/CopyFromBudgetDialog';
import BudgetLinkChip from '@components/features/service-records/BudgetLinkChip';
import { useAppointment } from '@services/appointmentsService';
import { useServiceRecord, useCreateServiceRecord, useUpdateServiceRecord } from '@services/serviceRecordsService';
import { showServiceRecordSuccess, showServiceRecordError } from '@services/notificationService';
import { appointmentKeys } from '@services/appointmentsService';
import { customerKeys, useCustomer } from '@services/customersService';
import { vehicleKeys, useVehicle } from '@services/vehiclesService';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@services/api';
import { emptyItem, hasFilledItems } from '@utils/items';
import { budgetToFormItems, toServiceRecordFormItems, toServiceRecordPayload } from '@utils/serviceRecord';

const today = new Date().toISOString().split('T')[0];
const FORM_ID = 'service-record-form';

const ServiceRecordFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');
  const isEditing = !!id;
  const queryClient = useQueryClient();

  const { data: appointmentData, isLoading: loadingAppointment } = useAppointment(appointmentId);
  const { data: existingData, isLoading: loadingExisting } = useServiceRecord(id);

  const createMutation = useCreateServiceRecord();
  const updateMutation = useUpdateServiceRecord();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const [photoFiles, setPhotoFiles] = useState([]);
  // Ítems guardados que se quitan: se envían con _destroy
  const [removedIds, setRemovedIds] = useState([]);
  const [copyOpen, setCopyOpen] = useState(false);
  // Cliente del presupuesto copiado (null si no tenía): cambiar a otro cliente rompe el vínculo.
  const linkedBudgetCustomerId = useRef(null);

  const isStandaloneCreate = !isEditing && !appointmentId;
  // Desde el perfil del cliente: ?customer_id=1&vehicle_id=2 (solo en creación standalone)
  const presetCustomerId = isStandaloneCreate ? searchParams.get('customer_id') : null;
  const presetVehicleId = presetCustomerId ? searchParams.get('vehicle_id') : null;
  const { data: presetCustomerData } = useCustomer(presetCustomerId);
  const { data: presetVehicleData } = useVehicle(presetVehicleId);
  const presetApplied = useRef({ customer: false, vehicle: false });

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

  const { register, control, handleSubmit, watch, setValue, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      service_date: today,
      mileage: '',
      notes: '',
      next_service_date: '',
      customer_id: '',
      vehicle_id: '',
      appointment_id: appointmentId || '',
      budget_id: null,
      items_attributes: [emptyItem(0)],
    },
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
        budget_id: r.budget_id ?? null,
        items_attributes: toServiceRecordFormItems(r),
      });
      setRemovedIds([]);
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

  // El vínculo con el presupuesto solo vale para su cliente (si el presupuesto no tenía, cualquiera).
  const unlinkBudgetIfCustomerDiffers = (newCustomerId) => {
    const budgetCustomerId = linkedBudgetCustomerId.current;
    if (!getValues('budget_id') || budgetCustomerId == null) return;
    if (String(newCustomerId ?? '') !== String(budgetCustomerId)) {
      setValue('budget_id', null, { shouldDirty: true });
    }
  };

  const handleSelectCustomer = (customer) => {
    unlinkBudgetIfCustomerDiffers(customer.id);
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
    unlinkBudgetIfCustomerDiffers(null);
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

  // Preselección por URL (una sola vez; el cliente va antes porque elegirlo limpia el vehículo)
  useEffect(() => {
    const customer = presetCustomerData?.data;
    if (customer && !presetApplied.current.customer) {
      presetApplied.current.customer = true;
      handleSelectCustomer(customer);
    }
    const vehicle = presetVehicleData?.data;
    if (presetApplied.current.customer && vehicle && !presetApplied.current.vehicle
      && String(vehicle.customer_id) === String(presetCustomerId)) {
      presetApplied.current.vehicle = true;
      handleSelectVehicle(vehicle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- los handlers solo usan setters estables
  }, [presetCustomerData, presetVehicleData, presetCustomerId]);

  const customerId = watch('customer_id');
  const budgetId = watch('budget_id');

  // Copiar desde presupuesto: reemplaza los ítems, vincula el presupuesto y completa
  // cliente/vehículo (solo en creación standalone; desde un turno vienen fijos).
  const handleCopyBudget = (budget) => {
    setValue('items_attributes', budgetToFormItems(budget), { shouldDirty: true });
    linkedBudgetCustomerId.current = budget.customer?.id ?? null;
    setValue('budget_id', budget.id, { shouldDirty: true });
    if (!isStandaloneCreate) return;
    if (budget.customer && String(budget.customer.id) !== String(selectedCustomer?.id ?? '')) {
      handleSelectCustomer(budget.customer);
    }
    if (budget.vehicle) handleSelectVehicle(budget.vehicle);
  };

  const goBack = () => navigate(appointmentId ? '/appointments' : '/service-records');

  const onSubmit = async (formData) => {
    const payload = toServiceRecordPayload(formData, { removedIds, isEditing });
    if (photoFiles.length > 0) payload.photos = photoFiles;

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id, data: payload });
        setRemovedIds([]);
        showServiceRecordSuccess('UPDATED');
      } else {
        await createMutation.mutateAsync(payload);
        showServiceRecordSuccess('CREATED');
        // Invalidate appointments so the has_service_record flag updates
        queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      }
      goBack();
    } catch (err) {
      const action = isEditing ? 'ERROR_UPDATE' : 'ERROR_CREATE';
      showServiceRecordError(action, err.response?.data?.message || err.message);
    }
  };

  const fieldClass = (hasError) =>
    `w-full px-3 py-2 bg-surface-variant border rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-secondary ${
      hasError ? 'border-error' : 'border-outline-variant'
    }`;
  const inputClass = fieldClass(false);

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
          onClick={goBack}
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

      <form id={FORM_ID} noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      autoComplete="off"
                      type="text"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                        if (!e.target.value) handleClearCustomer();
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      placeholder="Buscar cliente..."
                      className={`${fieldClass(!!errors.customer_id)} pl-9 pr-8`}
                      aria-invalid={!!errors.customer_id}
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
                      autoComplete="off"
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
                      className={`${fieldClass(!!errors.vehicle_id)} pl-9 pr-8 disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-invalid={!!errors.vehicle_id}
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

        <ItemsEditor
          control={control}
          register={register}
          setValue={setValue}
          getValues={getValues}
          errors={errors.items_attributes}
          onRemoveSaved={(itemId) => setRemovedIds((ids) => [...ids, itemId])}
          headerAction={!isEditing && (
            <button
              type="button"
              onClick={() => setCopyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-surface-container-high border border-outline-variant text-on-surface rounded-lg hover:bg-surface-variant transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Copiar desde presupuesto
            </button>
          )}
        >
          {!isEditing && budgetId && (
            <BudgetLinkChip budgetId={budgetId} onUnlink={() => setValue('budget_id', null, { shouldDirty: true })} />
          )}
        </ItemsEditor>

        {/* Fotos */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Fotos
            </h2>
          </div>
          <PhotosUpload
            currentUrls={existingData?.data?.photos_urls || []}
            onChange={setPhotoFiles}
          />
        </div>

      </form>

      <ItemsTotalsBar
        control={control}
        formId={FORM_ID}
        isSaving={isSaving}
        submitLabel={isEditing ? 'Guardar cambios' : 'Registrar atención'}
        showCard={false}
        onCancel={goBack}
      />

      {copyOpen && (
        <CopyFromBudgetDialog
          isOpen
          onClose={() => setCopyOpen(false)}
          customerId={customerId}
          hasFilledItems={hasFilledItems(getValues('items_attributes'))}
          onCopy={handleCopyBudget}
        />
      )}
    </div>
  );
};

export default ServiceRecordFormPage;
