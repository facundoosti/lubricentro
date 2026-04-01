import { Calendar } from 'lucide-react';
import SlideOver from '@ui/SlideOver';
import AppointmentForm from '@components/features/appointments/AppointmentForm';

const FORM_ID = 'appointment-form';

const AppointmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  appointment = null,
  isLoading = false,
}) => {
  const isEditing = !!appointment;

  const subtitle = isEditing
    ? `${appointment?.customer?.name || ''} · ${appointment?.vehicle?.brand || ''} ${appointment?.vehicle?.model || ''}`.trim()
    : 'Agenda un nuevo turno para un cliente y vehículo';

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Turno' : 'Nuevo Turno'}
      subtitle={subtitle}
      icon={Calendar}
      formId={FORM_ID}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Turno'}
      isLoading={isLoading}
    >
      <AppointmentForm
        onSubmit={onSubmit}
        initialData={appointment}
        isLoading={isLoading}
        formId={FORM_ID}
      />
    </SlideOver>
  );
};

export default AppointmentModal;
