# Sistema de Presupuestos - Frontend React

## 📋 **Descripción General**

El frontend del sistema de presupuestos proporciona una interfaz completa para crear, editar y gestionar cotizaciones para clientes del lubricentro.

## 🏗️ **Arquitectura del Frontend**

### **Estructura de Componentes**

```
src/components/features/quotes/
├── QuoteForm.jsx              # Formulario de creación/edición
├── QuoteModal.jsx             # Modal para crear/editar presupuestos
├── QuotesTable.jsx            # Tabla de listado de presupuestos
├── QuoteDetail.jsx            # Vista detallada del presupuesto
├── QuoteStatusBadge.jsx       # Badge de estado del presupuesto
├── QuoteItemsList.jsx         # Lista de productos y servicios
├── QuoteActions.jsx           # Botones de acción (enviar, aprobar, etc.)
└── QuoteConversionModal.jsx   # Modal para convertir a atención
```

### **Hooks Personalizados**

```
src/hooks/
├── useQuotes.js               # Hook principal para presupuestos
├── useQuoteServices.js        # Hook para servicios del presupuesto
├── useQuoteProducts.js        # Hook para productos del presupuesto
└── useQuoteConversion.js      # Hook para conversión a atención
```

### **Servicios de API**

```
src/services/
├── quotesService.js           # API calls para presupuestos
├── quoteServicesService.js    # API calls para servicios del presupuesto
└── quoteProductsService.js    # API calls para productos del presupuesto
```

## 🎮 **Componentes Principales**

### **QuoteForm.jsx**
```jsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCustomers } from '@hooks/useCustomers';
import { useVehicles } from '@hooks/useVehicles';
import { useServices } from '@hooks/useServices';
import { useProducts } from '@hooks/useProducts';
import Button from '@ui/Button';
import Input from '@ui/Input';
import Select from '@ui/Select';
import DatePicker from '@ui/DatePicker';

const QuoteForm = ({ quote = null, onSubmit, onCancel, loading = false }) => {
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const { services } = useServices();
  const { products } = useProducts();
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      customer_id: quote?.customer_id || '',
      vehicle_id: quote?.vehicle_id || '',
      issue_date: quote?.issue_date || new Date().toISOString().split('T')[0],
      expiry_date: quote?.expiry_date || '',
      notes: quote?.notes || '',
      quote_services: quote?.quote_services || [],
      quote_products: quote?.quote_products || []
    }
  });
  
  const selectedCustomerId = watch('customer_id');
  
  const handleFormSubmit = (data) => {
    onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Cliente y Vehículo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="customer_id"
          control={control}
          rules={{ required: 'Cliente es requerido' }}
          render={({ field }) => (
            <Select
              label="Cliente"
              options={customers?.map(c => ({ value: c.id, label: c.name })) || []}
              value={field.value}
              onChange={field.onChange}
              error={errors.customer_id?.message}
              required
            />
          )}
        />
        
        <Controller
          name="vehicle_id"
          control={control}
          rules={{ required: 'Vehículo es requerido' }}
          render={({ field }) => (
            <Select
              label="Vehículo"
              options={vehicles?.filter(v => v.customer_id == selectedCustomerId)
                .map(v => ({ value: v.id, label: `${v.brand} ${v.model} - ${v.license_plate}` })) || []}
              value={field.value}
              onChange={field.onChange}
              error={errors.vehicle_id?.message}
              required
              disabled={!selectedCustomerId}
            />
          )}
        />
      </div>
      
      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="issue_date"
          control={control}
          rules={{ required: 'Fecha de emisión es requerida' }}
          render={({ field }) => (
            <DatePicker
              label="Fecha de Emisión"
              value={field.value}
              onChange={field.onChange}
              error={errors.issue_date?.message}
              required
            />
          )}
        />
        
        <Controller
          name="expiry_date"
          control={control}
          rules={{ required: 'Fecha de vencimiento es requerida' }}
          render={({ field }) => (
            <DatePicker
              label="Fecha de Vencimiento"
              value={field.value}
              onChange={field.onChange}
              error={errors.expiry_date?.message}
              required
              minDate={watch('issue_date')}
            />
          )}
        />
      </div>
      
      {/* Observaciones */}
      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <Input
            label="Observaciones"
            type="textarea"
            value={field.value}
            onChange={field.onChange}
            placeholder="Observaciones adicionales..."
            rows={3}
          />
        )}
      />
      
      {/* Items del Presupuesto */}
      <QuoteItemsList
        control={control}
        services={services}
        products={products}
        errors={errors}
      />
      
      {/* Botones */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          loading={loading}
        >
          {quote ? 'Actualizar' : 'Crear'} Presupuesto
        </Button>
      </div>
    </form>
  );
};

export default QuoteForm;
```

