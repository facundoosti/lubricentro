import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceRecordsTable from "@components/features/service-records/ServiceRecordsTable";
import { useServiceRecords, useDeleteServiceRecord } from "@services/serviceRecordsService";
import { showServiceRecordSuccess, showServiceRecordError } from "@services/notificationService";
import PageHeader from "@ui/PageHeader";
import PageError from "@ui/PageError";
import ConfirmModal from "@ui/ConfirmModal";

const ServiceRecords = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const { data, isLoading, error } = useServiceRecords({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  const deleteServiceRecordMutation = useDeleteServiceRecord();

  const records = data?.data?.service_records || [];
  const pagination = data?.data?.pagination;

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleCreate = () => navigate('/atenciones/nueva');

  const handleEdit = (record) => navigate(`/atenciones/${record.id}/editar`);

  const handleDelete = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteServiceRecordMutation.mutateAsync(recordToDelete.id);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      showServiceRecordSuccess('DELETED');
    } catch (err) {
      showServiceRecordError('ERROR_DELETE', err.response?.data?.message || err.message);
    }
  };

  if (error) {
    return (
      <PageError
        title="Error al cargar las atenciones"
        message={error.message || 'Ha ocurrido un error inesperado'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Atenciones" description="Gestiona todas las atenciones y servicios realizados" />

      <ServiceRecordsTable
        serviceRecords={records}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleEdit}
        onCreate={handleCreate}
        loading={isLoading || deleteServiceRecordMutation.isPending}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setRecordToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Atención"
        message={`¿Estás seguro de que quieres eliminar la atención del ${recordToDelete?.service_date}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteServiceRecordMutation.isPending}
      />
    </div>
  );
};

export default ServiceRecords;
