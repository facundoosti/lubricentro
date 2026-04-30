import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { useCustomer, useUpdateCustomer } from "@services/customersService";
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
} from "@services/vehiclesService";
import CustomerMetaCard from "@components/features/customers/CustomerMetaCard";
import CustomerInfoCard from "@components/features/customers/CustomerInfoCard";
import CustomerVehiclesCard from "@components/features/customers/CustomerVehiclesCard";
import CustomerModal from "@components/features/customers/CustomerModal";
import VehicleModal from "@components/features/vehicles/VehicleModal";

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localCustomer, setLocalCustomer] = useState(null);

  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const {
    data: customerData,
    isLoading: customerLoading,
    error: customerError,
    refetch: refetchCustomer,
  } = useCustomer(id);
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles({
    customer_id: id,
  });

  const updateCustomerMutation = useUpdateCustomer();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();

  const customer = customerData?.data;

  useEffect(() => {
    if (customerData?.data) {
      setLocalCustomer(customerData.data);
    }
  }, [customerData]);

  useEffect(() => {
    if (vehiclesData) {
      const vehiclesArray = vehiclesData.data;
      if (vehiclesArray && Array.isArray(vehiclesArray.vehicles)) {
        setVehicles(vehiclesArray.vehicles);
      } else if (Array.isArray(vehiclesArray)) {
        setVehicles(vehiclesArray);
      } else {
        setVehicles([]);
      }
    }
  }, [vehiclesData]);

  useEffect(() => {
    setLoading(customerLoading || vehiclesLoading);
  }, [customerLoading, vehiclesLoading]);

  const displayCustomer = localCustomer || customer;

  const handleEditCustomerSubmit = async (data) => {
    try {
      await updateCustomerMutation.mutateAsync({
        id: displayCustomer.id,
        customerData: data,
      });
      setLocalCustomer((prev) => ({ ...prev, ...data }));
      await refetchCustomer();
      setIsEditCustomerModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      alert(
        `Error al actualizar cliente: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleAddVehicleSubmit = async (data) => {
    try {
      await createVehicleMutation.mutateAsync(data);
      setIsAddVehicleModalOpen(false);
    } catch (error) {
      console.error("Error al crear vehículo:", error);
      alert(
        `Error al crear vehículo: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleEditVehicleSubmit = async (data) => {
    try {
      await updateVehicleMutation.mutateAsync({
        id: selectedVehicle.id,
        vehicleData: data,
      });
      setIsEditVehicleModalOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error("Error al actualizar vehículo:", error);
      alert(
        `Error al actualizar vehículo: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-secondary hover:text-on-surface transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="flex flex-col items-center py-16 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-outline-variant border-t-primary" />
          <p className="text-sm text-secondary">
            Cargando perfil del cliente...
          </p>
        </div>
      </div>
    );
  }

  if (customerError || !displayCustomer) {
    return (
      <div className="p-6 md:p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-secondary hover:text-on-surface transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center">
            <User className="w-8 h-8 text-on-error-container" />
          </div>
          <h3 className="text-base font-semibold text-on-surface">
            Cliente no encontrado
          </h3>
          <p className="text-sm text-secondary">
            El cliente que buscas no existe o ha sido eliminado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <span className="text-outline-variant">/</span>
        <button
          onClick={() => navigate("/customers")}
          className="text-secondary hover:text-on-surface transition-colors"
        >
          Clientes
        </button>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface-variant">{displayCustomer.name}</span>
      </div>

      {/* Page title */}
      <h2 className="text-xl font-semibold text-on-surface mb-6">
        Perfil del Cliente
      </h2>

      {/* Cards */}
      <div className="space-y-4">
        <CustomerMetaCard
          customer={displayCustomer}
          onEdit={() => setIsEditCustomerModalOpen(true)}
          onViewServiceRecords={() =>
            navigate(`/service-records?customer_id=${displayCustomer.id}`)
          }
        />
        <CustomerInfoCard
          customer={displayCustomer}
          onEdit={() => setIsEditCustomerModalOpen(true)}
        />
        <CustomerVehiclesCard
          vehicles={vehicles}
          onAddVehicle={() => setIsAddVehicleModalOpen(true)}
          onEditVehicle={(v) => {
            setSelectedVehicle(v);
            setIsEditVehicleModalOpen(true);
          }}
        />
      </div>

      {/* Modales */}
      <CustomerModal
        isOpen={isEditCustomerModalOpen}
        onClose={() => setIsEditCustomerModalOpen(false)}
        onSubmit={handleEditCustomerSubmit}
        initialData={displayCustomer}
        isLoading={updateCustomerMutation.isPending}
      />

      <VehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onSubmit={handleAddVehicleSubmit}
        customerId={displayCustomer.id}
        initialCustomer={displayCustomer}
        isLoading={createVehicleMutation.isPending}
      />

      <VehicleModal
        isOpen={isEditVehicleModalOpen}
        onClose={() => {
          setIsEditVehicleModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSubmit={handleEditVehicleSubmit}
        vehicle={selectedVehicle}
        customerId={displayCustomer.id}
        isLoading={updateVehicleMutation.isPending}
      />
    </div>
  );
};

export default CustomerProfile;