### **QuotesTable.jsx**
```jsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import QuoteStatusBadge from './QuoteStatusBadge';
import QuoteActions from './QuoteActions';
import Table from '@ui/Table';
import Button from '@ui/Button';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@icons';

const QuotesTable = ({ 
  quotes = [], 
  pagination = {},
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
  onView,
  onCreate,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };
  
  const columns = [
    {
      key: 'quote_number',
      label: 'Número',
      render: (quote) => (
        <span className="font-medium text-gray-900">
          {quote.quote_number}
        </span>
      )
    },
    {
      key: 'customer',
      label: 'Cliente',
      render: (quote) => (
        <div>
          <div className="font-medium text-gray-900">{quote.customer.name}</div>
          <div className="text-sm text-gray-500">{quote.customer.phone}</div>
        </div>
      )
    },
    {
      key: 'vehicle',
      label: 'Vehículo',
      render: (quote) => (
        <div>
          <div className="font-medium text-gray-900">
            {quote.vehicle.brand} {quote.vehicle.model}
          </div>
          <div className="text-sm text-gray-500">{quote.vehicle.license_plate}</div>
        </div>
      )
    },
    {
      key: 'dates',
      label: 'Fechas',
      render: (quote) => (
        <div className="text-sm">
          <div>Emisión: {format(new Date(quote.issue_date), 'dd/MM/yyyy', { locale: es })}</div>
          <div>Vencimiento: {format(new Date(quote.expiry_date), 'dd/MM/yyyy', { locale: es })}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (quote) => <QuoteStatusBadge status={quote.status} />
    },
    {
      key: 'total_amount',
      label: 'Total',
      render: (quote) => (
        <span className="font-medium text-gray-900">
          ${quote.total_amount.toLocaleString('es-AR')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (quote) => (
        <QuoteActions
          quote={quote}
          onEdit={() => onEdit(quote)}
          onDelete={() => onDelete(quote)}
          onView={() => onView(quote)}
        />
      )
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Presupuestos</h3>
            <p className="text-sm text-gray-500">
              Gestiona las cotizaciones para tus clientes
            </p>
          </div>
          
          <Button onClick={onCreate} className="flex items-center space-x-2">
            <PlusIcon className="w-4 h-4" />
            <span>Nuevo Presupuesto</span>
          </Button>
        </div>
      </div>
      
      {/* Search */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="max-w-md">
          <Input
            placeholder="Buscar presupuestos..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Table */}
      <Table
        columns={columns}
        data={quotes}
        loading={loading}
        emptyMessage="No hay presupuestos para mostrar"
      />
      
      {/* Pagination */}
      {pagination && Object.keys(pagination).length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            pagination={pagination}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default QuotesTable;
```

### **QuoteStatusBadge.jsx**
```jsx
import React from 'react';

const QuoteStatusBadge = ({ status }) => {
  const statusConfig = {
    draft: {
      label: 'Borrador',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    sent: {
      label: 'Enviado',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    approved: {
      label: 'Aprobado',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    rejected: {
      label: 'Rechazado',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    expired: {
      label: 'Vencido',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    converted: {
      label: 'Convertido',
      className: 'bg-purple-100 text-purple-800 border-purple-200'
    }
  };
  
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
};

export default QuoteStatusBadge;
```

