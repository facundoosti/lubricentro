/* eslint-disable react-refresh/only-export-components */
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

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

export { renderWithProviders }
