import { PrismaClient } from '@prisma/client';

const globalForDB = globalThis as unknown as { database: PrismaClient };

// Trong Prisma 7, chúng ta truyền URL trực tiếp vào constructor
export const database = globalForDB.database || new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') globalForDB.database = database;
