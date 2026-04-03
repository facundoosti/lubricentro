import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCrudPage } from '@hooks/useCrudPage'

describe('useCrudPage', () => {
  describe('initial state', () => {
    it('starts with page 1', () => {
      const { result } = renderHook(() => useCrudPage())
      expect(result.current.currentPage).toBe(1)
    })

    it('starts with empty searchTerm', () => {
      const { result } = renderHook(() => useCrudPage())
      expect(result.current.searchTerm).toBe('')
    })

    it('uses defaultPerPage of 10', () => {
      const { result } = renderHook(() => useCrudPage())
      expect(result.current.perPage).toBe(10)
    })

    it('accepts custom defaultPerPage', () => {
      const { result } = renderHook(() => useCrudPage({ defaultPerPage: 25 }))
      expect(result.current.perPage).toBe(25)
    })

    it('starts with modal closed', () => {
      const { result } = renderHook(() => useCrudPage())
      expect(result.current.isModalOpen).toBe(false)
    })

    it('starts with no selectedItem', () => {
      const { result } = renderHook(() => useCrudPage())
      expect(result.current.selectedItem).toBeNull()
    })

    it('starts with delete modal closed', () => {
      const { result } = renderHook(() => useCrudPage())
      expect(result.current.isDeleteModalOpen).toBe(false)
    })

    it('starts with no itemToDelete', () => {
      const { result } = renderHook(() => useCrudPage())
      expect(result.current.itemToDelete).toBeNull()
    })
  })

  describe('handlePageChange', () => {
    it('updates currentPage', () => {
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handlePageChange(3))
      expect(result.current.currentPage).toBe(3)
    })
  })

  describe('handleSearch', () => {
    it('updates searchTerm', () => {
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handleSearch('toyota'))
      expect(result.current.searchTerm).toBe('toyota')
    })

    it('resets currentPage to 1', () => {
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handlePageChange(4))
      act(() => result.current.handleSearch('honda'))
      expect(result.current.currentPage).toBe(1)
    })
  })

  describe('handleCreate', () => {
    it('opens modal', () => {
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handleCreate())
      expect(result.current.isModalOpen).toBe(true)
    })

    it('clears selectedItem', () => {
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handleEdit({ id: 1 }))
      act(() => result.current.handleCreate())
      expect(result.current.selectedItem).toBeNull()
    })
  })

  describe('handleEdit', () => {
    it('opens modal', () => {
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handleEdit({ id: 5, name: 'Toyota' }))
      expect(result.current.isModalOpen).toBe(true)
    })

    it('sets selectedItem to the passed item', () => {
      const item = { id: 5, name: 'Toyota' }
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handleEdit(item))
      expect(result.current.selectedItem).toEqual(item)
    })
  })

  describe('handleModalClose', () => {
    it('closes modal', () => {
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handleCreate())
      act(() => result.current.handleModalClose())
      expect(result.current.isModalOpen).toBe(false)
    })

    it('clears selectedItem', () => {
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handleEdit({ id: 1 }))
      act(() => result.current.handleModalClose())
      expect(result.current.selectedItem).toBeNull()
    })
  })

  describe('handleDeleteRequest', () => {
    it('opens delete modal', () => {
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handleDeleteRequest({ id: 2 }))
      expect(result.current.isDeleteModalOpen).toBe(true)
    })

    it('sets itemToDelete to the passed item', () => {
      const item = { id: 2, name: 'Honda' }
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handleDeleteRequest(item))
      expect(result.current.itemToDelete).toEqual(item)
    })
  })

  describe('handleDeleteModalClose', () => {
    it('closes delete modal', () => {
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handleDeleteRequest({ id: 2 }))
      act(() => result.current.handleDeleteModalClose())
      expect(result.current.isDeleteModalOpen).toBe(false)
    })

    it('clears itemToDelete', () => {
      const { result } = renderHook(() => useCrudPage())
      act(() => result.current.handleDeleteRequest({ id: 2 }))
      act(() => result.current.handleDeleteModalClose())
      expect(result.current.itemToDelete).toBeNull()
    })
  })
})
