/**
 * End-to-end API integration tests against a REAL, ISOLATED MongoDB.
 *
 * Runs only when MONGODB_TEST_URI is set, e.g.
 *   MONGODB_TEST_URI=mongodb://127.0.0.1:27017 npx jest tests/integration
 *
 * Safety:
 *  - Refuses to run unless the host is localhost/127.0.0.1 (or ALLOW_REMOTE_TEST_DB=1).
 *  - Uses a brand-new database named test_<random> and drops ONLY that database afterwards.
 *  - Never touches the production database.
 *
 * All data here is fictional.
 */
const crypto = require('crypto');
const mongoose = require('mongoose');
const request = require('supertest');

const BASE_URI = process.env.MONGODB_TEST_URI;
const describeIfDb = BASE_URI ? describe : describe.skip;

function assertSafeTestUri(uri) {
  const host = new URL(uri.replace(/^mongodb(\+srv)?:/, 'http:')).hostname;
  if (!['localhost', '127.0.0.1', '::1'].includes(host) && process.env.ALLOW_REMOTE_TEST_DB !== '1') {
    throw new Error(`Refusing to run integration tests against non-local host "${host}"`);
  }
}

describeIfDb('API integration (isolated MongoDB)', () => {
  const DB_NAME = `test_${crypto.randomBytes(4).toString('hex')}`;
  let app;
  let User;
  const STAFF_CODE = 'fictional-staff-code-for-tests';

  const student = { name: 'Test Student', email: 'student@example.test', password: 'student-pass-123' };
  const staff = { name: 'Test Staff', email: 'staff@example.test', password: 'staff-pass-123' };
  let studentToken;
  let staffToken;
  let adminToken;
  let entryId;

  beforeAll(async () => {
    assertSafeTestUri(BASE_URI);
    process.env.STAFF_SIGNUP_CODE = STAFF_CODE;
    process.env.GROQ_API_KEY = '';
    process.env.ANTHROPIC_API_KEY = '';
    const uri = `${BASE_URI.replace(/\/$/, '')}/${DB_NAME}`;
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    app = require('../../app');
    User = require('../../models/User');
    await User.init(); // build the unique email index
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      if (mongoose.connection.name === DB_NAME) await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  });

  // ---------- health ----------
  test('GET /api/health reports a connected database without config details', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'connected' });
  });

  // ---------- registration ----------
  test('student can register and receives a token; password is stored hashed', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...student, role: 'student' });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('student');
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.password).toBeUndefined();
    const stored = await User.findOne({ email: student.email }).select('+password');
    expect(stored.password).not.toBe(student.password);
    expect(stored.password).toMatch(/^\$2[aby]\$/);
    studentToken = res.body.token;
  });

  test('duplicate email is rejected', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...student, role: 'student' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  test('short password and invalid email give clear 400 messages', async () => {
    const short = await request(app).post('/api/auth/register').send({ name: 'Al', email: 'a@example.test', password: 'short' });
    expect(short.status).toBe(400);
    expect(short.body.message).toMatch(/at least 8/);
    const bad = await request(app).post('/api/auth/register').send({ name: 'Al', email: 'not-an-email', password: 'long-enough-1' });
    expect(bad.status).toBe(400);
    expect(bad.body.message).toMatch(/valid email/i);
  });

  test('staff registration without the staff sign-up code is refused', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...staff, role: 'staff' });
    expect(res.status).toBe(403);
    expect(await User.countDocuments({ email: staff.email })).toBe(0);
  });

  test('staff registration with a wrong code is refused', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...staff, role: 'staff', staffCode: 'wrong' });
    expect(res.status).toBe(403);
  });

  test('staff registration with the correct code succeeds', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...staff, role: 'staff', staffCode: STAFF_CODE });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('staff');
    staffToken = res.body.token;
  });

  test('admin cannot be self-registered', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'Mallory', email: 'm@example.test', password: 'mallory-pass-1', role: 'admin' });
    expect(res.status).toBe(400);
  });

  // ---------- login ----------
  test('login works with correct credentials (email is case-insensitive)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'STUDENT@example.test', password: student.password });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('student');
  });

  test('login rejects a wrong password and a non-string payload', async () => {
    const wrong = await request(app).post('/api/auth/login').send({ email: student.email, password: 'nope-nope-nope' });
    expect(wrong.status).toBe(401);
    const injection = await request(app).post('/api/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } });
    expect([400, 401]).toContain(injection.status);
    expect(injection.body.token).toBeUndefined();
  });

  // ---------- profile / privilege escalation ----------
  test('GET /api/auth/me returns the current user', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).toContain(student.email);
  });

  test('a student cannot make themselves admin through the profile endpoint', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Renamed Student', role: 'admin', password: 'plain-text', isActive: true });
    expect(res.status).toBe(200);
    const stored = await User.findOne({ email: student.email }).select('+password');
    expect(stored.role).toBe('student');
    expect(stored.name).toBe('Renamed Student');
    expect(stored.password).toMatch(/^\$2[aby]\$/); // still a bcrypt hash
  });

  test('profile update with no allowed fields returns 400', async () => {
    const res = await request(app).put('/api/auth/profile').set('Authorization', `Bearer ${studentToken}`).send({ role: 'admin' });
    expect(res.status).toBe(400);
  });

  // ---------- authorization ----------
  test('protected staff routes reject anonymous and student users', async () => {
    expect((await request(app).get('/api/waste/all')).status).toBe(401);
    const asStudent = await request(app).get('/api/waste/all').set('Authorization', `Bearer ${studentToken}`);
    expect(asStudent.status).toBe(403);
    const createAsStudent = await request(app).post('/api/waste').set('Authorization', `Bearer ${studentToken}`)
      .send({ foodType: 'Bread', weight: 1, date: '2026-11-01', location: 'Dining Hall' });
    expect(createAsStudent.status).toBe(403);
  });

  test('a token signed with a different secret is rejected', async () => {
    const jwt = require('jsonwebtoken');
    const forged = jwt.sign({ id: new mongoose.Types.ObjectId().toString(), role: 'admin' }, 'not-the-server-secret');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  // ---------- food waste CRUD ----------
  test('staff can create an entry (validation errors are 400)', async () => {
    const bad = await request(app).post('/api/waste').set('Authorization', `Bearer ${staffToken}`)
      .send({ foodType: 'Bread', weight: 'heavy', date: '2026-11-01', location: 'Dining Hall' });
    expect(bad.status).toBe(400);

    const res = await request(app).post('/api/waste').set('Authorization', `Bearer ${staffToken}`)
      .send({ foodType: 'Bread', weight: 4.5, date: '2026-11-01', location: 'Dining Hall', binFullness: 60, pH: 6.5 });
    expect(res.status).toBe(201);
    expect(res.body.published).toBe(false);
    entryId = res.body._id;
  });

  test('unpublished entries are hidden from the public list', async () => {
    const res = await request(app).get('/api/waste');
    expect(res.status).toBe(200);
    expect(res.body.find((e) => e._id === entryId)).toBeUndefined();
  });

  test('staff can edit an entry', async () => {
    const res = await request(app).put(`/api/waste/${entryId}`).set('Authorization', `Bearer ${staffToken}`)
      .send({ foodType: 'Bread rolls', weight: 5, date: '2026-11-01', location: 'Dining Hall' });
    expect(res.status).toBe(200);
    expect(res.body.foodType).toBe('Bread rolls');
  });

  test('publish requires a boolean and then shows the entry publicly', async () => {
    const bad = await request(app).put(`/api/waste/${entryId}/publish`).set('Authorization', `Bearer ${staffToken}`).send({ published: 'yes' });
    expect(bad.status).toBe(400);
    const ok = await request(app).put(`/api/waste/${entryId}/publish`).set('Authorization', `Bearer ${staffToken}`).send({ published: true });
    expect(ok.status).toBe(200);
    const list = await request(app).get('/api/waste');
    expect(list.body.find((e) => e._id === entryId)).toBeDefined();
  });

  test('staff report summary aggregates the data', async () => {
    const res = await request(app).get('/api/waste/reports/summary').set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).toMatch(/Dining Hall/);
  });

  test('priority list ranks entries for staff', async () => {
    const res = await request(app).get('/api/waste/priority').set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('deleting an unknown or malformed id returns 404, then real delete works', async () => {
    const malformed = await request(app).delete('/api/waste/not-an-id').set('Authorization', `Bearer ${staffToken}`);
    expect(malformed.status).toBe(404);
    const del = await request(app).delete(`/api/waste/${entryId}`).set('Authorization', `Bearer ${staffToken}`);
    expect(del.status).toBe(200);
    const again = await request(app).delete(`/api/waste/${entryId}`).set('Authorization', `Bearer ${staffToken}`);
    expect(again.status).toBe(404);
  });

  // ---------- tips, feedback, notifications, chat ----------
  test('public tips load', async () => {
    const res = await request(app).get('/api/tips');
    expect(res.status).toBe(200);
  });

  test('feedback: students submit, only staff can read', async () => {
    const sub = await request(app).post('/api/feedback').set('Authorization', `Bearer ${studentToken}`).send({ content: 'Great idea', rating: 5 });
    expect(sub.status).toBe(201);
    const badRating = await request(app).post('/api/feedback').set('Authorization', `Bearer ${studentToken}`).send({ content: 'x', rating: 9 });
    expect(badRating.status).toBe(400);
    expect((await request(app).get('/api/feedback').set('Authorization', `Bearer ${studentToken}`)).status).toBe(403);
    const asStaff = await request(app).get('/api/feedback').set('Authorization', `Bearer ${staffToken}`);
    expect(asStaff.status).toBe(200);
    expect(asStaff.body.count).toBeGreaterThanOrEqual(1);
  });

  test('notification preferences can be read and updated', async () => {
    const upd = await request(app).put('/api/notifications/preferences').set('Authorization', `Bearer ${studentToken}`).send({ sms: true });
    expect(upd.status).toBe(200);
    expect(upd.body.data.sms).toBe(true);
  });

  test('AI chat without a configured provider answers 503 with a clear message', async () => {
    const res = await request(app).post('/api/chat').set('Authorization', `Bearer ${studentToken}`).send({ messages: [{ role: 'user', content: 'hi' }] });
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/not configured/i);
  });

  // ---------- admin ----------
  test('admin can list users and delete one; a deleted user’s token stops working', async () => {
    const bcrypt = require('bcryptjs');
    const admin = await User.create({ name: 'Test Admin', email: 'admin@example.test', password: await bcrypt.hash('admin-pass-123', 10), role: 'admin' });
    const login = await request(app).post('/api/auth/login').send({ email: 'admin@example.test', password: 'admin-pass-123' });
    adminToken = login.body.token;

    const list = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(list.status).toBe(200);
    expect((await request(app).get('/api/users').set('Authorization', `Bearer ${staffToken}`)).status).toBe(403);

    const self = await request(app).delete(`/api/users/${admin._id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(self.status).toBe(400);

    const staffUser = await User.findOne({ email: staff.email });
    const del = await request(app).delete(`/api/users/${staffUser._id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(del.status).toBe(200);
    const afterDelete = await request(app).get('/api/waste/all').set('Authorization', `Bearer ${staffToken}`);
    expect(afterDelete.status).toBe(401);
  });

  test('a deactivated account can no longer log in or use its token', async () => {
    await User.updateOne({ email: student.email }, { $set: { isActive: false } });
    const login = await request(app).post('/api/auth/login').send({ email: student.email, password: student.password });
    expect(login.status).toBe(401);
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${studentToken}`);
    expect(me.status).toBe(401);
  });
});
