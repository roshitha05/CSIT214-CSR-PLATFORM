// tests/helpers/testConfig.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// --- Load test data  ---
export const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'testData.json'), 'utf8')
);

// --- API routes ---
export const BASE = '/api';
export const LOGIN  = `${BASE}/login`;
export const LOGOUT = `${BASE}/logout`;

export const PROFILES        = `${BASE}/user-profiles`;
export const CREATE_PROFILE  = PROFILES;
export const GET_PROFILES    = `${PROFILES}/search`;   

export const USERS           = `${BASE}/users`;
export const CREATE_ACCOUNT  = USERS;
export const GET_ACCOUNTS    = `${USERS}/search`;      

// --- Simple login helper  ---
export async function loginAs(agent, creds) {
  // backend expects { login, password } (AuthEntity reads credentials.login)
  const res = await agent.post(LOGIN).send({
    login: creds.login,
    password: creds.password
  });
  return res;
}
