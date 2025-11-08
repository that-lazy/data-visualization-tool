/* eslint-disable no-console */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const { connectDatabase } = require('../src/config/database');
const { app } = require('../src/app');

async function authenticate() {
  await request(app).post('/auth/register').send({
    name: 'Tester',
    email: 'tester@example.com',
    password: 'Password123',
  });

  const loginResponse = await request(app).post('/auth/login').send({
    email: 'tester@example.com',
    password: 'Password123',
  });

  return loginResponse.body.token;
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
    const authHeader = { Authorization: `Bearer ${token}` };

    const createResponse = await request(app)
      .post('/transactions')
      .set(authHeader)
      .send({
        type: 'expense',
        category: 'Groceries',
        amount: 125.5,
        date: '2024-10-01',
        description: 'Weekly shopping',
      });
    console.log('Create status:', createResponse.status);
    console.log('Create body:', createResponse.body);

    const transactionId = createResponse.body._id;

    const listResponse = await request(app).get('/transactions').set(authHeader);
    console.log('List status:', listResponse.status);
    console.log('List body count:', listResponse.body.data.length);

    const updateResponse = await request(app)
      .patch(`/transactions/${transactionId}`)
      .set(authHeader)
      .send({ amount: 130 });
    console.log('Update status:', updateResponse.status);
    console.log('Updated amount:', updateResponse.body.amount);

    const deleteResponse = await request(app)
      .delete(`/transactions/${transactionId}`)
      .set(authHeader);
    console.log('Delete status:', deleteResponse.status);
  } catch (error) {
    console.error('Error during transaction tests:', error);
  } finally {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  }
}

run();
