import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';

// Query Keys
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
};

// Hooks para Products
export const useProducts = (filters = {}) => {
  const {
    page = 1,
    per_page = 10,
    search = '',
    min_price,
    max_price,
    ...otherFilters
  } = filters;

  return useQuery({
    queryKey: productKeys.list({ page, per_page, search, min_price, max_price, ...otherFilters }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      if (min_price) {
        params.append('min_price', min_price.toString());
      }

      if (max_price) {
        params.append('max_price', max_price.toString());
      }

      // Agregar otros filtros si existen
      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/products?${params}`);
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Mutations
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData) => {
      console.log("useCreateProduct - mutationFn called with:", productData);
      const response = await api.post('/products', { product: productData });
      console.log("useCreateProduct - Response:", response);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("useCreateProduct - onSuccess called with:", data);
      // Invalidar y refetch la lista de products
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Agregar el nuevo product al cache si es necesario
      if (data.data?.product) {
        queryClient.setQueryData(
          productKeys.detail(data.data.product.id),
          data
        );
      }
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      console.error('Error response:', error.response);
      throw error;
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productData }) => {
      console.log("useUpdateProduct - mutationFn called with:", { id, productData });
      const response = await api.put(`/products/${id}`, { product: productData });
      console.log("useUpdateProduct - Response:", response);
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log("useUpdateProduct - onSuccess called with:", data);
      // Invalidar y refetch la lista de products
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Actualizar el product específico en el cache
      queryClient.setQueryData(
        productKeys.detail(variables.id),
        data
      );
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      console.error('Error response:', error.response);
      throw error;
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      console.log("useDeleteProduct - mutationFn called with id:", id);
      const response = await api.delete(`/products/${id}`);
      console.log("useDeleteProduct - Response:", response);
      return response.data;
    },
    onSuccess: (data, id) => {
      console.log("useDeleteProduct - onSuccess called with:", data);
      // Invalidar y refetch la lista de products
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Remover el product del cache
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      console.error('Error response:', error.response);
      throw error;
    },
  });
};

// Funciones helper para el servicio
export const productsService = {
  // Obtener todos los products con filtros
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/products?${params}`);
    return response.data;
  },

  // Obtener un product por ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Crear un nuevo product
  create: async (productData) => {
    const response = await api.post('/products', { product: productData });
    return response.data;
  },

  // Actualizar un product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, { product: productData });
    return response.data;
  },

  // Eliminar un product
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Buscar products
  search: async (query) => {
    const response = await api.get('/products', { 
      params: { search: query } 
    });
    return response.data;
  },

  // Obtener products por rango de precio
  getByPriceRange: async (minPrice, maxPrice) => {
    const response = await api.get('/products', { 
      params: { min_price: minPrice, max_price: maxPrice } 
    });
    return response.data;
  },
};

// Tipos de datos para TypeScript (si se usa en el futuro)
export const productTypes = {
  Product: {
    id: 'number',
    name: 'string',
    description: 'string | null',
    unit_price: 'string',
    unit: 'string | null',
    created_at: 'string',
    updated_at: 'string',
  },
  
  ProductFilters: {
    page: 'number',
    per_page: 'number',
    search: 'string',
    min_price: 'number',
    max_price: 'number',
  },
  
  ProductCreateData: {
    name: 'string',
    description: 'string | null',
    unit_price: 'number',
    unit: 'string | null',
  },
  
  ProductUpdateData: {
    name: 'string | null',
    description: 'string | null',
    unit_price: 'number | null',
    unit: 'string | null',
  },
}; 