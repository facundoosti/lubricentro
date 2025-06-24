import React from "react";
import { Edit, Car, Plus } from "lucide-react";

const CustomerVehiclesCard = ({ vehicles = [], onAddVehicle, onEditVehicle }) => {
  const getVehicleIcon = () => {
    return <Car className="w-5 h-5" />;
  };

  const handleAddVehicle = () => {
    if (onAddVehicle) {
      onAddVehicle();
    }
  };

  const handleEditVehicle = (vehicle) => {
    if (onEditVehicle) {
      onEditVehicle(vehicle);
    }
  };

  // Validación defensiva para asegurar que vehicles sea un array
  const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Vehículos ({vehiclesArray.length})
          </h4>

          {vehiclesArray.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Car className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Este cliente no tiene vehículos registrados
              </p>
              <button
                onClick={handleAddVehicle}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar Vehículo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {vehiclesArray.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400">
                        {getVehicleIcon()}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white/90">
                        {vehicle.brand} {vehicle.model}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Patente: {vehicle.license_plate} • Año: {vehicle.year}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEditVehicle(vehicle)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Editar vehículo"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={handleAddVehicle}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar Vehículo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerVehiclesCard; 