/* eslint-disable no-console */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const { connectDatabase } = require('../src/config/database');
const { app } = require('../src/app');

async function run() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
  process.env.NODE_ENV = 'test';

  await connectDatabase(uri);

  try {
    const registerResponse = await request(app).post('/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    });

    console.log('Register status:', registerResponse.status);
    console.log('Register body:', registerResponse.body);

    const loginResponse = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'Password123',
    });

    console.log('Login status:', loginResponse.status);
    console.log('Login body:', loginResponse.body);
  } catch (error) {
    console.error('Error during auth tests:', error);
  } finally {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  }
}

run();