### **QuoteItemsList.jsx**
```jsx
import React from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { PlusIcon, TrashIcon } from '@icons';
import Button from '@ui/Button';
import Input from '@ui/Input';
import Select from '@ui/Select';

const QuoteItemsList = ({ control, services, products, errors }) => {
  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'quote_services'
  });
  
  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
    control,
    name: 'quote_products'
  });
  
  const addService = () => {
    appendService({
      service_id: '',
      quantity: 1,
      unit_price: 0
    });
  };
  
  const addProduct = () => {
    appendProduct({
      product_id: '',
      quantity: 1,
      unit_price: 0
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Servicios */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Servicios</h4>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addService}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Agregar Servicio
          </Button>
        </div>
        
        <div className="space-y-3">
          {serviceFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-5">
                <Controller
                  name={`quote_services.${index}.service_id`}
                  control={control}
                  rules={{ required: 'Servicio es requerido' }}
                  render={({ field: serviceField }) => (
                    <Select
                      label="Servicio"
                      options={services?.map(s => ({ 
                        value: s.id, 
                        label: s.name,
                        price: s.base_price 
                      })) || []}
                      value={serviceField.value}
                      onChange={(value) => {
                        serviceField.onChange(value);
                        // Auto-fill unit price
                        const service = services?.find(s => s.id == value);
                        if (service) {
                          control.setValue(`quote_services.${index}.unit_price`, service.base_price);
                        }
                      }}
                      error={errors.quote_services?.[index]?.service_id?.message}
                      required
                    />
                  )}
                />
              </div>
              
              <div className="col-span-2">
                <Controller
                  name={`quote_services.${index}.quantity`}
                  control={control}
                  rules={{ required: 'Cantidad es requerida', min: 1 }}
                  render={({ field: quantityField }) => (
                    <Input
                      label="Cantidad"
                      type="number"
                      value={quantityField.value}
                      onChange={quantityField.onChange}
                      min="1"
                      error={errors.quote_services?.[index]?.quantity?.message}
                      required
                    />
                  )}
                />
              </div>
              
              <div className="col-span-2">
                <Controller
                  name={`quote_services.${index}.unit_price`}
                  control={control}
                  rules={{ required: 'Precio unitario es requerido', min: 0 }}
                  render={({ field: priceField }) => (
                    <Input
                      label="Precio Unit."
                      type="number"
                      value={priceField.value}
                      onChange={priceField.onChange}
                      min="0"
                      step="0.01"
                      error={errors.quote_services?.[index]?.unit_price?.message}
                      required
                    />
                  )}
                />
              </div>
              
              <div className="col-span-2">
                <Input
                  label="Total"
                  type="number"
                  value={(control.watch(`quote_services.${index}.quantity`) || 0) * 
                         (control.watch(`quote_services.${index}.unit_price`) || 0)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeService(index)}
                  className="w-full"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Productos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Productos</h4>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addProduct}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
        
        <div className="space-y-3">
          {productFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-5">
                <Controller
                  name={`quote_products.${index}.product_id`}
                  control={control}
                  rules={{ required: 'Producto es requerido' }}
                  render={({ field: productField }) => (
                    <Select
                      label="Producto"
                      options={products?.map(p => ({ 
                        value: p.id, 
                        label: p.name,
                        price: p.unit_price 
                      })) || []}
                      value={productField.value}
                      onChange={(value) => {
                        productField.onChange(value);
                        // Auto-fill unit price
                        const product = products?.find(p => p.id == value);
                        if (product) {
                          control.setValue(`quote_products.${index}.unit_price`, product.unit_price);
                        }
                      }}
                      error={errors.quote_products?.[index]?.product_id?.message}
                      required
                    />
                  )}
                />
              </div>
              
              <div className="col-span-2">
                <Controller
                  name={`quote_products.${index}.quantity`}
                  control={control}
                  rules={{ required: 'Cantidad es requerida', min: 1 }}
                  render={({ field: quantityField }) => (
                    <Input
                      label="Cantidad"
                      type="number"
                      value={quantityField.value}
                      onChange={quantityField.onChange}
                      min="1"
                      error={errors.quote_products?.[index]?.quantity?.message}
                      required
                    />
                  )}
                />
              </div>
              
              <div className="col-span-2">
                <Controller
                  name={`quote_products.${index}.unit_price`}
                  control={control}
                  rules={{ required: 'Precio unitario es requerido', min: 0 }}
                  render={({ field: priceField }) => (
                    <Input
                      label="Precio Unit."
                      type="number"
                      value={priceField.value}
                      onChange={priceField.onChange}
                      min="0"
                      step="0.01"
                      error={errors.quote_products?.[index]?.unit_price?.message}
                      required
                    />
                  )}
                />
              </div>
              
              <div className="col-span-2">
                <Input
                  label="Total"
                  type="number"
                  value={(control.watch(`quote_products.${index}.quantity`) || 0) * 
                         (control.watch(`quote_products.${index}.unit_price`) || 0)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeProduct(index)}
                  className="w-full"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuoteItemsList;
```

