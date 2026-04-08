import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log("=== DEBUG ENV ===");
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  // console.log("ALL ENV:", process.env); // Be careful with secrets
  console.log("=================");
  try {
    console.log('Cleaning up database...');
    await prisma.milestone.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.goal.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.user.deleteMany({ where: { email: 'test-demo@planny.test' } });
    
    console.log('Seeding user...');
    const user = await prisma.user.upsert({
      where: { email: 'test-demo@planny.test' },
      update: {},
      create: {
        id: 'user_clanny_01',
        email: 'test-demo@planny.test',
        name: 'Minh Anh',
        role: 'Student',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCjOAetf-UlWMsXi02C34pbJY_EFfMIsNpjnP4g0mTtPtDpLW6UV1FtvOpKlCJ1nDLR24hRAN-G-Qc16CcfMeNGzAqjRwVxgFcYlXhqgzgkKDAzDay0WlPoRZZUTgFoEOKeBEBUSTC2KvZLbXRnGFuUm0ehwiFLnQ46WSsBsXTPpnwh1qOllmR3gCaWn46VLAJlmBhPp5WoiKTNKsuDoLC9SuGJJ-P1LHJzY-vXnPqbuAFoa_L7wj_bnMVAF809PEjIjK71M5jOF3d'
      },
    });

    console.log('Seeding subjects...');
    const math = await prisma.subject.create({
      data: { name: 'Toán', colorCode: '#031a6b', userId: user.id }
    });

    const eng = await prisma.subject.create({
      data: { name: 'Tiếng Anh', colorCode: '#1151d3', userId: user.id }
    });

    console.log('Seeding goals...');
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

    console.log('Seeding milestones...');
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

    console.log('Seeding tasks...');
    const taskData = [
      {
        title: 'Học Tiếng Anh Unit 8',
        date: new Date(),
        time: '14:00',
        priority: 'MEDIUM',
        duration: 120, // 2h
        isCompleted: false,
        subjectId: eng.id,
        userId: user.id
      },
      {
        title: 'Ôn tập Toán chương 5',
        date: new Date(),
        time: '10:00',
        priority: 'MEDIUM',
        duration: 90, // 1.5h
        isCompleted: true,
        subjectId: math.id,
        userId: user.id
      }
    ];

    for (const t of taskData) {
      await prisma.task.create({ data: t });
    }

    console.log('Seeding events...');
    const eventData = [
      {
        title: 'Kiểm tra Hóa Học',
        date: new Date(new Date().setDate(new Date().getDate() + 4)), // +4 days
        userId: user.id
      },
      {
        title: 'Thi IELTS',
        date: new Date(new Date().setDate(new Date().getDate() + 27)), // end of month
        userId: user.id
      },
      {
        title: 'Họp nhóm Olympic',
        date: new Date(), // Today
        timeStart: '16:00',
        timeEnd: '17:30',
        userId: user.id
      }
    ];

    for (const e of eventData) {
      await prisma.event.create({ data: e });
    }

    return NextResponse.json({ success: true, message: 'Seed completed!' });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
