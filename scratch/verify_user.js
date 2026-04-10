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
    const email = 'kientran131208@gmail.com';
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpires: null
      }
    });
    console.log(`PASS: Da xac thuc thanh cong email ${email}`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
