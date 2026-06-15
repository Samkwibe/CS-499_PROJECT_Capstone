import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@snhu.edu',
        password: 'test123',
        role: 'student'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });
});