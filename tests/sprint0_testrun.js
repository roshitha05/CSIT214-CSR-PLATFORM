import request from 'supertest';
import App from '../app.js';
import { LOGIN, LOGOUT } from './helpers/testConfig.js';

const app = new App().app;
const agent = request.agent(app);

const admin = { loginId: 'LiamCarter', password: 'LiamCarter' };

test('UA-10 — Admin logs in successfully', async () => {
  const res = await agent.post(LOGIN).send(admin);

  console.log('Login response:', res.statusCode, res.body); 
  expect([200, 204]).toContain(res.statusCode);
  expect(res.body).toHaveProperty('user');
  expect(res.body.user).toHaveProperty('loginId', admin.loginId);
});

test('UA-11 — Admin logs out successfully', async () => {
  const res = await agent.post(LOGOUT);

  console.log('Logout response:', res.statusCode, res.body); 

  expect([200, 204]).toContain(res.statusCode);
  expect(res.body === true || typeof res.body === 'object').toBe(true);
});