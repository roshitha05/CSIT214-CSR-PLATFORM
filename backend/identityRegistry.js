import bcrypt from "bcrypt";

export class IdentityRegistry {
  constructor(pgPool) {
    this.pool = pgPool;
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS account_data (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        joined_on TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id INTEGER PRIMARY KEY REFERENCES account_data(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        display_name VARCHAR(80)
      );
    `);
  }

  async register({ username, password, role = "user", displayName = null }) {
    if (!username || !password) throw new Error("missing_credentials");
    if (password.length < 6) throw new Error("weak_password");

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const hash = await bcrypt.hash(password, 12);
      const acc = await client.query(
        `INSERT INTO account_data (username, password_hash)
         VALUES ($1,$2)
         ON CONFLICT (username) DO NOTHING
         RETURNING id, username`,
        [String(username).trim().toLowerCase(), hash]
      );
      if (acc.rowCount === 0) throw new Error("username_taken");

      const userId = acc.rows[0].id;
      await client.query(
        `INSERT INTO user_profiles (user_id, role, display_name)
         VALUES ($1,$2,$3)
         ON CONFLICT (user_id) DO UPDATE
           SET role = EXCLUDED.role, display_name = EXCLUDED.display_name`,
        [userId, role, displayName]
      );

      await client.query("COMMIT");
      return { id: userId, username: acc.rows[0].username, role };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async authenticate({ username, password }) {
    const { rows } = await this.pool.query(
      `SELECT a.id, a.username, a.password_hash, p.role
         FROM account_data a
         LEFT JOIN user_profiles p ON p.user_id = a.id
        WHERE a.username = $1
        LIMIT 1`,
      [String(username).trim().toLowerCase()]
    );
    const row = rows[0];
    if (!row) return null;

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return null;

    return { id: row.id, username: row.username, role: row.role || "user" };
  }

  async profile(userId) {
    const { rows } = await this.pool.query(
      `SELECT a.id, a.username, p.role, p.display_name, a.joined_on
         FROM account_data a
         LEFT JOIN user_profiles p ON p.user_id = a.id
        WHERE a.id = $1`,
      [userId]
    );
    return rows[0] || null;
  }
}

