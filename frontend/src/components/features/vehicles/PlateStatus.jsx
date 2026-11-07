import { Link } from 'react-router-dom';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';

// Mensajes debajo del campo patente: dueño existente y resultado de la búsqueda automática.
const PlateStatus = ({ conflict, lookupStatus }) => {
  if (conflict) {
    const owner = conflict.customer;
    return (
      <p role="alert" className="mt-1 flex items-start gap-1.5 text-sm text-error">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Patente registrada a <strong>{owner?.name || conflict.customer_name || 'otro cliente'}</strong>
          {owner?.id && (
            <>
              {' · '}
              <Link to={`/customers/${owner.id}`} className="font-medium text-primary hover:underline">
                Ver perfil
              </Link>
            </>
          )}
        </span>
      </p>
    );
  }

  if (lookupStatus === 'loading') {
    return (
      <p className="mt-1 flex items-center gap-1.5 text-sm text-primary">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando información del vehículo...
      </p>
    );
  }

  const message = {
    not_found: 'No encontramos datos para esta patente. Completalos a mano.',
    error: 'El servicio de búsqueda no responde. Completalos a mano.',
  }[lookupStatus];

  if (!message) return null;

  return (
    <p role="status" className="mt-1 flex items-start gap-1.5 text-sm text-on-surface-variant">
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <span>
        {message}
        {lookupStatus === 'error' && ' Podés reintentar con ✨.'}
      </span>
    </p>
  );
};

export default PlateStatus;
