import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Car, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { useCustomer } from '@services/customersService';
import { useVehicles, useCreateVehicle, useUpdateVehicle } from '@services/vehiclesService';
import { useUpdateCustomer } from '@services/customersService';
import CustomerMetaCard from '@components/features/customers/CustomerMetaCard';
import CustomerInfoCard from '@components/features/customers/CustomerInfoCard';
import CustomerVehiclesCard from '@components/features/customers/CustomerVehiclesCard';
import CustomerModal from '@components/features/customers/CustomerModal';
import VehicleModal from '@components/features/vehicles/VehicleModal';
import ConfirmModal from '@ui/ConfirmModal';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localCustomer, setLocalCustomer] = useState(null); // Estado local como respaldo
  
  // Estados para modales
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Obtener datos del cliente
  const { data: customerData, isLoading: customerLoading, error: customerError, refetch: refetchCustomer } = useCustomer(id);
  
  // Obtener vehículos del cliente
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles({ customer_id: id });

  // Mutations
  const updateCustomerMutation = useUpdateCustomer();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();

  // Extraer datos del cliente directamente de React Query
  const customer = customerData?.data;

  // Actualizar estado local cuando cambian los datos de React Query
  useEffect(() => {
    if (customerData?.data) {
      setLocalCustomer(customerData.data);
    }
  }, [customerData]);

  // Debug logs para verificar actualizaciones
  useEffect(() => {
    console.log("CustomerProfile - customerData updated:", customerData);
    console.log("CustomerProfile - customer updated:", customer);
    console.log("CustomerProfile - localCustomer updated:", localCustomer);
  }, [customerData, customer, localCustomer]);

  useEffect(() => {
    if (vehiclesData) {
      console.log("CustomerProfile - vehiclesData:", vehiclesData);
      console.log("CustomerProfile - vehiclesData.data:", vehiclesData.data);
      
      // Validación defensiva para asegurar que vehicles sea un array
      const vehiclesArray = vehiclesData.data;
      if (vehiclesArray && Array.isArray(vehiclesArray.vehicles)) {
        // Estructura correcta del backend: { vehicles: [...] }
        console.log("CustomerProfile - vehiclesArray.vehicles is array, length:", vehiclesArray.vehicles.length);
        setVehicles(vehiclesArray.vehicles);
      } else if (Array.isArray(vehiclesArray)) {
        // Si la respuesta es directamente un array
        console.log("CustomerProfile - vehiclesArray is array, length:", vehiclesArray.length);
        setVehicles(vehiclesArray);
      } else {
        // Si no es un array, usar array vacío
        console.log("CustomerProfile - vehiclesArray is not array, using empty array");
        setVehicles([]);
      }
    }
  }, [vehiclesData]);

  useEffect(() => {
    setLoading(customerLoading || vehiclesLoading);
  }, [customerLoading, vehiclesLoading]);

  const handleBack = () => {
    navigate('/customers');
  };

  // Handlers para modales de cliente
  const handleEditCustomer = () => {
    setIsEditCustomerModalOpen(true);
  };

  const handleEditCustomerSubmit = async (data) => {
    try {
      console.log("CustomerProfile - handleEditCustomerSubmit called with:", data);
      await updateCustomerMutation.mutateAsync({ 
        id: displayCustomer.id, 
        customerData: data 
      });
      console.log("CustomerProfile - updateCustomerMutation completed");
      
      // Actualizar estado local inmediatamente como respaldo
      setLocalCustomer(prev => {
        const updated = {
          ...prev,
          ...data
        };
        console.log("CustomerProfile - localCustomer updated to:", updated);
        return updated;
      });
      
      // Forzar refetch manual como respaldo adicional
      await refetchCustomer();
      
      setIsEditCustomerModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      alert(`Error al actualizar cliente: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handlers para modales de vehículos
  const handleAddVehicle = () => {
    setIsAddVehicleModalOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditVehicleModalOpen(true);
  };

  const handleAddVehicleSubmit = async (data) => {
    try {
      await createVehicleMutation.mutateAsync(data);
      setIsAddVehicleModalOpen(false);
    } catch (error) {
      console.error("Error al crear vehículo:", error);
      alert(`Error al crear vehículo: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditVehicleSubmit = async (data) => {
    try {
      await updateVehicleMutation.mutateAsync({ 
        id: selectedVehicle.id, 
        vehicleData: data 
      });
      setIsEditVehicleModalOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error("Error al actualizar vehículo:", error);
      alert(`Error al actualizar vehículo: ${error.response?.data?.message || error.message}`);
    }
  };

  // Cerrar modales
  const closeEditCustomerModal = () => {
    setIsEditCustomerModalOpen(false);
  };

  const closeAddVehicleModal = () => {
    setIsAddVehicleModalOpen(false);
  };

  const closeEditVehicleModal = () => {
    setIsEditVehicleModalOpen(false);
    setSelectedVehicle(null);
  };

  // Usar localCustomer como fallback si customer no está disponible
  const displayCustomer = localCustomer || customer;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando perfil del cliente...</p>
        </div>
      </div>
    );
  }

  if (customerError || !displayCustomer) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <User className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Cliente no encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            El cliente que buscas no existe o ha sido eliminado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header con botón volver */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Clientes
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/customers')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                Clientes
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {displayCustomer.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Perfil del Cliente
        </h3>
        
        <div className="space-y-6">
          <CustomerMetaCard customer={displayCustomer} onEdit={handleEditCustomer} />
          <CustomerInfoCard customer={displayCustomer} onEdit={handleEditCustomer} />
          <CustomerVehiclesCard 
            vehicles={vehicles} 
            onAddVehicle={handleAddVehicle}
            onEditVehicle={handleEditVehicle}
          />
        </div>
      </div>

      {/* Modal para editar cliente */}
      <CustomerModal
        isOpen={isEditCustomerModalOpen}
        onClose={closeEditCustomerModal}
        onSubmit={handleEditCustomerSubmit}
        initialData={displayCustomer}
        isLoading={updateCustomerMutation.isPending}
      />

      {/* Modal para agregar vehículo */}
      <VehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={closeAddVehicleModal}
        onSubmit={handleAddVehicleSubmit}
        customerId={displayCustomer.id}
        isLoading={createVehicleMutation.isPending}
      />

      {/* Modal para editar vehículo */}
      <VehicleModal
        isOpen={isEditVehicleModalOpen}
        onClose={closeEditVehicleModal}
        onSubmit={handleEditVehicleSubmit}
        initialData={selectedVehicle}
        isLoading={updateVehicleMutation.isPending}
      />
    </div>
  );
};

export default CustomerProfile; 