'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth-utils';

export async function getAnalyticsStats(rangeInDays: number = 7) {
  try {
    const userId = await getUserId();
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - rangeInDays);
    startDate.setHours(0,0,0,0);

    // 1. Task Stats (Filtered by range)
    const tasks = await prisma.task.findMany({ 
      where: { 
        userId,
        date: { gte: startDate } 
      } 
    });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // 2. Study Stats (Filtered by range)
    const sessions = await prisma.studySession.findMany({
      where: { 
        userId, 
        date: { gte: startDate },
        OR: [{ mode: 'FOCUS' }, { mode: null }] 
      }
    });
    
    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMin, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // 3. Streak & Daily Average (Calculate from all sessions)
    const allSessions = await prisma.studySession.findMany({
      where: { 
        userId, 
        OR: [{ mode: 'FOCUS' }, { mode: null }] 
      },
      select: { date: true, durationMin: true }
    });

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { pomoGoalDay: true, name: true }
    });
    const dailyGoal = user?.pomoGoalDay ?? 8;
    const userName = user?.name || 'Người dùng';

    const focusByDate: Record<string, number> = {};
    allSessions.forEach(s => {
       const d = new Date(s.date);
       const dateStr = d.toISOString().split('T')[0];
       focusByDate[dateStr] = (focusByDate[dateStr] || 0) + 1;
    });

    // Sort dates to calculate max streak and current streak
    const sortedDates = Object.keys(focusByDate).sort();
    
    // Calculate Current Streak back from today
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if ((focusByDate[dateStr] || 0) >= dailyGoal) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            // Check if user just hasn't completed today's goal yet but is still on streak
            if (streak === 0 && dateStr === new Date().toISOString().split('T')[0]) {
               checkDate.setDate(checkDate.getDate() - 1);
               continue;
            }
            break;
        }
    }

    // Calculate Max Streak (All-time record)
    let maxStreak = 0;
    let currentChain = 0;
    
    if (sortedDates.length > 0) {
      const firstDate = new Date(sortedDates[0]);
      const lastDate = new Date();
      currentChain = 0;
      
      let it = new Date(firstDate);
      it.setHours(0,0,0,0);
      const end = new Date(lastDate);
      end.setHours(0,0,0,0);
      
      while (it <= end) {
        const dStr = it.toISOString().split('T')[0];
        if ((focusByDate[dStr] || 0) >= dailyGoal) {
          currentChain++;
          if (currentChain > maxStreak) maxStreak = currentChain;
        } else {
          currentChain = 0;
        }
        it.setDate(it.getDate() + 1);
      }
    }

    // Daily Average (Correct range)
    const rangeSessions = sessions.filter(s => new Date(s.date) >= startDate);
    const rangeMin = rangeSessions.reduce((acc, s) => acc + s.durationMin, 0);
    const averageHoursPerDay = (rangeMin / (rangeInDays * 60)).toFixed(1);

    return {
      totalHours,
      totalMinutes,
      completionRate,
      completedCount: completedTasks,
      totalCount: totalTasks,
      streak,
      maxStreak,
      userName,
      averageHoursPerDay: `${averageHoursPerDay}h`,
      dailyGoal
    };
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return {
      totalHours: '0.0',
      totalMinutes: 0,
      completionRate: 0,
      completedCount: 0,
      totalCount: 0,
      streak: 0,
      userName: 'Người dùng',
      averageHoursPerDay: '0.0h',
      dailyGoal: 4
    };
  }
}

