import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Crear un QueryClient para testing
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
    mutations: {
      retry: false,
    },
  },
})

// Wrapper completo para componentes que usan React Query y Router
const AllTheProviders = ({ children }) => {
  const testQueryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Función para renderizar componentes con todos los providers
const renderWithProviders = (ui, options = {}) => {
  const { route = '/' } = options
  
  // Simular la ruta si se proporciona
  if (route !== '/') {
    window.history.pushState({}, 'Test page', route)
  }
  
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Mock de datos de ejemplo
const mockCustomers = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    telefono: '123456789',
    email: 'juan@example.com',
    direccion: 'Calle 123'
  },
  {
    id: 2,
    nombre: 'María García',
    telefono: '987654321',
    email: 'maria@example.com',
    direccion: 'Avenida 456'
  }
]

const mockVehicles = [
  {
    id: 1,
    marca: 'Toyota',
    modelo: 'Corolla',
    patente: 'ABC123',
    año: 2020,
    customer_id: 1
  },
  {
    id: 2,
    marca: 'Honda',
    modelo: 'Civic',
    patente: 'XYZ789',
    año: 2019,
    customer_id: 2
  }
]

// Mock de servicios de API
const mockApiService = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

// Helper para limpiar mocks
const clearAllMocks = () => {
  mockApiService.get.mockClear()
  mockApiService.post.mockClear()
  mockApiService.put.mockClear()
  mockApiService.delete.mockClear()
}

export {
  renderWithProviders,
  createTestQueryClient,
  mockCustomers,
  mockVehicles,
  mockApiService,
  clearAllMocks,
} 