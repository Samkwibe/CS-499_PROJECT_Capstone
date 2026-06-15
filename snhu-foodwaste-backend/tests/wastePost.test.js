jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, _res, next) => {
    req.user = { _id: '507f1f77bcf86cd799439011', role: 'staff' };
    next();
  },
  authorize: () => (_req, _res, next) => next()
}));

jest.mock('../models/FoodWasteEntry', () => ({
  create: jest.fn()
}));

const request = require('supertest');
const FoodWasteEntry = require('../models/FoodWasteEntry');
const app = require('../app');

describe('POST /api/waste', () => {
  beforeEach(() => {
    FoodWasteEntry.create.mockReset();
  });

  it('rejects invalid payload before hitting the database', async () => {
    const res = await request(app)
      .post('/api/waste')
      .set('Authorization', 'Bearer test-token')
      .send({
        foodType: 'Scraps',
        weight: '',
        date: '2026-05-19',
        location: 'Kitchen',
        pH: 20
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Weight is required|pH must be between/);
    expect(FoodWasteEntry.create).not.toHaveBeenCalled();
  });

  it('creates an entry when the payload is valid', async () => {
    const saved = {
      _id: '507f1f77bcf86cd799439012',
      foodType: 'Scraps',
      weight: 10,
      published: false
    };
    FoodWasteEntry.create.mockResolvedValue(saved);

    const res = await request(app)
      .post('/api/waste')
      .set('Authorization', 'Bearer test-token')
      .send({
        foodType: 'Scraps',
        weight: 10,
        date: '2026-05-19',
        location: 'Kitchen',
        pH: 6.5,
        binFullness: 40,
        compostWeight: 3
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(saved);
    expect(FoodWasteEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        submittedBy: '507f1f77bcf86cd799439011',
        foodType: 'Scraps',
        weight: 10,
        published: false
      })
    );
  });
});
