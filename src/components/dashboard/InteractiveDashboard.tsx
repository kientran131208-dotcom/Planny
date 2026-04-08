'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCalendarItems } from '@/lib/actions/calendar';
import { useLanguage } from '../LanguageProvider';

export default function InteractiveDashboard({ tasks, stats, calendarItems: initialItems }: { tasks: any[], stats: any, calendarItems: any[] }) {
  const { lang, t } = useLanguage();
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(now);
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [calendarItems, setCalendarItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(false);

  const currentMonth = currentDate.getMonth(); 
  const currentYear = currentDate.getFullYear();
  const locale = lang === 'VI' ? 'vi-VN' : 'en-US';

  // Fetch items whenever month changes
  useEffect(() => {
    const fetchMonthData = async () => {
      // Don't refetch initial month on first load if already have it
      if (currentMonth === now.getMonth() && currentYear === now.getFullYear() && calendarItems === initialItems) {
        return;
      }

      setIsLoading(true);
      try {
        const items = await getCalendarItems(currentMonth, currentYear);
        setCalendarItems(items);
      } catch (err) {
        console.error('Error fetching calendar month data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthData();
  }, [currentMonth, currentYear]);
  
  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const selectedDate = new Date(currentYear, currentMonth, selectedDay);
  selectedDate.setHours(0,0,0,0);

  // Calendar Grid Logic Padding
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Monday = 1, ..., Sunday = 0 -> padding = (firstDay + 6) % 7
  const padding = (firstDayOfMonth + 6) % 7; 
  
  // Focus items including both tasks and events that occur on the selected day
  const focusItems = calendarItems.filter(item => {
    const start = new Date(item.date);
    start.setHours(0,0,0,0);
    const end = item.dateEnd ? new Date(item.dateEnd) : start;
    end.setHours(23,59,59,999);
    
    return selectedDate >= start && selectedDate <= end;
  }).slice(0, 8);

  // Absolute next upcoming incomplete task or event (Overall)
  const nextItem = calendarItems
    .filter(item => (item.type === 'EVENT' || !item.isCompleted) && new Date(item.date).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const getCalendarItemsForDay = (day: number) => {
    const targetDate = new Date(currentYear, currentMonth, day);
    targetDate.setHours(0,0,0,0);
    
    return calendarItems.filter(item => {
      const start = new Date(item.date);
      start.setHours(0,0,0,0);
      const end = item.dateEnd ? new Date(item.dateEnd) : start;
      end.setHours(23,59,59,999);
      
      return targetDate >= start && targetDate <= end;
    });
  };

  return (
    <section className="flex flex-col lg:flex-row gap-8 mt-8">
      {/* Today's Focus List */}
      <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <div className="text-left">
            <h3 className="text-xl font-extrabold text-[#031a6b]">
               {selectedDay === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear() 
                ? t('todayFocus') 
                : `${t('focusOn')} ${selectedDay}/${String(currentMonth + 1).padStart(2, '0')}`}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
               {focusItems.length > 0 
                ? t('noteItems', { count: focusItems.filter(t => t.type === 'EVENT' || !t.isCompleted).length })
                : t('noFocusItems')}
            </p>
          </div>
          <Link href="/tasks" className="text-[#1151d3] font-bold text-sm hover:underline">{t('viewAll')}</Link>
        </div>
        <div className="space-y-4">
          {focusItems.length > 0 ? (
            focusItems.map(item => (
              <div key={item.id} className={`bg-white p-5 rounded-2xl border flex items-center justify-between hover:shadow-md transition-all group ${
                item.type === 'EVENT' ? 'border-blue-50' : 'border-purple-50'
              } ${item.isCompleted ? 'opacity-60 bg-gray-50/30' : ''}`}>
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.isCompleted ? 'bg-emerald-50 text-emerald-500' :
                    item.type === 'EVENT' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    <span className="material-symbols-outlined text-xl">
                      {item.isCompleted ? 'check_circle' : (item.type === 'EVENT' ? 'event' : 'task_alt')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                       <h4 className={`font-bold transition-all ${item.isCompleted ? 'line-through text-gray-400' : 'text-[#031a6b]'}`}>
                         {item.title}
                       </h4>
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md transition-all`}
                             style={{ 
                               backgroundColor: item.isCompleted ? '#f1f5f9' : `${item.subject?.colorCode ? item.subject.colorCode : (item.type === 'EVENT' ? '#3b82f6' : '#a855f7')}15`,
                               color: item.isCompleted ? '#94a3b8' : (item.subject?.colorCode ? item.subject.colorCode : (item.type === 'EVENT' ? '#3b82f6' : '#a855f7'))
                             }}>
                         {item.isCompleted ? t('completed') : (item.subject?.name || (item.type === 'EVENT' ? t('events') : t('tasks')))}
                       </span>
                       {(item.time || item.timeStart) && !item.isCompleted && (
                         <span className="text-[8px] font-black uppercase px-2.5 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-100/50 flex items-center gap-1 group-hover:bg-orange-100 transition-colors">
                           <span className="material-symbols-outlined text-[10px] font-black">schedule</span>
                           {item.time || item.timeStart}
                         </span>
                       )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                       <div className="flex items-center gap-1 text-gray-400">
                         <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                         <span className="text-[10px] font-bold">
                           {new Date(item.date).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}
                           {item.dateEnd && new Date(item.dateEnd).getTime() > new Date(item.date).getTime() && (
                             <> - {new Date(item.dateEnd).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}</>
                           )}
                         </span>
                       </div>
                       


                       {item.dateEnd && item.type === 'TASK' && (
                         <div className="flex items-center gap-1 text-red-400/80">
                           <span className="material-symbols-outlined text-[14px]">timer</span>
                           <span className="text-[10px] font-black uppercase">{t('deadlinePrefixLabel')} {new Date(item.dateEnd).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}</span>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
                {!item.isCompleted && (
                  <div className="flex flex-col items-end gap-1">
                    <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                      item.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 
                      item.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {item.priority}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
               <span className="material-symbols-outlined text-5xl mb-4">coffee</span>
               <p className="text-sm font-medium text-gray-500 italic">{t('relaxNoTasks')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Mini Calendar */}
      <div className="lg:w-1/3 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-extrabold text-[#031a6b] capitalize text-left">
            {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(currentDate)}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const prev = new Date(currentYear, currentMonth - 1, 1);
                setCurrentDate(prev);
                setSelectedDay(1);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button 
              onClick={() => {
                const next = new Date(currentYear, currentMonth + 1, 1);
                setCurrentDate(next);
                setSelectedDay(1);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {[t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')].map((d, i) => (
            <span key={`${d}-${i}`} className="text-[10px] font-bold text-gray-400 uppercase">{d}</span>
          ))}
        </div>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          )}
          <div className="grid grid-cols-7 gap-1.5 auto-rows-fr">
            {[...Array(padding)].map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dayItems = getCalendarItemsForDay(day);
              const hasActivity = dayItems.length > 0;
              const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <div key={i} className="flex flex-col items-center gap-0.5 relative group/day">
                  <button 
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square w-full flex items-center justify-center text-[11px] font-black rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#1151d3] text-white shadow-lg shadow-blue-100 scale-110 z-10' 
                        : isToday 
                          ? 'bg-blue-50 text-[#1151d3] border-2 border-[#1151d3] ring-2 ring-white hover:bg-blue-100' 
                          : 'text-gray-800 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {day}
                  </button>
                  {hasActivity && (
                    <div className="flex gap-0.5 mt-0.5 absolute -bottom-1">
                      {dayItems.slice(0, 3).map((it, idx) => {
                        const color = it.color || (it.type === 'EVENT' ? '#3b82f6' : '#a855f7');
                        return (
                          <div key={idx} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : ''}`} style={{ backgroundColor: isSelected ? undefined : color }}></div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Next Global Activity Detail */}
        {nextItem ? (
          <div className={`mt-8 p-4 rounded-xl border-l-4 text-left ${nextItem.type === 'EVENT' ? 'bg-purple-50 border-purple-500' : 'bg-[#eff4ff] border-[#1151d3]'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${nextItem.type === 'EVENT' ? 'text-purple-600' : 'text-[#1151d3]'}`}>
              {nextItem.type === 'EVENT' ? t('upcomingEvent') : t('upcomingTask')}
            </p>
            <h5 className="text-sm font-bold text-[#031a6b]">{nextItem.title}</h5>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">
                {nextItem.type === 'EVENT' ? 'event' : 'task_alt'}
              </span>
              {new Date(nextItem.date).toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: '2-digit' })}, {nextItem.time || t('allDay')}
            </p>
          </div>
        ) : (
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border-l-4 border-gray-300 text-left">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('relaxing')}</p>
            <h5 className="text-sm font-bold text-gray-400 italic">{t('noUpcomingTasks')}</h5>
          </div>
        )}
      </div>
    </section>
  );
}
