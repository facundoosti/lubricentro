import React, { useState } from "react";
import ServiceRecordsTable from "@components/features/service-records/ServiceRecordsTable";
import { useServiceRecords, useDeleteServiceRecord } from "@services/serviceRecordsService";
import { useNotificationService } from "@services/notificationService";

const ServiceRecords = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage] = useState(10);

  // Servicio de notificaciones
  const notification = useNotificationService();

  // Query para obtener atenciones con paginación y búsqueda
  const {
    data,
    isLoading,
    error
  } = useServiceRecords({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  // Mutation para eliminar atenciones
  const deleteServiceRecordMutation = useDeleteServiceRecord();

  const records = data?.data?.service_records || [];
  const pagination = data?.data?.pagination;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset a la primera página al buscar
  };

  const handleDelete = async (record) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la atención del ${record.service_date}?`)) {
      try {
        await deleteServiceRecordMutation.mutateAsync(record.id);
        notification.showServiceRecordSuccess('DELETED');
      } catch (error) {
        console.error("Error al eliminar la atención:", error);
        notification.showServiceRecordError('ERROR_DELETE', error.response?.data?.message || error.message);
      }
    }
  };

  const handleEdit = (record) => {
    console.log("Editar atención:", record);
    notification.showInfo('Funcionalidad de edición en desarrollo');
  };

  const handleView = (record) => {
    console.log("Ver atención:", record);
    notification.showInfo('Funcionalidad de vista detallada en desarrollo');
  };

  const handleCreate = () => {
    console.log("Crear nueva atención");
    notification.showInfo('Funcionalidad de creación en desarrollo');
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
        serviceRecords={records}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreate={handleCreate}
        loading={isLoading || deleteServiceRecordMutation.isPending}
      />
    </div>
  );
};

export default ServiceRecords; 