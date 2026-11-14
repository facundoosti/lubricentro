import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';

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
    // Vista del serializer; null = vista por defecto (con customer_id trae el último service)
    view = 'with_customer',
    ...otherFilters
  } = filters;

  return useQuery({
    queryKey: vehicleKeys.list({ page, per_page, search, customer_id, brand, view, ...otherFilters }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
      });
      if (view) params.append('view', view);

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
    enabled: true,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useVehicle = (id) => {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/vehicles/${id}?view=with_customer`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Helper: build FormData for multipart uploads
const toFormData = (namespace, data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(`${namespace}[${key}][]`, v));
    } else {
      fd.append(`${namespace}[${key}]`, value);
    }
  });
  return fd;
};

// Mutations
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleData) => {
      const { image, ...fields } = vehicleData;
      const payload = image instanceof File
        ? toFormData('vehicle', { ...fields, image })
        : { vehicle: fields };
      const response = await api.post('/vehicles', payload);
      return response.data;
    },
    onSuccess: (data) => {
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
      const { image, ...fields } = vehicleData;
      const payload = image instanceof File
        ? toFormData('vehicle', { ...fields, image })
        : { vehicle: fields };
      const response = await api.put(`/vehicles/${id}`, payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
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
      const response = await api.delete(`/vehicles/${id}`);
      return response.data;
    },
    onSuccess: (data, id) => {
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

// Lookup de vehículo por patente via clasific.ar
const lookupVehicleByPlate = async (plate) => {
  const response = await api.get(`/vehicles/lookup?plate=${encodeURIComponent(plate)}`);
  return response.data;
};

// Datos de la patente en el servicio externo. Una consulta por patente (cache sin vencimiento);
// 404 = sin datos, 503/red = servicio caído. refetch() reintenta.
export const usePlateLookup = (plate) =>
  useQuery({
    queryKey: [...vehicleKeys.all, 'lookup', plate],
    queryFn: async () => {
      try {
        return (await lookupVehicleByPlate(plate))?.data?.vehicle ?? { status: 'not_found' };
      } catch (error) {
        // 404 es un resultado (se cachea); el resto es un error que se puede reintentar
        if (error?.response?.status === 404) return { status: 'not_found' };
        throw error;
      }
    },
    enabled: !!plate,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

// Vehículos ya registrados con esa patente (coincidencia exacta normalizada, con dueño).
export const useVehiclesByPlate = (plate) =>
  useQuery({
    queryKey: [...vehicleKeys.lists(), 'by-plate', plate],
    queryFn: async () => {
      const response = await api.get('/vehicles', { params: { license_plate: plate, per_page: 5 } });
      return response.data?.data?.vehicles || [];
    },
    enabled: !!plate,
    staleTime: 30 * 1000,
  });
