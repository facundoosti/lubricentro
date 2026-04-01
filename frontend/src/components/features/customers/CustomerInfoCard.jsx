import { Edit } from "lucide-react";

const CustomerInfoCard = ({ customer, onEdit }) => {
  return (
    <div className="p-5 border border-outline-variant rounded-lg bg-surface-container lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h4 className="text-base font-semibold text-on-surface mb-5">
            Información de Contacto
          </h4>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-5">
            <div>
              <p className="mb-1 text-xs font-medium text-secondary uppercase tracking-wider">
                Nombre Completo
              </p>
              <p className="text-sm text-on-surface">
                {customer.name}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-secondary uppercase tracking-wider">
                ID de Cliente
              </p>
              <p className="text-sm text-on-surface">
                #{customer.id}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-secondary uppercase tracking-wider">
                Email
              </p>
              <p className="text-sm text-on-surface">
                {customer.email || <span className="text-secondary">No especificado</span>}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-secondary uppercase tracking-wider">
                Teléfono
              </p>
              <p className="text-sm text-on-surface">
                {customer.phone || <span className="text-secondary">No especificado</span>}
              </p>
            </div>

            <div className="lg:col-span-2">
              <p className="mb-1 text-xs font-medium text-secondary uppercase tracking-wider">
                Dirección
              </p>
              <p className="text-sm text-on-surface">
                {customer.address || <span className="text-secondary">No especificada</span>}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="flex w-full items-center justify-center gap-2 rounded border border-outline-variant bg-surface-container-high px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-variant transition-colors lg:inline-flex lg:w-auto"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
      </div>
    </div>
  );
};

export default CustomerInfoCard;
