import 'server-only';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Trong Prisma 7, chúng ta truyền URL trực tiếp vào constructor
export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
