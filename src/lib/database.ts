import { PrismaClient } from '@prisma/client';

const globalForDB = globalThis as unknown as { database: PrismaClient };

export const database = globalForDB.database || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForDB.database = database;
