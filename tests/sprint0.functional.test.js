import request from 'supertest';
import App from '../app.js';

import {
  LOGIN, LOGOUT,
  USERS as CREATE_ACCOUNT,
  USERS as GET_ACCOUNTS,
  PROFILES as CREATE_PROFILE,
  PROFILES as GET_PROFILES,
  data as testData 
} from './helpers/testConfig.js';

const app = new App().app;
const agent = request.agent(app);
const uniq = () => Date.now().toString().slice(-6);


async function loginAsAdmin() {
  const raw = testData.admin.loginId;
  const pwd = testData.admin.password;
  const email = testData.admin.email;

  for (const body of [
    { username: raw, password: pwd },
    { loginId:  raw, password: pwd },
    { email,    password: pwd },
    { loginId: raw, email, password: pwd }
  ]) {
    const res = await agent.post(LOGIN).send(body);
    if ([200, 204].includes(res.statusCode)) return res;
  }

  throw new Error('Admin login failed with username/loginId/email payloads.');
}

describe('Sprint 0', () => {
  test('Admin logs in successfully', async () => {
    const adminCreds = {
      loginId: testData.admin.loginId,
      email: testData.admin.email, 
      password: testData.admin.password
    };

    const res = await agent.post(LOGIN).send(adminCreds);

    expect([200, 204]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('username', testData.admin.loginId);
  });

    test('Create User Profile as User Admin', async () => {
    await loginAsAdmin();
    //const suffix = uniq();

    const profile = testData.create.profile;
    const payload = {
        ...profile,
        name: profile.name
    };

    const createRes = await agent.post(CREATE_PROFILE).send(payload);
    if (![200, 201].includes(createRes.statusCode)) {
        console.error('CreateProfile FAILED:', createRes.statusCode, createRes.body);
    }
    expect([200, 201]).toContain(createRes.statusCode);
    });

    test('Create User Account as User Admin', async () => {
    await loginAsAdmin();
    const suffix = uniq();

    const user = testData.create.user;
    const payload = {
        ...user,
        username: `${user.username}_${suffix}`,
        email: user.email.replace('@', `+${suffix}@`) 
    };

    const createRes = await agent.post(CREATE_ACCOUNT).send(payload);
    if (![200, 201].includes(createRes.statusCode)) {
        console.error('CreateUser FAILED:', createRes.statusCode, createRes.body);
    }
    expect([200, 201]).toContain(createRes.statusCode);
    });


  test('Login as User Admin (negative: wrong password)', async () => {
    // Sends wrong password to confirm auth failure codes are correct
    const wrong = { loginId: testData.admin.loginId, password: testData.admin.password + '_x' };
    const res = await agent.post(LOGIN).send(wrong);
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  test('Log Out as User Admin', async () => {
    const res = await agent.post(LOGOUT);
    expect([200, 204]).toContain(res.statusCode);
    expect(res.body === true || typeof res.body === 'object').toBe(true);
  });
});

afterAll(async () => {
  try {
    const { default: DB } = await import('../db.js');
    DB.getInstance().getPool().end();
  } catch {}
});