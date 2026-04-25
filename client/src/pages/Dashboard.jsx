import { useState, useEffect } from 'react'
import { Package, AlertTriangle, XCircle, Tags, DollarSign, TrendingUp } from 'lucide-react'
import { getStats } from '../lib/api'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center h-full min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-farm-500"></div>
      </div>
    )
  }

  // Format currency for mobile (compact) and desktop (full)
  const formatCurrency = (value) => {
    const num = value || 0
    const formatted = num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    
    // For mobile, use compact format if value is very large
    if (num >= 1000000000000) {
      return `Rp ${(num / 1000000000000).toFixed(1)}T`
    } else if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(1)}Milyar`
    } else if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1)}Jt`
    }
    
    return `Rp ${formatted}`
  }

  const statCards = [
    {
      label: 'Total Barang',
      value: stats?.totalItems || 0,
      displayValue: stats?.totalItems || 0,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Total Nilai',
      value: stats?.totalValue || 0,
      displayValue: formatCurrency(stats?.totalValue),
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Stok Rendah',
      value: stats?.lowStock || 0,
      displayValue: stats?.lowStock || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Stok Habis',
      value: stats?.outOfStock || 0,
      displayValue: stats?.outOfStock || 0,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Kategori',
      value: stats?.categories || 0,
      displayValue: stats?.categories || 0,
      icon: Tags,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dasbor</h1>
        <p className="text-slate-500">Ringkasan inventaris pertanian Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
        {statCards.map(({ label, value, displayValue, icon: Icon, color, textColor, bgColor }) => (
          <div key={label} className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className={`${bgColor} p-2.5 md:p-3 rounded-lg`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${textColor}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <p 
              className="text-lg md:text-2xl font-bold text-slate-800 truncate"
              title={typeof value === 'number' && label === 'Total Nilai' ? `Rp ${value.toLocaleString('id-ID')}` : ''}
            >
              {displayValue}
            </p>
            <p className="text-xs md:text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 md:mb-8">
        <div className="p-4 md:p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Inventaris per Kategori</h2>
        </div>
        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {stats?.categoryBreakdown?.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3 md:gap-4">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-1">
                    <span className="font-medium text-slate-700 truncate">{cat.name}</span>
                    <span className="text-xs md:text-sm text-slate-500 whitespace-nowrap">
                      {cat.item_count} barang ({cat.total_quantity || 0} unit)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: cat.color,
                        width: `${Math.min(100, (cat.item_count / stats.totalItems) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(stats?.lowStock > 0 || stats?.outOfStock > 0) && (
        <div className="mt-4 md:mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-amber-600 flex-shrink-0" />
            <h2 className="text-base md:text-lg font-semibold text-amber-800">Peringatan Stok</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            {stats?.lowStock > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></span>
                <span className="text-sm md:text-base text-amber-800">
                  <strong>{stats.lowStock}</strong> barang stok rendah
                </span>
              </div>
            )}
            {stats?.outOfStock > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></span>
                <span className="text-sm md:text-base text-amber-800">
                  <strong>{stats.outOfStock}</strong> barang stok habis
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
