
import request from 'supertest';
import App from '../app.js';

import {
  // endpoints
  LOGIN, LOGOUT,
  USERS as CREATE_ACCOUNT, USERS as GET_ACCOUNTS,
  PROFILES as CREATE_PROFILE, PROFILES as GET_PROFILES,
  // parsed test data from tests/helpers/testConfig.js
  data as testData
} from './helpers/testConfig.js';

const app = new App().app;
const agent = request.agent(app);
const uniq = () => Date.now().toString().slice(-6);

// ---- helpers ---------------------------------------------------------------

// Some servers return plaintext/HTML on errors. Show both body & text.
function debugFail(label, res) {
  // eslint-disable-next-line no-console
  console.error(`${label} FAILED:`, res.statusCode, res.body, res.text);
}

// Login using { username, password }.
// Also enforce that the logged-in user has a "User Admin" role.
async function loginAsAdmin() {
  const creds = {
    username: testData.admin.username,     // <-- IMPORTANT: "username", not "loginId"
    password: testData.admin.password
  };
  const res = await agent.post(LOGIN).send(creds);

  if (![200, 204].includes(res.statusCode)) {
    throw new Error(`Admin login failed: status=${res.statusCode} body=${JSON.stringify(res.body)}`);
  }

  // Ensure role is an admin variant (your create routes require User Admin)
  const role = String(res.body?.user?.user_profile || '');
  if (!/user[_\s-]?admin/i.test(role)) {
    throw new Error(`Logged in as "${creds.username}" but role="${role}". Need "User Admin" permissions.`);
  }
  return res;
}

// Ensure a profile with the given name exists (FK for users.user_profile)
async function ensureProfileExists(name) {
  const r = await agent.get(GET_PROFILES).query({ name });
  if (r.statusCode === 200) {
    const found = Array.isArray(r.body)
      ? r.body.find(p => p.name === name)
      : (r.body?.name === name ? r.body : null);
    if (found) return found;
  }
  // seed it if not found
  const c = await agent.post(CREATE_PROFILE).send({
    name,
    description: 'Seeded by test to satisfy FK',
    status: 'ACTIVE'
  });
  if (![200, 201].includes(c.statusCode)) {
    debugFail('SeedProfile', c);
    throw new Error('Could not seed required user_profile');
  }
  return c.body;
}

// ---- tests -----------------------------------------------------------------

describe('Sprint 0 (Functional)', () => {
  test('Admin logs in successfully', async () => {
    const res = await loginAsAdmin();
    expect([200, 204]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('username', testData.admin.username);
  });

  test('Create User Account as User Admin', async () => {
    await loginAsAdmin();
    // Make sure the FK exists (user_profile -> user_profiles.name)
    await ensureProfileExists('CSR Representative');

    const suffix = uniq();
    const base = testData.create.user; // expect DB field names here
    const payload = {
      fullname:      base.fullname,
      email:         base.email.replace('@', `+${suffix}@`), // unique
      username:      `${base.username}_${suffix}`,           // unique
      password:      base.password,
      phone_number:  base.phone_number,
      address:       base.address,
      date_of_birth: base.date_of_birth,                     // YYYY-MM-DD
      status:        base.status,
      user_profile:  base.user_profile                       // must exist
    };

    const createRes = await agent.post(CREATE_ACCOUNT).send(payload);
    if (![200, 201].includes(createRes.statusCode)) debugFail('CreateUser', createRes);
    expect([200, 201]).toContain(createRes.statusCode);

    // Optional verification via GET ?username=
    const getRes = await agent.get(GET_ACCOUNTS).query({ username: payload.username });
    expect(getRes.statusCode).toBe(200);
    const found = Array.isArray(getRes.body)
      ? getRes.body.find(u => u.username === payload.username)
      : (getRes.body?.username === payload.username ? getRes.body : null);
    expect(found).toBeTruthy();
  });

  test('Create User Profile as User Admin', async () => {
    await loginAsAdmin();

    const suffix = uniq();
    const p = testData.create.profile; // { name, description, status }
    const payload = {
      name:        `${p.name}_${suffix}`,   // PK on name
      description: p.description,
      status:      p.status || 'ACTIVE'
    };

    const createRes = await agent.post(CREATE_PROFILE).send(payload);
    if (![200, 201].includes(createRes.statusCode)) debugFail('CreateProfile', createRes);
    expect([200, 201]).toContain(createRes.statusCode);

    // Optional verification via GET ?name=
    const getRes = await agent.get(GET_PROFILES).query({ name: payload.name });
    expect(getRes.statusCode).toBe(200);
    const found = Array.isArray(getRes.body)
      ? getRes.body.find(x => x.name === payload.name)
      : (getRes.body?.name === payload.name ? getRes.body : null);
    expect(found).toBeTruthy();
  });

  test('Login (negative) — wrong password', async () => {
    const wrong = {
      username: testData.admin.username,
      password: `${testData.admin.password}_x`
    };
    const res = await agent.post(LOGIN).send(wrong);
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  test('Log Out', async () => {
    const res = await agent.post(LOGOUT);
    expect([200, 204]).toContain(res.statusCode);
    expect(res.body === true || typeof res.body === 'object').toBe(true);
  });
});

// If your app exposes a DB pool, close it to avoid "open handles" warnings
afterAll(async () => {
  try {
    const { default: DB } = await import('../database/db.js'); // <-- correct path
    DB.getInstance().getPool().end();
  } catch { /* ignore if not available */ }
});
