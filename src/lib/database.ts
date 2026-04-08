import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForDB = globalThis as unknown as { database: PrismaClient };

const dbPath = path.resolve(process.cwd(), 'prisma/dev.db').replace(/\\/g, '/');
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
});

export const database = globalForDB.database || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForDB.database = database;
