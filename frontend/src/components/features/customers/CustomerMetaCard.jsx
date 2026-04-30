import { Edit, Phone, Mail, ClipboardList } from "lucide-react";

const CustomerMetaCard = ({ customer, onEdit, onViewServiceRecords }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-5 border border-outline-variant rounded-lg bg-surface-container lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          {/* Avatar */}
          <div className="w-20 h-20 shrink-0 rounded-full border-2 border-primary/30 overflow-hidden bg-primary-container/20 flex items-center justify-center">
            {customer.avatar_url ? (
              <img
                src={customer.avatar_url}
                alt={customer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary font-bold text-2xl">
                {getInitials(customer.name)}
              </span>
            )}
          </div>

          {/* Nombre y meta */}
          <div className="order-3 xl:order-2">
            <h4 className="mb-1.5 text-xl font-semibold text-center text-on-surface xl:text-left">
              {customer.name}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-secondary">
                Cliente #{customer.id}
              </p>
              <div className="hidden h-3.5 w-px bg-outline-variant xl:block" />
              <p className="text-sm text-secondary">
                {customer.vehicles_count || 0} vehículos
              </p>
            </div>
          </div>

          {/* Acciones rápidas de contacto */}
          <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                title="Llamar"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-secondary hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                title="Enviar email"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-secondary hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex w-full gap-2 lg:w-auto">
          {onViewServiceRecords && (
            <button
              onClick={onViewServiceRecords}
              className="flex flex-1 items-center justify-center gap-2 rounded border border-primary/30 bg-primary-container/10 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary-container/20 transition-colors lg:flex-none"
            >
              <ClipboardList className="w-4 h-4" />
              Atenciones
            </button>
          )}
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-2 rounded border border-outline-variant bg-surface-container-high px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-variant transition-colors lg:flex-none"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerMetaCard;
