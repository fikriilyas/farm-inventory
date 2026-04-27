import { useState, useEffect } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Eye, X, ShoppingCart } from 'lucide-react'
import { getSales, getSaleDetail } from '../lib/api'

function DailySales() {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [sales, setSales] = useState([])
  const [summary, setSummary] = useState({ transaction_count: 0, total_omset: 0, total_profit: 0 })
  const [selectedSale, setSelectedSale] = useState(null)
  const [detailItems, setDetailItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    loadSales()
  }, [selectedDate])

  const loadSales = async () => {
    setLoading(true)
    try {
      const data = await getSales(selectedDate)
      setSales(data.sales)
      setSummary(data.summary)
    } catch (error) {
      console.error('Failed to load sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (saleId) => {
    setDetailLoading(true)
    try {
      const data = await getSaleDetail(saleId)
      setSelectedSale(data)
      setDetailItems(data.items)
    } catch (error) {
      console.error('Failed to load detail:', error)
    } finally {
      setDetailLoading(false)
    }
  }

  const changeDate = (days) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('id-ID')
  }

  const isToday = selectedDate === today

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Laporan Penjualan Harian</h1>
        <p className="text-slate-500">Lihat rekap transaksi penjualan per hari</p>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-farm-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 bg-white"
            />
          </div>

          <button
            onClick={() => changeDate(1)}
            disabled={isToday}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-sm text-slate-500 mt-2">{formatDate(selectedDate)}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-xs md:text-sm text-slate-500 mb-1">Transaksi</p>
          <p className="text-xl md:text-2xl font-bold text-slate-800">{summary.transaction_count}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-xs md:text-sm text-slate-500 mb-1">Omset</p>
          <p className="text-lg md:text-xl font-bold text-farm-600 truncate" title={`Rp ${formatCurrency(summary.total_omset)}`}>
            Rp {formatCurrency(summary.total_omset)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-xs md:text-sm text-slate-500 mb-1">Profit</p>
          <p className="text-lg md:text-xl font-bold text-green-600 truncate" title={`Rp ${formatCurrency(summary.total_profit)}`}>
            Rp {formatCurrency(summary.total_profit)}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-farm-500"></div>
        </div>
      ) : sales.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Tidak ada transaksi</p>
          <p className="text-xs text-slate-400 mt-1">Belum ada penjualan pada tanggal ini</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Waktu</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Items</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Profit</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{formatTime(sale.created_at)}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{sale.item_count} barang</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-farm-600 font-medium">Rp {formatCurrency(sale.total_amount)}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-green-600">Rp {formatCurrency(sale.total_profit)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewDetail(sale.id)}
                        className="p-2 text-slate-400 hover:text-farm-600 hover:bg-farm-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 sticky top-0 bg-white">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-slate-800">Detail Transaksi</h2>
                <p className="text-sm text-slate-500">
                  {new Date(selectedSale.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}, {formatTime(selectedSale.created_at)}
                </p>
              </div>
              <button
                onClick={() => { setSelectedSale(null); setDetailItems([]) }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-500"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {detailItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{item.item_name}</p>
                        <p className="text-xs text-slate-500">
                          {item.quantity} × Rp {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-slate-800 ml-4">
                        Rp {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Total Items:</span>
                      <span className="font-medium text-slate-800">{detailItems.length} barang</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Total Omset:</span>
                      <span className="font-medium text-farm-600">Rp {formatCurrency(selectedSale.total_amount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Profit:</span>
                      <span className="font-medium text-green-600">Rp {formatCurrency(selectedSale.total_profit)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 border-t border-slate-200">
              <button
                onClick={() => { setSelectedSale(null); setDetailItems([]) }}
                className="w-full py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DailySales
