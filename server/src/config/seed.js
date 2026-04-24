const bcrypt = require('bcryptjs');
const db = require('./database');

const seed = () => {
  seedCategories();
  seedItems();
  seedUsers();
};

const seedCategories = () => {
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (categoryCount.count > 0) return;

  const insertCategory = db.prepare('INSERT INTO categories (name, description, color) VALUES (?, ?, ?)');
  const categories = [
    ['Seeds', 'Various seeds for planting', '#22c55e'],
    ['Fertilizers', 'Soil enrichment products', '#84cc16'],
    ['Pesticides', 'Pest control products', '#ef4444'],
    ['Tools', 'Farming tools and equipment', '#f59e0b'],
    ['Produce', 'Fresh farm produce', '#10b981'],
    ['Hardware', 'Hardware supplies', '#6366f1'],
    ['Livestock', 'Animal supplies', '#8b5cf6']
  ];
  categories.forEach(c => insertCategory.run(c[0], c[1], c[2]));
};

const seedItems = () => {
  const itemCount = db.prepare('SELECT COUNT(*) as count FROM items').get();
  if (itemCount.count > 0) return;

  const insertItem = db.prepare(`
    INSERT INTO items (name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const items = [
    ['Tomato Seeds', 150, 20.00, 25.00, 'pack', 1, 20, 'High-yield tomato seeds'],
    ['Lettuce Seeds', 200, 15.00, 20.00, 'pack', 1, 30, 'Fresh green lettuce seeds'],
    ['Corn Seeds', 100, 25.00, 30.00, 'pack', 1, 15, 'Sweet corn hybrid seeds'],
    ['Carrot Seeds', 180, 14.00, 18.00, 'pack', 1, 25, 'Orange carrot seeds'],
    ['Cucumber Seeds', 120, 18.00, 22.00, 'pack', 1, 20, 'Cucumber seeds'],
    ['Bell Pepper Seeds', 80, 23.00, 28.00, 'pack', 1, 15, 'Mixed color pepper seeds'],
    ['Organic Compost', 50, 35.00, 45.00, 'bag', 2, 10, 'Natural compost fertilizer'],
    ['NPK 10-10-10', 75, 45.00, 55.00, 'bag', 2, 15, 'Balanced fertilizer'],
    ['Urea', 60, 32.00, 40.00, 'bag', 2, 12, 'Nitrogen fertilizer'],
    ['Cow Manure', 40, 28.00, 35.00, 'bag', 2, 8, 'Dried cow manure'],
    ['Bone Meal', 30, 40.00, 50.00, 'kg', 2, 5, 'Phosphorus supplement'],
    ['Insecticide Spray', 25, 50.00, 65.00, 'bottle', 3, 8, 'General insect killer'],
    ['Fungicide', 20, 60.00, 75.00, 'bottle', 3, 5, 'Plant fungus treatment'],
    ['Weed Killer', 35, 45.00, 55.00, 'bottle', 3, 10, 'Herbicide concentrate'],
    ['Rat Poison', 40, 25.00, 30.00, 'pack', 3, 10, 'Rodent control'],
    ['Organic Pesticide', 15, 65.00, 80.00, 'bottle', 3, 5, 'Natural pest control'],
    ['Shovel', 20, 65.00, 85.00, 'pcs', 4, 5, 'Heavy duty shovel'],
    ['Rake', 25, 50.00, 65.00, 'pcs', 4, 5, 'Garden rake'],
    ['Hoe', 18, 58.00, 75.00, 'pcs', 4, 5, 'Cultivation hoe'],
    ['Watering Can', 30, 35.00, 45.00, 'pcs', 4, 8, '10L watering can'],
    ['Pruning Shears', 40, 42.00, 55.00, 'pcs', 4, 10, 'Sharp pruning scissors'],
    ['Wheelbarrow', 8, 280.00, 350.00, 'pcs', 4, 2, 'Garden wheelbarrow'],
    ['Garden Hose', 15, 95.00, 120.00, 'pcs', 4, 3, '30m garden hose'],
    ['Fresh Tomatoes', 100, 10.00, 15.00, 'kg', 5, 20, 'Farm fresh tomatoes'],
    ['Fresh Corn', 80, 8.00, 12.00, 'pcs', 5, 15, 'Sweet corn cobs'],
    ['Lettuce Bunch', 60, 5.00, 8.00, 'bunch', 5, 15, 'Green lettuce'],
    ['Carrots', 70, 7.00, 10.00, 'kg', 5, 15, 'Fresh carrots'],
    ['Cucumbers', 50, 8.00, 12.00, 'kg', 5, 10, 'Cucumber harvest'],
    ['Fencing Wire', 10, 200.00, 250.00, 'roll', 6, 3, 'Galvanized wire'],
    ['Nails', 50, 10.00, 15.00, 'kg', 6, 10, 'Assorted nails'],
    ['PVC Pipe', 20, 65.00, 85.00, 'pcs', 6, 5, '3m PVC pipe'],
    ['Garden Hose', 12, 120.00, 150.00, 'pcs', 6, 3, '50m hose'],
    ['Chicken Feed', 30, 95.00, 120.00, 'bag', 7, 8, 'Poultry feed'],
    ['Cattle Feed', 15, 200.00, 250.00, 'bag', 7, 5, 'Cattle supplement'],
    ['Vitamin Supplements', 25, 65.00, 85.00, 'bottle', 7, 8, 'Animal vitamins']
  ];
  items.forEach(i => insertItem.run(i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7]));
};

const seedUsers = () => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) return;

  const insertUser = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');

  const ownerHash = bcrypt.hashSync('owner123', 10);
  const officerHash = bcrypt.hashSync('officer123', 10);

  insertUser.run('owner', ownerHash, 'owner');
  insertUser.run('officer1', officerHash, 'officer');
  insertUser.run('officer2', officerHash, 'officer');
  insertUser.run('officer3', officerHash, 'officer');
};

module.exports = { seed };