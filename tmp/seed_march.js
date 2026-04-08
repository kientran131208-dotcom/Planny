const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMarchData() {
  const userId = 'user_clanny_01'; // Default dev user
  
  // Check if we have subjects
  const subjects = await prisma.subject.findMany({ where: { userId } });
  const subjectId = subjects[0]?.id || null;

  console.log('Creating March Testing Data...');
  
  await prisma.task.create({
    data: {
      title: 'Ôn tập Giải tích (Tháng 3)',
      date: new Date('2026-03-15T09:00:00Z'),
      dateEnd: new Date('2026-03-20T17:00:00Z'),
      priority: 'HIGH',
      userId,
      subjectId,
      isCompleted: false
    }
  });

  await prisma.event.create({
    data: {
      title: 'Hội thảo Công nghệ (Tháng 3)',
      date: new Date('2026-03-10T08:00:00Z'),
      dateEnd: new Date('2026-03-10T11:00:00Z'),
      priority: 'MEDIUM',
      userId,
      subjectId,
      isCompleted: false
    }
  });

  console.log('Done! March data created.');
  process.exit(0);
}

createMarchData();
