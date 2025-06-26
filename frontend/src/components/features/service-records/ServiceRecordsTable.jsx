import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@ui/Table";
import Badge from "@ui/Badge";
import Button from "@ui/Button";
import Pagination from "@ui/Pagination";
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Car,
  User,
  DollarSign
} from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ServiceRecordsTable = ({ 
  serviceRecords = [], 
  pagination = {},
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
  onView,
  onCreate,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Ensure serviceRecords is always an array and handle different data structures
  let records = [];
  if (Array.isArray(serviceRecords)) {
    records = serviceRecords;
  } else if (serviceRecords && typeof serviceRecords === 'object') {
    // Handle different possible structures
    records = serviceRecords.service_records || serviceRecords.data || serviceRecords.records || [];
  }

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return '-';
    }
  };

  const getStatusColor = (record) => {
    if (record.is_overdue) return "error";
    if (record.days_until_next_service && record.days_until_next_service <= 30) return "warning";
    return "success";
  };

  const getStatusText = (record) => {
    if (record.is_overdue) return "Vencido";
    if (record.days_until_next_service && record.days_until_next_service <= 30) return "Próximo";
    return "Completado";
  };

  const getInitials = (name) => {
    if (!name) return '--';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón crear */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar atenciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </form>
        </div>
        
        <Button
          onClick={onCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Nueva Atención
        </Button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Fecha
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Cliente
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Vehículo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Kilometraje
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Total
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Estado
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Próximo Servicio
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500">
                    Cargando atenciones...
                  </TableCell>
                </TableRow>
              ) : !records || records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500">
                    {!records ? 'Error al cargar datos' : 'No se encontraron atenciones'}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                            {formatDate(record.service_date)}
                          </span>
                          <span className="block text-gray-500 text-xs dark:text-gray-400">
                            ID: {record.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 font-medium text-xs">
                            {getInitials(record.customer?.name)}
                          </span>
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                            {record.customer?.name || 'Cliente no encontrado'}
                          </span>
                          <span className="block text-gray-500 text-xs dark:text-gray-400">
                            {record.customer?.phone || 'Sin teléfono'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                          <Car className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                            {record.vehicle?.brand} {record.vehicle?.model}
                          </span>
                          <span className="block text-gray-500 text-xs dark:text-gray-400">
                            {record.vehicle?.license_plate || 'Sin patente'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="text-gray-800 text-sm dark:text-white/90">
                        {record.mileage ? `${record.mileage.toLocaleString()} km` : '-'}
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-sm dark:text-white/90">
                          {formatCurrency(record.total_amount)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={getStatusColor(record)}
                      >
                        {getStatusText(record)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="text-gray-800 text-sm dark:text-white/90">
                        {formatDate(record.next_service_date)}
                      </div>
                      {record.days_until_next_service !== undefined && (
                        <div className="text-gray-500 text-xs dark:text-gray-400">
                          {record.days_until_next_service > 0 
                            ? `En ${record.days_until_next_service} días`
                            : `Hace ${Math.abs(record.days_until_next_service)} días`
                          }
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(record)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(record)}
                          className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(record)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación */}
      {pagination && pagination.total_pages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.current_page || 1}
            totalPages={pagination.total_pages || 1}
            totalItems={pagination.total_count || 0}
            itemsPerPage={pagination.per_page || 10}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ServiceRecordsTable; 