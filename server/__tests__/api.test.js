const request = require('supertest');
const path = require('path');

// Mock the database path for testing
const dbPath = path.join(__dirname, '..', 'db', 'inventory.test.db');

// Set test environment before requiring the app
process.env.NODE_ENV = 'test';

const app = require('../index');

describe('API Endpoints', () => {
  let server;
  let authCookie;

  beforeAll(async () => {
    // Login once for all tests
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'owner', password: 'owner123' });
    authCookie = loginRes.headers['set-cookie'];
  });

  afterAll(() => {
    // Clean up test database if needed
    const fs = require('fs');
    try {
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
      }
    } catch (err) {
      console.log('Cleanup error:', err.message);
    }
  });

  // ============ Categories Tests ============

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const res = await request(app)
        .get('/api/categories')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      // Check seed data exists
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('color');
    });
  });

  describe('POST /api/categories', () => {
    // Use unique name with timestamp to avoid conflicts
    const uniqueName = `Test Category ${Date.now()}`;

    it('should create a new category', async () => {
      const newCategory = {
        name: uniqueName,
        description: 'Test Description',
        color: '#ff0000'
      };
      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', authCookie)
        .send(newCategory);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(uniqueName);
    });

    it('should handle duplicate category name', async () => {
      const newCategory = {
        name: 'Seeds', // Already exists from seed data
        description: 'Duplicate test',
        color: '#000000'
      };
      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', authCookie)
        .send(newCategory);
      // Should return 500 due to UNIQUE constraint
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ============ Items Tests ============

  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const res = await request(app)
        .get('/api/items')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('quantity');
      expect(res.body[0]).toHaveProperty('purchase_price');
      expect(res.body[0]).toHaveProperty('selling_price');
      expect(res.body[0]).toHaveProperty('category_name');
    });

    it('should filter items by search term', async () => {
      const res = await request(app)
        .get('/api/items?search=Tomato')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(item => {
        expect(item.name.toLowerCase()).toContain('tomato');
      });
    });

    it('should filter items by category', async () => {
      const res = await request(app)
        .get('/api/items?category=1')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(item => {
        expect(item.category_id).toBe(1);
      });
    });

    it('should filter low stock items', async () => {
      const res = await request(app)
        .get('/api/items?stock=low')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(item => {
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.quantity).toBeLessThanOrEqual(item.low_stock_threshold);
      });
    });

    it('should filter out of stock items', async () => {
      const res = await request(app)
        .get('/api/items?stock=out')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(item => {
        expect(item.quantity).toBe(0);
      });
    });

    it('should filter in stock items', async () => {
      const res = await request(app)
        .get('/api/items?stock=in')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(item => {
        expect(item.quantity).toBeGreaterThan(item.low_stock_threshold);
      });
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item', async () => {
      const res = await request(app)
        .get('/api/items/1')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('name');
    });

    it('should return 404 for non-existent item', async () => {
      const res = await request(app)
        .get('/api/items/99999')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'Test Item',
        quantity: 100,
        purchase_price: 40.00,
        selling_price: 50.00,
        unit: 'pcs',
        category_id: 1,
        low_stock_threshold: 10,
        description: 'Test description'
      };
      const res = await request(app)
        .post('/api/items')
        .set('Cookie', authCookie)
        .send(newItem);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test Item');
      expect(res.body.quantity).toBe(100);
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an existing item', async () => {
      const updateData = {
        name: 'Updated Item',
        quantity: 200,
        purchase_price: 60.00,
        selling_price: 75.00,
        unit: 'kg',
        category_id: 2,
        low_stock_threshold: 20,
        description: 'Updated description'
      };
      const res = await request(app)
        .put('/api/items/1')
        .set('Cookie', authCookie)
        .send(updateData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Updated Item');
      expect(res.body.quantity).toBe(200);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an item', async () => {
      // First create an item to delete
      const createRes = await request(app)
        .post('/api/items')
        .set('Cookie', authCookie)
        .send({
          name: 'Item To Delete',
          quantity: 10,
          purchase_price: 8.00,
          selling_price: 10.00,
          unit: 'pcs',
          category_id: 1,
          low_stock_threshold: 5
        });
      const itemId = createRes.body.id;

      const res = await request(app)
        .delete(`/api/items/${itemId}`)
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);

      // Verify it's deleted
      const getRes = await request(app)
        .get(`/api/items/${itemId}`)
        .set('Cookie', authCookie);
      expect(getRes.statusCode).toEqual(404);
    });
  });

  // ============ Stats Tests ============

  describe('GET /api/stats', () => {
    it('should return dashboard statistics', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalItems');
      expect(res.body).toHaveProperty('totalValue');
      expect(res.body).toHaveProperty('lowStock');
      expect(res.body).toHaveProperty('outOfStock');
      expect(res.body).toHaveProperty('categories');
      expect(res.body).toHaveProperty('categoryBreakdown');
      expect(Array.isArray(res.body.categoryBreakdown)).toBe(true);
    });

    it('should return valid numeric values', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', authCookie);
      expect(typeof res.body.totalItems).toBe('number');
      expect(typeof res.body.totalValue).toBe('number');
      expect(typeof res.body.lowStock).toBe('number');
      expect(typeof res.body.outOfStock).toBe('number');
      expect(typeof res.body.categories).toBe('number');
    });
  });

  // ============ Authentication Tests ============

  describe('Authentication', () => {
    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ username: 'owner', password: 'owner123' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toBe('owner');
        expect(res.body.user.role).toBe('owner');
        expect(res.headers['set-cookie']).toBeDefined();
      });

      it('should reject invalid password', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ username: 'owner', password: 'wrongpassword' });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error');
      });

      it('should reject invalid username', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ username: 'nonexistent', password: 'password' });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error');
      });

      it('should reject missing credentials', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({});
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout successfully', async () => {
        // First login
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ username: 'owner', password: 'owner123' });
        
        const cookie = loginRes.headers['set-cookie'];
        
        // Then logout
        const res = await request(app)
          .post('/api/auth/logout')
          .set('Cookie', cookie);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
      });
    });

    describe('GET /api/auth/me', () => {
      it('should return current user when authenticated', async () => {
        // First login
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ username: 'owner', password: 'owner123' });
        
        const cookie = loginRes.headers['set-cookie'];
        
        // Then get current user
        const res = await request(app)
          .get('/api/auth/me')
          .set('Cookie', cookie);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toBe('owner');
      });

      it('should return 401 when not authenticated', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error');
      });
    });
  });

  // ============ Protected Routes Tests ============

  describe('Protected Routes', () => {
    let authCookie;

    beforeAll(async () => {
      // Login once for all protected route tests
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'owner', password: 'owner123' });
      authCookie = loginRes.headers['set-cookie'];
    });

    it('should allow access to categories with valid session', async () => {
      const res = await request(app)
        .get('/api/categories')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should deny access to categories without session', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should allow access to items with valid session', async () => {
      const res = await request(app)
        .get('/api/items')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should deny access to items without session', async () => {
      const res = await request(app).get('/api/items');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should allow access to stats with valid session', async () => {
      const res = await request(app)
        .get('/api/stats')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalItems');
    });

    it('should deny access to stats without session', async () => {
      const res = await request(app).get('/api/stats');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ============ Edge Cases ============

  describe('Error Handling', () => {
    it('should handle invalid category filter', async () => {
      const res = await request(app)
        .get('/api/items?category=invalid')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
    });

    it('should handle empty search result', async () => {
      const res = await request(app)
        .get('/api/items?search=xyznonexistent')
        .set('Cookie', authCookie);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
