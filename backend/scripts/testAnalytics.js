/* eslint-disable no-console */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const { connectDatabase } = require('../src/config/database');
const { app } = require('../src/app');

async function authenticate() {
  await request(app).post('/auth/register').send({
    name: 'Analyst',
    email: 'analyst@example.com',
    password: 'Password123',
  });

  const loginResponse = await request(app).post('/auth/login').send({
    email: 'analyst@example.com',
    password: 'Password123',
  });

  return loginResponse.body.token;
}

async function seedTransactions(token) {
  const authHeader = { Authorization: `Bearer ${token}` };

  const transactions = [
    {
      type: 'income',
      category: 'Salary',
      amount: 5000,
      date: '2024-01-31',
    },
    {
      type: 'expense',
      category: 'Groceries',
      amount: 300,
      date: '2024-01-15',
    },
    {
      type: 'expense',
      category: 'Rent',
      amount: 1500,
      date: '2024-01-01',
    },
    {
      type: 'income',
      category: 'Freelance',
      amount: 800,
      date: '2024-02-05',
    },
    {
      type: 'expense',
      category: 'Utilities',
      amount: 200,
      date: '2024-02-08',
    },
  ];

  for (const tx of transactions) {
    // eslint-disable-next-line no-await-in-loop
    await request(app).post('/transactions').set(authHeader).send(tx);
  }
}

async function run() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
  process.env.NODE_ENV = 'test';

  await connectDatabase(uri);

  try {
    const token = await authenticate();
    await seedTransactions(token);

    const authHeader = { Authorization: `Bearer ${token}` };

    const categoryResponse = await request(app)
      .get('/analytics/category-breakdown')
      .set(authHeader);
    console.log('Category breakdown status:', categoryResponse.status);
    console.log('Category breakdown data length:', categoryResponse.body.data.length);

    const monthlyResponse = await request(app)
      .get('/analytics/monthly-summary')
      .set(authHeader);
    console.log('Monthly summary status:', monthlyResponse.status);
    console.log('Monthly summary data length:', monthlyResponse.body.data.length);

    const netResponse = await request(app)
      .get('/analytics/net-balance')
      .set(authHeader);
    console.log('Net balance status:', netResponse.status);
    console.log('Net balance data:', netResponse.body.data);
  } catch (error) {
    console.error('Error during analytics tests:', error);
  } finally {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  }
}

run();
