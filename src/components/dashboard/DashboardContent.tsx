'use client';

import Link from 'next/link';
import { useLanguage } from '../LanguageProvider';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import InteractiveDashboard from '@/components/dashboard/InteractiveDashboard';
import AIInsight from '@/components/dashboard/AIInsight';
import StreakWarning from '@/components/dashboard/StreakWarning';
import { AIInsight as AIInsightType } from '@/lib/actions/ai';

export default function DashboardContent({ 
  tasks, 
  stats, 
  calendarItems, 
  weeklyHours, 
  streakCount, 
  goalMetrics,
  todayMinutes,
  goalMinutes,
  streakWarningEnabled
}: { 
  tasks: any[], 
  stats: any, 
  calendarItems: any[], 
  weeklyHours: number, 
  streakCount: number, 
  goalMetrics: any,
  todayMinutes: number,
  goalMinutes: number,
  streakWarningEnabled: boolean
}) {
  const { lang, t } = useLanguage();
  const weeklyMinutes = Number(weeklyHours);
  const formattedWeeklyTime = weeklyMinutes >= 60 
    ? `${Math.floor(weeklyMinutes / 60)}h ${weeklyMinutes % 60}m`
    : `${weeklyMinutes}m`;

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Streak Warning */}
      <StreakWarning 
        todayMinutes={todayMinutes} 
        goalMinutes={goalMinutes} 
        isEnabled={streakWarningEnabled}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1151d3] to-[#031a6b] rounded-2xl p-10 flex items-center justify-between shadow-xl shadow-[#031a6b]/20 relative overflow-hidden">
        <div className="space-y-6 max-w-xl text-left relative z-10">
          <h2 className="text-[32px] font-extrabold text-white leading-tight tracking-tight">
            {t('whatToLearn')}
          </h2>
          <p className="text-white/70 text-lg">
            {t('tasksPlanned', { count: tasks.filter((t: any) => {
              const today = new Date();
              today.setHours(0,0,0,0);
              const d = new Date(t.date);
              d.setHours(0,0,0,0);
              return d.getTime() === today.getTime() && !t.isCompleted;
            }).length })}
          </p>
          <Link href="/tasks" className="inline-flex bg-[#4D7CFE] hover:bg-[#3d6de5] text-white px-6 py-3 rounded-xl font-bold items-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-[#4D7CFE]/30">
            <span className="material-symbols-outlined">add_circle</span>
            {t('addNewTask')}
          </Link>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 transform translate-x-10 translate-y-10">
          <span className="material-symbols-outlined text-[300px] text-white">auto_stories</span>
        </div>
        <div className="relative hidden lg:block pr-8 z-10">
          <div className="w-64 h-64 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 rotate-3 flex items-center justify-center shadow-2xl">
             <span className="material-symbols-outlined text-white text-8xl">school</span>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/analytics" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 block">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#1151d3]">schedule</span>
            </div>
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t('weekly')}</span>
          </div>
          <h3 className="text-3xl font-extrabold text-[#031a6b] text-left">{formattedWeeklyTime}</h3>
          <p className="text-sm text-gray-500 font-medium mt-1 text-left">{t('weeklyStudyTime')}</p>
        </Link>

        <Link href="/tasks" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 block">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500">check_circle</span>
            </div>
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t('progress')}</span>
          </div>
          <h3 className="text-3xl font-extrabold text-[#031a6b] text-left">{stats.completed}/{stats.total}</h3>
          <p className="text-sm text-gray-500 font-medium mt-1 text-left">{t('completedTasks')}</p>
        </Link>

        <Link href="/analytics" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 block">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
            </div>
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t('streak')}</span>
          </div>
          <h3 className="text-3xl font-extrabold text-orange-500 text-left">{streakCount} {t('daySuffix')}</h3>
          <p className="text-sm text-gray-500 font-medium mt-1 text-left">{t('continuousStreak')}</p>
        </Link>

        <Link href="/goals" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 block">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600">leaderboard</span>
            </div>
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t('goals')}</span>
          </div>
          <h3 className="text-3xl font-extrabold text-[#031a6b] text-left">{goalMetrics.avgProgress}%</h3>
          <p className="text-sm text-gray-500 font-medium mt-1 text-left">{t('goalProgress')}</p>
        </Link>
      </section>

      {/* Upcoming Events Section */}
      <UpcomingEvents events={calendarItems} />

      {/* Today's Focus & Dynamic Calendar Row */}
      <InteractiveDashboard tasks={tasks} stats={stats} calendarItems={calendarItems} />
    </div>
  );
}
