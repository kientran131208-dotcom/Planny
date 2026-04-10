export const dynamic = 'force-dynamic';

import { getTasks, getStats } from '@/lib/actions/tasks';
import { getWeeklyStudyTime, getStreak, getTodaySessions } from '@/lib/actions/pomodoro';
import { getCalendarItems } from '@/lib/actions/calendar';
import { getOverallGoalMetrics } from '@/lib/actions/goals';
import { getUserSettings } from '@/lib/actions/user-settings';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default async function Dashboard() {
  const now = new Date();
  const [tasks, stats, calendarItems, weeklyHours, streakData, goalMetrics, todaySessions, userSettings] = await Promise.all([
    getTasks(), 
    getStats(),
    getCalendarItems(now.getMonth(), now.getFullYear()),
    getWeeklyStudyTime(),
    getStreak(),
    getOverallGoalMetrics(),
    getTodaySessions(),
    getUserSettings()
  ]);

  const todayMinutes = todaySessions.reduce((acc, s) => acc + (s.mode === 'FOCUS' ? s.durationMin : 0), 0);
  const goalMinutes = (userSettings?.pomoGoalDay || 8) * 60;
  const streakWarningEnabled = userSettings?.streakWarningEnabled ?? true;

  return (
    <DashboardContent 
      tasks={tasks}
      stats={stats}
      calendarItems={calendarItems}
      weeklyHours={Number(weeklyHours)}
      streakCount={streakData.current}
      goalMetrics={goalMetrics}
      todayMinutes={todayMinutes}
      goalMinutes={goalMinutes}
      streakWarningEnabled={streakWarningEnabled}
    />
  );
}
