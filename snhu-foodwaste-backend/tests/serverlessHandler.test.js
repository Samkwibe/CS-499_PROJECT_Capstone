/**
 * Tests for the Vercel serverless entry point (api/index.js).
 *
 * The handler is mounted on a plain Node http server, which has NO res.status()/res.json()
 * helpers, so these tests also prove the handler does not depend on Vercel-only helpers.
 * MongoDB is mocked; no network or database is needed.
 */
const http = require('http');
const path = require('path');
const request = require('supertest');

const HANDLER = path.resolve(__dirname, '../../api/index.js');
const DB = path.resolve(__dirname, '../config/db.js');
const GOOD_SECRET = 'a'.repeat(48);

function loadHandler({ env, dbImpl }) {
  let handler;
  let connectDB;
  jest.isolateModules(() => {
    Object.assign(process.env, env);
    connectDB = jest.fn(dbImpl || (() => Promise.resolve({})));
    jest.doMock(DB, () => connectDB);
    handler = require(HANDLER);
  });
  return { server: http.createServer((req, res) => handler(req, res)), connectDB };
}

describe('serverless handler (api/index.js)', () => {
  const saved = { ...process.env };

  beforeEach(() => {
    delete process.env.MONGODB_URI;
    delete process.env.MONGO_URI;
    delete process.env.JWT_SECRET;
    delete process.env.VERCEL;
  });

  afterEach(() => {
    jest.resetModules();
    jest.dontMock(DB);
    process.env = { ...saved };
  });

  test('returns 503 JSON (not a crash) when MONGODB_URI is missing', async () => {
    const { server, connectDB } = loadHandler({ env: { JWT_SECRET: GOOD_SECRET } });
    const res = await request(server).get('/api/auth/me');
    expect(res.status).toBe(503);
    expect(res.body).toEqual(expect.objectContaining({ success: false }));
    expect(connectDB).not.toHaveBeenCalled();
  });

  test('returns 503 when JWT_SECRET is missing', async () => {
    const { server } = loadHandler({ env: { MONGODB_URI: 'mongodb://example/db' } });
    const res = await request(server).get('/api/waste');
    expect(res.status).toBe(503);
  });

  test('returns 503 JSON when the database is unreachable', async () => {
    const { server } = loadHandler({
      env: { MONGODB_URI: 'mongodb://example/db', JWT_SECRET: GOOD_SECRET },
      dbImpl: () => Promise.reject(new Error('querySrv ENOTFOUND'))
    });
    const res = await request(server).get('/api/waste');
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/Database connection failed/);
    expect(JSON.stringify(res.body)).not.toMatch(/ENOTFOUND/);
  });

  test('health check reports configuration problems by name only', async () => {
    const { server, connectDB } = loadHandler({ env: {} });
    const res = await request(server).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body.database).toBe('not_checked');
    expect(res.body.configProblems).toEqual(
      expect.arrayContaining(['MONGODB_URI is not set', 'JWT_SECRET is not set'])
    );
    expect(connectDB).not.toHaveBeenCalled();
  });

  test('health check reports an unreachable database', async () => {
    const { server } = loadHandler({
      env: { MONGODB_URI: 'mongodb://example/db', JWT_SECRET: GOOD_SECRET },
      dbImpl: () => Promise.reject(new Error('timeout'))
    });
    const res = await request(server).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'degraded', database: 'unreachable', configProblems: [] });
  });

  test('health check is 200 when configured and the database connects', async () => {
    const { server } = loadHandler({
      env: { MONGODB_URI: 'mongodb://example/db', JWT_SECRET: GOOD_SECRET }
    });
    const res = await request(server).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'connected', configProblems: [] });
  });

  test('forwards requests to Express when healthy', async () => {
    const { server, connectDB } = loadHandler({
      env: { MONGODB_URI: 'mongodb://example/db', JWT_SECRET: GOOD_SECRET }
    });
    const res = await request(server).get('/api/auth/me'); // no token -> Express auth middleware
    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/no token/i);
  });
});
