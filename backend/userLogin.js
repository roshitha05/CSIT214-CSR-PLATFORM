import bcrypt from "bcrypt";
import { neonPool } from "./dbConnector.js";

const SALT_ROUNDS = 12;

async function q(text, params) {
  return neonPool.query(text, params);
}

export async function createUser(req, res) {
  const username = req.body.username;          
  const password = req.body.password;
  if (password.length < 6) {
    return res.status(400).json({ ok:false, error:"weak_password", min:6 });
  }
  if (username.length > 50) {
    return res.status(400).json({ ok:false, error:"username_too_long", max:50 });
  }

  try {
    await q(`
      CREATE TABLE IF NOT EXISTS account_data (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        joined_on TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const insert = await q(
      `INSERT INTO account_data (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO NOTHING
       RETURNING id, username`,
      [username, hash]
    );

    if (insert.rowCount === 0) {
      return res.status(409).json({ ok:false, error:"username_taken" });
    }

    const user = insert.rows[0];
    return res.status(201).json({ ok:true, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error("register_error:", err);
    return res.status(500).json({ ok:false, error:"server_error" });
  }
}
