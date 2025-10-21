import request from 'supertest';
import App from '../app.js';
const app = new App().app; 

import {
  USERS, USER, USERS_SEARCH, USER_SUSPEND,
  PROFILES, PROFILE, PROFILES_SEARCH, PROFILE_SUSPEND,
  LOGIN, LOGOUT, data, pickId
} from './helpers/testConfig.js';


test('UA-1-2 — Create Admin Profile (manual body; 200/201/409)', async () => {
  const res = await request(app).post(PROFILES).send(data.create.profile);
  expect([200, 201, 409]).toContain(res.statusCode);
});


test('UA-1-1 — Create User Account As Admin (manual body; 200/201/409)', async () => {
  const res = await request(app).post(USERS).send(data.create.user);
  expect([200, 201, 409]).toContain(res.statusCode);
});

let chosenUserId;

test('UA-2 — View User Accounts as Admin', async () => {
  const res = await request(app).get(USERS);
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);

  const found = res.body.find(
    (u) => u.loginId === data.csrUser.loginId || u.username === data.csrUser.loginId
  );
  const picked = found || res.body[0];
  chosenUserId = pickId(picked);
  expect(!!chosenUserId).toBe(true);
});

test('UA-2 — View User Account Details as Admin', async () => {
  const res = await request(app).get(USER(chosenUserId));
  expect(res.statusCode).toBe(200);
  expect(typeof res.body).toBe('object');
});

let chosenProfileId;

test('UA-3 — View User Profile as Admin', async () => {
  const res = await request(app).get(PROFILES);
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);

  const found = res.body.find((p) => p.name === data.profileKey.name);
  const picked = found || res.body[0];
  chosenProfileId = pickId(picked);
  expect(!!chosenProfileId).toBe(true);
});

test('UA-3 — View User Profile Details as Admin', async () => {
  const res = await request(app).get(PROFILE(chosenProfileId));
  expect(res.statusCode).toBe(200);
  expect(typeof res.body).toBe('object');
});

test('UA-4 — Update User Account as Admin', async () => {
  const res = await request(app).patch(USER(chosenUserId)).send(data.update.user);
  expect(res.statusCode).toBe(200);
});

test('UA-5 — Update User Profile as Admin', async () => {
  const res = await request(app).patch(PROFILE(chosenProfileId)).send(data.update.profile);
  expect(res.statusCode).toBe(200);
});


test('UA-6 — Suspend User Account as Admin', async () => {
  const res = await request(app).patch(USER_SUSPEND(chosenUserId)).send(data.suspend.user);
  expect([200, 204]).toContain(res.statusCode);
});


test('UA-7 — Suspend User Profile as Admin', async () => {
  const res = await request(app).patch(PROFILE_SUSPEND(chosenProfileId)).send(data.suspend.profile);
  expect([200, 204]).toContain(res.statusCode);
});


test('UA-8 — Search User Accounts as Admin', async () => {
  const q = encodeURIComponent(data.admin.loginId);
  const res = await request(app).get(`${USERS_SEARCH}?q=${q}`);
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  const has = res.body.some(
    (u) => u.loginId === data.admin.loginId || u.username === data.admin.loginId
  );
  expect(has).toBe(true);
});


test('UA-9 — Search User Profiles as Admin', async () => {
  const q = encodeURIComponent(data.profileKey.name);
  const res = await request(app).get(`${PROFILES_SEARCH}?q=${q}`);
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);
});

test('UA-10 — User Admin logs in', async () => {
  const res = await request(app).post(LOGIN).send({
    loginId: data.admin.loginId,
    password: data.admin.password
  });
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('user');
  expect(res.body).not.toHaveProperty('token');
  const idField = res.body.user.loginId || res.body.user.username || res.body.user.email;
  expect(idField).toBe(data.admin.loginId);
});

test('UA-11 — User Admin logs out', async () => {
  const res = await request(app).post(LOGOUT);
  expect(res.statusCode).toBe(200);
  expect(res.body).toBe(true);
});
