import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import User from '../models/users.js';

const testUser = {
  name: 'Jest User',
  email: `jest-${Date.now()}@test.com`,
  password: 'password123',
  role: 'Editor',
};

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Set MONGO_URI or MONGODB_URI in server/.env for integration tests');
  }
  await mongoose.connect(uri);
});

afterAll(async () => {
  await User.deleteMany({ email: /@test\.com$/ });
  await mongoose.disconnect();
});

afterEach(async () => {
  await User.deleteMany({ email: testUser.email });
});

describe('POST /api/auth/register', () => {
  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it('returns 400 for invalid role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...testUser,
      email: `invalid-role-${Date.now()}@test.com`,
      role: 'SuperUser',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid role/i);
  });

  it('registers a user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registered successfully/i);
  });

  it('returns 409 for duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('returns token and user on success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('Editor');
    expect(res.body.user.email).toBe(testUser.email);
  });
});

describe('GET /api/project (protected)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/project');
    expect(res.status).toBe(401);
  });

  it('returns 200 with valid token', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
