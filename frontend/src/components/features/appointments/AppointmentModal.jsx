import Modal from '@ui/Modal';
import AppointmentForm from '@components/features/appointments/AppointmentForm';

const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  appointment = null, 
  isLoading = false 
}) => {
  const isEditing = !!appointment;
  const title = isEditing ? 'Editar Turno' : 'Crear Turno';
  const description = isEditing 
    ? 'Modifica los detalles del turno seleccionado'
    : 'Agenda un nuevo turno para un cliente y vehículo';

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] p-6 lg:p-10"
    >
      <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
        <div>
          <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
            {title}
          </h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
        
        <div className="mt-8">
          <AppointmentForm
            onSubmit={handleSubmit}
            initialData={appointment}
            isLoading={isLoading}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentModal; 