## 🪝 **Hooks Personalizados**

### **useQuotes.js**
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesService } from '@services/quotesService';
import { useToast } from '@hooks/useToast';

export const useQuotes = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['quotes', page, search],
    queryFn: () => quotesService.getQuotes(page, search),
    keepPreviousData: true
  });
};

export const useQuote = (id) => {
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: () => quotesService.getQuote(id),
    enabled: !!id
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: quotesService.createQuote,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['quotes']);
      showToast('Presupuesto creado exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al crear el presupuesto', 'error');
    }
  });
};

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }) => quotesService.updateQuote(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['quotes']);
      queryClient.invalidateQueries(['quotes', variables.id]);
      showToast('Presupuesto actualizado exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al actualizar el presupuesto', 'error');
    }
  });
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: quotesService.deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries(['quotes']);
      showToast('Presupuesto eliminado exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al eliminar el presupuesto', 'error');
    }
  });
};

export const useConvertQuote = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: quotesService.convertToServiceRecord,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['quotes']);
      queryClient.invalidateQueries(['service-records']);
      showToast('Presupuesto convertido a atención exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al convertir el presupuesto', 'error');
    }
  });
};
```

### **useQuoteServices.js**
```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { quoteServicesService } from '@services/quoteServicesService';
import { useToast } from '@hooks/useToast';

export const useCreateQuoteService = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: ({ quoteId, data }) => quoteServicesService.createQuoteService(quoteId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['quotes', variables.quoteId]);
      queryClient.invalidateQueries(['quotes']);
      showToast('Servicio agregado al presupuesto', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al agregar el servicio', 'error');
    }
  });
};

export const useUpdateQuoteService = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: ({ quoteId, serviceId, data }) => 
      quoteServicesService.updateQuoteService(quoteId, serviceId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['quotes', variables.quoteId]);
      queryClient.invalidateQueries(['quotes']);
      showToast('Servicio actualizado exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al actualizar el servicio', 'error');
    }
  });
};

export const useDeleteQuoteService = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: ({ quoteId, serviceId }) => 
      quoteServicesService.deleteQuoteService(quoteId, serviceId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['quotes', variables.quoteId]);
      queryClient.invalidateQueries(['quotes']);
      showToast('Servicio eliminado del presupuesto', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al eliminar el servicio', 'error');
    }
  });
};
```

## 🚀 **Servicios de API**

### **quotesService.js**
```javascript
import api from './api';

