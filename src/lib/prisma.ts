import 'server-only';
// Prisma client initialization - forced reload for dateEnd 2026-04-04
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Ensure absolute path for SQLite
const dbPath = path.resolve(process.cwd(), 'prisma/dev.db').replace(/\\/g, '/');
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
});

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
