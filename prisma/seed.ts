import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

// Matches the TEST_USER_ID used in Server Actions for consistency
const TEST_USER_ID = 'user_clanny_01';

async function main() {
  console.log('🚀 Starting Seeding Process...');

  console.log('🧹 Cleaning up database...');
  await prisma.studySession.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });

  console.log('👤 Creating test user...');
  const user = await prisma.user.create({
    data: {
      id: TEST_USER_ID,
      name: 'Tài khoản Dùng thử',
      email: 'demo-user@planny.test',
      role: 'Học sinh',
      school: 'THPT Chuyên Hà Nội - Amsterdam',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop'
    }
  });

  console.log('📚 Creating subjects...');
  const math = await prisma.subject.create({
    data: { name: 'Toán học', colorCode: '#1151d3', userId: user.id }
  });

  const eng = await prisma.subject.create({
    data: { name: 'Tiếng Anh', colorCode: '#9333ea', userId: user.id }
  });

  const physics = await prisma.subject.create({
    data: { name: 'Vật lý', colorCode: '#10b981', userId: user.id }
  });

  console.log('🎯 Creating academic goals...');
  const mathGoal = await prisma.goal.create({
    data: {
      title: 'Hoàn thành SGK Toán',
      description: 'Hoàn thành 20 chương Toán 12 trước kỳ thi THPTQG',
      deadline: new Date('2026-04-30'),
      progress: 75,
      status: 'ON_TRACK',
      userId: user.id
    }
  });

  const ieltsGoal = await prisma.goal.create({
    data: {
      title: 'IELTS Band 7.0',
      description: 'Đạt band 7.0 IELTS để du học Úc vào tháng 9/2026',
      deadline: new Date('2026-06-30'),
      progress: 45,
      status: 'IN_PROGRESS',
      userId: user.id
    }
  });

  const codingGoal = await prisma.goal.create({
    data: {
      title: 'Olympic Tin học',
      description: 'Tham gia Olympic Tin học cấp thành phố tháng 4/2026',
      deadline: new Date('2026-04-15'),
      progress: 90,
      status: 'AT_RISK',
      userId: user.id
    }
  });

  console.log('🏁 Creating milestones for goals...');
  const milestones = [
    { title: 'Chương 1-5', date: new Date('2026-02-15'), isCompleted: true, goalId: mathGoal.id },
    { title: 'Chương 6-10', date: new Date('2026-03-15'), isCompleted: true, goalId: mathGoal.id },
    { title: 'Chương 11-15', date: new Date('2026-04-01'), isCompleted: true, goalId: mathGoal.id },
    { title: 'Chương 16-20', date: new Date('2026-04-25'), isCompleted: false, goalId: mathGoal.id },
    
    { title: 'Bắt đầu ôn IELTS', date: new Date('2026-01-10'), isCompleted: true, goalId: ieltsGoal.id },
    { title: 'Listening 6.5 → 7.0', date: new Date('2026-03-20'), isCompleted: true, goalId: ieltsGoal.id },
    { title: 'Reading 6.0 → 7.0', date: new Date('2026-05-15'), isCompleted: false, goalId: ieltsGoal.id },
    
    { title: 'Đăng ký Olympic TH', date: new Date('2026-03-25'), isCompleted: true, goalId: codingGoal.id },
    { title: 'Thuật toán sắp xếp', date: new Date('2026-03-30'), isCompleted: true, goalId: codingGoal.id },
    { title: 'Quy hoạch động', date: new Date('2026-04-05'), isCompleted: true, goalId: codingGoal.id },
    { title: 'Đề thi thử cuối', date: new Date('2026-04-12'), isCompleted: false, goalId: codingGoal.id },
  ];

  for (const m of milestones) {
    await prisma.milestone.create({ data: m });
  }

  console.log('✅ Basic Seeding completed. Now generating historical study data...');

  const now = new Date();
  
  // Generating historical tasks
  console.log('📝 Generating tasks...');
  const taskTitles = ['Ôn tập Algebra', 'Viết bài luận IELTS', 'Giải đề Physics', 'Luyện Codeforces', 'Học từ vựng mới'];
  for (let i = 0; i < 40; i++) {
    const taskDate = new Date();
    taskDate.setDate(now.getDate() - (i % 15));
    const isCompleted = Math.random() > 0.3;
    const sub = [math.id, eng.id, physics.id][i % 3];
    
    await prisma.task.create({
      data: {
        title: taskTitles[i % taskTitles.length],
        date: taskDate,
        isCompleted,
        userId: user.id,
        subjectId: sub,
        priority: ['HIGH', 'MEDIUM', 'LOW'][i % 3]
      }
    });
  }

  // Generating historical study sessions
  console.log('📊 Generating study sessions...');
  for (let i = 0; i < 30; i++) {
    const sessionDate = new Date();
    sessionDate.setDate(now.getDate() - i);
    
    // Create 1-3 sessions per day
    const numSessions = Math.floor(Math.random() * 3) + 1;
    for (let s = 0; s < numSessions; s++) {
      const duration = Math.floor(Math.random() * 90) + 30; // 30-120 mins
      const sub = [math.id, eng.id, physics.id][Math.floor(Math.random() * 3)];
      
      await prisma.studySession.create({
        data: {
          date: sessionDate,
          durationMin: duration,
          userId: user.id,
          subjectId: sub,
          mode: 'FOCUS',
          title: `Học ${i % 2 === 0 ? 'chương mới' : 'ôn bài'}`
        }
      });
    }
  }

  console.log('✅ ALL SEEDING COMPLETED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
