import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { useBudget, useCreateBudget, useUpdateBudget } from '@services/budgetsService';
import { showBudgetSuccess, showBudgetError, parseApiError } from '@services/notificationService';
import BudgetGeneralSection from '@components/features/budgets/BudgetGeneralSection';
import ItemsEditor from '@components/features/items/ItemsEditor';
import ItemsTotalsBar from '@components/features/items/ItemsTotalsBar';
import BudgetActions from '@components/features/budgets/BudgetActions';
import { defaultValues, toFormValues, toPayload } from '@utils/budget';

const FORM_ID = 'budget-form';

const BudgetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  // Desde el perfil del cliente: /budgets/new?customer_id=1&vehicle_id=2 (solo al crear)
  const [searchParams] = useSearchParams();

  const [initialCustomer, setInitialCustomer] = useState(null);
  const [removedIds, setRemovedIds] = useState([]);
  const loadedVersionRef = useRef(null);

  const { data: existingData, isLoading: loadingExisting, isError } = useBudget(id);
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const { register, control, handleSubmit, setValue, getValues, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: isEditing ? defaultValues() : {
      ...defaultValues(),
      customer_id: searchParams.get('customer_id') || '',
      vehicle_id: searchParams.get('customer_id') && searchParams.get('vehicle_id')
        ? Number(searchParams.get('vehicle_id'))
        : null,
    },
  });

  const budget = existingData?.data;

  // Cargar el presupuesto una vez por versión guardada (un refetch con los mismos
  // datos no debe pisar cambios sin guardar).
  useEffect(() => {
    if (!isEditing || !budget) return;
    const version = `${budget.id}-${budget.updated_at}`;
    if (loadedVersionRef.current === version) return;
    loadedVersionRef.current = version;

    reset(toFormValues(budget));
    setRemovedIds([]);
    setInitialCustomer(budget.customer || null);
  }, [budget, isEditing, reset]);

  const onSubmit = async (formData) => {
    const payload = toPayload(formData, removedIds);
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id, data: payload });
        setRemovedIds([]);
        showBudgetSuccess('UPDATED');
      } else {
        const res = await createMutation.mutateAsync(payload);
        showBudgetSuccess('CREATED');
        const newId = res?.data?.id;
        navigate(newId ? `/budgets/${newId}/edit` : '/budgets');
      }
    } catch (err) {
      showBudgetError(isEditing ? 'ERROR_UPDATE' : 'ERROR_CREATE', parseApiError(err));
    }
  };

  if (isEditing && loadingExisting) {
    return (
      <div className="flex items-center justify-center py-24" role="status" aria-label="Cargando presupuesto">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isEditing && (isError || !budget)) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-3">
        <p className="text-on-surface font-semibold">No pudimos cargar el presupuesto</p>
        <button type="button" onClick={() => navigate('/budgets')} className="text-primary text-sm hover:underline">
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/budgets')}
          aria-label="Volver al listado"
          className="p-2 rounded-lg hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-on-surface">
            {isEditing ? 'Editar presupuesto' : 'Nuevo presupuesto'}
          </h1>
          <p className="text-secondary text-sm mt-0.5">
            {isEditing ? `Presupuesto #${id}` : 'Completá los datos del presupuesto'}
          </p>
        </div>
        {isEditing && (
          <BudgetActions budget={budget} isDirty={isDirty} className="w-full sm:w-auto sm:ml-auto" />
        )}
      </div>

      <form id={FORM_ID} noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <BudgetGeneralSection
          control={control}
          register={register}
          setValue={setValue}
          errors={errors}
          initialCustomer={initialCustomer}
        />

        <ItemsEditor
          control={control}
          register={register}
          setValue={setValue}
          getValues={getValues}
          errors={errors.items_attributes}
          onRemoveSaved={(itemId) => setRemovedIds((ids) => [...ids, itemId])}
        />
      </form>

      <ItemsTotalsBar
        control={control}
        formId={FORM_ID}
        isSaving={isSaving}
        submitLabel={isEditing ? 'Guardar' : 'Crear presupuesto'}
        onCancel={() => navigate('/budgets')}
      />
    </div>
  );
};

export default BudgetForm;
