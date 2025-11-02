import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Client } from 'pg';

const dataPath = path.join(process.cwd(), 'tests', 'testData.json');
export const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

export const BASE = '/api';
export const USERS = `${BASE}/users`;
export const USER = (id) => `${USERS}/${id}`;
export const PROFILES = `${BASE}/user-profiles`;
export const PROFILE = (id) => `${PROFILES}/${id}`;
export const LOGIN = `${BASE}/login`;
export const LOGOUT = `${BASE}/logout`;

/**
 * Test-only setup:
 * - Hash admin password in users.password (bcrypt)
 * - Ensure 'User Admin' exists in user_profiles
 * Uses process.env.DATABASE_URL (must be set when running tests).
 */
export async function setupDbForTests() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.warn('[TestSetup] DATABASE_URL not set; skipping DB prep.');
    return;
  }
  const adminUser = data?.admin?.username;
  const adminPlain = data?.admin?.password;
  if (!adminUser || !adminPlain) {
    console.warn('[TestSetup] Missing admin creds in tests/testData.json; skipping DB prep.');
    return;
  }

  const client = new Client({ connectionString: conn });
  await client.connect();
  try {
    // Ensure 'User Admin' profile exists
    await client.query(
      `INSERT INTO user_profiles (name, description, status)
       VALUES ($1,$2,$3)
       ON CONFLICT (name) DO NOTHING`,
      ['User Admin', 'Full administrative privileges', 'ACTIVE']
    );

    // Hash the admin password and upsert the admin row
    const hash = await bcrypt.hash(adminPlain, 10);

    const upd = await client.query(
      `UPDATE users
         SET password = $1, status = 'ACTIVE', user_profile = 'User Admin'
       WHERE username = $2`,
      [hash, adminUser]
    );

    if (upd.rowCount === 0) {
      // If admin not present, insert it (safe for local/test DB)
      await client.query(
        `INSERT INTO users
          (fullname, email, username, password, phone_number, address, date_of_birth, status, user_profile)
         VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          'Test Admin',
          `${adminUser}@example.com`,
          adminUser,
          hash,
          '90000000',
          '1 Test Lane, Singapore',
          '1990-01-01',
          'ACTIVE',
          'User Admin'
        ]
      );
    }
  } finally {
    await client.end();
  }
}
