import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { getItems } from '../lib/api'

function SaleProductModal({ isOpen, onClose, onAdd }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(0)
  const [unitPrice, setUnitPrice] = useState(0)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
    setSelectedProduct(null)
    setQuantity(0)
    setUnitPrice(0)
    setErrors({})
  }

  const handleSearchChange = async (e) => {
    const query = e.target.value
    setSearchQuery(query)
    setSelectedProduct(null)
    setUnitPrice(0)

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
    setSelectedProduct(product)
    setSearchQuery(product.name)
    setUnitPrice(product.selling_price)
    setShowResults(false)
    setErrors({})
  }

  const validate = () => {
    const newErrors = {}

    if (!selectedProduct) {
      newErrors.product = 'Pilih produk terlebih dahulu'
    }
    if (!quantity || quantity <= 0) {
      newErrors.quantity = 'Quantity harus lebih dari 0'
    }
    if (selectedProduct && quantity > selectedProduct.quantity) {
      newErrors.quantity = `Stok tidak cukup (tersedia: ${selectedProduct.quantity})`
    }
    if (!unitPrice || unitPrice <= 0) {
      newErrors.unitPrice = 'Harga harus lebih dari 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) return

    onAdd({
      item_id: selectedProduct.id,
      name: selectedProduct.name,
      unit: selectedProduct.unit,
      quantity: parseInt(quantity),
      unit_price: parseFloat(unitPrice),
      purchase_price: selectedProduct.purchase_price,
      stock: selectedProduct.quantity
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
          <div className="relative">
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
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.category_name} • Stok: {product.quantity} {product.unit}</p>
                      </div>
                      <span className="text-sm text-farm-600 font-medium">
                        Rp {product.selling_price?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.product && <p className="text-xs text-red-600 mt-1">{errors.product}</p>}
          </div>

          {/* Selected Product Info */}
          {selectedProduct && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-800">{selectedProduct.name}</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">{selectedProduct.category_name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500">Stok:</span>
                  <span className="ml-1 text-slate-700 font-medium">{selectedProduct.quantity} {selectedProduct.unit}</span>
                </div>
                <div>
                  <span className="text-slate-500">Harga Jual:</span>
                  <span className="ml-1 text-slate-700 font-medium">Rp {selectedProduct.selling_price?.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quantity and Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                max={selectedProduct?.quantity || 1}
                value={quantity || ''}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 ${
                  errors.quantity ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual (Rp) *</label>
              <input
                type="number"
                min="1"
                step="100"
                value={unitPrice || ''}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 ${
                  errors.unitPrice ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {errors.unitPrice && <p className="text-xs text-red-600 mt-1">{errors.unitPrice}</p>}
            </div>
          </div>

          {/* Subtotal Preview */}
          {selectedProduct && quantity > 0 && unitPrice > 0 && (
            <div className="bg-farm-50 rounded-lg p-3 border border-farm-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-farm-700">Subtotal:</span>
                <span className="text-lg font-bold text-farm-700">
                  Rp {(quantity * unitPrice)?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}

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

export default SaleProductModal
