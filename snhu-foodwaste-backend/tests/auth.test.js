const request = require('supertest');
const User = require('../models/User');
const app = require('../app');

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

describe('Auth API', () => {
  it('registers a new user and returns a token', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: 'test@snhu.edu',
      role: 'student'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@snhu.edu',
        password: 'testpassword123',
        role: 'student'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test User',
      email: 'test@snhu.edu',
      role: 'student'
    }));
  });

  it('rejects public admin registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@snhu.edu',
        password: 'testpassword123',
        role: 'admin'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
    expect(res.body.message).toEqual('Invalid registration role');
    expect(User.create).not.toHaveBeenCalled();
  });
});