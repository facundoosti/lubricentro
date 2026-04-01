import { ClipboardList } from 'lucide-react';
import SlideOver from '@ui/SlideOver';
import ServiceRecordForm from '@components/features/service-records/ServiceRecordForm';
import { useCreateServiceRecord, useUpdateServiceRecord } from '@services/serviceRecordsService';
import { showServiceRecordSuccess, showServiceRecordError } from '@services/notificationService';

const FORM_ID = 'service-record-form';

const ServiceRecordModal = ({ isOpen, onClose, record = null }) => {
  const createServiceRecord = useCreateServiceRecord();
  const updateServiceRecord = useUpdateServiceRecord();

  const isEditing = !!record;
  const isLoading = createServiceRecord.isPending || updateServiceRecord.isPending;

  const subtitle = isEditing
    ? `${record?.vehicle?.brand || ''} ${record?.vehicle?.model || ''} · ${record?.vehicle?.license_plate || ''}`.trim()
    : 'Registra una nueva atención';

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateServiceRecord.mutateAsync({ id: record.id, data });
        showServiceRecordSuccess('UPDATED');
      } else {
        await createServiceRecord.mutateAsync(data);
        showServiceRecordSuccess('CREATED');
      }
      onClose();
    } catch (error) {
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Error al guardar la atención';
      showServiceRecordError('ERROR_CREATE', msg);
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Atención' : 'Nueva Atención'}
      subtitle={subtitle}
      icon={ClipboardList}
      formId={FORM_ID}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Atención'}
      isLoading={isLoading}
    >
      <ServiceRecordForm
        record={record}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        formId={FORM_ID}
      />
    </SlideOver>
  );
};

export default ServiceRecordModal;
