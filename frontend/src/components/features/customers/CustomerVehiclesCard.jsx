import { Edit, Car, Plus } from "lucide-react";

const CustomerVehiclesCard = ({ vehicles = [], onAddVehicle, onEditVehicle }) => {
  const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];

  return (
    <div className="p-5 border border-outline-variant rounded-lg bg-surface-container lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-base font-semibold text-on-surface">
          Vehículos
          <span className="ml-2 text-sm font-normal text-secondary">({vehiclesArray.length})</span>
        </h4>
        <button
          onClick={onAddVehicle}
          className="flex items-center gap-1.5 rounded bg-primary-container text-on-primary px-3 py-1.5 text-sm font-bold hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {vehiclesArray.length === 0 ? (
        <div className="flex flex-col items-center py-10 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
            <Car className="w-6 h-6 text-secondary" />
          </div>
          <p className="text-sm text-secondary">
            Este cliente no tiene vehículos registrados
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehiclesArray.map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center justify-between p-4 border border-outline-variant rounded-lg bg-surface-container-high hover:bg-surface-variant transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-on-surface">
                    {vehicle.brand} {vehicle.model}
                  </h5>
                  <p className="text-xs text-secondary mt-0.5">
                    {vehicle.license_plate} · {vehicle.year}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onEditVehicle(vehicle)}
                title="Editar vehículo"
                className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-surface-container text-secondary hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerVehiclesCard;
