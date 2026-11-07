import { screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithProviders } from '@/test/utils'
import ItemSearchInput from '@components/features/budgets/ItemSearchInput'

vi.mock('@services/productsService', () => ({ useProducts: vi.fn() }))
vi.mock('@services/servicesService', () => ({ useServices: vi.fn() }))

import { useProducts } from '@services/productsService'
import { useServices } from '@services/servicesService'

const mockProducts = [
  { id: 1, name: 'Aceite 10W40', unit_price: '10000.0', iva_rate: '21.0', stock: 5 },
  { id: 2, name: 'Neumático 175', unit_price: '4000.0', iva_rate: '10.5', stock: 0 },
]
const mockServices = [{ id: 9, name: 'Cambio de aceite', base_price: '15000.0' }]

const withResults = ({ products = mockProducts, services = mockServices, isLoading = false } = {}) => {
  useProducts.mockReturnValue({ data: { data: { products } }, isLoading })
  useServices.mockReturnValue({ data: { data: { services } }, isLoading })
}

const getInput = () => screen.getByRole('combobox', { name: 'Artículo o descripción' })

const typeAndWait = (text) => {
  fireEvent.change(getInput(), { target: { value: text } })
  act(() => { vi.advanceTimersByTime(300) })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  useProducts.mockReturnValue({ data: null, isLoading: false })
  useServices.mockReturnValue({ data: null, isLoading: false })
})

afterEach(() => vi.useRealTimers())

