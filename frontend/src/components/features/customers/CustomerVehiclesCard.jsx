import { Link } from 'react-router-dom';
import { Edit, Car, Plus, FileText, Wrench } from 'lucide-react';

const formatDate = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

const lastServiceText = (vehicle) => {
  if (!vehicle.last_service_date) return 'Sin services';
  const km = vehicle.last_mileage != null ? ` · ${Number(vehicle.last_mileage).toLocaleString('es-AR')} km` : '';
  return `Último service: ${formatDate(vehicle.last_service_date)}${km}`;
};

const actionClass =
  'flex h-8 min-w-0 flex-auto items-center justify-center gap-1.5 whitespace-nowrap rounded border border-outline-variant bg-surface-container px-2 text-xs font-medium text-on-surface hover:text-primary hover:border-primary/40 transition-colors sm:flex-none sm:px-3';

const CustomerVehiclesCard = ({ customerId, vehicles = [], isLoading = false, isError = false, onRetry, onAddVehicle, onEditVehicle }) => (
  <section className="p-5 border border-outline-variant rounded-lg bg-surface-container lg:p-6">
    <div className="flex items-center justify-between mb-5">
      <h4 className="text-base font-semibold text-on-surface">
        Vehículos
        <span className="ml-2 text-sm font-normal text-secondary">({vehicles.length})</span>
      </h4>
      <button
        type="button"
        onClick={onAddVehicle}
        className="flex items-center gap-1.5 rounded bg-primary-container text-on-primary px-3 py-1.5 text-sm font-bold hover:brightness-110 active:scale-95 transition-all"
      >
        <Plus className="w-4 h-4" />
        Agregar
      </button>
    </div>

    {isLoading && <p className="py-10 text-center text-sm text-secondary">Cargando vehículos...</p>}

    {!isLoading && isError && (
      <div className="py-10 text-center">
        <p className="text-sm text-error">No se pudieron cargar los vehículos.</p>
        <button type="button" onClick={onRetry} className="mt-2 text-sm font-medium text-primary hover:underline">
          Reintentar
        </button>
      </div>
    )}

    {!isLoading && !isError && vehicles.length === 0 && (
      <div className="flex flex-col items-center py-10 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
          <Car className="w-6 h-6 text-secondary" />
        </div>
        <p className="text-sm text-on-surface-variant">Este cliente no tiene vehículos registrados</p>
      </div>
    )}

    {!isLoading && !isError && vehicles.length > 0 && (
      <ul className="space-y-3">
        {vehicles.map((vehicle) => {
          const query = `customer_id=${customerId}&vehicle_id=${vehicle.id}`;
          return (
            <li
              key={vehicle.id}
              className="flex flex-col gap-3 p-3 sm:p-4 border border-outline-variant rounded-lg bg-surface-container-high sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {vehicle.image_url ? (
                    <img src={vehicle.image_url} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <Car className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h5 className="text-sm font-medium text-on-surface truncate">
                    {vehicle.brand} {vehicle.model}
                  </h5>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {vehicle.license_plate} · {vehicle.year}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{lastServiceText(vehicle)}</p>
                </div>
              </div>

              <div className="flex w-full items-center gap-1.5 sm:w-auto sm:gap-2">
                <Link to={`/budgets/new?${query}`} className={actionClass}>
                  <FileText className="hidden w-3.5 h-3.5 shrink-0 sm:inline" />
                  <span className="truncate">Presupuestar</span>
                </Link>
                <Link to={`/service-records/new?${query}`} aria-label="Nueva atención" className={actionClass}>
                  <Wrench className="hidden w-3.5 h-3.5 shrink-0 sm:inline" />
                  {/* En mobile no entra el texto completo */}
                  <span className="truncate sm:hidden">Atención</span>
                  <span className="hidden truncate sm:inline">Nueva atención</span>
                </Link>
                <button
                  type="button"
                  onClick={() => onEditVehicle(vehicle)}
                  title="Editar vehículo"
                  aria-label={`Editar ${vehicle.license_plate}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-outline-variant bg-surface-container text-secondary hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

export default CustomerVehiclesCard;
