import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, ArrowLeft, Save, Printer } from "lucide-react";
import {
  useBudget,
  useCreateBudget,
  useUpdateBudget,
} from "@services/budgetsService";
import { useCustomers } from "@services/customersService";
import {
  showBudgetSuccess,
  showBudgetError,
} from "@services/notificationService";

const STATUSES = [
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Enviado" },
  { value: "approved", label: "Aprobado" },
  { value: "rejected", label: "Rechazado" },
];

const formatCurrency = (value) => {
  const n = Number(value) || 0;
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const BudgetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const { data: existingData, isLoading: loadingExisting } = useBudget(id);
  const { data: customersData } = useCustomers({
    search: customerSearch,
    per_page: 20,
  });
  const customers = customersData?.data?.customers || [];

  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      status: "draft",
      customer_id: "",
      vehicle_description: "",
      notes: "",
      card_surcharge_percentage: 0,
      items_attributes: [
        { quantity: 1, description: "", unit_price: 0, position: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items_attributes",
  });

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && existingData?.data) {
      const p = existingData.data;
      reset({
        date: p.date || new Date().toISOString().split("T")[0],
        status: p.status || "draft",
        customer_id: p.customer_id || "",
        vehicle_description: p.vehicle_description || "",
        notes: p.notes || "",
        card_surcharge_percentage: p.card_surcharge_percentage || 0,
        items_attributes: p.items?.length
          ? p.items.map((item, idx) => ({
              id: item.id,
              position: idx,
              quantity: item.quantity,
              description: item.description,
              unit_price: item.unit_price,
            }))
          : [{ quantity: 1, description: "", unit_price: 0, position: 0 }],
      });
      if (p.customer) setCustomerSearch(p.customer.name);
    }
  }, [existingData, isEditing, reset]);

  // Computed totals (live)
  const watchedItems = watch("items_attributes") || [];
  const watchedSurcharge = Number(watch("card_surcharge_percentage")) || 0;

  const totalList = watchedItems.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
  }, 0);
  const totalCard = totalList * (1 + watchedSurcharge / 100);

  const handleSelectCustomer = (customer) => {
    setValue("customer_id", customer.id);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const onSubmit = async (formData) => {
    // Tag items with position
    const payload = {
      ...formData,
      items_attributes: formData.items_attributes.map((item, idx) => ({
        ...item,
        position: idx,
      })),
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id, data: payload });
        showBudgetSuccess("UPDATED");
      } else {
        const res = await createMutation.mutateAsync(payload);
        showBudgetSuccess("CREATED");
        const newId = res?.data?.id;
        if (newId) {
          navigate(`/presupuestos/${newId}/editar`);
          return;
        }
      }
      navigate("/presupuestos");
    } catch (err) {
      const action = isEditing ? "ERROR_UPDATE" : "ERROR_CREATE";
      showBudgetError(action, err.response?.data?.message || err.message);
    }
  };

  if (isEditing && loadingExisting) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/presupuestos")}
          className="p-2 rounded-lg hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            {isEditing ? "Editar Budget" : "Nuevo Budget"}
          </h1>
          <p className="text-secondary text-sm mt-0.5">
            {isEditing ? `Budget #${id}` : "Completá los datos del budget"}
          </p>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={() => navigate(`/presupuestos/${id}/imprimir`)}
            className="ml-auto flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-high text-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir PDF
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General info */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
            Datos generales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Fecha <span className="text-error">*</span>
              </label>
              <input
                type="date"
                {...register("date", { required: "La fecha es obligatoria" })}
                className="w-full px-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
              />
              {errors.date && (
                <p className="text-error text-xs mt-1">{errors.date.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Estado
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer */}
            <div className="relative">
              <label className="block text-sm font-medium text-on-surface mb-1">
                Cliente
              </label>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                  if (!e.target.value) setValue("customer_id", "");
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowCustomerDropdown(false), 150)
                }
                className="w-full px-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-secondary"
              />
              <input type="hidden" {...register("customer_id")} />
              {showCustomerDropdown && customers.length > 0 && (
                <ul className="absolute z-20 top-full mt-1 w-full bg-surface-container border border-outline-variant rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {customers.map((c) => (
                    <li
                      key={c.id}
                      onMouseDown={() => handleSelectCustomer(c)}
                      className="px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high cursor-pointer"
                    >
                      <span className="font-medium">{c.name}</span>
                      {c.phone && (
                        <span className="text-secondary ml-2">{c.phone}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Vehicle description */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Vehículo
              </label>
              <input
                type="text"
                placeholder="Ej: Ford Falcon 1986"
                {...register("vehicle_description")}
                className="w-full px-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-secondary"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Notas
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Observaciones..."
              className="w-full px-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-secondary resize-none"
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
              Artículos
            </h2>
            <button
              type="button"
              onClick={() =>
                append({
                  quantity: 1,
                  description: "",
                  unit_price: 0,
                  position: fields.length,
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-container/20 text-primary rounded-lg hover:bg-primary-container/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar ítem
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left pb-2 text-secondary font-medium w-16">
                    Cant.
                  </th>
                  <th className="text-left pb-2 text-secondary font-medium">
                    Artículo / Descripción
                  </th>
                  <th className="text-right pb-2 text-secondary font-medium w-32">
                    Precio Unit.
                  </th>
                  <th className="text-right pb-2 text-secondary font-medium w-32">
                    Importe
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {fields.map((field, index) => {
                  const qty = Number(watchedItems[index]?.quantity) || 0;
                  const price = Number(watchedItems[index]?.unit_price) || 0;
                  const lineTotal = qty * price;

                  return (
                    <tr key={field.id}>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register(`items_attributes.${index}.quantity`, {
                            required: true,
                            min: 0,
                          })}
                          className="w-full px-2 py-1.5 bg-surface-variant border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-primary text-center"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          placeholder="Descripción del artículo"
                          {...register(
                            `items_attributes.${index}.description`,
                            { required: true },
                          )}
                          className="w-full px-2 py-1.5 bg-surface-variant border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-secondary"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register(`items_attributes.${index}.unit_price`, {
                            required: true,
                            min: 0,
                          })}
                          className="w-full px-2 py-1.5 bg-surface-variant border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-primary text-right"
                        />
                      </td>
                      <td className="py-2 pr-2 text-right text-on-surface font-medium">
                        {formatCurrency(lineTotal)}
                      </td>
                      <td className="py-2 text-center">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="p-1 rounded hover:bg-error-container/20 text-secondary hover:text-error transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
        </div>

        {/* Totals */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Recargo Tarjeta (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register("card_surcharge_percentage", {
                    min: 0,
                    max: 100,
                  })}
                  className="w-24 px-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary text-center"
                />
                <span className="text-secondary text-sm">%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-right">
              <div className="flex items-center justify-between gap-8">
                <span className="text-secondary text-sm">
                  PRECIO D/LISTA / EFT/DEB TOTAL
                </span>
                <span className="text-on-surface font-bold text-lg">
                  {formatCurrency(totalList)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <span className="text-secondary text-sm">
                  TARJETA D/CRED TOTAL
                </span>
                <span className="text-primary font-bold text-lg">
                  {formatCurrency(totalCard)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate("/presupuestos")}
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
            {isSaving
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear budget"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;
