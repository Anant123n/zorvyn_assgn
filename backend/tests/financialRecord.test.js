const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = require('../app');
const User = require('../models/User');
const FinancialRecord = require('../models/FinancialRecord');

const TEST_DB_URI =
  process.env.MONGODB_URI_TEST || process.env.MONGODB_URI + '_test';

let adminToken;
let analystToken;
let viewerToken;
let recordId;

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
  await User.deleteMany({});
  await FinancialRecord.deleteMany({});

  // Create test users
  const adminRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Record Admin',
    email: 'recordadmin@test.com',
    password: 'password123',
    role: 'admin',
  });
  adminToken = adminRes.body.data.token;

  const analystRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Record Analyst',
    email: 'recordanalyst@test.com',
    password: 'password123',
    role: 'analyst',
  });
  analystToken = analystRes.body.data.token;

  const viewerRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Record Viewer',
    email: 'recordviewer@test.com',
    password: 'password123',
    role: 'viewer',
  });
  viewerToken = viewerRes.body.data.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await FinancialRecord.deleteMany({});
  await mongoose.connection.close();
});

describe('Financial Records', () => {
  // ─── Create ──────────────────────────────────────────
  describe('POST /api/v1/records', () => {
    it('should allow admin to create a record', async () => {
      const res = await request(app)
        .post('/api/v1/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 5000,
          type: 'income',
          category: 'salary',
          date: '2024-01-15',
          description: 'Test salary',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.record.amount).toBe(5000);
      recordId = res.body.data.record._id;
    });

    it('should create another record for filtering tests', async () => {
      const res = await request(app)
        .post('/api/v1/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 1200,
          type: 'expense',
          category: 'rent',
          date: '2024-02-01',
          description: 'Monthly rent',
        });

      expect(res.status).toBe(201);
    });

    it('should reject viewer creating a record', async () => {
      const res = await request(app)
        .post('/api/v1/records')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 100,
          type: 'expense',
          category: 'food',
          date: '2024-01-15',
        });

      expect(res.status).toBe(403);
    });

    it('should reject analyst creating a record', async () => {
      const res = await request(app)
        .post('/api/v1/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          amount: 100,
          type: 'expense',
          category: 'food',
          date: '2024-01-15',
        });

      expect(res.status).toBe(403);
    });

    it('should reject invalid record data', async () => {
      const res = await request(app)
        .post('/api/v1/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: -100,
          type: 'invalid',
          category: 'nonexistent',
        });

      expect(res.status).toBe(400);
    });
  });

  // ─── Read ────────────────────────────────────────────
  describe('GET /api/v1/records', () => {
    it('should allow viewer to list records', async () => {
      const res = await request(app)
        .get('/api/v1/records')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records.length).toBeGreaterThan(0);
    });

    it('should allow analyst to list records', async () => {
      const res = await request(app)
        .get('/api/v1/records')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/v1/records?type=income')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.records.forEach((r) => {
        expect(r.type).toBe('income');
      });
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get('/api/v1/records?category=salary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.records.forEach((r) => {
        expect(r.category).toBe('salary');
      });
    });

    it('should filter by date range', async () => {
      const res = await request(app)
        .get('/api/v1/records?startDate=2024-01-01&endDate=2024-01-31')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should search in description', async () => {
      const res = await request(app)
        .get('/api/v1/records?search=salary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records.length).toBeGreaterThan(0);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/v1/records?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records.length).toBe(1);
      expect(res.body.data.totalPages).toBeDefined();
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/records');

      expect(res.status).toBe(401);
    });
  });

  // ─── Read Single ─────────────────────────────────────
  describe('GET /api/v1/records/:id', () => {
    it('should get a record by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/records/${recordId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.record._id).toBe(recordId);
    });

    it('should return 404 for non-existent record', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/records/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/records/invalidid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  // ─── Update ──────────────────────────────────────────
  describe('PATCH /api/v1/records/:id', () => {
    it('should allow admin to update a record', async () => {
      const res = await request(app)
        .patch(`/api/v1/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 6000, description: 'Updated salary' });

      expect(res.status).toBe(200);
      expect(res.body.data.record.amount).toBe(6000);
    });

    it('should reject viewer updating a record', async () => {
      const res = await request(app)
        .patch(`/api/v1/records/${recordId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ amount: 9999 });

      expect(res.status).toBe(403);
    });

    it('should reject analyst updating a record', async () => {
      const res = await request(app)
        .patch(`/api/v1/records/${recordId}`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ amount: 9999 });

      expect(res.status).toBe(403);
    });
  });

  // ─── Delete ──────────────────────────────────────────
  describe('DELETE /api/v1/records/:id', () => {
    it('should reject viewer deleting a record', async () => {
      const res = await request(app)
        .delete(`/api/v1/records/${recordId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to soft delete a record', async () => {
      const res = await request(app)
        .delete(`/api/v1/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 for already deleted record', async () => {
      const res = await request(app)
        .get(`/api/v1/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
