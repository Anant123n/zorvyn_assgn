const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = require('../app');
const User = require('../models/User');

// Use a separate test database
const TEST_DB_URI =
  process.env.MONGODB_URI_TEST || process.env.MONGODB_URI + '_test';

let adminToken;
let analystToken;
let viewerToken;
let testUserId;

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
  await User.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Authentication', () => {
  // ─── Registration ────────────────────────────────────
  describe('POST /api/v1/auth/register', () => {
    it('should register an admin user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test Admin',
        email: 'testadmin@test.com',
        password: 'password123',
        role: 'admin',
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('admin');
      adminToken = res.body.data.token;
    });

    it('should register an analyst user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test Analyst',
        email: 'testanalyst@test.com',
        password: 'password123',
        role: 'analyst',
      });

      expect(res.status).toBe(201);
      analystToken = res.body.data.token;
    });

    it('should register a viewer user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test Viewer',
        email: 'testviewer@test.com',
        password: 'password123',
        role: 'viewer',
      });

      expect(res.status).toBe(201);
      viewerToken = res.body.data.token;
      testUserId = res.body.data.user._id;
    });

    it('should reject duplicate email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Duplicate',
        email: 'testadmin@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(409);
    });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Bad Email',
        email: 'notanemail',
        password: 'password123',
      });

      expect(res.status).toBe(400);
    });

    it('should reject short password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Short Pass',
        email: 'shortpass@test.com',
        password: '123',
      });

      expect(res.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({});

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  // ─── Login ───────────────────────────────────────────
  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'testadmin@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'testadmin@test.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'noone@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });

  // ─── Profile ─────────────────────────────────────────
  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('testadmin@test.com');
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(401);
    });
  });
});

// Export tokens for use in other test files
module.exports = { getAdminToken: () => adminToken, getAnalystToken: () => analystToken, getViewerToken: () => viewerToken, getTestUserId: () => testUserId };
