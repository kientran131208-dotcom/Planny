'use client';

import { useState, useEffect } from 'react';
import { getMonthlyProgress, getUserPomoGoals } from '@/lib/actions/pomodoro';
import { useLanguage } from '../LanguageProvider';

interface MiniCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

export default function MiniCalendar({ onDateSelect, selectedDate }: MiniCalendarProps) {
  const { t, lang } = useLanguage();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [monthlyProgress, setMonthlyProgress] = useState<Record<number, number>>({});
  const [dailyGoal, setDailyGoal] = useState(8);

  const daysLabels = [
    t('mondayShort'),
    t('tuesdayShort'),
    t('wednesdayShort'),
    t('thursdayShort'),
    t('fridayShort'),
    t('saturdayShort'),
    t('sundayShort')
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  useEffect(() => {
    const fetchProgress = async () => {
      const [progress, goalData] = await Promise.all([
        getMonthlyProgress(currentYear, currentMonth),
        getUserPomoGoals()
      ]);
      setMonthlyProgress(progress);
      setDailyGoal(goalData.pomoGoalDay);
    };
    fetchProgress();
  }, [currentMonth, currentYear]);

  const changeMonth = (offset: number) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(3,26,107,0.03)] dark:shadow-none border border-transparent dark:border-gray-800 selection:bg-blue-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-black text-[#031a6b] dark:text-white capitalize flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-lg font-black">calendar_month</span>
          {new Intl.DateTimeFormat(lang === 'VI' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' }).format(new Date(currentYear, currentMonth))}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="w-8 h-8 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all border border-gray-100/50 dark:border-gray-800"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="w-8 h-8 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all border border-gray-100/50 dark:border-gray-800"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-3">
        {daysLabels.map((d) => (
          <span key={d} className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {[...Array(emptyDays)].map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
          const isSelected = day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear();
          const progress = monthlyProgress[day] || 0;
          const goalMet = progress >= dailyGoal;

          return (
            <button
              key={day}
              onClick={() => onDateSelect(new Date(currentYear, currentMonth, day))}
              className={`relative aspect-square flex items-center justify-center text-[12px] font-black rounded-xl transition-all group ${isSelected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none z-10 scale-105'
                  : goalMet
                    ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-900/40'
                    : isToday
                      ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      : 'text-[#031a6b] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              {day}

              {goalMet && (
                <span className={`absolute -top-1.5 -right-1.5 material-symbols-outlined text-[16px] ${isSelected ? 'text-orange-400' : 'text-orange-500'} drop-shadow-sm`}>
                  local_fire_department
                </span>
              )}

              {progress > 0 && !goalMet && !isSelected && (
                <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-blue-300"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

