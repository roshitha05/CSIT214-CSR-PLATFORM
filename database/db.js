import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

export default class DB {
    static instance = null;

    constructor() {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        this.db = drizzle(pool);
        this.pool = pool;

        DB.instance = this;
    }

    static getInstance() {
        if (!DB.instance) {
            DB.instance = new DB();
        }
        return DB.instance;
    }

    getDatabase() {
        return this.db;
    }
}
