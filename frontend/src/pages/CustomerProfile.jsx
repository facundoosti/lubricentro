import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User } from 'lucide-react';
import { useCustomer, useUpdateCustomer, customerKeys } from '@services/customersService';
import { useVehicles } from '@services/vehiclesService';
import { showCustomerSuccess, showCustomerError, parseApiError } from '@services/notificationService';
import CustomerHeaderCard from '@components/features/customers/CustomerHeaderCard';
import CustomerHistoryCard from '@components/features/customers/CustomerHistoryCard';
import CustomerVehiclesCard from '@components/features/customers/CustomerVehiclesCard';
import CustomerModal from '@components/features/customers/CustomerModal';
import VehicleModal from '@components/features/vehicles/VehicleModal';

const BackButton = ({ onClick }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 text-secondary hover:text-on-surface transition-colors">
    <ArrowLeft className="w-4 h-4" />
    Volver
  </button>
);

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  // null = cerrado; {} = alta; { vehicle } = edición
  const [vehicleModal, setVehicleModal] = useState(null);

  const { data: customerData, isLoading: customerLoading, error: customerError } = useCustomer(id);
  // Vista por defecto con customer_id: incluye último service y km de cada vehículo
  const vehiclesQuery = useVehicles({ customer_id: id, per_page: 50, view: null });
  const updateCustomer = useUpdateCustomer();

  const customer = customerData?.data;
  const vehicles = vehiclesQuery.data?.data?.vehicles || [];

  // ?addVehicle=1 (desde "Cliente creado") abre el alta de vehículo y se quita de la URL
  const customerLoaded = !!customer?.id;
  const wantsAddVehicle = searchParams.get('addVehicle') === '1';
  useEffect(() => {
    if (!customerLoaded || !wantsAddVehicle) return;
    setVehicleModal({});
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('addVehicle');
      return next;
    }, { replace: true });
  }, [customerLoaded, wantsAddVehicle, setSearchParams]);

  const handleEditCustomerSubmit = async (data) => {
    try {
      await updateCustomer.mutateAsync({ id: customer.id, customerData: data });
      showCustomerSuccess('UPDATED');
      setIsEditCustomerOpen(false);
    } catch (error) {
      showCustomerError('ERROR_UPDATE', parseApiError(error));
    }
  };

  if (customerLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-6"><BackButton onClick={() => navigate(-1)} /></div>
        <div className="flex flex-col items-center py-16 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-outline-variant border-t-primary" />
          <p className="text-sm text-secondary">Cargando perfil del cliente...</p>
        </div>
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-6"><BackButton onClick={() => navigate(-1)} /></div>
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center">
            <User className="w-8 h-8 text-on-error-container" />
          </div>
          <h3 className="text-base font-semibold text-on-surface">Cliente no encontrado</h3>
          <p className="text-sm text-secondary">El cliente que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6 text-sm min-w-0">
        <BackButton onClick={() => navigate(-1)} />
        <span className="text-outline-variant">/</span>
        <button onClick={() => navigate('/customers')} className="text-secondary hover:text-on-surface transition-colors">
          Clientes
        </button>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface-variant truncate">{customer.name}</span>
      </div>

      <h2 className="text-xl font-semibold text-on-surface mb-6">Perfil del Cliente</h2>

      <div className="space-y-4">
        <CustomerHeaderCard
          customer={customer}
          onEdit={() => setIsEditCustomerOpen(true)}
          onNewBudget={() => navigate(`/budgets/new?customer_id=${customer.id}`)}
        />
        <CustomerVehiclesCard
          customerId={customer.id}
          vehicles={vehicles}
          isLoading={vehiclesQuery.isLoading}
          isError={vehiclesQuery.isError}
          onRetry={() => vehiclesQuery.refetch()}
          onAddVehicle={() => setVehicleModal({})}
          onEditVehicle={(vehicle) => setVehicleModal({ vehicle })}
        />
        <CustomerHistoryCard customerId={customer.id} />
      </div>

      <CustomerModal
        isOpen={isEditCustomerOpen}
        onClose={() => setIsEditCustomerOpen(false)}
        onSubmit={handleEditCustomerSubmit}
        initialData={customer}
        isLoading={updateCustomer.isPending}
      />

      <VehicleModal
        isOpen={vehicleModal !== null}
        onClose={() => setVehicleModal(null)}
        vehicle={vehicleModal?.vehicle ?? null}
        customerId={customer.id}
        initialCustomer={customer}
        // vehicles_count viene del detalle del cliente: refrescarlo al crear/editar
        onSuccess={() => queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) })}
      />
    </div>
  );
};

export default CustomerProfile;
