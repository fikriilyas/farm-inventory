import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, Package } from 'lucide-react'
import { getItems, getCategories, createItem, updateItem, deleteItem } from '../lib/api'

function Items() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    purchase_price: 0,
    selling_price: 0,
    unit: 'pcs',
    category_id: '',
    low_stock_threshold: 10,
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [search, categoryFilter, stockFilter])

  const loadData = async () => {
    try {
      const [itemsData, categoriesData] = await Promise.all([
        getItems({ search, category: categoryFilter, stock: stockFilter }),
        getCategories()
      ])
      setItems(itemsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...formData, category_id: parseInt(formData.category_id) }
      if (editingItem) {
        await updateItem(editingItem.id, data)
      } else {
        await createItem(data)
      }
      setShowModal(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Failed to save item:', error)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      quantity: item.quantity,
      purchase_price: item.purchase_price,
      selling_price: item.selling_price,
      unit: item.unit,
      category_id: item.category_id,
      low_stock_threshold: item.low_stock_threshold,
      description: item.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      try {
        await deleteItem(id)
        loadData()
      } catch (error) {
        console.error('Failed to delete item:', error)
      }
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      quantity: 0,
      purchase_price: 0,
      selling_price: 0,
      unit: 'pcs',
      category_id: '',
      low_stock_threshold: 10,
      description: ''
    })
  }

  const getStockStatus = (item) => {
    if (item.quantity === 0) return { label: 'Stok Habis', color: 'bg-red-100 text-red-700' }
    if (item.quantity <= item.low_stock_threshold) return { label: 'Stok Rendah', color: 'bg-yellow-100 text-yellow-700' }
    return { label: 'Ada Stok', color: 'bg-green-100 text-green-700' }
  }

  const formatPrice = (price) => {
    const num = parseFloat(price) || 0
    return num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Barang Inventaris</h1>
          <p className="text-slate-500">Kelola inventaris toko pertanian Anda</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-farm-500 text-white rounded-lg hover:bg-farm-600 transition-colors touch-manipulation"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Tambah Barang</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari barang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 bg-white"
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 bg-white"
          >
            <option value="">Semua Status Stok</option>
            <option value="in">Ada Stok</option>
            <option value="low">Stok Rendah</option>
            <option value="out">Stok Habis</option>
          </select>
        </div>
      </div>

      {/* Items Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-500"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Tidak ada barang ditemukan</p>
          </div>
        ) : (
          <>
            {/* Mobile: Vertical Grid List */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => {
                const status = getStockStatus(item)
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
                  >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 truncate">{item.name}</h3>
                          {item.description && (
                            <p className="text-xs text-slate-500 truncate">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-slate-500 hover:text-farm-600 hover:bg-farm-50 rounded-lg transition-colors touch-manipulation"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${item.category_color}20`, color: item.category_color }}
                        >
                          {item.category_name}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                          {item.quantity <= item.low_stock_threshold && item.quantity > 0 && (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          )}
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-slate-500">Jumlah:</span>
                          <span className="font-medium text-slate-800 ml-1">{item.quantity} {item.unit}</span>
                        </div>
                        <div className="text-right">
                          <div>
                            <span className="text-slate-500">Beli:</span>
                            <span className="font-medium text-slate-600 ml-1">Rp {formatPrice(item.purchase_price)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Jual:</span>
                            <span className="font-medium text-slate-800 ml-1">Rp {formatPrice(item.selling_price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-slate-600">Barang</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600">Kategori</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600">Jumlah</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600">Harga Beli</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600">Harga Jual</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600">Status</th>
                    <th className="text-right px-6 py-4 font-medium text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item) => {
                    const status = getStockStatus(item)
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-800">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-slate-500">{item.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: `${item.category_color}20`, color: item.category_color }}
                          >
                            {item.category_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-800">{item.quantity} {item.unit}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600">Rp {formatPrice(item.purchase_price)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-800 font-medium">Rp {formatPrice(item.selling_price)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {item.quantity <= item.low_stock_threshold && item.quantity > 0 && (
                              <AlertTriangle className="w-3 h-3 mr-1" />
                            )}
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-slate-500 hover:text-farm-600 hover:bg-farm-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl w-full md:max-w-lg max-h-[90vh] overflow-auto animate-slide-up md:animate-none">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-lg md:text-xl font-semibold text-slate-800">
                {editingItem ? 'Edit Barang' : 'Tambah Barang Baru'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    pattern="[0-9]*"
                    value={formData.quantity === 0 ? '' : formData.quantity}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') {
                        setFormData({ ...formData, quantity: 0 })
                      } else {
                        const num = parseInt(value.replace(/\D/g, ''))
                        setFormData({ ...formData, quantity: isNaN(num) ? 0 : num })
                      }
                    }}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Satuan</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 bg-white"
                  >
                  <option value="pcs">Pcs</option>
                  <option value="kg">Kg</option>
                  <option value="pack">Paket</option>
                  <option value="bag">Kantong</option>
                  <option value="bottle">Botol</option>
                  <option value="bunch">Ikatan</option>
                  <option value="roll">Gulung</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Harga Beli (Rp)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    pattern="[0-9]*\.?[0-9]*"
                    value={formData.purchase_price === 0 ? '' : formData.purchase_price}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') {
                        setFormData({ ...formData, purchase_price: 0 })
                      } else {
                        const num = parseFloat(value.replace(/[^\d.]/g, ''))
                        setFormData({ ...formData, purchase_price: isNaN(num) ? 0 : num })
                      }
                    }}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    pattern="[0-9]*\.?[0-9]*"
                    value={formData.selling_price === 0 ? '' : formData.selling_price}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') {
                        setFormData({ ...formData, selling_price: 0 })
                      } else {
                        const num = parseFloat(value.replace(/[^\d.]/g, ''))
                        setFormData({ ...formData, selling_price: isNaN(num) ? 0 : num })
                      }
                    }}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Peringatan Stok Rendah</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  pattern="[0-9]*"
                  value={formData.low_stock_threshold === 0 ? '' : formData.low_stock_threshold}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '') {
                      setFormData({ ...formData, low_stock_threshold: 0 })
                    } else {
                      const num = parseInt(value.replace(/\D/g, ''))
                      setFormData({ ...formData, low_stock_threshold: isNaN(num) ? 0 : num })
                    }
                  }}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 bg-white"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors touch-manipulation"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-farm-500 text-white rounded-lg hover:bg-farm-600 transition-colors touch-manipulation"
                >
                  {editingItem ? 'Perbarui' : 'Tambah'} Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Items
