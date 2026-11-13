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
  DollarSign,
  Camera
} from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Input from '@ui/Input';

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
            <Input
              startIcon={Search}
              autoComplete="off"
              placeholder="Buscar atenciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
        
        <Button
          onClick={onCreate}
          className="flex items-center gap-2 bg-primary-container text-on-primary font-bold hover:brightness-110 rounded"
        >
          <Plus className="w-4 h-4" />
          Nueva Atención
        </Button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-outline-variant">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Fecha
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Cliente
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Vehículo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Kilometraje
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Total
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Estado
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Próximo Servicio
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-outline-variant">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-on-surface-variant">
                    Cargando atenciones...
                  </TableCell>
                </TableRow>
              ) : !records || records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-on-surface-variant">
                    {!records ? 'Error al cargar datos' : 'No se encontraron atenciones'}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-surface-container-high">
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        {record.photos_urls?.length > 0 ? (
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <img
                              src={record.photos_urls[0]}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {record.photos_urls.length > 1 && (
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-container rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                                {record.photos_urls.length}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <span className="block font-medium text-on-surface text-sm">
                            {formatDate(record.service_date)}
                          </span>
                          <span className="block text-on-surface-variant text-xs">
                            {record.photos_urls?.length > 0
                              ? `${record.photos_urls.length} foto${record.photos_urls.length > 1 ? 's' : ''}`
                              : `ID: ${record.id}`}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-tertiary/10 rounded-full flex items-center justify-center">
                          <span className="text-tertiary font-medium text-xs">
                            {getInitials(record.customer?.name)}
                          </span>
                        </div>
                        <div>
                          <span className="block font-medium text-on-surface text-sm">
                            {record.customer?.name || 'Cliente no encontrado'}
                          </span>
                          <span className="block text-on-surface-variant text-xs">
                            {record.customer?.phone || 'Sin teléfono'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500/15 rounded-full flex items-center justify-center">
                          <Car className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <span className="block font-medium text-on-surface text-sm">
                            {record.vehicle?.brand} {record.vehicle?.model}
                          </span>
                          <span className="block text-on-surface-variant text-xs">
                            {record.vehicle?.license_plate || 'Sin patente'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="text-on-surface text-sm">
                        {record.mileage ? `${record.mileage.toLocaleString()} km` : '-'}
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-on-surface text-sm">
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
                      <div className="text-on-surface text-sm">
                        {formatDate(record.next_service_date)}
                      </div>
                      {record.days_until_next_service !== undefined && (
                        <div className="text-on-surface-variant text-xs">
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
                          className="p-1 text-secondary hover:text-primary"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(record)}
                          className="p-1 text-secondary hover:text-primary"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(record)}
                          className="p-1 text-secondary hover:text-error"
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