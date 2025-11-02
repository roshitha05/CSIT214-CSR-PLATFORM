// tests/sprint0.functional.test.js
import request from 'supertest';
import App from '../app.js';

import {
  LOGIN, LOGOUT,
  USERS as CREATE_ACCOUNT, USERS as GET_ACCOUNTS,
  PROFILES as CREATE_PROFILE, PROFILES as GET_PROFILES,
  data as testData,
  setupDbForTests
} from './helpers/testConfig.js';

const app = new App().app;
const agent = request.agent(app);
const uniq = () => Date.now().toString().slice(-6);

// run DB help prop
beforeAll(async () => {
  await setupDbForTests();
})

// --- Helper Functions ------------------------------------------------------

// Debug failed requests clearly
function debugFail(label, res) {
  console.error(`${label} FAILED:`, res.statusCode, res.body, res.text);
}

// Log in as the existing User Admin (IsabellaGray)
async function loginAsAdmin() {
  const creds = {
    username: testData.admin.username,
    password: testData.admin.password
  };
  const res = await agent.post(LOGIN).send(creds);

  if (![200, 204].includes(res.statusCode)) {
    throw new Error(
      `Admin login failed: status=${res.statusCode}, body=${JSON.stringify(res.body)}`
    );
  }

  const role = String(res.body?.user?.user_profile || '');
  if (!/user[_\s-]?admin/i.test(role)) {
    throw new Error(
      `Logged in as "${creds.username}" but role="${role}". Expected User Admin permissions.`
    );
  }
  return res;
}

// Ensure a profile with the given name exists (FK for user_profile)
async function ensureProfileExists(name) {
  const r = await agent.get(GET_PROFILES).query({ name });
  if (r.statusCode === 200) {
    const found = Array.isArray(r.body)
      ? r.body.find(p => p.name === name)
      : (r.body?.name === name ? r.body : null);
    if (found) return found;
  }

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

// --- Functional Tests ------------------------------------------------------

describe('Sprint 0 — Functional Tests (User Admin)', () => {

  test('1️⃣ Admin logs in successfully', async () => {
    const res = await loginAsAdmin();
    expect([200, 204]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('username', testData.admin.username);
  });

  test('2️⃣ Create User Profile as User Admin', async () => {
    await loginAsAdmin();

    const suffix = uniq();
    const p = testData.create.profile;
    const payload = {
      name:        `${p.name}_${suffix}`,
      description: p.description,
      status:      p.status || 'ACTIVE'
    };

    const createRes = await agent.post(CREATE_PROFILE).send(payload);
    if (![200, 201].includes(createRes.statusCode)) debugFail('CreateProfile', createRes);
    expect([200, 201]).toContain(createRes.statusCode);

    const getRes = await agent.get(GET_PROFILES).query({ name: payload.name });
    expect(getRes.statusCode).toBe(200);
  });

  test('3️⃣ Create User Account as User Admin', async () => {
    await loginAsAdmin();
    await ensureProfileExists('CSR Representative');

    const suffix = uniq();
    const base = testData.create.user;
    const payload = {
      fullname:      base.fullname,
      email:         base.email.replace('@', `+${suffix}@`),
      username:      `${base.username}_${suffix}`,
      password:      base.password,
      phone_number:  base.phone_number,
      address:       base.address,
      date_of_birth: base.date_of_birth,
      status:        base.status,
      user_profile:  base.user_profile
    };

    const createRes = await agent.post(CREATE_ACCOUNT).send(payload);
    if (![200, 201].includes(createRes.statusCode)) debugFail('CreateUser', createRes);
    expect([200, 201]).toContain(createRes.statusCode);
  });

  test('4️⃣ Log Out as User Admin', async () => {
    const res = await agent.post(LOGOUT);
    expect([200, 204]).toContain(res.statusCode);
    expect(res.body === true || typeof res.body === 'object').toBe(true);
  });

});

// close DB connection to avoid open handles
afterAll(async () => {
  try {
    const { default: DB } = await import('../database/db.js');
    DB.getInstance().getPool().end();
  } catch {}
});
