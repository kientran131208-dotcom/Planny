'use server';

import { database as prisma } from '@/lib/database';
import { getUserId } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function createStudySession(durationMin: number, subjectId: string | null, mode: string = 'FOCUS', title: string | null = null) {
  try {
    const userId = await getUserId();
    const id = Math.random().toString(36).substring(2, 15);
    const dateStr = new Date().toISOString();
    
    // Use raw SQL to insert to bypass schema validation
    await prisma.$executeRaw`
      INSERT INTO StudySession (id, date, durationMin, subjectId, userId, mode, title)
      VALUES (${id}, ${dateStr}, ${durationMin}, ${subjectId}, ${userId}, ${mode}, ${title})
    `;

    const session = { 
      id, 
      date: new Date(), 
      durationMin, 
      subjectId, 
      userId, 
      mode, 
      title 
    };

    console.log(`--- Created session: ${durationMin}m for sub: ${subjectId} by user: ${userId} (mode: ${mode})`);
    
    revalidatePath('/pomodoro');
    revalidatePath('/analytics');
    revalidatePath('/');

    return session;
  } catch (error) {
    console.error('Error creating study session:', error);
    throw error;
  }
}

export async function getUserPomoGoals() {
  try {
    const userId = await getUserId();
    // Raw SQL to bypass model check
    const users: any[] = await prisma.$queryRaw`SELECT pomoGoalDay, pomoGoalWeek, pomoGoalMonth FROM User WHERE id = ${userId} LIMIT 1`;
    const user = users[0];
    return {
      pomoGoalDay: user?.pomoGoalDay ?? 8,
      pomoGoalWeek: user?.pomoGoalWeek ?? 40,
      pomoGoalMonth: user?.pomoGoalMonth ?? 150
    };
  } catch (error) {
    console.error('Error fetching user pomo goals:', error);
    return { pomoGoalDay: 8, pomoGoalWeek: 40, pomoGoalMonth: 150 };
  }
}




export async function updatePomoGoals(day: number, week: number, month: number) {
  try {
    const userId = await getUserId();
    await prisma.$executeRaw`UPDATE User SET pomoGoalDay = ${day}, pomoGoalWeek = ${week}, pomoGoalMonth = ${month}, updatedAt = CURRENT_TIMESTAMP WHERE id = ${userId}`;
    revalidatePath('/pomodoro');
    return { success: true };
  } catch (error) {
    console.error('Error updating pomo goals:', error);
    return { success: false, error: 'Database update failed' };
  }
}


export async function getTodaySessions() {
  try {
    const userId = await getUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: {
          gte: today,
        },
      },
      include: {
        subject: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions;
  } catch (error) {
    console.error('Error fetching today sessions:', error);
    return [];
  }
}

export async function getSessionsByRange(range: 'day' | 'week' | 'month') {
  try {
    const userId = await getUserId();
    const now = new Date();
    let startDate = new Date(now);

    if (range === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - (day === 0 ? 6 : day - 1); // Monday
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      include: {
        subject: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions;
  } catch (error) {
    console.error(`Error fetching sessions for range ${range}:`, error);
    return [];
  }
}

export async function clearStudySessions() {
  try {
    const userId = await getUserId();
    const result = await prisma.studySession.deleteMany({
      where: { userId }
    });
    console.log(`--- Cleared ${result.count} sessions for user ${userId}`);
    revalidatePath('/pomodoro');
    revalidatePath('/analytics');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error clearing study sessions:', error);
    throw error;
  }
}

export async function updateStudySessionTitle(id: string, title: string) {
  try {
    const userId = await getUserId();
    await prisma.$executeRaw`UPDATE StudySession SET title = ${title} WHERE id = ${id} AND userId = ${userId}`;
    revalidatePath('/pomodoro');
    return { success: true };
  } catch (error) {
    console.error('Error updating study session title:', error);
    return { success: false };
  }
}

export async function deleteStudySession(id: string) {
  try {
    const userId = await getUserId();
    const result = await prisma.studySession.deleteMany({
      where: { id, userId }
    });
    console.log(`--- Deleted ${result.count} session (ID: ${id}) for user ${userId}`);
    revalidatePath('/pomodoro');
    revalidatePath('/analytics');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting study session:', error);
    throw error;
  }
}

export async function getWeeklyStudyTime() {
  try {
    const userId = await getUserId();
    const now = new Date();
    
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - (day === 0 ? 6 : day - 1); 
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: {
          gte: startOfWeek,
        },
      },
    });

    const focusSessions = sessions.filter((s: any) => s.mode === 'FOCUS' || !s.mode);
    const totalMinutes = focusSessions.reduce((acc, s) => acc + s.durationMin, 0);
    
    return totalMinutes;
  } catch (error) {
    console.error('Error fetching weekly study time:', error);
    return 0;
  }
}

