import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { getItems, getCategories } from '../lib/api'

function AddProductModal({ isOpen, onClose, onAdd }) {
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    quantity: 0,
    unit: 'pcs',
    purchase_price: 0,
    update_price: false
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      loadCategories()
      resetForm()
    }
  }, [isOpen])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const resetForm = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
    setFormData({
      name: '',
      category_id: '',
      quantity: 0,
      unit: 'pcs',
      purchase_price: 0,
      update_price: false
    })
    setErrors({})
  }

  const handleSearchChange = async (e) => {
    const query = e.target.value
    setSearchQuery(query)
    setFormData({ ...formData, name: query })

    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    try {
      const items = await getItems({ search: query })
      setSearchResults(items)
      setShowResults(true)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleSelectProduct = (product) => {
    setFormData({
      ...formData,
      name: product.name,
      category_id: product.category_id,
      unit: product.unit || 'pcs',
      purchase_price: product.purchase_price,
      update_price: false
    })
    setSearchQuery(product.name)
    setShowResults(false)
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Nama produk harus diisi'
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Kategori harus dipilih'
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity harus lebih dari 0'
    }
    if (!formData.purchase_price || formData.purchase_price <= 0) {
      newErrors.purchase_price = 'Harga harus lebih dari 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) return

    onAdd({
      name: formData.name.trim(),
      category_id: parseInt(formData.category_id),
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      purchase_price: parseFloat(formData.purchase_price),
      update_price: formData.update_price
    })

    resetForm()
    onClose()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-lg md:text-xl font-semibold text-slate-800">Tambah Produk</h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {/* Product Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cari Produk</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="Ketik untuk mencari..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category_name}</p>
                    </div>
                    <span className="text-sm text-slate-600">
                      Rp {product.purchase_price?.toLocaleString('id-ID')} / {product.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 text-center">- atau isi manual -</p>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nama produk"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 ${
                errors.name ? 'border-red-300' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori *</label>
            <select
              value={formData.category_id}
              onChange={(e) => handleInputChange('category_id', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 bg-white ${
                errors.category_id ? 'border-red-300' : 'border-slate-200'
              }`}
            >
              <option value="">Pilih Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-xs text-red-600 mt-1">{errors.category_id}</p>}
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 ${
                  errors.quantity ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Satuan</label>
              <select
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
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

          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Harga Beli (Rp) *</label>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.purchase_price || ''}
              onChange={(e) => handleInputChange('purchase_price', e.target.value)}
              placeholder="0"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 ${
                errors.purchase_price ? 'border-red-300' : 'border-slate-200'
              }`}
            />
            {errors.purchase_price && <p className="text-xs text-red-600 mt-1">{errors.purchase_price}</p>}
          </div>

          {/* Update Price Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="update_price_batch"
              checked={formData.update_price}
              onChange={(e) => handleInputChange('update_price', e.target.checked)}
              className="w-4 h-4 text-farm-500 rounded focus:ring-farm-500"
            />
            <label
              htmlFor="update_price_batch"
              className="text-sm text-slate-600 cursor-pointer"
            >
              Update harga produk yang sudah ada
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-farm-500 text-white rounded-lg hover:bg-farm-600 transition-colors"
            >
              Tambah
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProductModal
