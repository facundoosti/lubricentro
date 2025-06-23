import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ServiceRecordsTable from '@components/features/service-records/ServiceRecordsTable';
import { 
  useServiceRecords, 
  useDeleteServiceRecord 
} from '@services/serviceRecordsService';

const ServiceRecords = () => {
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    search: '',
  });

  const { data, isLoading, error } = useServiceRecords(filters);
  const deleteMutation = useDeleteServiceRecord();

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Atención eliminada correctamente');
    } catch (error) {
      console.error('Error deleting service record:', error);
      toast.error('Error al eliminar la atención');
    }
  };

  const handleEdit = (record) => {
    // TODO: Implementar modal de edición
    console.log('Edit record:', record);
    toast.info('Funcionalidad de edición en desarrollo');
  };

  const handleView = (record) => {
    // TODO: Implementar vista detallada
    console.log('View record:', record);
    toast.info('Funcionalidad de vista detallada en desarrollo');
  };

  const handleCreate = () => {
    // TODO: Implementar modal de creación
    console.log('Create new record');
    toast.info('Funcionalidad de creación en desarrollo');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            Error al cargar las atenciones
          </div>
          <div className="text-gray-600">
            {error.message || 'Ha ocurrido un error inesperado'}
          </div>
        </div>
      </div>
    );
  }

  const serviceRecords = data?.data?.service_records || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Atenciones
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona todas las atenciones y servicios realizados
        </p>
      </div>

      <ServiceRecordsTable
        serviceRecords={serviceRecords}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreate={handleCreate}
        loading={isLoading || deleteMutation.isPending}
      />
    </div>
  );
};

export default ServiceRecords; 