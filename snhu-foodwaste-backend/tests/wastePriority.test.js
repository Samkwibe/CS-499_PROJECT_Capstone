const { rankWasteEntries, scoreWasteEntry } = require('../utils/wastePriority');

describe('waste priority scoring', () => {
  it('assigns a higher score to urgent bins', () => {
    const normal = scoreWasteEntry({
      binFullness: 30,
      gas: 1,
      pH: 7,
      weight: 8,
      compostWeight: 3,
      date: new Date()
    });

    const urgent = scoreWasteEntry({
      binFullness: 95,
      gas: 7,
      pH: 4.8,
      weight: 70,
      compostWeight: 50,
      date: new Date(Date.now() - 48 * 60 * 60 * 1000)
    });

    expect(urgent.priorityScore).toBeGreaterThan(normal.priorityScore);
    expect(['High', 'Critical']).toContain(urgent.priorityLevel);
  });

  it('ranks entries from highest to lowest priority', () => {
    const ranked = rankWasteEntries([
      { _id: 'low', binFullness: 15, gas: 0.3, pH: 7, weight: 4 },
      { _id: 'high', binFullness: 91, gas: 6, pH: 5, weight: 60 }
    ]);

    expect(ranked[0]._id).toEqual('high');
  });
});
