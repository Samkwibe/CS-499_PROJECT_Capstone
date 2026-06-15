const FoodWasteEntry = require('../models/FoodWasteEntry');

describe('FoodWasteEntry model validation', () => {
  const baseEntry = {
    submittedBy: '507f1f77bcf86cd799439011',
    foodType: 'Kitchen scraps',
    weight: 12,
    date: new Date('2026-05-19'),
    location: 'Dining Hall',
    humidity: 55,
    pH: 6.8,
    gas: 0.4,
    binFullness: 72,
    compostWeight: 8
  };

  it('accepts a valid food waste entry', async () => {
    const entry = new FoodWasteEntry(baseEntry);

    await expect(entry.validate()).resolves.toBeUndefined();
  });

  it('rejects out-of-range sensor values', async () => {
    const entry = new FoodWasteEntry({
      ...baseEntry,
      pH: 15,
      binFullness: 120
    });

    await expect(entry.validate()).rejects.toThrow();
  });
});
