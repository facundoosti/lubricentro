import { useState, useEffect } from 'react';
import {
  TrendingUp, X, ChevronRight, ArrowLeft, CheckCircle, AlertCircle, Percent, DollarSign, Filter,
} from 'lucide-react';
import { useBulkPricePreview, useBulkPriceUpdate } from '@services/productsService';
import { showSuccess, showError, parseApiError } from '@services/notificationService';
import BulkPriceFilters from '@components/features/products/BulkPriceFilters';
import {
  EMPTY_BULK_FILTERS, hasBulkFilters, useBulkFilterOptions, bulkCriteriaSummary,
} from '@hooks/useBulkFilterOptions';
import Dialog from '@ui/Dialog';
import Button from '@ui/Button';
import Field from '@ui/Field';
import Input from '@ui/Input';
import BulkPricePreviewTable from '@components/features/products/BulkPricePreviewTable';

const STEPS = { FILTER: 'filter', PREVIEW: 'preview', DONE: 'done' };

const ADJUSTMENT_TYPES = [
  { value: 'percentage', label: 'Porcentaje', hint: 'Ej: +15%', icon: Percent },
  { value: 'fixed', label: 'Monto fijo', hint: 'Ej: +$500', icon: DollarSign },
];

const plural = (n) => `${n} producto${n !== 1 ? 's' : ''}`;
const formatARS = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(value);

