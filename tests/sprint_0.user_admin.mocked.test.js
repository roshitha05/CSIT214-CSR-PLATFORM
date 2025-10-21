import {jest} from '@jest/globals';
import './helpers/mockDB.js';

process.env.DATABASE_URL ??= 'postgresql://mock:mock@localhost/mockdb?sslmode=require';
process.env.ENV ??= 'testing';       

import request from 'supertest';
const { default: App } = await import('../app.js');

import {
  BASE, USERS, USER, USERS_SEARCH, USER_SUSPEND,
  PROFILES, PROFILE, PROFILES_SEARCH, PROFILE_SUSPEND,
  LOGIN, LOGOUT
} from './helpers/testConfig.js';

const app = new App().app;
const agent = request.agent(app);

jest.setTimeout(15000);

describe('Sprint 0 — User Admin (FULL, MOCKED DB)', () => {
  let chosenUserId;
  let chosenProfileId;

  beforeAll(async () => {
    const res = await agent.post(LOGIN).send({ loginId: 'LiamCarter', password: 'LiamCarter' });
    if (![200, 204].includes(res.statusCode)) {
      console.error('LOGIN failed', res.statusCode, res.body);
    }
    expect([200, 204]).toContain(res.statusCode);
  });

  // UA-1-2: Create Profile
  test('Create Admin Profile (201/200/409)', async () => {
    const createProfile = { name: 'CSR_Profile_Manual', description: 'CSR profile created by mocked Jest' };
    const res = await agent.post(PROFILES).send(createProfile);
    expect([200, 201, 409]).toContain(res.statusCode);

    if (res.statusCode === 409) {
      const s = await agent.get(`${PROFILES_SEARCH}?q=${encodeURIComponent(createProfile.name)}`);
      expect(s.statusCode).toBe(200);
      chosenProfileId = s.body?.[0]?.id || s.body?.[0]?._id || 'p1';
    } else {
      chosenProfileId = res.body?.id || res.body?._id || res.body?.profile?.id || 'p1';
    }
    expect(chosenProfileId).toBeTruthy();
  });

  // UA-1-1: Create User
  test('Create User Account (201/200/409)', async () => {
    const createUser = {
      username: 'ManualUser01',
      loginId: 'ManualUser01',
      password: 'ManualUser01',
      email: 'ManualUser01@CSR.com',
      role: 'CSR Representative',
      phone: '91234567'
    };
    const res = await agent.post(USERS).send(createUser);
    expect([200, 201, 409]).toContain(res.statusCode);

    if (res.statusCode === 409) {
      const s = await agent.get(`${USERS_SEARCH}?q=${encodeURIComponent(createUser.loginId)}`);
      expect(s.statusCode).toBe(200);
      const found = Array.isArray(s.body)
        ? s.body.find(u => u.loginId === createUser.loginId || u.username === createUser.loginId)
        : null;
      chosenUserId = found?.id || found?._id || 'u1';
    } else {
      chosenUserId = res.body?.id || res.body?._id || res.body?.user?.id || 'u1';
    }
    expect(chosenUserId).toBeTruthy();
  });

  // UA-2: View Users
  test('View User Accounts (200)', async () => {
    const res = await agent.get(USERS);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('View User Account Details (200)', async () => {
    const res = await agent.get(USER(chosenUserId));
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  // UA-3: View Profiles
  test('View User Profiles (200)', async () => {
    const res = await agent.get(PROFILES);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('View User Profile Details (200)', async () => {
    const res = await agent.get(PROFILE(chosenProfileId));
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  // UA-4 / UA-5: Update
  test('Update User Account (200/204)', async () => {
    const res = await agent.patch(USER(chosenUserId)).send({ phone: '9999' });
    expect([200, 204]).toContain(res.statusCode);
  });

  test('Update User Profile (200/204)', async () => {
    const res = await agent.patch(PROFILE(chosenProfileId)).send({ description: 'Updated CSR description' });
    expect([200, 204]).toContain(res.statusCode);
  });

  // UA-6 / UA-7: Suspend
  test('Suspend User Account (200/204)', async () => {
    const res = await agent.patch(USER_SUSPEND(chosenUserId)).send({ suspended: true });
    expect([200, 204]).toContain(res.statusCode);
  });

  test('Suspend User Profile (200/204)', async () => {
    const res = await agent.patch(PROFILE_SUSPEND(chosenProfileId)).send({ suspended: true });
    expect([200, 204]).toContain(res.statusCode);
  });

  // UA-8 / UA-9: Search
  test('Search User Accounts (200)', async () => {
    const res = await agent.get(`${USERS_SEARCH}?q=${encodeURIComponent('ManualUser01')}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Search User Profiles (200)', async () => {
    const res = await agent.get(`${PROFILES_SEARCH}?q=${encodeURIComponent('CSR')}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // UA-10 / UA-11: Login/Logout
  test('Admin logs in (noop)', async () => {
    const res = await agent.post(LOGIN).send({ loginId: 'LiamCarter', password: 'LiamCarter' });
    expect([200, 204]).toContain(res.statusCode);
  });

  test('Admin logs out (200/204)', async () => {
    const res = await agent.post(LOGOUT);
    expect([200, 204]).toContain(res.statusCode);
  });
});
