import 'server-only';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForDB = globalThis as unknown as { database: PrismaClient };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

export const database = globalForDB.database || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForDB.database = database;
