import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Componente de ejemplo para testing
const ExampleComponent = () => {
  return (
    <div>
      <h1>Test Component</h1>
      <button>Click me</button>
    </div>
  )
}

// Wrapper para React Query
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})

const renderWithQueryClient = (component) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('Example Component', () => {
  it('renders without crashing', () => {
    renderWithQueryClient(<ExampleComponent />)
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('renders a button', () => {
    renderWithQueryClient(<ExampleComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('button has correct text', () => {
    renderWithQueryClient(<ExampleComponent />)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
}) 