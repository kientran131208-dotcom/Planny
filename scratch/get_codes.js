const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://postgres.nezhjivsrutdbqslttvc:6ShvdHhFhEhYaZFL@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
    }
  }
});

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: {
        resetCode: { not: null }
      },
      select: {
        email: true,
        resetCode: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });
    console.log('--- DANH SACH MA KHOI PHUC MAT KHAU MOI NHAT ---');
    users.forEach(u => {
      console.log(`Email: ${u.email} | Ma Reset: ${u.resetCode} | Cap nhat: ${u.updatedAt}`);
    });
    console.log('--------------------------------------');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
