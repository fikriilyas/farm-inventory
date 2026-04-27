const API_BASE = '/api'

const fetchWithCredentials = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include'
  })
}

// Auth
export const login = (username, password) =>
  fetchWithCredentials(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }).then(res => {
    if (!res.ok) {
      return res.json().then(err => Promise.reject(err.error || 'Login failed'))
    }
    return res.json()
  })

export const logout = () =>
  fetchWithCredentials(`${API_BASE}/auth/logout`, { method: 'POST' }).then(res => res.json())

export const getCurrentUser = () =>
  fetchWithCredentials(`${API_BASE}/auth/me`).then(res => {
    if (!res.ok) {
      return Promise.reject(new Error('Not authenticated'))
    }
    return res.json()
  })

// Categories
export const getCategories = () => fetchWithCredentials(`${API_BASE}/categories`).then(res => res.json())
export const createCategory = (data) => fetchWithCredentials(`${API_BASE}/categories`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).then(res => res.json())

export const deleteCategory = (id) => fetchWithCredentials(`${API_BASE}/categories/${id}`, {
  method: 'DELETE'
}).then(res => res.json())

// Items
export const getItems = (filters = {}) => {
  const params = new URLSearchParams(filters)
  return fetchWithCredentials(`${API_BASE}/items?${params}`).then(res => res.json())
}
export const getItem = (id) => fetchWithCredentials(`${API_BASE}/items/${id}`).then(res => res.json())
export const createItem = (data) => fetchWithCredentials(`${API_BASE}/items`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).then(res => res.json())
export const updateItem = (id, data) => fetchWithCredentials(`${API_BASE}/items/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).then(res => res.json())
export const deleteItem = (id) => fetchWithCredentials(`${API_BASE}/items/${id}`, {
  method: 'DELETE'
}).then(res => res.json())

// Batch operations
export const batchAddItems = (items) =>
  fetchWithCredentials(`${API_BASE}/items/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  }).then(res => {
    if (!res.ok) {
      return res.json().then(err => Promise.reject(err.error || 'Batch processing failed'))
    }
    return res.json()
  })

// Sales
export const getSales = (date) =>
  fetchWithCredentials(`${API_BASE}/sales?date=${date}`).then(res => res.json())

export const getSaleDetail = (id) =>
  fetchWithCredentials(`${API_BASE}/sales/${id}`).then(res => {
    if (!res.ok) return Promise.reject(new Error('Sale not found'))
    return res.json()
  })

export const createSale = (saleData) =>
  fetchWithCredentials(`${API_BASE}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData)
  }).then(res => {
    if (!res.ok) {
      return res.json().then(err => Promise.reject(err.error || 'Sale failed'))
    }
    return res.json()
  })

// Stats
export const getStats = () => fetchWithCredentials(`${API_BASE}/stats`).then(res => res.json())