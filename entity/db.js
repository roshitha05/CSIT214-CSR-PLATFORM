import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

export default class DB {
    constructor() {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        this.db = drizzle(pool);
    }
}
