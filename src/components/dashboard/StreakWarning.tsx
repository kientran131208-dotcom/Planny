'use client';

import { useLanguage } from '@/components/LanguageProvider';

interface StreakWarningProps {
  todayMinutes: number;
  goalMinutes: number;
  isEnabled: boolean;
}

export default function StreakWarning({ todayMinutes, goalMinutes, isEnabled }: StreakWarningProps) {
  const { t } = useLanguage();
  
  if (!isEnabled) return null;

  const now = new Date();
  const currentHour = now.getHours();
  const isLate = currentHour >= 18; // After 6 PM
  const progress = (todayMinutes / goalMinutes) * 100;
  const isAtRisk = isLate && progress < 50;

  if (!isAtRisk) return null;

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-[2rem] text-white shadow-2xl shadow-orange-500/20 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-4xl animate-bounce">priority_high</span>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-black uppercase tracking-tight mb-1">Cảnh báo Streak!</h4>
          <p className="text-white/80 text-sm font-medium">
            Bạn đã hoàn thành {todayMinutes} phút tập trung. Còn 1 ít nữa để đạt mục tiêu {goalMinutes} phút và duy trì chuỗi thành tích!
          </p>
        </div>
        <div className="hidden sm:block">
           <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90">
                 <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                 <circle cx="32" cy="32" r="28" fill="transparent" stroke="white" strokeWidth="4" 
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - progress / 100)}
                    strokeLinecap="round" />
              </svg>
              <span className="text-[10px] font-black">{Math.round(progress)}%</span>
           </div>
        </div>
      </div>
    </div>
  );
}
