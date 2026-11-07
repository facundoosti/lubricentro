import { useNavigate } from 'react-router-dom';
import { Copy, MessageCircle, Printer } from 'lucide-react';
import { useDuplicateBudget } from '@services/budgetsService';
import { useSetting } from '@services/settingsService';
import { showBudgetSuccess, showBudgetError, parseApiError } from '@services/notificationService';
import { buildBudgetMessage, buildWhatsAppUrl } from '@utils/whatsapp';

const baseBtn =
  'inline-flex items-center justify-center gap-1.5 rounded border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const variants = {
  full: `${baseBtn} px-3 py-2 border-outline-variant bg-surface-container-high text-on-surface hover:bg-surface-variant`,
  icon: `${baseBtn} p-1.5 border-transparent text-secondary hover:text-on-surface hover:bg-surface-container-high`,
};

// Imprimir · WhatsApp · Duplicar sobre el presupuesto GUARDADO. Con cambios sin
// guardar (`isDirty`) se deshabilitan para no mandar/duplicar datos viejos.
// `compact` muestra solo íconos (para el listado).
const BudgetActions = ({ budget, isDirty = false, compact = false, className = '' }) => {
  const navigate = useNavigate();
  const duplicate = useDuplicateBudget();
  const { data: settingData } = useSetting();

  const contact = budget?.customer;
  const dirtyTitle = 'Guardá los cambios primero';
  const whatsappUrl = budget
    ? buildWhatsAppUrl(
        contact?.phone,
        buildBudgetMessage({ budget, customerName: contact?.name, businessName: settingData?.data?.lubricentro_name }),
      )
    : null;

  const handleDuplicate = async () => {
    try {
      const res = await duplicate.mutateAsync(budget.id);
      showBudgetSuccess('DUPLICATED');
      if (res?.data?.id) navigate(`/presupuestos/${res.data.id}/editar`);
    } catch (err) {
      showBudgetError('ERROR_DUPLICATE', parseApiError(err));
    }
  };

  const cls = compact ? variants.icon : variants.full;
  const label = (text) => (compact ? <span className="sr-only">{text}</span> : text);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => navigate(`/presupuestos/${budget.id}/imprimir`)}
        disabled={isDirty}
        className={cls}
        title={isDirty ? dirtyTitle : 'Imprimir'}
      >
        <Printer className="w-4 h-4" />
        {label('Imprimir')}
      </button>

      {whatsappUrl && !isDirty ? (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={cls} title="Enviar por WhatsApp">
          <MessageCircle className="w-4 h-4" />
          {label('WhatsApp')}
        </a>
      ) : (
        <button
          type="button"
          disabled
          className={cls}
          title={isDirty ? dirtyTitle : 'El cliente no tiene teléfono cargado'}
          aria-label={`Enviar por WhatsApp (${isDirty ? 'guardá los cambios primero' : 'el cliente no tiene teléfono cargado'})`}
        >
          <MessageCircle className="w-4 h-4" />
          {!compact && 'WhatsApp'}
        </button>
      )}

      <button
        type="button"
        onClick={handleDuplicate}
        disabled={duplicate.isPending || isDirty}
        className={cls}
        title={isDirty ? dirtyTitle : 'Duplicar'}
      >
        <Copy className="w-4 h-4" />
        {label(duplicate.isPending ? 'Duplicando...' : 'Duplicar')}
      </button>
    </div>
  );
};

export default BudgetActions;
