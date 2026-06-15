const request = require('supertest');
const app = require('../app');

describe('Protected food waste routes', () => {
  it('rejects staff management requests without a token', async () => {
    const res = await request(app).get('/api/waste/all');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(expect.objectContaining({
      success: false,
      message: 'Not authorized, no token provided in headers'
    }));
  });

  it('rejects report requests without a token', async () => {
    const res = await request(app).get('/api/waste/reports/summary');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(expect.objectContaining({
      success: false
    }));
  });
});