export async function getRangeActivity(rangeInDays: number = 7) {
  try {
    const userId = await getUserId();
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - rangeInDays + 1);
    startDate.setHours(0,0,0,0);

    const sessions = await prisma.studySession.findMany({
      where: { 
        userId, 
        date: { gte: startDate },
        OR: [{ mode: 'FOCUS' }, { mode: null }]
      }
    });

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { pomoGoalDay: true }
    });
    const dailyGoal = user?.pomoGoalDay ?? 4;
    const chartScale = dailyGoal / 0.75;

    // Smart grouping based on range
    if (rangeInDays <= 31) {
      // Group by Day
      const dailyData = [];
      for (let i = 0; i < rangeInDays; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(startDate.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const daySessions = sessions.filter(s => new Date(s.date).toISOString().split('T')[0] === dateStr);
        const dayMin = daySessions.reduce((acc, s) => acc + s.durationMin, 0);
        const dayHours = dayMin / 60;
        
        const height = Math.min(Math.round((dayHours / chartScale) * 100), 100) + '%';
        const isToday = checkDate.toDateString() === now.toDateString();

        // Sparse labels for 30 days to avoid overlap
        let label = '';
        if (rangeInDays === 7) {
          label = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][checkDate.getDay()];
        } else {
          // Show every 5th day, or the first/last day, or today
          if (i === 0 || i === rangeInDays - 1 || isToday || (checkDate.getDate() % 5 === 0)) {
            label = `${checkDate.getDate()}/${checkDate.getMonth() + 1}`;
          }
        }

        const displayValue = Math.floor(dayMin / 60) > 0 
          ? `${Math.floor(dayMin / 60)}h${dayMin % 60 > 0 ? ` ${dayMin % 60}p` : ''}` 
          : `${dayMin}p`;

        dailyData.push({
          label,
          height,
          isToday,
          value: displayValue
        });
      }
      return dailyData;
    } else if (rangeInDays <= 100) {
      // Group by Week (for 3 months)
      const weeklyData = [];
      const weeks = Math.ceil(rangeInDays / 7);
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const weekSessions = sessions.filter(s => {
          const d = new Date(s.date);
          return d >= weekStart && d < weekEnd;
        });
        const weekHours = weekSessions.reduce((acc, s) => acc + s.durationMin, 0) / 60;
        const avgDailyHours = weekHours / 7;
        const height = Math.min(Math.round((avgDailyHours / chartScale) * 100), 100) + '%';

        const totalMins = weekSessions.reduce((acc, s) => acc + s.durationMin, 0);
        const avgDailyMins = Math.round(totalMins / 7);
        const displayValue = Math.floor(avgDailyMins / 60) > 0 
          ? `${Math.floor(avgDailyMins / 60)}h${avgDailyMins % 60 > 0 ? ` ${avgDailyMins % 60}p` : ''}/ngày` 
          : `${avgDailyMins}p/ngày`;

        weeklyData.push({
          label: `W${i + 1}`,
          height,
          isToday: now >= weekStart && now < weekEnd,
          value: displayValue
        });
      }
      return weeklyData;
    } else {
      // Group by Month (for Year)
      const monthlyData = [];
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(now.getFullYear(), i, 1);
        const monthEnd = new Date(now.getFullYear(), i + 1, 0);
        
        const monthSessions = sessions.filter(s => {
          const d = new Date(s.date);
          return d >= monthStart && d <= monthEnd;
        });
        const monthHours = monthSessions.reduce((acc, s) => acc + s.durationMin, 0) / 60;
        const daysInMonth = monthEnd.getDate();
        const avgDailyHours = monthHours / daysInMonth;
        const height = Math.min(Math.round((avgDailyHours / chartScale) * 100), 100) + '%';

        const totalMins = monthSessions.reduce((acc, s) => acc + s.durationMin, 0);
        const avgDailyMins = Math.round(totalMins / daysInMonth);
        const displayValue = Math.floor(avgDailyMins / 60) > 0 
          ? `${Math.floor(avgDailyMins / 60)}h${avgDailyMins % 60 > 0 ? ` ${avgDailyMins % 60}p` : ''}/ngày` 
          : `${avgDailyMins}p/ngày`;

        monthlyData.push({
          label: `Th${i + 1}`,
          height,
          isToday: now.getMonth() === i,
          value: displayValue
        });
      }
      return monthlyData;
    }
  } catch (error) {
    console.error('Error fetching range activity:', error);
    return [];
  }
}

export async function getSubjectBreakdown(rangeInDays: number = 7) {
  try {
    const userId = await getUserId();
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - rangeInDays);
    startDate.setHours(0,0,0,0);

    const subjects = await prisma.subject.findMany({
      where: { userId },
      include: { 
        studySessions: {
          where: { 
            date: { gte: startDate },
            OR: [{ mode: 'FOCUS' }, { mode: null }] 
          }
        }
      }
    });

    const breakdown = subjects.map(s => {
      const minutes = s.studySessions.reduce((acc, sess) => acc + sess.durationMin, 0);
      return {
        name: s.name,
        minutes,
        color: s.colorCode
      };
    });

    const totalMinutes = breakdown.reduce((acc, b) => acc + b.minutes, 0);
    
    return breakdown.map(b => ({
      ...b,
      percentage: totalMinutes > 0 ? Math.round((b.minutes / totalMinutes) * 100) : 0
    })).filter(b => b.minutes > 0); // Only show subjects with activity
  } catch (error) {
    console.error('Error fetching subject breakdown:', error);
    return [];
  }
}

export async function getSubjectPerformance(rangeInDays: number = 7) {
  try {
    const userId = await getUserId();
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - rangeInDays);
    startDate.setHours(0,0,0,0);

    const subjects = await prisma.subject.findMany({
      where: { userId },
      include: { 
        tasks: {
          where: { date: { gte: startDate } }
        },
        studySessions: {
          where: { 
            date: { gte: startDate },
            OR: [{ mode: 'FOCUS' }, { mode: null }] 
          }
        }
      }
    });

    return subjects.map(s => {
      const completed = s.tasks.filter(t => t.isCompleted).length;
      const total = s.tasks.length;
      const minutes = s.studySessions.reduce((acc, sess) => acc + sess.durationMin, 0);
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        name: s.name,
        color: s.colorCode,
        hours: (minutes / 60).toFixed(1),
        completedTasks: `${completed}/${total} tasks`,
        progress,
        trend: progress >= 80 ? 'up' : progress >= 40 ? 'flat' : 'down'
      };
    });
  } catch (error) {
    console.error('Error fetching subject performance:', error);
    return [];
  }
}

export async function getHeatmapActivity() {
  try {
    const userId = await getUserId();
    const now = new Date();
    const startDate = new Date();
    // Go back to the start of the year or last 365 days
    startDate.setFullYear(now.getFullYear() - 1);
    startDate.setHours(0, 0, 0, 0);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: startDate },
        OR: [{ mode: 'FOCUS' }, { mode: null }]
      },
      select: {
        date: true,
        durationMin: true
      }
    });

    const activity: Record<string, number> = {};
    sessions.forEach(s => {
      const d = new Date(s.date);
      const dateStr = d.toISOString().split('T')[0];
      activity[dateStr] = (activity[dateStr] || 0) + s.durationMin;
    });

    return activity;
  } catch (error) {
    console.error('Error fetching heatmap activity:', error);
    return {};
  }
}
