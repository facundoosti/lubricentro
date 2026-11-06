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
  Car
} from "lucide-react";

const VehiclesTable = ({ 
  vehicles = [], 
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

  const getVehicleIcon = (brand) => {
    // Mapear marcas a colores específicos
    const brandColors = {
      'toyota': 'bg-primary/10 text-primary',
      'honda': 'bg-tertiary/10 text-tertiary',
      'ford': 'bg-error/10 text-error',
      'chevrolet': 'bg-yellow-500/15 text-yellow-500',
      'volkswagen': 'bg-surface-container-high text-on-surface-variant',
      'nissan': 'bg-purple-500/15 text-purple-500',
      'bmw': 'bg-primary/10 text-primary',
      'mercedes': 'bg-surface-container-high text-on-surface-variant',
      'audi': 'bg-error/10 text-error',
      'hyundai': 'bg-primary/10 text-primary',
      'kia': 'bg-tertiary/10 text-tertiary',
    };

    const colorClass = brandColors[brand.toLowerCase()] || 'bg-surface-container-high text-on-surface-variant';
    
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
        <Car className="w-5 h-5" />
      </div>
    );
  };

  const getStatusColor = () => {
    // Por ahora, todos los vehículos están activos
    // En el futuro se puede agregar lógica basada en turnos o mantenimiento
    return "success";
  };

  const getStatusText = () => {
    return "Activo";
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
                type="text"
                placeholder="Buscar vehículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </form>
        </div>
        
        <Button
          onClick={onCreate}
          className="flex items-center gap-2 bg-primary-container hover:bg-primary-container/90 text-white"
        >
          <Plus className="w-4 h-4" />
          Nuevo Vehículo
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
                  Vehículo
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
                  Patente
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-on-surface-variant text-start text-xs"
                >
                  Año
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
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-outline-variant">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-on-surface-variant">
                    Cargando vehículos...
                  </TableCell>
                </TableRow>
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-on-surface-variant">
                    No se encontraron vehículos
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="hover:bg-surface-container-high">
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        {vehicle.image_url ? (
                          <img
                            src={vehicle.image_url}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          getVehicleIcon(vehicle.brand)
                        )}
                        <div>
                          <span className="block font-medium text-on-surface text-sm">
                            {vehicle.brand} {vehicle.model}
                          </span>
                          <span className="block text-on-surface-variant text-xs">
                            ID: {vehicle.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="text-on-surface text-sm">
                        {vehicle.customer_name || `Cliente #${vehicle.customer_id}`}
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="text-on-surface text-sm font-mono">
                        {vehicle.license_plate}
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="text-on-surface text-sm">
                        {vehicle.year}
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={getStatusColor(vehicle)}
                      >
                        {getStatusText(vehicle)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(vehicle)}
                          className="p-1 text-secondary hover:text-primary"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(vehicle)}
                          className="p-1 text-secondary hover:text-yellow-500"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(vehicle)}
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

export default VehiclesTable; 