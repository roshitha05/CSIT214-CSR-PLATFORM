import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { upstashCache } from 'drizzle-orm/cache/upstash';

export default class DB {
    static instance = null;

    constructor() {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        this.db = drizzle(
            pool,
            {
                cache: upstashCache({
                    url: "https://glowing-monkey-14895.upstash.io",
                    token: "ATovAAIncDJmZTQ3Nzc0NTljNDA0NTdmYTYzM2IwYjM4M2MwNjA0N3AyMTQ4OTU",
                    global: true
                }),
            }
        );
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

    getPool() {
        return this.pool
    }
}
