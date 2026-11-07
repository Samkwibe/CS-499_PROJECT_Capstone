/**
 * Browser workflow checks for MunchiesSNHU (Playwright).
 *
 * Runs against a LOCAL server backed by an ISOLATED database seeded with fictional data:
 *   1. start mongod locally and the API:  MONGODB_URI=mongodb://127.0.0.1:27017/munchies_e2e \
 *        JWT_SECRET=<32+ random chars> STAFF_SIGNUP_CODE=local-staff-code PORT=5055 node ../snhu-foodwaste-backend/server.js
 *   2. seed demo data:  DEMO_STUDENT_PASSWORD=local-demo-student-1 DEMO_STAFF_PASSWORD=local-demo-staff-1 \
 *        node ../snhu-foodwaste-backend/scripts/seed-demo.js --confirm
 *   3. npm install && BASE_URL=http://localhost:5055 npm test
 * Never point this at production: it creates and deletes records.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const B = process.env.BASE_URL || 'http://localhost:5055';
if (!/^http:\/\/(localhost|127\.0\.0\.1)/.test(B) && process.env.ALLOW_REMOTE_E2E !== '1') {
  throw new Error(`Refusing to run browser workflows against ${B}; they create and delete data.`);
}
const STUDENT_PW = process.env.DEMO_STUDENT_PASSWORD || 'local-demo-student-1';
const STAFF_PW = process.env.DEMO_STAFF_PASSWORD || 'local-demo-staff-1';
const STAFF_CODE = process.env.STAFF_SIGNUP_CODE || 'local-staff-code';
// Optional: serve Chart.js from a local file when the CDN is unreachable (offline sandboxes).
const CHART = process.env.CHART_JS_PATH ? fs.readFileSync(process.env.CHART_JS_PATH, 'utf8') : null;
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] } : {});

async function newPage(viewport = { width: 1366, height: 900 }) {
  const ctx = await browser.newContext({ viewport });
  // Serve Chart.js locally (the sandbox cannot reach the CDN); other external assets are skipped.
  if (CHART) {
    await ctx.route('https://cdn.jsdelivr.net/npm/chart.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: CHART }));
    await ctx.route(/^https:\/\/(fonts|cdnjs)\./, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  }
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  return page;
}

const stamp = Date.now().toString(36);

// 1. Student sign-up through the UI
{
  const p = await newPage();
  await p.goto(`${B}/signup.html`);
  await p.fill('#nameInput', 'Recruiter Student');
  await p.fill('#emailInput', `student.${stamp}@example.com`);
  await p.fill('#passwordInput', 'short');
  await p.fill('#confirmPasswordInput', 'short');
  await p.click('#signupBtn');
  check('signup: short password shows a validation message', /at least 8/i.test(await p.textContent('#status')));
  await p.fill('#passwordInput', 'student-pass-123');
  await p.fill('#confirmPasswordInput', 'student-pass-123');
  await p.click('#signupBtn');
  await p.waitForURL(/settings-student|student-dashboard/, { timeout: 8000 }).catch(() => {});
  check('signup: student account created and redirected', /settings-student|student-dashboard/.test(p.url()), p.url().replace(B, ''));
  check('signup: no JS errors', p.errors.length === 0, p.errors.join(' | '));
  await p.context().close();
}

// 2. Staff sign-up needs the code
{
  const p = await newPage();
  await p.goto(`${B}/signup.html`);
  check('signup: staff code field hidden for students', await p.isHidden('#staffCodeField'));
  await p.check('input[name="role"][value="staff"]');
  check('signup: staff code field appears for staff', await p.isVisible('#staffCodeField'));
  await p.fill('#nameInput', 'Would-be Staff');
  await p.fill('#emailInput', `staff.${stamp}@example.com`);
  await p.fill('#passwordInput', 'staff-pass-1234');
  await p.fill('#confirmPasswordInput', 'staff-pass-1234');
  await p.fill('#staffCodeInput', 'wrong-code');
  await p.click('#signupBtn');
  await p.waitForTimeout(800);
  check('signup: wrong staff code is refused with a clear message', /staff sign-up code/i.test(await p.textContent('#status')), (await p.textContent('#status')).trim());
  await p.fill('#staffCodeInput', STAFF_CODE);
  await p.click('#signupBtn');
  await p.waitForURL(/staff-dashboard/, { timeout: 8000 }).catch(() => {});
  check('signup: correct staff code creates a staff account', /staff-dashboard/.test(p.url()));
  await p.context().close();
}

// 3. Login UI (wrong then right) and student dashboard
{
  const p = await newPage();
  await p.goto(`${B}/login.html`);
  await p.fill('#emailInput', 'demo.student@example.com');
  await p.fill('#passwordInput', 'wrong-password');
  await p.click('#loginBtn');
  await p.waitForTimeout(800);
  check('login: wrong password shows an error', /invalid|failed|incorrect/i.test(await p.textContent('#statusMsg')), (await p.textContent('#statusMsg')).trim());
  await p.fill('#passwordInput', STUDENT_PW);
  await p.click('#loginBtn');
  await p.waitForURL(/student-dashboard|settings-student/, { timeout: 8000 }).catch(() => {});
  check('login: student lands on a student page', /student/.test(p.url()), p.url().replace(B, ''));
  await p.goto(`${B}/student-dashboard.html`);
  await p.waitForTimeout(1500);
  const canvases = await p.locator('canvas').count();
  const text = await p.textContent('body');
  check('student dashboard: loads published data', /Dining Hall|kg|lbs|Total/i.test(text) && p.errors.length === 0, `canvases=${canvases}; errors=${p.errors.length}`);
  await p.goto(`${B}/data-entry.html`);
  await p.waitForTimeout(800);
  check('student cannot open staff data entry', !/data-entry/.test(p.url()) || /not authorized|access/i.test(await p.textContent('body')), p.url().replace(B, ''));
  await p.context().close();
}

// 4. Staff workflows: dashboard, data entry CRUD, search, publish, reports, import, settings
{
  const p = await newPage();
  await p.goto(`${B}/login.html`);
  await p.fill('#emailInput', 'demo.staff@example.com');
  await p.fill('#passwordInput', STAFF_PW);
  await p.click('#loginBtn');
  await p.waitForURL(/staff-dashboard/, { timeout: 8000 }).catch(() => {});
  check('login: staff lands on the staff dashboard', /staff-dashboard/.test(p.url()));
  await p.waitForTimeout(2000);
  const charts = await p.evaluate(() => (window.Chart && Object.keys(window.Chart.instances || {}).length) || 0);
  check('staff dashboard: charts render with data', charts > 0 && p.errors.length === 0, `charts=${charts}; errors=${p.errors.join(' | ')}`);
  
  await p.goto(`${B}/data-entry.html`);
  await p.waitForTimeout(1500);
  const before = await p.locator('#foodWasteBody tr').count();
  check('data entry: existing entries are listed', before > 0, `rows=${before}`);

  // Validation
  await p.click('#addBtn');
  await p.waitForTimeout(400);
  const formMsg = (await p.textContent('#formStatus')) + (await p.textContent('#msgFoodType'));
  check('data entry: empty form shows validation messages', formMsg.trim().length > 0, formMsg.trim().slice(0, 80));

  // Create
  await p.fill('#foodType', `E2E Carrots ${stamp}`);
  await p.fill('#wasteWeight', '7.5');
  await p.fill('#wasteDate', '2026-11-05');
  await p.fill('#wasteLocation', 'Dining Hall');
  await p.fill('#binFullness', '55');
  await p.click('#addBtn');
  await p.waitForTimeout(400);
  check('data entry: missing sensor readings are reported', /required/i.test(await p.textContent('#formStatus')), (await p.textContent('#formStatus')).trim());
  await p.fill('#temperature', '40');
  await p.fill('#relativeHumidity', '50');
  await p.fill('#phLevel', '6.5');
  await p.fill('#naturalGas', '1');
  await p.fill('#compostWeight', '2');
  await p.click('#addBtn');
  await p.waitForTimeout(1500);
  await p.fill('#entrySearch', stamp);
  await p.waitForTimeout(600);
  let row = p.locator('#foodWasteBody tr', { hasText: stamp });
  check('data entry: create + search finds the new entry', (await row.count()) === 1);

  // Edit
  await row.locator('.btn-edit').click();
  await p.waitForTimeout(400);
  await p.fill('#wasteWeight', '9.25');
  await p.click('#updateBtn');
  await p.waitForTimeout(1500);
  await p.fill('#entrySearch', stamp);
  await p.waitForTimeout(600);
  row = p.locator('#foodWasteBody tr', { hasText: stamp });
  check('data entry: edit saves the new weight', /9\.25/.test(await row.textContent()));

  // Publish
  await row.locator('.btn-publish').click();
  await p.waitForTimeout(1200);
  const pub = await (await fetch(`${B}/api/waste`)).json();
  check('data entry: publish makes it public', pub.some((e) => e.foodType.includes(stamp)));

  // Delete
  await p.fill('#entrySearch', stamp);
  await p.waitForTimeout(600);
  await p.locator('#foodWasteBody tr', { hasText: stamp }).locator('.btn-delete').click();
  await p.waitForTimeout(1500);
  await p.fill('#entrySearch', stamp);
  await p.waitForTimeout(600);
  check('data entry: delete removes the entry', (await p.locator('#foodWasteBody tr', { hasText: stamp }).count()) === 0);
  check('data entry: no JS errors during CRUD', p.errors.length === 0, p.errors.join(' | '));

  for (const page of ['staff-report.html', 'staff-import.html', 'settings-staff.html']) {
    p.errors.length = 0;
    await p.goto(`${B}/${page}`);
    await p.waitForTimeout(1500);
    check(`${page}: loads for staff without errors`, p.url().endsWith(page) && p.errors.length === 0, p.errors.join(' | '));
  }

  // Logout
  const logout = p.locator('[data-logout]').first();
  if (await logout.count()) {
    await logout.click();
    await p.waitForTimeout(800);
    const token = await p.evaluate(() => localStorage.getItem('authToken'));
    check('logout: clears the session', token === null, p.url().replace(B, ''));
  } else {
    check('logout: control present on staff page', false, 'no [data-logout] element');
  }
  await p.context().close();
}

// 5. Mobile navigation and AI assistant widget
{
  const p = await newPage({ width: 390, height: 844 });
  await p.goto(`${B}/index.html`);
  await p.waitForTimeout(800);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('mobile: home page has no horizontal overflow', overflow <= 1, `overflow=${overflow}px`);
  const toggle = p.locator('.mnav-toggle').first();
  check('mobile: a menu toggle exists', (await toggle.count()) > 0);
  if (await toggle.count()) {
    await toggle.click();
    await p.waitForTimeout(400);
    const visibleLinks = await p.locator('.topnav a:visible').count();
    check('mobile: menu opens and shows links', visibleLinks > 0, `visible links=${visibleLinks}`);
  }
  const chatBtn = p.locator('.mchat-btn').first();
  check('AI assistant: chat button present', (await chatBtn.count()) > 0);
  if (await chatBtn.count()) {
    await chatBtn.click();
    await p.waitForTimeout(400);
    check('AI assistant: panel opens', await p.locator('.mchat-panel').isVisible());
  }
  check('mobile: no JS errors', p.errors.length === 0, p.errors.join(' | '));
  await p.context().close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exitCode = failed.length ? 1 : 0;