export const quotesService = {
  // Obtener lista de presupuestos
  getQuotes: async (page = 1, search = '') => {
    const params = new URLSearchParams();
    if (page > 1) params.append('page', page);
    if (search) params.append('search', search);
    
    const response = await api.get(`/quotes?${params.toString()}`);
    return response.data;
  },
  
  // Obtener presupuesto específico
  getQuote: async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },
  
  // Crear nuevo presupuesto
  createQuote: async (data) => {
    const response = await api.post('/quotes', data);
    return response.data;
  },
  
  // Actualizar presupuesto
  updateQuote: async (id, data) => {
    const response = await api.put(`/quotes/${id}`, data);
    return response.data;
  },
  
  // Eliminar presupuesto
  deleteQuote: async (id) => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  },
  
  // Convertir presupuesto a atención
  convertToServiceRecord: async (id) => {
    const response = await api.post(`/quotes/${id}/convert_to_service_record`);
    return response.data;
  },
  
  // Cambiar estado del presupuesto
  updateStatus: async (id, status) => {
    const response = await api.patch(`/quotes/${id}/status`, { status });
    return response.data;
  }
};
```

### **quoteServicesService.js**
```javascript
import api from './api';

export const quoteServicesService = {
  // Agregar servicio al presupuesto
  createQuoteService: async (quoteId, data) => {
    const response = await api.post(`/quotes/${quoteId}/quote_services`, data);
    return response.data;
  },
  
  // Actualizar servicio del presupuesto
  updateQuoteService: async (quoteId, serviceId, data) => {
    const response = await api.put(`/quotes/${quoteId}/quote_services/${serviceId}`, data);
    return response.data;
  },
  
  // Eliminar servicio del presupuesto
  deleteQuoteService: async (quoteId, serviceId) => {
    const response = await api.delete(`/quotes/${quoteId}/quote_services/${serviceId}`);
    return response.data;
  }
};
```

## 📱 **Página Principal de Presupuestos**

### **Quotes.jsx**
```jsx
import React, { useState } from 'react';
import { useQuotes, useDeleteQuote } from '@hooks/useQuotes';
import QuotesTable from '@components/features/quotes/QuotesTable';
import QuoteModal from '@components/features/quotes/QuoteModal';
import QuoteDetail from '@components/features/quotes/QuoteDetail';
import ConfirmModal from '@ui/ConfirmModal';
import { useToast } from '@hooks/useToast';

const Quotes = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  
  const { data: quotesData, isLoading } = useQuotes(currentPage, searchTerm);
  const deleteQuoteMutation = useDeleteQuote();
  const { showToast } = useToast();
  
  const quotes = quotesData?.data?.quotes || [];
  const pagination = quotesData?.data?.pagination || {};
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };
  
  const handleCreate = () => {
    setShowCreateModal(true);
  };
  
  const handleEdit = (quote) => {
    setSelectedQuote(quote);
    setShowEditModal(true);
  };
  
  const handleView = (quote) => {
    setSelectedQuote(quote);
    setShowDetailModal(true);
  };
  
  const handleDelete = (quote) => {
    setQuoteToDelete(quote);
  };
  
  const confirmDelete = async () => {
    try {
      await deleteQuoteMutation.mutateAsync(quoteToDelete.id);
      setQuoteToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  };
  
  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedQuote(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Presupuestos</h1>
          <p className="mt-2 text-gray-600">
            Gestiona las cotizaciones para tus clientes
          </p>
        </div>
        
        <QuotesTable
          quotes={quotes}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onCreate={handleCreate}
          loading={isLoading}
        />
      </div>
      
      {/* Modal de Creación */}
      {showCreateModal && (
        <QuoteModal
          onClose={handleModalClose}
          mode="create"
        />
      )}
      
      {/* Modal de Edición */}
      {showEditModal && selectedQuote && (
        <QuoteModal
          quote={selectedQuote}
          onClose={handleModalClose}
          mode="edit"
        />
      )}
      
      {/* Modal de Detalle */}
      {showDetailModal && selectedQuote && (
        <QuoteDetail
          quote={selectedQuote}
          onClose={handleModalClose}
        />
      )}
      
      {/* Modal de Confirmación de Eliminación */}
      {quoteToDelete && (
        <ConfirmModal
          title="Eliminar Presupuesto"
          message={`¿Estás seguro de que quieres eliminar el presupuesto ${quoteToDelete.quote_number}?`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setQuoteToDelete(null)}
          variant="danger"
        />
      )}
    </div>
  );
};

