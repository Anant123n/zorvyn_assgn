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

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
  await User.deleteMany({});
  await FinancialRecord.deleteMany({});

  // Create test users
  const adminRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Dash Admin',
    email: 'dashadmin@test.com',
    password: 'password123',
    role: 'admin',
  });
  adminToken = adminRes.body.data.token;
  const adminId = adminRes.body.data.user._id;

  const analystRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Dash Analyst',
    email: 'dashanalyst@test.com',
    password: 'password123',
    role: 'analyst',
  });
  analystToken = analystRes.body.data.token;

  const viewerRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Dash Viewer',
    email: 'dashviewer@test.com',
    password: 'password123',
    role: 'viewer',
  });
  viewerToken = viewerRes.body.data.token;

  // Create sample records for dashboard tests
  const records = [
    { amount: 5000, type: 'income', category: 'salary', date: '2024-01-15', description: 'Jan salary', createdBy: adminId },
    { amount: 3000, type: 'income', category: 'freelance', date: '2024-01-20', description: 'Freelance work', createdBy: adminId },
    { amount: 1200, type: 'expense', category: 'rent', date: '2024-01-01', description: 'Rent', createdBy: adminId },
    { amount: 500, type: 'expense', category: 'food', date: '2024-01-10', description: 'Groceries', createdBy: adminId },
    { amount: 5000, type: 'income', category: 'salary', date: '2024-02-15', description: 'Feb salary', createdBy: adminId },
    { amount: 1200, type: 'expense', category: 'rent', date: '2024-02-01', description: 'Rent', createdBy: adminId },
    { amount: 800, type: 'expense', category: 'utilities', date: '2024-02-10', description: 'Bills', createdBy: adminId },
  ];

  await FinancialRecord.insertMany(records);
});

afterAll(async () => {
  await User.deleteMany({});
  await FinancialRecord.deleteMany({});
  await mongoose.connection.close();
});

describe('Dashboard', () => {
  // ─── Summary ─────────────────────────────────────────
  describe('GET /api/v1/dashboard/summary', () => {
    it('should return financial summary for analyst', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.totalIncome).toBeDefined();
      expect(res.body.data.summary.totalExpenses).toBeDefined();
      expect(res.body.data.summary.netBalance).toBeDefined();
      expect(res.body.data.summary.totalRecords).toBeDefined();
      expect(res.body.data.summary.totalIncome).toBe(13000);
      expect(res.body.data.summary.totalExpenses).toBe(3700);
      expect(res.body.data.summary.netBalance).toBe(9300);
    });

    it('should return summary for admin', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should reject viewer from accessing summary', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });

    it('should filter summary by date range', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary?startDate=2024-01-01&endDate=2024-01-31')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.totalIncome).toBe(8000);
      expect(res.body.data.summary.totalExpenses).toBe(1700);
    });
  });

  // ─── Category Breakdown ──────────────────────────────
  describe('GET /api/v1/dashboard/category-breakdown', () => {
    it('should return category breakdown for analyst', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/category-breakdown')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.breakdown).toBeInstanceOf(Array);
      expect(res.body.data.breakdown.length).toBeGreaterThan(0);

      // Check that each category has the expected fields
      const salaryCategory = res.body.data.breakdown.find(
        (c) => c.category === 'salary'
      );
      expect(salaryCategory).toBeDefined();
      expect(salaryCategory.totalIncome).toBe(10000);
    });

    it('should reject viewer from accessing breakdown', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/category-breakdown')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Monthly Trends ──────────────────────────────────
  describe('GET /api/v1/dashboard/monthly-trends', () => {
    it('should return monthly trends for admin', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/monthly-trends')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.trends).toBeInstanceOf(Array);
      expect(res.body.data.trends.length).toBe(2); // Jan + Feb

      // Should be sorted chronologically
      expect(res.body.data.trends[0].label).toBe('2024-01');
      expect(res.body.data.trends[1].label).toBe('2024-02');
    });

    it('should reject viewer from accessing trends', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/monthly-trends')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Recent Activity ────────────────────────────────
  describe('GET /api/v1/dashboard/recent-activity', () => {
    it('should return recent activity for viewer', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-activity')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records).toBeInstanceOf(Array);
    });

    it('should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-activity?limit=3')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records.length).toBeLessThanOrEqual(3);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/dashboard/recent-activity');

      expect(res.status).toBe(401);
    });
  });
});
