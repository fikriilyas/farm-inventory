import { useState } from 'react'
import { Plus, X, Trash2, Edit2, Check, Package, CheckCircle, AlertTriangle, ShoppingCart, CalendarDays, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { createSale, getSales, getSaleDetail } from '../lib/api'
import SaleProductModal from '../components/SaleProductModal'

function Sales() {
  // Sale tab state
  const [activeTab, setActiveTab] = useState('sale')
  const [cartItems, setCartItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [saleResult, setSaleResult] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editQuantity, setEditQuantity] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // History tab state
  const today = new Date().toISOString().split('T')[0]
  const [historyDate, setHistoryDate] = useState(today)
  const [historySales, setHistorySales] = useState([])
  const [historySummary, setHistorySummary] = useState({ transaction_count: 0, total_omset: 0, total_profit: 0 })
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [detailItems, setDetailItems] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)

  // ============ SALE TAB FUNCTIONS ============

  const addToCart = (productData) => {
    const existingIndex = cartItems.findIndex(item => item.item_id === productData.item_id)

    if (existingIndex >= 0) {
      const existing = cartItems[existingIndex]
      const newQuantity = existing.quantity + productData.quantity

      if (newQuantity > productData.stock) {
        setErrors({
          general: `Stok ${productData.name} tidak cukup. Total yang diminta: ${newQuantity}, Tersedia: ${productData.stock}`
        })
        return
      }

      const updated = [...cartItems]
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQuantity,
        subtotal: newQuantity * updated[existingIndex].unit_price,
        profit: newQuantity * (updated[existingIndex].unit_price - updated[existingIndex].purchase_price)
      }
      setCartItems(updated)
    } else {
      if (productData.quantity > productData.stock) {
        setErrors({
          general: `Stok ${productData.name} tidak cukup. Diminta: ${productData.quantity}, Tersedia: ${productData.stock}`
        })
        return
      }

      const newItem = {
        tempId: Date.now() + Math.random(),
        item_id: productData.item_id,
        name: productData.name,
        unit: productData.unit,
        quantity: productData.quantity,
        unit_price: productData.unit_price,
        purchase_price: productData.purchase_price,
        subtotal: productData.quantity * productData.unit_price,
        profit: productData.quantity * (productData.unit_price - productData.purchase_price)
      }
      setCartItems([...cartItems, newItem])
    }
    setErrors({})
  }

  const removeFromCart = (tempId) => {
    setCartItems(cartItems.filter(item => item.tempId !== tempId))
  }

  const startEdit = (item) => {
    setEditingId(item.tempId)
    setEditQuantity(item.quantity)
  }

  const saveEdit = (tempId) => {
    const newQty = parseInt(editQuantity) || 0
    if (newQty <= 0) {
      removeFromCart(tempId)
    } else {
      setCartItems(cartItems.map(item =>
        item.tempId === tempId
          ? {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unit_price,
              profit: newQty * (item.unit_price - item.purchase_price)
            }
          : item
      ))
    }
    setEditingId(null)
    setEditQuantity(0)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditQuantity(0)
  }

  const calculateTotals = () => {
    let totalItems = 0
    let totalQuantity = 0
    let totalAmount = 0
    let totalProfit = 0

    cartItems.forEach(item => {
      totalItems++
      totalQuantity += item.quantity
      totalAmount += item.subtotal
      totalProfit += item.profit
    })

    return { totalItems, totalQuantity, totalAmount, totalProfit }
  }

  const handleOpenSummary = () => {
    if (cartItems.length === 0) {
      setErrors({ general: 'Tambahkan minimal 1 produk' })
      return
    }
    setShowSummary(true)
  }

  const confirmSale = async () => {
    setLoading(true)
    setErrors({})

    try {
      const saleData = {
        items: cartItems.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      }

      const result = await createSale(saleData)

      setSaleResult({
        total_amount: result.total_amount,
        total_profit: result.total_profit,
        item_count: result.items.length
      })

      setCartItems([])
      setShowSummary(false)
    } catch (error) {
      console.error('Sale failed:', error)
      setErrors({ general: error.message || 'Gagal memproses penjualan' })
    } finally {
      setLoading(false)
    }
  }

  const resetForNewSale = () => {
    setSaleResult(null)
    setErrors({})
  }

  // ============ HISTORY TAB FUNCTIONS ============

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const data = await getSales(historyDate)
      setHistorySales(data.sales)
      setHistorySummary(data.summary)
    } catch (error) {
      console.error('Failed to load sales:', error)
    } finally {
      setHistoryLoading(false)
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
    const date = new Date(historyDate)
    date.setDate(date.getDate() + days)
    setHistoryDate(date.toISOString().split('T')[0])
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('id-ID')
  }

  const isToday = historyDate === today

  // ============ RENDER ============

  const { totalItems, totalQuantity, totalAmount, totalProfit } = calculateTotals()

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Penjualan</h1>
        <p className="text-slate-500">Catat penjualan produk</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-4 md:mb-6">
        <button
          onClick={() => setActiveTab('sale')}
          className={`flex-1 md:flex-none py-2 px-3 md:px-4 rounded-md text-sm font-medium transition-colors touch-manipulation ${
            activeTab === 'sale'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShoppingCart className="w-4 h-4 inline mr-1.5" />
          Penjualan
        </button>
        <button
          onClick={() => { setActiveTab('history'); loadHistory() }}
          className={`flex-1 md:flex-none py-2 px-3 md:px-4 rounded-md text-sm font-medium transition-colors touch-manipulation ${
            activeTab === 'history'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarDays className="w-4 h-4 inline mr-1.5" />
          Riwayat
        </button>
      </div>

      {/* ============= SALE TAB ============= */}
      {activeTab === 'sale' ? (
        <>
          {/* Success Message */}
          {saleResult && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Penjualan berhasil diproses!</h3>
              </div>
              <div className="text-sm text-green-700 space-y-1 mb-4">
                <p>{saleResult.item_count} produk terjual</p>
                <p>Total Penjualan: Rp {saleResult.total_amount?.toLocaleString('id-ID')}</p>
                <p>Total Profit: Rp {saleResult.total_profit?.toLocaleString('id-ID')}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetForNewSale}
                  className="px-4 py-2 bg-farm-500 text-white rounded-lg hover:bg-farm-600 transition-colors"
                >
                  Tambah Penjualan Lagi
                </button>
                <button
                  onClick={() => window.location.href = '/items'}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Lihat Barang
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Cart Items */}
          {cartItems.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Produk</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Quantity</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Harga</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Subtotal</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {cartItems.map((item) => (
                      <tr key={item.tempId} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500 md:hidden">
                            {item.quantity} {item.unit} × Rp {item.unit_price?.toLocaleString('id-ID')}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {editingId === item.tempId ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(e.target.value.replace(/\D/g, ''))}
                                className="w-20 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-farm-500"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEdit(item.tempId)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-800">{item.quantity}</span>
                              <span className="text-slate-500 text-sm">{item.unit}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-slate-600">Rp {item.unit_price?.toLocaleString('id-ID')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-800">
                            Rp {item.subtotal?.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {editingId !== item.tempId && (
                              <button
                                onClick={() => startEdit(item)}
                                className="p-2 text-slate-400 hover:text-farm-600 hover:bg-farm-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => removeFromCart(item.tempId)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : !saleResult && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center mb-6">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Belum ada produk ditambahkan</p>
            </div>
          )}

          {/* Add Product Button */}
          {!saleResult && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 mb-6"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Produk</span>
            </button>
          )}

          {/* Summary */}
          {cartItems.length > 0 && !saleResult && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6">
              <h3 className="font-semibold text-slate-800 mb-3">Ringkasan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Total Produk</p>
                  <p className="text-lg font-bold text-slate-800">{totalItems}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Quantity</p>
                  <p className="text-lg font-bold text-slate-800">{totalQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Penjualan</p>
                  <p className="text-lg font-bold text-farm-600">Rp {totalAmount.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Profit</p>
                  <p className="text-lg font-bold text-green-600">Rp {totalProfit.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {cartItems.length > 0 && !saleResult && (
            <button
              onClick={handleOpenSummary}
              className="w-full py-3 bg-farm-500 text-white rounded-lg hover:bg-farm-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Proses Penjualan</span>
            </button>
          )}

          {/* Product Modal */}
          <SaleProductModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onAdd={addToCart}
          />

          {/* Summary Modal */}
          {showSummary && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-auto">
                <div className="p-4 md:p-6 border-b border-slate-200">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-800">Konfirmasi Penjualan</h2>
                </div>

                <div className="p-4 md:p-6 space-y-4">
                  <div className="bg-slate-50 rounded-lg p-3 max-h-48 overflow-auto">
                    {cartItems.map(item => (
                      <div key={item.tempId} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-b-0">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {item.quantity} × Rp {item.unit_price?.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          Rp {item.subtotal?.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Total Produk:</span>
                      <span className="font-medium text-slate-800">{totalItems}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Total Quantity:</span>
                      <span className="font-medium text-slate-800">{totalQuantity}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-farm-700 font-semibold">Total Penjualan:</span>
                      <span className="text-lg font-bold text-farm-700">Rp {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 font-semibold">Total Profit:</span>
                      <span className="text-lg font-bold text-green-600">Rp {totalProfit.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 border-t border-slate-200 flex gap-3">
                  <button
                    onClick={() => setShowSummary(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmSale}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-farm-500 text-white rounded-lg hover:bg-farm-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <span>Konfirmasi & Simpan</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ============= HISTORY TAB ============= */
        <>
          {/* Date Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg touch-manipulation"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-farm-500 flex-shrink-0" />
                <input
                  type="date"
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                  max={today}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 bg-white w-full"
                />
              </div>

              <button
                onClick={() => changeDate(1)}
                disabled={isToday}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-slate-200">
              <p className="text-xs md:text-sm text-slate-500 mb-1">Transaksi</p>
              <p className="text-xl md:text-2xl font-bold text-slate-800">{historySummary.transaction_count}</p>
            </div>
            <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-slate-200">
              <p className="text-xs md:text-sm text-slate-500 mb-1">Omset</p>
              <p className="text-lg md:text-xl font-bold text-farm-600 truncate">Rp {formatCurrency(historySummary.total_omset)}</p>
            </div>
            <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-slate-200">
              <p className="text-xs md:text-sm text-slate-500 mb-1">Profit</p>
              <p className="text-lg md:text-xl font-bold text-green-600 truncate">Rp {formatCurrency(historySummary.total_profit)}</p>
            </div>
          </div>

          {/* Transaction List */}
          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-farm-500"></div>
            </div>
          ) : historySales.length === 0 ? (
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
                    {historySales.map((sale) => (
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
                            className="p-2 text-slate-400 hover:text-farm-600 hover:bg-farm-50 rounded-lg transition-colors touch-manipulation"
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
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg touch-manipulation"
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
                    className="w-full py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors touch-manipulation"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Sales
