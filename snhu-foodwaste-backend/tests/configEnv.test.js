const { getConfigProblems, sha256 } = require('../config/env');

const GOOD = { MONGODB_URI: 'mongodb://example/db', JWT_SECRET: 'x'.repeat(40) };

describe('getConfigProblems', () => {
  test('no problems for a complete configuration', () => {
    expect(getConfigProblems(GOOD)).toEqual([]);
  });

  test('accepts the legacy MONGO_URI name', () => {
    expect(getConfigProblems({ MONGO_URI: 'mongodb://example/db', JWT_SECRET: GOOD.JWT_SECRET })).toEqual([]);
  });

  test('reports missing variables by name', () => {
    expect(getConfigProblems({})).toEqual(['MONGODB_URI is not set', 'JWT_SECRET is not set']);
  });

  test('rejects short or placeholder secrets in production only', () => {
    expect(getConfigProblems({ ...GOOD, JWT_SECRET: 'short', NODE_ENV: 'production' })[0]).toMatch(/at least 32/);
    expect(getConfigProblems({ ...GOOD, JWT_SECRET: 'change-me-to-a-long-random-secret', VERCEL: '1' })[0]).toMatch(/placeholder/);
    expect(getConfigProblems({ ...GOOD, JWT_SECRET: 'short', NODE_ENV: 'development' })).toEqual([]);
  });

  test('never echoes the secret value in a problem message', () => {
    const secret = 'super-secret-but-too-short';
    const problems = getConfigProblems({ ...GOOD, JWT_SECRET: secret, NODE_ENV: 'production' });
    expect(problems.join(' ')).not.toContain(secret);
  });

  test('sha256 helper is stable', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});
