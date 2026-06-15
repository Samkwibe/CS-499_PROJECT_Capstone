const { sanitizeWasteBody, formatMongooseError } = require('../utils/sanitizeWasteBody');

describe('sanitizeWasteBody', () => {
  const validBody = {
    foodType: '  Pasta  ',
    weight: '12.5',
    date: '2026-05-19',
    location: ' Dining Hall ',
    pH: '6.8',
    humidity: '55',
    gas: '0.4',
    binFullness: '72',
    compostWeight: '8'
  };

  it('returns trimmed strings and numeric fields', () => {
    const result = sanitizeWasteBody(validBody);

    expect(result.foodType).toBe('Pasta');
    expect(result.location).toBe('Dining Hall');
    expect(result.weight).toBe(12.5);
    expect(result.pH).toBe(6.8);
    expect(result.binFullness).toBe(72);
  });

  it('rejects missing or invalid weight', () => {
    expect(() => sanitizeWasteBody({ ...validBody, weight: '' })).toThrow(/Weight is required/);
    expect(() => sanitizeWasteBody({ ...validBody, weight: 'abc' })).toThrow(/Weight is required/);
  });

  it('rejects pH outside 0–14', () => {
    expect(() => sanitizeWasteBody({ ...validBody, pH: '15' })).toThrow(/pH must be between 0 and 14/);
    expect(() => sanitizeWasteBody({ ...validBody, pH: '-1' })).toThrow(/pH must be between 0 and 14/);
  });

  it('omits undefined optional fields', () => {
    const result = sanitizeWasteBody({
      foodType: 'Bread',
      weight: 5,
      date: '2026-05-19',
      location: 'Cafe'
    });

    expect(result).not.toHaveProperty('pH');
    expect(result).not.toHaveProperty('humidity');
  });
});

describe('formatMongooseError', () => {
  it('joins validation error messages', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        weight: { message: 'Weight is required' },
        pH: { message: 'pH cannot exceed 14' }
      }
    };

    expect(formatMongooseError(err)).toBe('Weight is required pH cannot exceed 14');
  });

  it('returns message for non-validation errors', () => {
    expect(formatMongooseError(new Error('Database offline'))).toBe('Database offline');
  });
});
