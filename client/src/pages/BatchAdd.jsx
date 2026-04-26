import { useState, useEffect } from 'react'
import { Plus, X, Search, Package, AlertTriangle, CheckCircle, PackagePlus } from 'lucide-react'
import { getItems, getCategories, batchAddItems } from '../lib/api'

function BatchAdd() {
  const createEmptyRow = () => ({
    id: Date.now() + Math.random(),
    mode: 'existing',
    selectedProduct: null,
    quantity: 0,
    updatePrice: false,
    newPrice: null,
    newName: '',
    newCategoryId: null,
    newUnit: 'pcs',
    price: 0
  })

  const [batchItems, setBatchItems] = useState([createEmptyRow()])
  const [categories, setCategories] = useState([])
  const [searchCache, setSearchCache] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const addProductRow = () => {
    setBatchItems([...batchItems, createEmptyRow()])
  }

  const removeProductRow = (id) => {
    if (batchItems.length === 1) {
      setErrors({ ...errors, general: 'Minimal harus ada 1 produk' })
      return
    }
    setBatchItems(batchItems.filter(item => item.id !== id))
    setErrors({ ...errors, [id]: null })
  }

  const handleProductSearch = async (index, query) => {
    if (!query || query.length < 2) {
      setSearchCache({ ...searchCache, [index]: [] })
      return
    }

    try {
      const items = await getItems({ search: query })
      setSearchCache({ ...searchCache, [index]: items })
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleSelectExisting = (index, product) => {
    const updated = [...batchItems]
    updated[index] = {
      ...updated[index],
      mode: 'existing',
      selectedProduct: product,
      quantity: updated[index].quantity || 0,
      updatePrice: false,
      newPrice: null
    }
    setBatchItems(updated)
    setSearchCache({ ...searchCache, [index]: [] })
  }

  const handleCreateNew = (index, field, value) => {
    const updated = [...batchItems]
    updated[index] = {
      ...updated[index],
      mode: 'new',
      [field]: value
    }
    setBatchItems(updated)
  }

  const handleQuantityChange = (index, value) => {
    const numValue = parseInt(value) || 0
    const updated = [...batchItems]
    updated[index] = {
      ...updated[index],
      quantity: numValue > 0 ? numValue : 0
    }
    setBatchItems(updated)
  }

  const handlePriceUpdateToggle = (index, checked) => {
    const updated = [...batchItems]
    updated[index] = {
      ...updated[index],
      updatePrice: checked,
      newPrice: checked ? updated[index].selectedProduct?.price || 0 : null
    }
    setBatchItems(updated)
  }

  const handleNewPriceChange = (index, value) => {
    const numValue = parseFloat(value) || 0
    const updated = [...batchItems]
    updated[index] = {
      ...updated[index],
      newPrice: numValue
    }
    setBatchItems(updated)
  }

  const checkDuplicate = (currentId, productId) => {
    return batchItems.some(item =>
      item.id !== currentId &&
      item.mode === 'existing' &&
      item.selectedProduct?.id === productId
    )
  }

  const calculateTotals = () => {
    let totalQuantity = 0
    let totalValue = 0

    batchItems.forEach(item => {
      if (item.quantity > 0) {
        totalQuantity += item.quantity
        if (item.mode === 'existing') {
          const price = item.updatePrice ? item.newPrice : item.selectedProduct?.price || 0
          totalValue += item.quantity * price
        } else {
          totalValue += item.quantity * (item.price || 0)
        }
      }
    })

    return { totalQuantity, totalValue }
  }

  const validateBatch = () => {
    const newErrors = {}
    let isValid = true

    batchItems.forEach((item, index) => {
      if (item.quantity <= 0) {
        newErrors[item.id] = 'Quantity harus lebih dari 0'
        isValid = false
      } else if (item.mode === 'existing' && !item.selectedProduct) {
        newErrors[item.id] = 'Pilih produk yang ada'
        isValid = false
      } else if (item.mode === 'new') {
        if (!item.newName?.trim()) {
          newErrors[item.id] = 'Nama produk harus diisi'
          isValid = false
        } else if (!item.newCategoryId) {
          newErrors[item.id] = 'Kategori harus dipilih'
          isValid = false
        } else if (!item.price || item.price <= 0) {
          newErrors[item.id] = 'Harga harus lebih dari 0'
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const submitBatch = async () => {
    if (!validateBatch()) return

    setLoading(true)
    setSuccess(null)

    try {
      const batchData = {
        items: batchItems.map(item => ({
          mode: item.mode,
          ...(item.mode === 'existing' ? {
            itemId: item.selectedProduct.id,
            quantity: item.quantity,
            updatePrice: item.updatePrice,
            newPrice: item.updatePrice ? item.newPrice : null
          } : {
            name: item.newName.trim(),
            categoryId: parseInt(item.newCategoryId),
            unit: item.newUnit,
            quantity: item.quantity,
            price: item.price
          })
        }))
      }

      const result = await batchAddItems(batchData)

      setSuccess({
        message: `${result.processed} produk berhasil diproses`,
        updated: result.updated || 0,
        created: result.created || 0,
        totalValue: result.totalValue
      })
      setBatchItems([createEmptyRow()])
      setErrors({})
    } catch (error) {
      console.error('Batch submit failed:', error)
      setErrors({ general: error.message || 'Gagal memproses batch' })
    } finally {
      setLoading(false)
    }
  }

  const { totalQuantity, totalValue } = calculateTotals()

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Tambah Batch Produk</h1>
        <p className="text-slate-500">Masukkan produk dari pembelian distributor</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Batch berhasil diproses!</h3>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p>{success.message}</p>
            <p>• {success.updated} produk diperbarui (quantity ditambahkan)</p>
            <p>• {success.created} produk baru dibuat</p>
            <p className="mt-2 font-medium">Total Nilai: Rp {success.totalValue?.toLocaleString('id-ID')}</p>
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

      {/* Product List */}
      <div className="space-y-4 mb-6">
        {batchItems.map((item, index) => (
          <ProductRow
            key={item.id}
            item={item}
            index={index}
            categories={categories}
            searchCache={searchCache}
            onSelectExisting={handleSelectExisting}
            onSearch={handleProductSearch}
            onCreateNew={handleCreateNew}
            onQuantityChange={handleQuantityChange}
            onPriceUpdateToggle={handlePriceUpdateToggle}
            onNewPriceChange={handleNewPriceChange}
            onRemove={() => removeProductRow(item.id)}
            error={errors[item.id]}
            checkDuplicate={checkDuplicate}
          />
        ))}
      </div>

      {/* Add Product Button */}
      <button
        onClick={addProductRow}
        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 mb-6"
      >
        <Plus className="w-5 h-5" />
        <span>Tambah Produk Lain</span>
      </button>

      {/* Batch Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6">
        <h3 className="font-semibold text-slate-800 mb-3">Ringkasan Batch</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Total Produk</p>
            <p className="text-lg font-bold text-slate-800">{batchItems.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Quantity</p>
            <p className="text-lg font-bold text-slate-800">{totalQuantity} unit</p>
          </div>
          <div className="col-span-2 pt-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">Total Nilai Pembelian</p>
            <p className="text-xl font-bold text-slate-800">Rp {totalValue.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={submitBatch}
        disabled={loading}
        className="w-full py-3 bg-farm-500 text-white rounded-lg hover:bg-farm-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Memproses...</span>
          </>
        ) : (
          <>
            <PackagePlus className="w-5 h-5" />
            <span>Simpan Batch</span>
          </>
        )}
      </button>
    </div>
  )
}

// ProductRow Component
function ProductRow({
  item,
  index,
  categories,
  searchCache,
  onSelectExisting,
  onSearch,
  onCreateNew,
  onQuantityChange,
  onPriceUpdateToggle,
  onNewPriceChange,
  onRemove,
  error,
  checkDuplicate
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(index, query)
    setShowSearchResults(true)
  }

  const handleSelectProduct = (product) => {
    if (checkDuplicate(item.id, product.id)) {
      if (!window.confirm(`"${product.name}" sudah ada di batch. Tetap tambahkan?`)) {
        setShowSearchResults(false)
        return
      }
    }
    onSelectExisting(index, product)
    setSearchQuery(product.name)
    setShowSearchResults(false)
  }

  const isDuplicate = item.mode === 'existing' && item.selectedProduct && checkDuplicate(item.id, item.selectedProduct.id)

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${error ? 'border-red-300' : 'border-slate-200'} p-4`}>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600">Produk {index + 1}</span>
        <button
          onClick={onRemove}
          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Duplicate Warning */}
      {isDuplicate && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <span className="text-xs text-yellow-700">Produk ini sudah ada di batch</span>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => {
            setSearchQuery('')
            setShowSearchResults(false)
            onCreateNew(index, 'mode', 'existing')
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            item.mode === 'existing'
              ? 'bg-farm-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Pilih Produk
        </button>
        <button
          onClick={() => {
            setSearchQuery('')
            setShowSearchResults(false)
            onCreateNew(index, 'mode', 'new')
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            item.mode === 'new'
              ? 'bg-farm-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Produk Baru
        </button>
      </div>

      {/* Existing Product Mode */}
      {item.mode === 'existing' && (
        <div className="space-y-3">
          {/* Product Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Cari produk..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
            />
            {showSearchResults && searchCache[index]?.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                {searchCache[index].map(product => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category_name}</p>
                    </div>
                    <span className="text-sm text-slate-600">Rp {product.price?.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Product Info */}
          {item.selectedProduct && (
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-800">{item.selectedProduct.name}</span>
                <span className="text-sm text-slate-600">
                  Rp {item.selectedProduct.price?.toLocaleString('id-ID')} / {item.selectedProduct.unit}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="bg-slate-200 px-2 py-0.5 rounded">{item.selectedProduct.category_name}</span>
                <span>{item.selectedProduct.unit}</span>
              </div>
            </div>
          )}

          {/* Quantity and Price Update */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={item.quantity || ''}
                onChange={(e) => onQuantityChange(index, e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Satuan</label>
              <input
                type="text"
                value={item.selectedProduct?.unit || 'pcs'}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
              />
            </div>
          </div>

          {/* Price Update Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`update-price-${item.id}`}
              checked={item.updatePrice}
              onChange={(e) => onPriceUpdateToggle(index, e.target.checked)}
              className="w-4 h-4 text-farm-500 rounded focus:ring-farm-500"
            />
            <label
              htmlFor={`update-price-${item.id}`}
              className="text-sm text-slate-600 cursor-pointer"
            >
              Update harga menjadi:
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={item.newPrice || ''}
              onChange={(e) => onNewPriceChange(index, e.target.value)}
              disabled={!item.updatePrice}
              placeholder="Rp 0"
              className={`flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                item.updatePrice
                  ? 'border-farm-500 focus:ring-farm-500'
                  : 'border-slate-200 bg-slate-100'
              }`}
            />
          </div>
        </div>
      )}

      {/* New Product Mode */}
      {item.mode === 'new' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Nama Produk *</label>
              <input
                type="text"
                value={item.newName}
                onChange={(e) => onCreateNew(index, 'newName', e.target.value)}
                placeholder="Nama produk"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Kategori *</label>
              <select
                value={item.newCategoryId || ''}
                onChange={(e) => onCreateNew(index, 'newCategoryId', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 bg-white"
              >
                <option value="">Pilih kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Satuan</label>
              <select
                value={item.newUnit}
                onChange={(e) => onCreateNew(index, 'newUnit', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500 bg-white"
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
              <label className="block text-xs text-slate-500 mb-1">Harga (Rp) *</label>
              <input
                type="number"
                min="0"
                step="100"
                value={item.price || ''}
                onChange={(e) => onCreateNew(index, 'price', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                step="1"
                value={item.quantity || ''}
                onChange={(e) => onQuantityChange(index, e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  )
}

export default BatchAdd