// target = null → modo libre (el usuario elige filtros)
// target = { type: 'ids', ids: [1,2,3] } → productos específicos seleccionados
// target = { type: 'filters', search, brand, supplierId, categoryId, active } → los que coinciden con los filtros del listado
const BulkPriceModal = ({ isOpen, onClose, target = null }) => {
  const hasTarget = target !== null;

  const [step, setStep] = useState(STEPS.FILTER);
  const [filters, setFilters] = useState(EMPTY_BULK_FILTERS);
  const [adjustmentType, setAdjustmentType] = useState('percentage');
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [previews, setPreviews] = useState([]);

  const options = useBulkFilterOptions();
  const previewMutation = useBulkPricePreview();
  const updateMutation = useBulkPriceUpdate();

  useEffect(() => {
    if (isOpen) {
      setStep(STEPS.FILTER);
      setFilters(EMPTY_BULK_FILTERS);
      setAdjustmentType('percentage');
      setAdjustmentValue('');
      setPreviews([]);
    }
  }, [isOpen]);

  const numericValue = parseFloat(adjustmentValue);
  const hasValue = Number.isFinite(numericValue) && numericValue !== 0;
  const hasCriteria = hasTarget || hasBulkFilters(filters);

  const buildParams = () => {
    const base = { adjustment_type: adjustmentType, adjustment_value: adjustmentValue };
    if (target?.type === 'ids') return { ...base, product_ids: target.ids };
    if (target?.type === 'filters') {
      return {
        ...base,
        search: target.search || undefined,
        brand: target.brand || undefined,
        supplier_id: target.supplierId || undefined,
        category_id: target.categoryId || undefined,
        active: target.active || undefined,
      };
    }
    return {
      ...base,
      search: filters.search || undefined,
      brand: filters.brands.join(',') || undefined,
      supplier_id: filters.supplierIds.join(',') || undefined,
      category_id: filters.categoryIds.join(',') || undefined,
    };
  };

  const criteriaSummary = () => bulkCriteriaSummary(target, filters, options);

  const handlePreview = async () => {
    try {
      const data = await previewMutation.mutateAsync(buildParams());
      setPreviews(data.data?.previews || []);
      setStep(STEPS.PREVIEW);
    } catch (err) {
      showError('Error al generar la vista previa', parseApiError(err));
    }
  };

  const handleConfirm = async () => {
    try {
      const data = await updateMutation.mutateAsync(buildParams());
      showSuccess(`${plural(data.data?.updated ?? previews.length)} actualizados`);
      setStep(STEPS.DONE);
    } catch (err) {
      showError('Error al actualizar los precios', parseApiError(err));
    }
  };

  const sign = numericValue >= 0 ? '+' : '−';
  const absValue = Math.abs(numericValue);
  const adjustmentLabel = adjustmentType === 'percentage' ? `${sign}${absValue}%` : `${sign}${formatARS(absValue)}`;

  const subtitle = {
    [STEPS.FILTER]: hasTarget ? 'Definí el ajuste a aplicar' : 'Elegí los productos y el ajuste a aplicar',
    [STEPS.PREVIEW]: `Vista previa · ${plural(previews.length)}`,
    [STEPS.DONE]: 'Actualización completada',
  }[step];

  const disabledReason = !hasCriteria
    ? 'Elegí al menos un criterio para filtrar productos'
    : !hasValue ? 'Ingresá un valor distinto de 0' : null;

  const busy = previewMutation.isPending || updateMutation.isPending;

  // Pila de diálogos, Escape, foco, fondo no interactuable y scroll lock: Dialog (Base UI).
  // El fondo no cierra (hay datos cargados).
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      bare
      size="lg"
      closeOnBackdrop={false}
      closeOnEscape={!updateMutation.isPending}
      ariaLabelledBy="bulk-price-title"
      className="bg-surface-container border border-outline-variant rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 id="bulk-price-title" className="text-xl font-bold text-on-surface tracking-tight">Actualizar precios por lote</h2>
            <p className="text-xs text-on-surface-variant">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={updateMutation.isPending}
          aria-label="Cerrar"
          className="p-2 text-secondary hover:text-on-surface hover:bg-surface-container-high rounded-full transition-all disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
        {step === STEPS.FILTER && (
          <>
            {hasTarget ? (
              <div className="flex items-center gap-2 p-3 bg-primary-container/10 border border-primary-container/30 rounded-lg text-sm">
                <Filter className="w-4 h-4 text-primary shrink-0" />
                <span className="text-on-surface">{criteriaSummary()}</span>
              </div>
            ) : (
              <BulkPriceFilters filters={filters} onChange={setFilters} options={options} />
            )}

            <section className="space-y-4" aria-labelledby="bulk-price-adjust-title">
              <h3 id="bulk-price-adjust-title" className="text-sm font-semibold text-on-surface">Ajuste</h3>

              <div role="radiogroup" aria-label="Tipo de ajuste" className="grid grid-cols-2 gap-3">
                {ADJUSTMENT_TYPES.map(({ value, label, hint, icon: Icon }) => {
                  const selected = adjustmentType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setAdjustmentType(value)}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                        selected
                          ? 'border-primary bg-primary-container/20 text-primary'
                          : 'border-outline-variant bg-surface-container-high text-on-surface hover:bg-surface-variant'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>
                        <span className="block text-sm font-semibold">{label}</span>
                        <span className="block text-xs opacity-70">{hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <Field
                label={`Valor del ajuste ${adjustmentType === 'percentage' ? '(%)' : '($)'}`}
                hint="Usá un valor negativo para bajar precios (ej: -10)"
              >
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  startIcon={adjustmentType === 'percentage' ? Percent : DollarSign}
                  containerClassName="max-w-xs"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !disabledReason && !busy) handlePreview(); }}
                  placeholder="Ej: 15"
                />
              </Field>
            </section>
          </>
        )}

        {step === STEPS.PREVIEW && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3 bg-surface-container-high rounded-lg border border-outline-variant text-sm">
              <span className="text-on-surface-variant">
                Ajuste: <strong className="text-on-surface">{adjustmentLabel}</strong>
              </span>
              <span className="text-outline-variant" aria-hidden="true">|</span>
              <span className="text-on-surface-variant">{criteriaSummary()}</span>
            </div>

            {previews.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-secondary">
                <AlertCircle className="w-8 h-8 opacity-40" />
                <p className="text-sm">No hay productos que cumplan esos criterios</p>
              </div>
            ) : (
              <BulkPricePreviewTable previews={previews} formatPrice={formatARS} />
            )}
          </div>
        )}

        {step === STEPS.DONE && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-14 h-14 rounded-full bg-tertiary/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-tertiary" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-on-surface">¡Precios actualizados!</p>
              <p className="text-sm text-secondary mt-1">Se actualizaron {plural(previews.length)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-6 py-4 border-t border-outline-variant bg-surface-container-high/30 flex items-center justify-between gap-3">
        {step === STEPS.PREVIEW ? (
          <Button variant="secondary" startIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep(STEPS.FILTER)} disabled={busy}>
            Volver
          </Button>
        ) : step === STEPS.FILTER ? (
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        ) : <span />}

        <div className="flex items-center gap-3">
          {step === STEPS.FILTER && (
            <>
              {disabledReason && <span className="text-xs text-on-surface-variant">{disabledReason}</span>}
              <Button
                onClick={handlePreview}
                loading={previewMutation.isPending}
                disabled={Boolean(disabledReason)}
                endIcon={<ChevronRight className="w-4 h-4" />}
                className="font-bold"
              >
                {previewMutation.isPending ? 'Calculando...' : 'Vista previa'}
              </Button>
            </>
          )}

          {step === STEPS.PREVIEW && previews.length > 0 && (
            <Button
              onClick={handleConfirm}
              loading={updateMutation.isPending}
              startIcon={<CheckCircle className="w-4 h-4" />}
              className="font-bold"
            >
              {updateMutation.isPending ? 'Actualizando...' : `Confirmar ${plural(previews.length)}`}
            </Button>
          )}

          {step === STEPS.DONE && (
            <Button onClick={onClose} className="font-bold">Cerrar</Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default BulkPriceModal;
