import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Items from '../pages/Items'

// Mock the API
vi.mock('../lib/api', () => ({
  getItems: vi.fn(),
  getCategories: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn()
}))

import { getItems, getCategories, createItem, updateItem, deleteItem } from '../lib/api'

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Items', () => {
  const mockItems = [
    {
      id: 1,
      name: 'Tomato Seeds',
      quantity: 150,
      purchase_price: 20.00,
      selling_price: 25.00,
      unit: 'pack',
      category_id: 1,
      category_name: 'Seeds',
      category_color: '#22c55e',
      low_stock_threshold: 20,
      description: 'High-yield tomato seeds'
    },
    {
      id: 2,
      name: 'Lettuce Seeds',
      quantity: 5,
      purchase_price: 15.00,
      selling_price: 20.00,
      unit: 'pack',
      category_id: 1,
      category_name: 'Seeds',
      category_color: '#22c55e',
      low_stock_threshold: 30,
      description: 'Fresh green lettuce seeds'
    }
  ]

  const mockCategories = [
    { id: 1, name: 'Seeds', color: '#22c55e' },
    { id: 2, name: 'Fertilizers', color: '#84cc16' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    getItems.mockResolvedValue(mockItems)
    getCategories.mockResolvedValue(mockCategories)
  })

  it('should render loading state initially', () => {
    getItems.mockImplementation(() => new Promise(() => {}))

    renderWithRouter(<Items />)

    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should render items list', async () => {
    renderWithRouter(<Items />)

    await waitFor(() => {
      expect(screen.getByText('Barang Inventaris')).toBeInTheDocument()
    })

    expect(screen.getAllByText('Tomato Seeds').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Lettuce Seeds').length).toBeGreaterThan(0)
  })

  it('should render category filter', async () => {
    renderWithRouter(<Items />)

    await waitFor(() => {
      expect(screen.getByText('Semua Kategori')).toBeInTheDocument()
    })

    // There are multiple comboboxes, get the first one
    const comboboxes = screen.getAllByRole('combobox')
    expect(comboboxes[0]).toBeInTheDocument()
  })

  it('should filter items by search', async () => {
    renderWithRouter(<Items />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Cari barang...')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Cari barang...')
    fireEvent.change(searchInput, { target: { value: 'Tomato' } })

    expect(getItems).toHaveBeenCalledWith(expect.objectContaining({
      search: 'Tomato'
    }))
  })

  it('should show Tambah Barang button', async () => {
    renderWithRouter(<Items />)

    await waitFor(() => {
      expect(screen.getByText('Tambah Barang')).toBeInTheDocument()
    })
  })

  it('should open modal when Tambah Barang is clicked', async () => {
    renderWithRouter(<Items />)

    await waitFor(() => {
      expect(screen.getByText('Tambah Barang')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Tambah Barang'))

    await waitFor(() => {
      expect(screen.getByText('Tambah Barang Baru')).toBeInTheDocument()
    })
  })

  it('should render empty state when no items', async () => {
    getItems.mockResolvedValue([])

    renderWithRouter(<Items />)

    await waitFor(() => {
      expect(screen.getByText('Tidak ada barang ditemukan')).toBeInTheDocument()
    })
  })

  it('should display correct stock status badges', async () => {
    renderWithRouter(<Items />)

    await waitFor(() => {
      expect(screen.getByText('Ada Stok')).toBeInTheDocument()
    })

    // Check for Low Stock status (Lettuce has 5 quantity with threshold 30)
    // Use getAllByText since there may be multiple (filter option + badge)
    const lowStockElements = screen.getAllByText('Stok Rendah')
    expect(lowStockElements.length).toBeGreaterThan(0)
  })

  it('should handle API error', async () => {
    getItems.mockRejectedValue(new Error('Failed to load'))
    getCategories.mockResolvedValue([])

    renderWithRouter(<Items />)

    await waitFor(() => {
      expect(screen.getByText('Barang Inventaris')).toBeInTheDocument()
    })
  })
})
