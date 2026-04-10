export const dynamic = 'force-dynamic';

import PomodoroContent from '@/components/pomodoro/PomodoroContent';
import { getSubjects } from '@/lib/actions/subjects';
import { getTodaySessions, getStreak } from '@/lib/actions/pomodoro';
import { getUserSettings } from '@/lib/actions/user-settings';

export default async function Pomodoro() {
   const [subjects, sessions, streak, userSettings] = await Promise.all([
      getSubjects(),
      getTodaySessions(),
      getStreak(),
      getUserSettings()
   ]);

   return (
      <PomodoroContent 
         initialSubjects={subjects} 
         initialSessions={sessions}
         streakCount={streak.current}
         userSettings={userSettings as any}
      />
   );
}
