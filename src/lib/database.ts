import { PrismaClient } from '@prisma/client';

const globalForDB = globalThis as unknown as { database: PrismaClient };

export const database = globalForDB.database || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForDB.database = database;
