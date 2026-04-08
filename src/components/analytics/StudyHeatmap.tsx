'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

interface StudyHeatmapProps {
  activity: Record<string, number>;
}

export default function StudyHeatmap({ activity }: StudyHeatmapProps) {
  const { t, lang } = useLanguage();
  const [hovered, setHovered] = useState<{ date: string, minutes: number, x: number, y: number } | null>(null);
  const now = new Date();
  const weeks = 53;
  const daysPerWeek = 7;
  
  // Calculate start date (Sunday of 52 weeks ago)
  const startDate = new Date(now);
  startDate.setFullYear(now.getFullYear() - 1);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const getColor = (minutes: number) => {
    if (!minutes) return 'bg-[#eff4ff]';
    if (minutes < 30) return 'bg-[#d8e7ff]'; // Subtle blue
    if (minutes < 90) return 'bg-[#98c0ff]'; // Medium light blue
    if (minutes < 180) return 'bg-[#4e89ff]'; // Brighter blue
    return 'bg-[#031a6b]'; // Dark navy for power focus (3h+)
  };

  const grid: ({ date: string, minutes: number } | null)[][] = [];
  for (let w = 0; w < weeks; w++) {
    const week: ({ date: string, minutes: number } | null)[] = [];
    for (let d = 0; d < daysPerWeek; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (w * 7) + d);
      
      if (date > now) {
         week.push(null);
         continue;
      }
      
      const dateStr = date.toISOString().split('T')[0];
      week.push({
        date: dateStr,
        minutes: activity[dateStr] || 0
      });
    }
    grid.push(week);
  }

  const months = [
    t('m1'), t('m2'), t('m3'), t('m4'), t('m5'), t('m6'), 
    t('m7'), t('m8'), t('m9'), t('m10'), t('m11'), t('m12')
  ];

  const handleMouseEnter = (e: React.MouseEvent, item: { date: string, minutes: number }) => {
    // Get position relative to the container for absolute positioning
    const container = e.currentTarget.closest('.relative');
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = e.currentTarget.getBoundingClientRect();
      
      setHovered({
        ...item,
        x: itemRect.left - containerRect.left,
        y: itemRect.top - containerRect.top
      });
    }
  };

  return (
    <div className="p-8 rounded-[16px] bg-white shadow-sm border border-gray-50 flex flex-col relative group">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-bold text-[#031a6b]">{t('studyStreakCalendar')}</h4>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
           <span>{t('less')}</span>
           <div className="flex gap-1">
             <div className="w-2.5 h-2.5 rounded-[2px] bg-[#eff4ff]"></div>
             <div className="w-2.5 h-2.5 rounded-[2px] bg-[#d8e7ff]"></div>
             <div className="w-2.5 h-2.5 rounded-[2px] bg-[#98c0ff]"></div>
             <div className="w-2.5 h-2.5 rounded-[2px] bg-[#4e89ff]"></div>
             <div className="w-2.5 h-2.5 rounded-[2px] bg-[#031a6b]"></div>
           </div>
           <span>{t('more')}</span>
        </div>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div 
          className="absolute z-[100] pointer-events-none transform -translate-x-1/2 translate-y-6 transition-all duration-150 ease-out"
          style={{ left: hovered.x + 8, top: hovered.y }}
        >
          <div className="bg-[#031a6b] text-white text-[11px] px-4 py-2.5 rounded-xl shadow-[0_15px_35px_rgba(3,26,107,0.3)] border border-white/20 backdrop-blur-md">
            <p className="font-black mb-0.5 whitespace-nowrap">
              {new Date(hovered.date).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-blue-200 font-bold flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"></span>
              {hovered.minutes > 0 ? `${hovered.minutes} ${t('minutesStudy')}` : t('noActivity')}
            </p>
            {/* Arrow (Top) */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-[#031a6b]"></div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto pb-4 scrollbar-hide print:overflow-visible">
        <div className="inline-flex flex-col min-w-full print:scale-[0.85] print:origin-top-left">
           {/* Month Headers */}
           <div className="relative h-4 mb-2 text-[9px] font-black uppercase text-gray-300 ml-8 print:text-gray-600">
              {grid.map((week, idx) => {
                 if (idx % 4.3 === 0) {
                    const d = new Date(startDate);
                    d.setDate(startDate.getDate() + (idx * 7));
                    return (
                      <span 
                        key={idx} 
                        className="absolute"
                        style={{ left: `${idx * 17.5}px`, width: '40px' }}
                      >
                        {months[d.getMonth()]}
                      </span>
                    )
                 }
                 return null;
              })}
           </div>

           <div className="flex gap-2">
              {/* Day Labels */}
              <div className="flex flex-col gap-[3px] mr-1 text-[9px] font-black uppercase text-gray-300 justify-between h-[126px] pt-1.5 print:text-gray-600">
                 <span className="opacity-0">{t('mon')}</span>
                 <span>{t('tue')}</span>
                 <span className="opacity-0">{t('wed')}</span>
                 <span>{t('thu')}</span>
                 <span className="opacity-0">{t('fri')}</span>
                 <span>{t('sat')}</span>
                 <span>{t('sun')}</span>
              </div>

              {/* Grid */}
              <div className="flex gap-[4px] print:gap-[2px]">
                {grid.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[4px] print:gap-[2px]">
                    {week.map((item, dIdx) => (
                       <div 
                         key={dIdx} 
                         onMouseEnter={(e) => item && handleMouseEnter(e, item)}
                         onMouseLeave={() => setHovered(null)}
                         className={`w-4 h-4 rounded-[3px] transition-all hover:scale-125 hover:shadow-lg hover:z-10 cursor-crosshair print:w-3.5 print:h-3.5 print:border print:border-gray-50 ${item ? getColor(item.minutes) : 'opacity-0'}`}
                       >
                       </div>
                    ))}
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <p className="text-[10px] text-gray-400 italic font-medium leading-relaxed">
          {t('limitQuote')}
        </p>
        <div className="flex items-center gap-4 text-[10px] font-bold text-[#031a6b]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{t('stepQuote')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