export default Quotes;
```

## 🎨 **Estilos y UI Components**

### **Tailwind CSS Classes Utilizadas**
```css
/* Layout y Espaciado */
.min-h-screen, .max-w-7xl, .mx-auto, .py-6, .px-4, .mb-6, .mt-2
.space-y-6, .space-y-3, .space-y-4, .gap-3, .gap-4

/* Grid y Flexbox */
.grid, .grid-cols-1, .grid-cols-12, .md:grid-cols-2
.flex, .items-center, .justify-between, .justify-end

/* Colores */
.bg-white, .bg-gray-50, .bg-gray-100, .bg-blue-100, .bg-green-100
.text-gray-900, .text-gray-500, .text-blue-800, .text-green-800

/* Bordes y Sombras */
.rounded-lg, .shadow, .border, .border-gray-200, .border-b, .border-t

/* Tipografía */
.text-lg, .text-sm, .text-xs, .font-medium, .font-bold

/* Estados */
.disabled, .readOnly, .loading, .error
```

## 🔧 **Configuración y Variables de Entorno**

### **Variables de Entorno del Frontend**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Lubricentro

# Quote Configuration
VITE_QUOTE_DEFAULT_EXPIRY_DAYS=30
VITE_QUOTE_MAX_ITEMS=50
VITE_QUOTE_NUMBER_PREFIX=Q
```

### **Configuración de Vite**
```javascript
// vite.config.js
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@icons': path.resolve(__dirname, './src/icons'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
});
```

## 🧪 **Testing Strategy**

### **Component Testing con Vitest**
```javascript
// test/components/features/quotes/QuotesTable.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuotesTable from '@components/features/quotes/QuotesTable';

describe('QuotesTable', () => {
  const mockQuotes = [
    {
      id: 1,
      quote_number: 'Q2025-0001',
      customer: { name: 'Juan Pérez', phone: '123-456-7890' },
      vehicle: { brand: 'Toyota', model: 'Corolla', license_plate: 'ABC123' },
      issue_date: '2025-12-01',
      expiry_date: '2025-12-31',
      status: 'draft',
      total_amount: 150.00
    }
  ];
  
  it('renders quotes table correctly', () => {
    render(
      <QuotesTable
        quotes={mockQuotes}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onView={vi.fn()}
        onCreate={vi.fn()}
      />
    );
    
    expect(screen.getByText('Presupuestos')).toBeInTheDocument();
    expect(screen.getByText('Q2025-0001')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });
  
  it('calls onCreate when new quote button is clicked', () => {
    const onCreate = vi.fn();
    
    render(
      <QuotesTable
        quotes={mockQuotes}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onView={vi.fn()}
        onCreate={onCreate}
      />
    );
    
    fireEvent.click(screen.getByText('Nuevo Presupuesto'));
    expect(onCreate).toHaveBeenCalled();
  });
});
```

## 📱 **Responsive Design**

### **Breakpoints y Adaptaciones**
```css
/* Mobile First Approach */
.grid-cols-1          /* Base: 1 columna */
.md:grid-cols-2       /* 768px+: 2 columnas */
.lg:grid-cols-12      /* 1024px+: 12 columnas */

/* Espaciado Responsive */
.px-4                 /* Base: 1rem */
.sm:px-6              /* 640px+: 1.5rem */
.lg:px-8              /* 1024px+: 2rem */

/* Texto Responsive */
.text-lg              /* Base: 1.125rem */
.md:text-3xl          /* 768px+: 1.875rem */
```

## 🚀 **Deployment y Build**

### **Scripts de Build**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### **Optimizaciones de Producción**
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          quotes: ['./src/components/features/quotes']
        }
      }
    }
  }
});
```

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0 - Sistema de Presupuestos Frontend implementado
**Estado**: ✅ COMPLETADO - Frontend funcional

