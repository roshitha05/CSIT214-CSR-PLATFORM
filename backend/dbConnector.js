import pg from "pg";

export const neonPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
