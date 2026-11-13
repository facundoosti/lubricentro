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
  Wrench,
  DollarSign,
  Clock
} from "lucide-react";

const ServicesTable = ({ 
  services = [], 
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

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const getServiceIcon = (name) => {
    // Mapear tipos de servicios a colores específicos
    const serviceColors = {
      'aceite': 'bg-primary/10 text-primary',
      'filtro': 'bg-tertiary/10 text-tertiary',
      'frenos': 'bg-error/10 text-error',
      'batería': 'bg-yellow-500/15 text-yellow-500',
      'neumático': 'bg-purple-500/15 text-purple-500',
      'lubricación': 'bg-indigo-500/15 text-indigo-500',
      'diagnóstico': 'bg-cyan-500/15 text-cyan-500',
      'limpieza': 'bg-orange-500/15 text-orange-500',
      'reparación': 'bg-pink-500/15 text-pink-500',
      'mantenimiento': 'bg-teal-500/15 text-teal-500',
    };

    // Buscar coincidencias en el nombre del servicio
    const serviceName = name.toLowerCase();
    let colorClass = 'bg-surface-container-high text-on-surface-variant'; // Default

    for (const [type, color] of Object.entries(serviceColors)) {
      if (serviceName.includes(type)) {
        colorClass = color;
        break;
      }
    }
    
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
        <Wrench className="w-5 h-5" />
      </div>
    );
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(numPrice);
  };

  const getStatusColor = () => {
    // Por ahora, todos los servicios están activos
    // En el futuro se puede agregar lógica basada en disponibilidad
    return "success";
  };

  const getStatusText = () => {
    return "Disponible";
  };

  const truncateDescription = (description, maxLength = 50) => {
    if (!description) return "-";
    return description.length > maxLength 
      ? `${description.substring(0, maxLength)}...` 
      : description;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón crear */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                autoComplete="off"
                type="text"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </form>
        </div>
        
        <Button
          onClick={onCreate}
          className="flex items-center gap-2 bg-primary-container hover:bg-primary-container/90 text-white"
        >
          <Plus className="w-4 h-4" />
          Nuevo Servicio
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
                  Servicio
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Descripción
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Precio Base
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
                  Creado
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
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-on-surface-variant">
                    Cargando servicios...
                  </TableCell>
                </TableRow>
              ) : services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-on-surface-variant">
                    No se encontraron servicios
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id} className="hover:bg-surface-container-high">
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        {getServiceIcon(service.name)}
                        <div>
                          <span className="block font-medium text-on-surface text-sm">
                            {service.name}
                          </span>
                          <span className="block text-on-surface-variant text-xs">
                            ID: {service.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="text-on-surface text-sm max-w-xs">
                        {truncateDescription(service.description)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-1">
                        <span className="text-on-surface text-sm font-medium">
                          {formatPrice(service.base_price)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={getStatusColor()}
                      >
                        {getStatusText()}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-secondary" />
                        <span className="text-on-surface-variant text-xs">
                          {formatDate(service.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(service)}
                          className="p-1 text-secondary hover:text-primary"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(service)}
                          className="p-1 text-secondary hover:text-primary"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(service)}
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

export default ServicesTable; 