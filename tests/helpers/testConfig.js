import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const data = JSON.parse(
  fs.readFileSync(join(__dirname, '..', 'testData.json'), 'utf8')
);

export const BASE = '/api';

export const USERS = `${BASE}/users`;
export const USER = (id) => `${USERS}/${id}`;
export const USERS_SEARCH = `${USERS}/search`;
export const USER_SUSPEND = (id) => `${USERS}/${id}/suspend`;

export const PROFILES = `${BASE}/user-profiles`;
export const PROFILE = (id) => `${PROFILES}/${id}`;
export const PROFILES_SEARCH = `${PROFILES}/search`;
export const PROFILE_SUSPEND = (id) => `${PROFILES}/${id}/suspend`;

export const LOGIN = `${BASE}/login`;
export const LOGOUT = `${BASE}/logout`;

export const pickId = (obj) => obj?.id || obj?._id;
