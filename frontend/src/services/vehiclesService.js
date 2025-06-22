import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@services/api';

// Query Keys
export const vehicleKeys = {
  all: ['vehicles'],
  lists: () => [...vehicleKeys.all, 'list'],
  list: (filters) => [...vehicleKeys.lists(), filters],
  details: () => [...vehicleKeys.all, 'detail'],
  detail: (id) => [...vehicleKeys.details(), id],
};

// Hooks para Vehicles
export const useVehicles = (filters = {}) => {
  const {
    page = 1,
    per_page = 10,
    search = '',
    customer_id,
    brand,
    ...otherFilters
  } = filters;

  return useQuery({
    queryKey: vehicleKeys.list({ page, per_page, search, customer_id, brand, ...otherFilters }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      if (customer_id) {
        params.append('customer_id', customer_id.toString());
      }

      if (brand) {
        params.append('brand', brand);
      }

      // Agregar otros filtros si existen
      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/vehicles?${params}`);
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useVehicle = (id) => {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/vehicles/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Mutations
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleData) => {
      console.log("useCreateVehicle - mutationFn called with:", vehicleData);
      const response = await api.post('/vehicles', { vehicle: vehicleData });
      console.log("useCreateVehicle - Response:", response);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("useCreateVehicle - onSuccess called with:", data);
      // Invalidar y refetch la lista de vehicles
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      
      // Agregar el nuevo vehicle al cache si es necesario
      if (data.data?.vehicle) {
        queryClient.setQueryData(
          vehicleKeys.detail(data.data.vehicle.id),
          data
        );
      }
    },
    onError: (error) => {
      console.error('Error creating vehicle:', error);
      console.error('Error response:', error.response);
      throw error;
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, vehicleData }) => {
      console.log("useUpdateVehicle - mutationFn called with:", { id, vehicleData });
      const response = await api.put(`/vehicles/${id}`, { vehicle: vehicleData });
      console.log("useUpdateVehicle - Response:", response);
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log("useUpdateVehicle - onSuccess called with:", data);
      // Invalidar y refetch la lista de vehicles
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      
      // Actualizar el vehicle específico en el cache
      queryClient.setQueryData(
        vehicleKeys.detail(variables.id),
        data
      );
    },
    onError: (error) => {
      console.error('Error updating vehicle:', error);
      console.error('Error response:', error.response);
      throw error;
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      console.log("useDeleteVehicle - mutationFn called with id:", id);
      const response = await api.delete(`/vehicles/${id}`);
      console.log("useDeleteVehicle - Response:", response);
      return response.data;
    },
    onSuccess: (data, id) => {
      console.log("useDeleteVehicle - onSuccess called with:", data);
      // Invalidar y refetch la lista de vehicles
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      
      // Remover el vehicle del cache
      queryClient.removeQueries({ queryKey: vehicleKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error deleting vehicle:', error);
      console.error('Error response:', error.response);
      throw error;
    },
  });
};

// Funciones helper para el servicio
export const vehiclesService = {
  // Obtener todos los vehicles con filtros
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/vehicles?${params}`);
    return response.data;
  },

  // Obtener un vehicle por ID
  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // Crear un nuevo vehicle
  create: async (vehicleData) => {
    const response = await api.post('/vehicles', { vehicle: vehicleData });
    return response.data;
  },

  // Actualizar un vehicle
  update: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, { vehicle: vehicleData });
    return response.data;
  },

  // Eliminar un vehicle
  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  // Buscar vehicles
  search: async (query) => {
    const response = await api.get('/vehicles', { 
      params: { search: query } 
    });
    return response.data;
  },

  // Obtener vehicles por cliente
  getByCustomer: async (customerId) => {
    const response = await api.get(`/customers/${customerId}/vehicles`);
    return response.data;
  },
};

// Tipos de datos para TypeScript (si se usa en el futuro)
export const vehicleTypes = {
  Vehicle: {
    id: 'number',
    brand: 'string',
    model: 'string',
    license_plate: 'string',
    year: 'string',
    customer_id: 'number',
    customer_name: 'string',
    created_at: 'string',
    updated_at: 'string',
  },
  
  VehicleFilters: {
    page: 'number',
    per_page: 'number',
    search: 'string',
    customer_id: 'number',
    brand: 'string',
  },
  
  VehicleCreateData: {
    brand: 'string',
    model: 'string',
    license_plate: 'string',
    year: 'string',
    customer_id: 'number',
  },
  
  VehicleUpdateData: {
    brand: 'string | null',
    model: 'string | null',
    license_plate: 'string | null',
    year: 'string | null',
    customer_id: 'number | null',
  },
}; 