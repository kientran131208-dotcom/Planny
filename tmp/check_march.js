const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMarch() {
  const tasks = await prisma.task.findMany({
    where: {
      date: { gte: new Date('2026-03-01'), lte: new Date('2026-03-31') }
    }
  });
  console.log('MARCH TASKS:', tasks.length);
  const events = await prisma.event.findMany({
    where: {
      date: { gte: new Date('2026-03-01'), lte: new Date('2026-03-31') }
    }
  });
  console.log('MARCH EVENTS:', events.length);
  process.exit(0);
}

checkMarch();
