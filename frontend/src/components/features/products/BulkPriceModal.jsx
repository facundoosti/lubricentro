import { useState } from 'react';
import { TrendingUp, X, ChevronRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useSuppliers } from '@services/suppliersService';
import { useBulkPricePreview, useBulkPriceUpdate } from '@services/productsService';
import { showSuccess, showError } from '@services/notificationService';
import ProductSearchInput from '@components/features/products/ProductSearchInput';

const STEPS = { FILTER: 'filter', PREVIEW: 'preview', DONE: 'done' };

const BulkPriceModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(STEPS.FILTER);
  const [supplierId, setSupplierId] = useState('');
  const [search, setSearch] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('percentage');
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [previews, setPreviews] = useState([]);

  const { data: suppliersData } = useSuppliers({ per_page: 200 });
  const suppliers = suppliersData?.data?.suppliers || [];

  const previewMutation = useBulkPricePreview();
  const updateMutation = useBulkPriceUpdate();

  const formatARS = (value) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(value);

  const handlePreview = async () => {
    if (!adjustmentValue || parseFloat(adjustmentValue) === 0) {
      showError('Valor requerido', 'Ingresá un valor de ajuste mayor a 0');
      return;
    }
    if (!supplierId && !search) {
      showError('Criterio requerido', 'Seleccioná al menos un proveedor o un criterio de búsqueda');
      return;
    }

    try {
      const data = await previewMutation.mutateAsync({
        supplier_id: supplierId || undefined,
        search: search || undefined,
        adjustment_type: adjustmentType,
        adjustment_value: adjustmentValue,
      });
      setPreviews(data.data?.previews || []);
      setStep(STEPS.PREVIEW);
    } catch (err) {
      showError('Error', err?.response?.data?.message || 'Error al generar la vista previa');
    }
  };

  const handleConfirm = async () => {
    try {
      const data = await updateMutation.mutateAsync({
        supplier_id: supplierId || undefined,
        search: search || undefined,
        adjustment_type: adjustmentType,
        adjustment_value: adjustmentValue,
      });
      showSuccess(`${data.data?.updated} producto(s) actualizados exitosamente`);
      setStep(STEPS.DONE);
    } catch (err) {
      showError('Error', err?.response?.data?.message || 'Error al actualizar los precios');
    }
  };

  const handleClose = () => {
    setStep(STEPS.FILTER);
    setSupplierId('');
    setSearch('');
    setAdjustmentType('percentage');
    setAdjustmentValue('');
    setPreviews([]);
    onClose();
  };

  if (!isOpen) return null;

  const adjustmentLabel = adjustmentType === 'percentage'
    ? `${parseFloat(adjustmentValue) >= 0 ? '+' : ''}${adjustmentValue}%`
    : `${parseFloat(adjustmentValue) >= 0 ? '+' : ''}$${adjustmentValue}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-surface-container border border-outline-variant rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-on-surface">Actualización de Precios por Lote</h2>
              <p className="text-xs text-secondary">
                {step === STEPS.FILTER && 'Definí los criterios y el tipo de ajuste'}
                {step === STEPS.PREVIEW && `Vista previa — ${previews.length} producto(s) afectados`}
                {step === STEPS.DONE && 'Actualización completada'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-md text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* STEP 1: Filter */}
          {step === STEPS.FILTER && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-on-surface-variant uppercase tracking-wide">Criterios de filtro</h3>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Proveedor</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Todos los proveedores</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                    Buscar por nombre de producto
                  </label>
                  <ProductSearchInput
                    value={search}
                    onChange={(text) => setSearch(text)}
                    onSelect={(product) => product && setSearch(product.name)}
                    placeholder="Ej: aceite, filtro..."
                  />
                  <p className="mt-1 text-xs text-secondary">Podés combinar proveedor y nombre para filtrar mejor</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-medium text-on-surface-variant uppercase tracking-wide">Tipo de ajuste</h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'percentage', label: 'Porcentaje', hint: 'Ej: +15%' },
                    { value: 'fixed', label: 'Monto fijo', hint: 'Ej: +$500' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAdjustmentType(opt.value)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        adjustmentType === opt.value
                          ? 'border-primary bg-primary-container/15 text-primary'
                          : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
                      }`}
                    >
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs opacity-70 mt-0.5">{opt.hint}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                    Valor del ajuste {adjustmentType === 'percentage' ? '(%)' : '(ARS)'}
                    <span className="ml-1 text-xs text-secondary font-normal">Usá valores negativos para bajar precios</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">
                      {adjustmentType === 'percentage' ? '%' : '$'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(e.target.value)}
                      placeholder="Ej: 15"
                      className="w-full pl-8 pr-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface placeholder:text-secondary text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Preview */}
          {step === STEPS.PREVIEW && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-surface-container-high rounded-lg border border-outline-variant text-sm">
                <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                <span className="text-on-surface-variant">
                  Ajuste: <span className="font-semibold text-on-surface">{adjustmentLabel}</span>
                  {supplierId && ` · Proveedor: ${suppliers.find(s => String(s.id) === supplierId)?.name}`}
                  {search && ` · Búsqueda: "${search}"`}
                </span>
              </div>

              {previews.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-secondary">
                  <AlertCircle className="w-8 h-8 opacity-40" />
                  <p className="text-sm">No se encontraron productos con esos criterios</p>
                </div>
              ) : (
                <div className="rounded-lg border border-outline-variant overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container-high">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-secondary uppercase">SKU</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-secondary uppercase">Producto</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-secondary uppercase">Precio actual</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-secondary uppercase">Precio nuevo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previews.map((p) => (
                        <tr key={p.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-high/50">
                          <td className="px-4 py-3 font-mono text-xs text-secondary">{p.sku || '—'}</td>
                          <td className="px-4 py-3 text-on-surface">{p.name}</td>
                          <td className="px-4 py-3 text-right text-secondary">{formatARS(p.current_price)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-tertiary">{formatARS(p.new_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Done */}
          {step === STEPS.DONE && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-tertiary-container/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-tertiary" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-on-surface">¡Precios actualizados!</p>
                <p className="text-sm text-secondary mt-1">{previews.length} producto(s) fueron actualizados exitosamente</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 p-6 pt-0 border-t border-outline-variant shrink-0 mt-2">
          <button
            onClick={step === STEPS.PREVIEW ? () => setStep(STEPS.FILTER) : handleClose}
            className="px-4 py-2 text-sm bg-surface-container-high border border-outline-variant text-on-surface rounded-lg hover:brightness-110 transition-colors"
          >
            {step === STEPS.PREVIEW ? '← Volver' : 'Cancelar'}
          </button>

          <div className="flex gap-3">
            {step === STEPS.FILTER && (
              <button
                onClick={handlePreview}
                disabled={previewMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-container text-on-primary rounded-lg font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {previewMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Calculando...</>
                ) : (
                  <>Vista previa <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            )}

            {step === STEPS.PREVIEW && previews.length > 0 && (
              <button
                onClick={handleConfirm}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-container text-on-primary rounded-lg font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updateMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Actualizando...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Confirmar {previews.length} cambio(s)</>
                )}
              </button>
            )}

            {step === STEPS.DONE && (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm bg-primary-container text-on-primary rounded-lg font-medium hover:brightness-110 transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPriceModal;
