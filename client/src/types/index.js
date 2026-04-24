/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} color
 * @property {string} created_at
 */

/**
 * @typedef {Object} Item
 * @property {number} id
 * @property {string} name
 * @property {number} quantity
 * @property {number} purchase_price
 * @property {number} selling_price
 * @property {string} unit
 * @property {number} category_id
 * @property {number} low_stock_threshold
 * @property {string} description
 * @property {string} category_name
 * @property {string} category_color
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Stats
 * @property {number} totalItems
 * @property {number} totalValue
 * @property {number} lowStock
 * @property {number} outOfStock
 * @property {number} categories
 * @property {Array<{name: string, color: string, item_count: number, total_quantity: number}>} categoryBreakdown
 */
