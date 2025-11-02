// tests/sprint0.functional.test.js
import request from 'supertest';
import App from '../app.js';
import {
  LOGIN, LOGOUT,
  USERS as CREATE_ACCOUNT, USERS as GET_ACCOUNTS,
  PROFILES as CREATE_PROFILE, PROFILES as GET_PROFILES,
  data as testData,
  setupDbForTests,
  loginWithDebug
} from './helpers/testConfig.js';

const app = new App().app;
const agent = request.agent(app);
const uniq = () => Date.now().toString().slice(-6);

beforeAll(async () => {
  await setupDbForTests();
});

describe('Sprint 0 — Functional Tests', () => {
  test('1) UA logs in (fallback CSR if needed)', async () => {
    const { role, res } = await loginWithDebug(
      agent,
      testData.adminUA,
      testData.adminCSR,
      LOGIN
    );
    expect([200, 204]).toContain(res.statusCode);
    console.log(`✅ Logged in as ${role}`);
  });

  test('2) Create User Profile', async () => {
    await loginWithDebug(agent, testData.adminUA, testData.adminCSR, LOGIN);
    const suffix = uniq();
    const p = testData.create.profile;
    const payload = { name: `${p.name}_${suffix}`, description: p.description, status: p.status };

    const createRes = await agent.post(CREATE_PROFILE).send(payload);
    expect([200, 201]).toContain(createRes.statusCode);

    const getRes = await agent.get(GET_PROFILES).query({ name: payload.name });
    expect(getRes.statusCode).toBe(200);
  });

  test('3) Create User Account', async () => {
    await loginWithDebug(agent, testData.adminUA, testData.adminCSR, LOGIN);
    const suffix = uniq();
    const u = testData.create.user;
    const payload = {
      fullname: u.fullname,
      email: u.email.replace('@', `+${suffix}@`),
      username: `${u.username}_${suffix}`,
      password: u.password,
      phone_number: u.phone_number,
      address: u.address,
      date_of_birth: u.date_of_birth,
      status: u.status,
      user_profile: u.user_profile
    };

    const createRes = await agent.post(CREATE_ACCOUNT).send(payload);
    expect([200, 201]).toContain(createRes.statusCode);

    // (optional) quick check via search if your API supports it
    // const getRes = await agent.get(GET_ACCOUNTS).query({ username: payload.username });
    // expect(getRes.statusCode).toBe(200);
  });

  test('4) Log Out', async () => {
    const res = await agent.post(LOGOUT);
    expect([200, 204]).toContain(res.statusCode);
  });
});
