import bcrypt from "bcrypt";
import { neonPool } from "./dbConnector.js";

export async function userLogin(req, res) {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: "Please provide username and password" });
  }

  try {
    const result = await neonPool.query(
      "SELECT id, username, password_hash FROM account_data WHERE username = $1",
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ ok: false, error: "Invalid username or password" });
    }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ ok: false, error: "Invalid username or password" });
    }
    req.session.client = { id: user.id, username: user.username };
    res.json({ ok: true, message: "Login successful", user: req.session.client });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
}
