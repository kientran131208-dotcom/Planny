// Prisma client v2 - forced refresh for ghost columns
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForPrismaV2 = globalThis as unknown as { prismaV2: PrismaClient };

const dbPath = path.resolve(process.cwd(), 'prisma/dev.db').replace(/\\/g, '/');
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
});

export const prisma = globalForPrismaV2.prismaV2 || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrismaV2.prismaV2 = prisma;
