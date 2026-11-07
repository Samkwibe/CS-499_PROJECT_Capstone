const mongoose = require('mongoose');
const User = require('../models/User');

const validate = (email) => new User({ name: 'Test', email, password: 'x'.repeat(60) }).validateSync();

describe('User email validation', () => {
  test.each(['x@gmail.com', 'sam+demo@gmail.com', 'jane@company.tech', 'a.b@school.info', 'student@snhu.edu'])(
    'accepts %s', (email) => {
      const err = validate(email);
      expect(err && err.errors.email).toBeUndefined();
    }
  );

  test.each(['not-an-email', 'a@b', '@example.com', 'a@@example.com'])('rejects %s', (email) => {
    expect(validate(email).errors.email.message).toBe('Please provide a valid email');
  });

  afterAll(() => mongoose.disconnect());
});
