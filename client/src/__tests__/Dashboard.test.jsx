import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'

// Mock the API
vi.mock('../lib/api', () => ({
  getStats: vi.fn()
}))

import { getStats } from '../lib/api'

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    getStats.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderWithRouter(<Dashboard />)

    // Should show loading spinner
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should render dashboard with stats', async () => {
    const mockStats = {
      totalItems: 50,
      totalValue: 15000.50,
      lowStock: 5,
      outOfStock: 2,
      categories: 7,
      categoryBreakdown: [
        { name: 'Seeds', color: '#22c55e', item_count: 10, total_quantity: 500 },
        { name: 'Fertilizers', color: '#84cc16', item_count: 8, total_quantity: 300 }
      ]
    }

    getStats.mockResolvedValue(mockStats)

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Dasbor')).toBeInTheDocument()
    })

    // Check stat cards are rendered
    expect(screen.getByText('Total Barang')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('Total Nilai')).toBeInTheDocument()
    expect(screen.getByText('Rp 15.000,50')).toBeInTheDocument()
    expect(screen.getByText('Stok Rendah')).toBeInTheDocument()
    expect(screen.getByText('Stok Habis')).toBeInTheDocument()
    expect(screen.getByText('Kategori')).toBeInTheDocument()
  })

  it('should render category breakdown', async () => {
    const mockStats = {
      totalItems: 10,
      totalValue: 1000,
      lowStock: 1,
      outOfStock: 0,
      categories: 2,
      categoryBreakdown: [
        { name: 'Seeds', color: '#22c55e', item_count: 5, total_quantity: 100 },
        { name: 'Fertilizers', color: '#84cc16', item_count: 5, total_quantity: 50 }
      ]
    }

    getStats.mockResolvedValue(mockStats)

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Inventaris per Kategori')).toBeInTheDocument()
    })

    expect(screen.getByText('Seeds')).toBeInTheDocument()
    expect(screen.getByText('Fertilizers')).toBeInTheDocument()
  })

  it('should show stock alerts when there are low stock items', async () => {
    const mockStats = {
      totalItems: 10,
      totalValue: 1000,
      lowStock: 3,
      outOfStock: 1,
      categories: 2,
      categoryBreakdown: []
    }

    getStats.mockResolvedValue(mockStats)

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Peringatan Stok')).toBeInTheDocument()
    })

    // Use getAllByText for elements that may appear multiple times
    const lowStockAlerts = screen.getAllByText(/barang stok rendah/)
    expect(lowStockAlerts.length).toBeGreaterThan(0)
    const outOfStockAlerts = screen.getAllByText(/barang stok habis/)
    expect(outOfStockAlerts.length).toBeGreaterThan(0)
  })

  it('should handle API error gracefully', async () => {
    getStats.mockRejectedValue(new Error('Failed to fetch'))

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      // Should still render even with error (shows 0 values)
      expect(screen.getByText('Dasbor')).toBeInTheDocument()
    })

    expect(screen.getByText('Total Barang')).toBeInTheDocument()
    // Use getAllByText and check at least one exists
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
  })
})