export async function getStreak() {
  try {
    const userId = await getUserId();
    const users: any[] = await prisma.$queryRaw`SELECT pomoGoalDay FROM User WHERE id = ${userId} LIMIT 1`;
    const dailyGoal = users[0]?.pomoGoalDay ?? 8;

    const allSessions = await prisma.studySession.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });


    if (allSessions.length === 0) return { current: 0, max: 0 };

    // Filter focus sessions in JS to avoid schema mismatch errors on 'mode'
    const focusSessions = allSessions.filter((s: any) => 
      s.mode === 'FOCUS' || (!s.mode && s.durationMin > 0)
    );


    const focusByDate: Record<string, number> = {};
    focusSessions.forEach(s => {
       const d = new Date(s.date);
       const dateStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
       focusByDate[dateStr] = (focusByDate[dateStr] || 0) + s.durationMin;
    });

    // Calculate Streak achievements (Current and Max)
    let currentStreak = 0;
    let maxStreak = 0;
    
    // 1. Calculate Current Streak (Backwards from today)
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    const todayStr = checkDate.toISOString().split('T')[0];
    const goalMin = dailyGoal * 60;

    let isIteratingCurrent = true;
    while (isIteratingCurrent) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const minutesOnDate = focusByDate[dateStr] || 0;

        if (minutesOnDate >= goalMin) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            // If it's today and goal not met, we don't break yet, we check yesterday
            if (dateStr === todayStr) {
               checkDate.setDate(checkDate.getDate() - 1);
               continue;
            }
            isIteratingCurrent = false;
        }
        if (currentStreak > 3650) break; // 10 years sanity check
    }

    // 2. Calculate Max Streak (All-time record - forwards)
    if (focusSessions.length > 0) {
      const sortedDates = Object.keys(focusByDate).sort();
      let it = new Date(sortedDates[0]);
      it.setHours(0,0,0,0);
      const end = new Date();
      end.setHours(0,0,0,0);
      
      let currentChain = 0;
      while (it <= end) {
        const dStr = it.toISOString().split('T')[0];
        if ((focusByDate[dStr] || 0) >= goalMin) {
          currentChain++;
          if (currentChain > maxStreak) maxStreak = currentChain;
        } else {
          // If it's today and goal not met, don't break the chain for max streak calculation 
          // (it might still be completed later today)
          if (dStr !== end.toISOString().split('T')[0]) {
            currentChain = 0;
          }
        }
        it.setDate(it.getDate() + 1);
      }
    }

    return {
      current: currentStreak,
      max: maxStreak
    };
  } catch (error) {
    console.error('Error calculating streak:', error);
    return { current: 0, max: 0 };
  }
}

export async function getSessionsByDate(date: Date) {
  try {
    const userId = await getUserId();
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        subject: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions;
  } catch (error) {
    console.error(`Error fetching sessions for date ${date}:`, error);
    return [];
  }
}

export async function getMonthlyProgress(year: number, month: number) {
  try {
    const userId = await getUserId();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Group by day of month
    const progress: Record<number, number> = {};
    sessions.forEach(s => {
      const day = s.date.getDate();
      progress[day] = (progress[day] || 0) + 1;
    });

    return progress;
  } catch (error) {
    console.error('Error fetching monthly progress:', error);
    return {};
  }
}



