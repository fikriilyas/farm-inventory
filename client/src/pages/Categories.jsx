import { useState, useEffect } from 'react'
import { Plus, X, Tags, Package, Trash2 } from 'lucide-react'
import { getCategories, createCategory, deleteCategory } from '../lib/api'

const colorOptions = [
  '#22c55e', '#84cc16', '#ef4444', '#f59e0b', '#10b981',
  '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'
]

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#22c55e'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createCategory(formData)
      setShowModal(false)
      setFormData({ name: '', description: '', color: '#22c55e' })
      loadCategories()
    } catch (error) {
      console.error('Failed to create category:', error)
      alert('Gagal membuat kategori. Nama mungkin sudah ada.')
    }
  }

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return
    
    try {
      await deleteCategory(categoryToDelete.id)
      setShowDeleteModal(false)
      setCategoryToDelete(null)
      loadCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Gagal menghapus kategori. Pastikan tidak ada barang yang terhubung.')
      setShowDeleteModal(false)
      setCategoryToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setCategoryToDelete(null)
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kategori</h1>
          <p className="text-slate-500">Kelola kategori barang</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-farm-500 text-white rounded-lg hover:bg-farm-600 transition-colors touch-manipulation"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Tambah Kategori</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-farm-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Tags className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Tidak ada kategori ditemukan</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Tags className="w-5 h-5 md:w-6 md:h-6" style={{ color: category.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-xs text-slate-500">{category.color}</span>
                </div>
                <button
                  onClick={() => handleDeleteClick(category)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl w-full md:max-w-md max-h-[90vh] overflow-auto animate-slide-up md:animate-none">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-lg md:text-xl font-semibold text-slate-800">Tambah Kategori Baru</h2>
              <button
                onClick={() => setShowModal(false)}
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
                  placeholder="mis., Benih, Pupuk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-500"
                  placeholder="Deskripsi opsional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Warna</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-9 h-9 rounded-lg transition-transform touch-manipulation ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors touch-manipulation"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-farm-500 text-white rounded-lg hover:bg-farm-600 transition-colors touch-manipulation"
                >
                  Tambah Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl w-full md:max-w-sm max-h-[90vh] overflow-auto animate-slide-up md:animate-none">
            <div className="p-4 md:p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">
                Hapus Kategori?
              </h3>
              <p className="text-slate-500 mb-6">
                Apakah Anda yakin ingin menghapus <strong>{categoryToDelete?.name}</strong>? 
                Barang yang terhubung akan menjadi tanpa kategori.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors touch-manipulation"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors touch-manipulation"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
