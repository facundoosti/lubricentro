import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Pagination from '@ui/Pagination'

const defaultProps = {
  currentPage: 1,
  totalPages: 5,
  onPageChange: vi.fn(),
  totalItems: 50,
  itemsPerPage: 10,
}

describe('Pagination', () => {
  it('returns null when totalPages <= 1', () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={1} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when totalPages is 0', () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows info text with correct item range', () => {
    render(<Pagination {...defaultProps} currentPage={2} />)
    expect(screen.getByText('Mostrando 11 a 20 de 50 resultados')).toBeInTheDocument()
  })

  it('shows info text on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />)
    expect(screen.getByText('Mostrando 1 a 10 de 50 resultados')).toBeInTheDocument()
  })

  it('clamps endItem to totalItems on last page', () => {
    // 47 items, 10 per page → last page shows "41 a 47"
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={vi.fn()}
        totalItems={47}
        itemsPerPage={10}
      />
    )
    expect(screen.getByText('Mostrando 41 a 47 de 47 resultados')).toBeInTheDocument()
  })

  it('prev button is disabled on page 1', () => {
    render(<Pagination {...defaultProps} currentPage={1} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()
  })

  it('next button is disabled on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[buttons.length - 1]).toBeDisabled()
  })

  it('calls onPageChange with currentPage - 1 when prev is clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with currentPage + 1 when next is clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[buttons.length - 1])
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('calls onPageChange with the clicked page number', () => {
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} currentPage={1} totalPages={5} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('renders all page numbers when totalPages <= 5', () => {
    render(<Pagination {...defaultProps} totalPages={5} />)
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument()
    }
  })

  it('shows ellipsis when totalPages > 5 and currentPage is near start', () => {
    render(<Pagination {...defaultProps} currentPage={2} totalPages={10} totalItems={100} />)
    expect(screen.getAllByText('...').length).toBeGreaterThan(0)
  })

  it('shows ellipsis when totalPages > 5 and currentPage is near end', () => {
    render(
      <Pagination
        currentPage={9}
        totalPages={10}
        onPageChange={vi.fn()}
        totalItems={100}
        itemsPerPage={10}
      />
    )
    expect(screen.getAllByText('...').length).toBeGreaterThan(0)
  })

  it('applies custom className', () => {
    const { container } = render(<Pagination {...defaultProps} className="mt-4" />)
    expect(container.firstChild).toHaveClass('mt-4')
  })
})
