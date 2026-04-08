import { getSubjects } from '@/lib/actions/tasks';
import { getTodaySessions, getStreak } from '@/lib/actions/pomodoro';
import { getUserSettings } from '@/lib/actions/user-settings';
import PomodoroContent from '@/components/pomodoro/PomodoroContent';
import PomodoroHeader from '@/components/pomodoro/PomodoroHeader';

export const metadata = {
  title: 'Pomodoro Focus - Planny',
  description: 'Achieve deep focus with the Pomodoro technique',
};

export default async function PomodoroPage() {
  const subjects = await getSubjects();
  const [initialSessions, streakData, userSettings] = await Promise.all([
    getTodaySessions(),
    getStreak(),
    getUserSettings()
  ]);

  return (
    <main className="p-10 xl:p-16 min-h-screen bg-[#f8f9ff]">
      <div className="max-w-[1500px] mx-auto">
        <PomodoroHeader />

        <section className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
           <PomodoroContent 
             initialSubjects={subjects} 
             initialSessions={initialSessions as any} 
             streakCount={streakData.current}
             userSettings={userSettings as any}
           />
        </section>
      </div>
    </main>
  );
}
