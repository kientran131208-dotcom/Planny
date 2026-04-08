const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.studySession.findMany({
    include: { user: true, subject: true }
  });
  console.log('--- ALL STUDY SESSIONS ---');
  console.log(JSON.stringify(sessions, null, 2));

  const users = await prisma.user.findMany();
  console.log('--- ALL USERS ---');
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
