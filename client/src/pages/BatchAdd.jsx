import { useState } from 'react'
import { Plus, X, Trash2, Edit2, Check, Package, CheckCircle, AlertTriangle } from 'lucide-react'
import { batchAddItems } from '../lib/api'
import AddProductModal from '../components/AddProductModal'

function BatchAdd() {
  const [batchItems, setBatchItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editQuantity, setEditQuantity] = useState(0)

  const addProductToBatch = (productData) => {
    const newItem = {
      tempId: Date.now() + Math.random(),
      name: productData.name,
      category_id: productData.category_id,
      quantity: productData.quantity,
      unit: productData.unit,
      purchase_price: productData.purchase_price,
      update_price: productData.update_price
    }
    setBatchItems([...batchItems, newItem])
  }

  const removeItem = (tempId) => {
    setBatchItems(batchItems.filter(item => item.tempId !== tempId))
  }

  const startEdit = (item) => {
    setEditingId(item.tempId)
    setEditQuantity(item.quantity)
  }

  const saveEdit = (tempId) => {
    setBatchItems(batchItems.map(item =>
      item.tempId === tempId
        ? { ...item, quantity: parseInt(editQuantity) || 0 }
        : item
    ))
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditQuantity(0)
  }

  const calculateTotals = () => {
    let totalQuantity = 0
    let totalValue = 0

    batchItems.forEach(item => {
      totalQuantity += item.quantity
      totalValue += item.quantity * item.purchase_price
    })

    return { totalQuantity, totalValue }
  }

  const validateBatch = () => {
    if (batchItems.length === 0) {
      setErrors({ general: 'Tambahkan minimal 1 produk' })
      return false
    }
    setErrors({})
    return true
  }

  const submitBatch = async () => {
    if (!validateBatch()) return

    setLoading(true)
    setSuccess(null)

    try {
      const result = await batchAddItems(batchItems)
      
      setSuccess({
        message: `${result.processed} produk berhasil diproses`,
        updated: result.updated || 0,
        created: result.created || 0,
        totalValue: result.totalValue
      })
      setBatchItems([])
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
        <p className="text-slate-500">Tambahkan produk dari pembelian distributor</p>
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

      {/* Batch Items List */}
      {batchItems.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Produk</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Kategori</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Quantity</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Harga</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Total</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {batchItems.map((item) => (
                  <tr key={item.tempId} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500 md:hidden">{item.unit}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{item.category_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.tempId ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
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
                      <span className="text-slate-600">Rp {item.purchase_price?.toLocaleString('id-ID')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">
                        Rp {(item.quantity * item.purchase_price)?.toLocaleString('id-ID')}
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
                          onClick={() => removeItem(item.tempId)}
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
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center mb-6">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Belum ada produk ditambahkan</p>
        </div>
      )}

      {/* Add Product Button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 mb-6"
      >
        <Plus className="w-5 h-5" />
        <span>Tambah Produk</span>
      </button>

      {/* Summary */}
      {batchItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-3">Ringkasan Batch</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-500">Total Produk</p>
              <p className="text-lg font-bold text-slate-800">{batchItems.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Quantity</p>
              <p className="text-lg font-bold text-slate-800">{totalQuantity} unit</p>
            </div>
            <div className="col-span-2 md:col-span-1 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
              <p className="text-sm text-slate-500">Total Nilai Pembelian</p>
              <p className="text-xl font-bold text-slate-800">Rp {totalValue.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {batchItems.length > 0 && (
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
            <span>Simpan Batch</span>
          )}
        </button>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addProductToBatch}
      />
    </div>
  )
}

export default BatchAdd
