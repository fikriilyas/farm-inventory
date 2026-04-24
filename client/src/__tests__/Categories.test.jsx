import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Categories from '../pages/Categories'

// Mock the API
vi.mock('../lib/api', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn()
}))

import { getCategories, createCategory } from '../lib/api'

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Categories', () => {
  const mockCategories = [
    { id: 1, name: 'Seeds', description: 'Various seeds for planting', color: '#22c55e' },
    { id: 2, name: 'Fertilizers', description: 'Soil enrichment products', color: '#84cc16' },
    { id: 3, name: 'Pesticides', description: 'Pest control products', color: '#ef4444' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    getCategories.mockImplementation(() => new Promise(() => {}))

    renderWithRouter(<Categories />)

    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should render categories list', async () => {
    getCategories.mockResolvedValue(mockCategories)

    renderWithRouter(<Categories />)

    await waitFor(() => {
      expect(screen.getByText('Kategori')).toBeInTheDocument()
    })

    expect(screen.getByText('Seeds')).toBeInTheDocument()
    expect(screen.getByText('Fertilizers')).toBeInTheDocument()
    expect(screen.getByText('Pesticides')).toBeInTheDocument()
  })

  it('should render category descriptions', async () => {
    getCategories.mockResolvedValue(mockCategories)

    renderWithRouter(<Categories />)

    await waitFor(() => {
      expect(screen.getByText('Various seeds for planting')).toBeInTheDocument()
    })
  })

  it('should show Tambah Kategori button', async () => {
    getCategories.mockResolvedValue(mockCategories)

    renderWithRouter(<Categories />)

    await waitFor(() => {
      expect(screen.getByText('Tambah Kategori')).toBeInTheDocument()
    })
  })

  it('should open modal when Tambah Kategori is clicked', async () => {
    getCategories.mockResolvedValue(mockCategories)

    renderWithRouter(<Categories />)

    await waitFor(() => {
      expect(screen.getByText('Tambah Kategori')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Tambah Kategori'))

    await waitFor(() => {
      expect(screen.getByText('Tambah Kategori Baru')).toBeInTheDocument()
    })
  })

  it('should have color picker in modal', async () => {
    getCategories.mockResolvedValue(mockCategories)

    renderWithRouter(<Categories />)

    await waitFor(() => {
      fireEvent.click(screen.getByText('Tambah Kategori'))
    })

    await waitFor(() => {
      expect(screen.getByText('Warna')).toBeInTheDocument()
    })
  })

  it('should render empty state when no categories', async () => {
    getCategories.mockResolvedValue([])

    renderWithRouter(<Categories />)

    await waitFor(() => {
      expect(screen.getByText('Tidak ada kategori ditemukan')).toBeInTheDocument()
    })
  })

  it('should create new category', async () => {
    getCategories
      .mockResolvedValueOnce(mockCategories)
      .mockResolvedValueOnce([...mockCategories, { id: 4, name: 'New Category', description: 'Test', color: '#ff0000' }])
    createCategory.mockResolvedValue({ id: 4, name: 'New Category', description: 'Test', color: '#ff0000' })

    renderWithRouter(<Categories />)

    await waitFor(() => {
      fireEvent.click(screen.getByText('Tambah Kategori'))
    })

    await waitFor(() => {
      expect(screen.getByText('Tambah Kategori Baru')).toBeInTheDocument()
    })

    // Fill form
    const nameInput = screen.getByPlaceholderText('mis., Benih, Pupuk')
    fireEvent.change(nameInput, { target: { value: 'New Category' } })

    // Get the submit button inside the form (second "Tambah Kategori" button)
    const submitButtons = screen.getAllByText('Tambah Kategori')
    fireEvent.click(submitButtons[1])

    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledWith({
        name: 'New Category',
        description: '',
        color: '#22c55e'
      })
    })
  })

  it('should handle API error', async () => {
    getCategories.mockRejectedValue(new Error('Failed to load'))

    renderWithRouter(<Categories />)

    await waitFor(() => {
      expect(screen.getByText('Kategori')).toBeInTheDocument()
    })
  })
})