describe('ItemSearchInput', () => {
  describe('renderizado', () => {
    it('muestra el placeholder y el valor inicial', () => {
      renderWithProviders(<ItemSearchInput value="Aceite" />)
      expect(getInput()).toHaveValue('Aceite')
      expect(getInput()).toHaveAttribute('placeholder', 'Buscar producto o servicio...')
    })

    it('muestra el botón de limpiar solo con texto', () => {
      const { rerender } = renderWithProviders(<ItemSearchInput value="" />)
      expect(screen.queryByRole('button', { name: 'Limpiar' })).toBeNull()
      rerender(<ItemSearchInput value="Aceite" />)
      expect(screen.getByRole('button', { name: 'Limpiar' })).toBeInTheDocument()
    })
  })

  describe('edición', () => {
    it('avisa el texto libre', () => {
      const onChange = vi.fn()
      renderWithProviders(<ItemSearchInput value="" onChange={onChange} />)
      fireEvent.change(getInput(), { target: { value: 'aceite' } })
      expect(onChange).toHaveBeenCalledWith('aceite')
    })

    it('al limpiar borra solo la descripción', () => {
      const onChange = vi.fn()
      const onSelect = vi.fn()
      renderWithProviders(<ItemSearchInput value="Aceite" onChange={onChange} onSelect={onSelect} />)
      fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }))
      expect(onChange).toHaveBeenCalledWith('')
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('Enter nunca envía el formulario', () => {
      const onSubmit = vi.fn((e) => e.preventDefault())
      renderWithProviders(<form onSubmit={onSubmit}><ItemSearchInput value="" /></form>)
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
      getInput().dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
    })
  })

  describe('resultados', () => {
    it('muestra "Buscando..." mientras carga', () => {
      withResults({ products: [], services: [], isLoading: true })
      renderWithProviders(<ItemSearchInput value="" />)
      typeAndWait('ace')
      expect(screen.getByText('Buscando...')).toBeInTheDocument()
    })

    it('muestra "Sin resultados" si no hay coincidencias', () => {
      withResults({ products: [], services: [] })
      renderWithProviders(<ItemSearchInput value="" />)
      typeAndWait('zzz')
      expect(screen.getByText('Sin resultados')).toBeInTheDocument()
    })

    it('muestra un error si falla la búsqueda', () => {
      useProducts.mockReturnValue({ data: null, isLoading: false, isError: true })
      useServices.mockReturnValue({ data: null, isLoading: false, isError: true })
      renderWithProviders(<ItemSearchInput value="" />)
      typeAndWait('ace')
      expect(screen.getByText('No se pudo buscar. Probá de nuevo.')).toBeInTheDocument()
    })

    it('muestra los resultados que llegan primero', () => {
      useProducts.mockReturnValue({ data: { data: { products: mockProducts } }, isLoading: false })
      useServices.mockReturnValue({ data: null, isLoading: true })
      renderWithProviders(<ItemSearchInput value="" />)
      typeAndWait('a')
      expect(screen.getByRole('option', { name: /Aceite 10W40/ })).toBeInTheDocument()
    })

    it('muestra precio neto + IVA = final y el stock', () => {
      withResults()
      renderWithProviders(<ItemSearchInput value="" />)
      typeAndWait('a')

      const aceite = screen.getByRole('option', { name: /Aceite 10W40/ })
      expect(aceite).toHaveTextContent('$10.000 + IVA 21% = $12.100')
      expect(aceite).toHaveTextContent('Stock: 5')

      const neumatico = screen.getByRole('option', { name: /Neumático 175/ })
      expect(neumatico).toHaveTextContent('IVA 10,5% = $4.420')
      expect(neumatico).toHaveTextContent('Sin stock')

      expect(screen.getByRole('option', { name: /Cambio de aceite/ })).toHaveTextContent('precio final')
    })
  })

  describe('selección', () => {
    it('un producto devuelve su precio neto, alícuota y stock', () => {
      withResults()
      const onSelect = vi.fn()
      renderWithProviders(<ItemSearchInput value="" onSelect={onSelect} />)
      typeAndWait('neu')
      fireEvent.mouseDown(screen.getByRole('option', { name: /Neumático 175/ }))
      expect(onSelect).toHaveBeenCalledWith({ description: 'Neumático 175', unit_price: 4000, iva_rate: 10.5, stock: 0 })
    })

    it('un servicio queda sin IVA', () => {
      withResults()
      const onSelect = vi.fn()
      renderWithProviders(<ItemSearchInput value="" onSelect={onSelect} />)
      typeAndWait('cam')
      fireEvent.mouseDown(screen.getByRole('option', { name: /Cambio de aceite/ }))
      expect(onSelect).toHaveBeenCalledWith({ description: 'Cambio de aceite', unit_price: 15000, iva_rate: null, stock: null })
    })

    it('un producto sin alícuota usa 21% y precio 0 si no es numérico', () => {
      withResults({ products: [{ id: 3, name: 'Item raro', unit_price: null }], services: [] })
      const onSelect = vi.fn()
      renderWithProviders(<ItemSearchInput value="" onSelect={onSelect} />)
      typeAndWait('item')
      fireEvent.mouseDown(screen.getByRole('option', { name: /Item raro/ }))
      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ unit_price: 0, iva_rate: 21 }))
    })
  })

  describe('teclado', () => {
    it('↓ ↓ Enter elige el segundo resultado', () => {
      withResults()
      const onSelect = vi.fn()
      renderWithProviders(<ItemSearchInput value="" onSelect={onSelect} />)
      typeAndWait('a')

      fireEvent.keyDown(getInput(), { key: 'ArrowDown' })
      fireEvent.keyDown(getInput(), { key: 'ArrowDown' })
      expect(getInput()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: /Neumático/ }).id)

      fireEvent.keyDown(getInput(), { key: 'Enter' })
      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ description: 'Neumático 175' }))
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('↑ desde el inicio va al último', () => {
      withResults()
      renderWithProviders(<ItemSearchInput value="" />)
      typeAndWait('a')
      fireEvent.keyDown(getInput(), { key: 'ArrowUp' })
      expect(screen.getByRole('option', { name: /Cambio de aceite/ })).toHaveAttribute('aria-selected', 'true')
    })

    it('Esc cierra la lista', () => {
      withResults()
      renderWithProviders(<ItemSearchInput value="" />)
      typeAndWait('a')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      fireEvent.keyDown(getInput(), { key: 'Escape' })
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('Enter sin opción activa no elige nada', () => {
      withResults()
      const onSelect = vi.fn()
      renderWithProviders(<ItemSearchInput value="" onSelect={onSelect} />)
      typeAndWait('a')
      fireEvent.keyDown(getInput(), { key: 'Enter' })
      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  it('cierra la lista al hacer click afuera', () => {
    withResults()
    renderWithProviders(
      <div>
        <ItemSearchInput value="" />
        <div data-testid="outside">Fuera</div>
      </div>,
    )
    typeAndWait('a')
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})
