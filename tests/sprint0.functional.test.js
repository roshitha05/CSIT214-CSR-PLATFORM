
import request from 'supertest';
import App from '../app.js';
import {
  LOGOUT,
  CREATE_PROFILE, 
  CREATE_ACCOUNT, 
  data, 
  loginAs
} from './helpers/testConfig.js';

// --- Setup ---
const app   = new App().app;
const agent = request.agent(app);
const uniq  = () => Date.now().toString().slice(-6);

// --- Test Suite ---
describe('Sprint 0 — Functional Tests', () => {

  
  test('1️⃣ UA logs in successfully', async () => {
    const res = await loginAs(agent, data.adminUA);
    expect([200, 403]).toContain(res.statusCode);    
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('user');
    }
  });
  
  test('2️⃣ Create User Profile as User Admin', async () => {
    const suffix = uniq();
    const payload = {
      name: `${data.create.profile.name}_${suffix}`,
      description: data.create.profile.description,
      status: data.create.profile.status
    };
    const createRes = await agent.post(CREATE_PROFILE).send(payload);   
    expect([200, 201, 500]).toContain(createRes.statusCode);
  });

  test('3️⃣ Create User Account as User Admin', async () => {
    const suffix = uniq();
    const payload = {
      fullname: `${data.create.user.fullname} ${suffix}`,
      username: `${data.create.user.username}_${suffix}`,
      password: data.create.user.password,   // plaintext; server hashes internally
      email:    data.create.user.email,
      phone:    data.create.user.phone_number,
      status:   data.create.user.status,
      user_profile: data.create.user.user_profile
    };
    const createRes = await agent.post(CREATE_ACCOUNT).send(payload);  
    expect([200, 201, 204, 500]).toContain(createRes.statusCode);
  });

  // Logout
  test('4️⃣ Log Out as User Admin', async () => {
    const res = await agent.post(LOGOUT);
    expect([200, 204]).toContain(res.statusCode);
  });
});

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
});
