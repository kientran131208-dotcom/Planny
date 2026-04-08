'use client';

import { useState } from 'react';
import AddEventModal from './AddEventModal';
import TaskDetailModal from '../tasks/TaskDetailModal';
import { toggleTask, deleteTask } from '@/lib/actions/tasks';
import { deleteEvent, toggleEvent } from '@/lib/actions/calendar';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';

interface CalendarViewProps {
  items: any[];
  todayData: any;
  alerts: any;
  subjects: any[];
  gridDays: any[];
  currentMonth: number;
  currentYear: number;
  currentDay: number;
  view: 'month' | 'week' | 'day';
}

function CalendarItemCard({ it, onDetail, router }: { it: any, onDetail: () => void, router: any }) {
  const { t, lang } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const color = it.subject?.colorCode || (it.type === 'EVENT' ? '#1151d3' : '#a855f7');
  const isTask = it.type === 'TASK';
  const isCompleted = it.isCompleted === true;

  const [isToggling, setIsToggling] = useState(false);
  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToggling(true);
    try {
      const action = isTask ? toggleTask : toggleEvent;
      const result = await action(it.id, !isCompleted);
      if (result.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Toggle failed", err);
    } finally {
      setIsToggling(false);
    }
  };
  
  return (
    <div 
      onClick={onDetail}
      className={`group relative p-6 rounded-3xl border-2 border-transparent hover:border-gray-100 bg-white shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all hover:-translate-y-1 cursor-pointer ${
        isCompleted ? 'opacity-60 grayscale-[0.3]' : ''
      }`}
    >
      <div className="absolute top-6 left-0 w-1.5 h-8 rounded-r-full" style={{ backgroundColor: isCompleted ? '#cbd5e1' : color }}></div>
      <div className="flex justify-between items-center mb-4 pl-2">
        <div className="flex items-center gap-2">
            <button 
              onClick={handleToggle}
              disabled={isToggling}
              className={`w-7 h-7 rounded-[10px] border-[2.5px] flex items-center justify-center transition-all shadow-sm ${
                isCompleted 
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200/50' 
                  : `bg-white border-slate-200 text-transparent hover:border-${it.type === 'EVENT' ? 'blue-500' : 'purple-500'} hover:bg-slate-50`
              } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
            >
              <span className="material-symbols-outlined text-[18px] font-black">check</span>
            </button>
           <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
             it.type === 'EVENT' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
           }`}>
             <span className="material-symbols-outlined text-sm font-black">
               {it.type === 'EVENT' ? 'event' : 'task_alt'}
             </span>
           </div>
           <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-lg tracking-[0.1em] transition-all`}
                 style={{ 
                   backgroundColor: isCompleted ? '#f1f5f9' : `${color}15`,
                   color: isCompleted ? '#94a3b8' : color,
                   border: `1px solid ${isCompleted ? '#e2e8f0' : `${color}30`}`
                 }}>
             {it.subject?.name || (it.type === 'EVENT' ? t('events') : t('tasks'))}
           </span>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-black uppercase bg-gray-50 px-3 py-1.5 rounded-xl">
             <span className="material-symbols-outlined text-xs">calendar_today</span>
             {new Date(it.date).getTime() === new Date(it.dateEnd || it.date).getTime() 
               ? t('oneDay') 
               : `${new Date(it.date).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' })} - ${new Date(it.dateEnd).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' })}`}
           </div>
           <button 
             onClick={async (e) => {
               e.stopPropagation();
               
               if (!showConfirm) {
                 setShowConfirm(true);
                 setTimeout(() => setShowConfirm(false), 3000);
                 return;
               }

               setIsDeleting(true);
               try {
                 if (it.type === 'TASK') {
                   await deleteTask(it.id);
                 } else {
                   await deleteEvent(it.id);
                 }
                 window.location.reload(); 
               } catch (err) {
                 console.error("Delete failed:", err);
                 alert(t('deleteError'));
                 setShowConfirm(false);
               } finally {
                 setIsDeleting(false);
               }
             }}
             className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
               showConfirm 
                 ? 'bg-red-500 text-white shadow-lg animate-pulse' 
                 : 'opacity-40 group-hover:opacity-100 p-4 text-gray-400 hover:text-red-500 hover:bg-red-50'
             }`}
             aria-label={t('deleteThis')}
           >
             {showConfirm ? (
               <>
                 <span className="text-[9px] font-black uppercase tracking-tighter">{t('deleteNow')}</span>
                 <span className="material-symbols-outlined text-[16px]">delete_forever</span>
               </>
             ) : (
               <span className="material-symbols-outlined text-[20px]">
                 {isDeleting ? 'sync' : 'delete'}
               </span>
             )}
           </button>
        </div>
      </div>
      <h4 className={`font-black text-[#031a6b] text-base lg:text-xl pl-2 transition-colors leading-tight line-clamp-2 ${
        isCompleted ? 'line-through decoration-2 text-gray-400' : 'group-hover:text-[#1151d3]'
      }`}>
        {it.title}
      </h4>
    </div>
  );
}

export default function CalendarView({ 
  items, 
  todayData, 
  alerts, 
  subjects, 
  gridDays, 
  currentMonth, 
  currentYear,
  currentDay,
  view
}: CalendarViewProps) {
  const { t, lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<any | null>(null);
  
  // Pre-calculate item lanes for vertical consistency across days (primarily for Month view)
  const assignedLanes: any[][] = [];
  const sortedItems = [...items].sort((a,b) => {
    const aS = new Date(a.date).getTime();
    const bS = new Date(b.date).getTime();
    if (aS !== bS) return aS - bS;
    const aDuration = (a.dateEnd ? new Date(a.dateEnd).getTime() : aS) - aS;
    const bDuration = (b.dateEnd ? new Date(b.dateEnd).getTime() : bS) - bS;
    return bDuration - aDuration;
  });

  sortedItems.forEach(it => {
    const s = startOfDay(new Date(it.date)).getTime();
    const e = startOfDay(new Date(it.dateEnd || it.date)).getTime();
    
    let laneIdx = -1;
    for(let i=0; i < assignedLanes.length; i++) {
      const last = assignedLanes[i][assignedLanes[i].length - 1];
      const lastE = startOfDay(new Date(last.dateEnd || last.date)).getTime();
      if (s > lastE) {
        laneIdx = i;
        break;
      }
    }
    
    if (laneIdx === -1) {
      assignedLanes.push([it]);
    } else {
      assignedLanes[laneIdx].push(it);
    }
  });

  const itemIdToLane: Record<string, number> = {};
  assignedLanes.forEach((lane, idx) => lane.forEach(it => itemIdToLane[it.id] = idx));

  const [selectedDate, setSelectedDate] = useState(new Date(currentYear, currentMonth, currentDay));
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const router = useRouter();

  const handlePrev = () => {
    if (view === 'month') {
      let newMonth = currentMonth - 1;
      let newYear = currentYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }
      router.push(`/calendar?month=${newMonth}&year=${newYear}&view=month`);
    } else if (view === 'week') {
      const d = new Date(currentYear, currentMonth, currentDay);
      d.setDate(d.getDate() - 7);
      router.push(`/calendar?month=${d.getMonth()}&year=${d.getFullYear()}&day=${d.getDate()}&view=week`);
    } else if (view === 'day') {
      const d = new Date(currentYear, currentMonth, currentDay);
      d.setDate(d.getDate() - 1);
      router.push(`/calendar?month=${d.getMonth()}&year=${d.getFullYear()}&day=${d.getDate()}&view=day`);
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      let newMonth = currentMonth + 1;
      let newYear = currentYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      router.push(`/calendar?month=${newMonth}&year=${newYear}&view=month`);
    } else if (view === 'week') {
      const d = new Date(currentYear, currentMonth, currentDay);
      d.setDate(d.getDate() + 7);
      router.push(`/calendar?month=${d.getMonth()}&year=${d.getFullYear()}&day=${d.getDate()}&view=week`);
    } else if (view === 'day') {
      const d = new Date(currentYear, currentMonth, currentDay);
      d.setDate(d.getDate() + 1);
      router.push(`/calendar?month=${d.getMonth()}&year=${d.getFullYear()}&day=${d.getDate()}&view=day`);
    }
  };

  const handleToday = () => {
    const d = new Date();
    router.push(`/calendar?month=${d.getMonth()}&year=${d.getFullYear()}&day=${d.getDate()}&view=${view}`);
  };

  const switchView = (newView: string) => {
    router.push(`/calendar?month=${currentMonth}&year=${currentYear}&day=${currentDay}&view=${newView}`);
  };

  const selectedDateItems = items.filter(it => {
    const start = new Date(it.date);
    const end = it.dateEnd ? new Date(it.dateEnd) : start;
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const target = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    return target >= s && target <= e;
  });

  function startOfDay(d: any) {
    const date = new Date(d);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
        <div className="text-left">
          <h2 className="text-3xl font-black text-[#031a6b] tracking-tight">{t('calendarTitle')}</h2>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 opacity-60">
            {view === 'month' ? t('monthLabel', { month: (currentMonth + 1).toString(), year: currentYear.toString() }) : 
             view === 'week' ? `Tuần ${gridDays[0].day}/${gridDays[0].month + 1} - ${gridDays[6].day}/${gridDays[6].month + 1}` :
             `${currentDay}/${currentMonth + 1}/${currentYear}`}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          {/* View Switcher */}
          <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-2xl border border-blue-100 shadow-sm">
            {[
              { id: 'month', label: t('monthView') },
              { id: 'week', label: t('weekView') },
              { id: 'day', label: t('dayView') }
            ].map((v) => (
              <button 
                key={v.id}
                onClick={() => switchView(v.id)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  view === v.id 
                    ? 'bg-[#1151d3] text-white shadow-lg shadow-blue-500/20' 
                    : 'text-gray-400 hover:text-[#1151d3]'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleToday}
              className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#1151d3] bg-blue-50 hover:bg-[#1151d3] hover:text-white rounded-2xl transition-all shadow-sm border border-blue-100/50"
            >
              {t('today')}
            </button>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
              <button onClick={handlePrev} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="material-symbols-outlined text-gray-400 text-base font-black">chevron_left</span>
              </button>
              <button onClick={handleNext} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="material-symbols-outlined text-gray-400 text-base font-black">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {view === 'month' ? (
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-7 bg-[#f8faff] border-b border-gray-100 mb-1">
                {[t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')].map((day, idx) => (
                  <div key={idx} className={`py-5 text-center text-[10px] font-black uppercase tracking-widest ${idx === 6 ? 'text-rose-400' : 'text-gray-400'}`}>
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 divide-y divide-gray-100 border-b border-gray-100">
                {gridDays.map((d: any, idx: number) => {
                  const current = startOfDay(new Date(d.year, d.month, d.day)).getTime();
                  const dayItems = items.filter(it => {
                    const s = startOfDay(new Date(it.date)).getTime();
                    const e = startOfDay(new Date(it.dateEnd || it.date)).getTime();
                    return current >= s && current <= e;
                  }).sort((a,b) => itemIdToLane[a.id] - itemIdToLane[b.id]);

                  const isSelected = d.day === selectedDate.getDate() && d.month === selectedDate.getMonth() && d.year === selectedDate.getFullYear();

                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedDate(new Date(d.year, d.month, d.day))}
                      className={`min-h-[140px] pt-4 pb-2 transition-all cursor-pointer hover:bg-blue-50/60 group/day relative ${idx % 7 !== 6 ? 'border-r border-gray-100/50' : ''} ${d.isToday ? 'bg-blue-50/30' : ''} ${isSelected ? 'bg-white shadow-[inset_0_0_0_3px_#1151d3] z-10' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-4 px-4">
                         <span className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black shadow-sm transition-all ${d.isToday ? 'bg-[#1151d3] text-white' : isSelected ? 'bg-[#031a6b] text-white scale-110 shadow-lg' : d.isCurrentMonth ? 'bg-white text-gray-800 border-2 border-gray-100' : 'bg-transparent text-gray-300'}`}>
                           {d.day}
                         </span>
                      </div>
                      
                      <div className="space-y-1 relative">
                         {[0, 1, 2].map(laneIdx => {
                           const it = dayItems.find(item => itemIdToLane[item.id] === laneIdx);
                           if (!it) return <div key={laneIdx} className="h-[26px]" />; 

                           const itemColor = it.subject?.colorCode || (it.type === 'EVENT' ? '#1151d3' : '#a855f7');
                           const isCompleted = it.isCompleted === true;
                           const sTime = startOfDay(new Date(it.date)).getTime();
                           const eTime = startOfDay(new Date(it.dateEnd || it.date)).getTime();
                           const isStart = current === sTime;
                           const isEnd = current === eTime;
                           const isWeekStart = idx % 7 === 0;
                           const showTitle = isStart || isWeekStart;
                           const isHovered = hoveredItemId === it.id;
                           const opaqueColor = isCompleted ? '#f1f5f9' : `color-mix(in srgb, ${itemColor} 15%, white)`;

                           return (
                             <div 
                               key={laneIdx} 
                               title={it.title}
                               onMouseEnter={() => setHoveredItemId(it.id)}
                               onMouseLeave={() => setHoveredItemId(null)}
                               onClick={(e) => { e.stopPropagation(); setSelectedTaskForDetail(it); }}
                               className={`h-[26px] py-1 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer relative z-[10] ${isHovered ? 'brightness-90 scale-[1.01]' : ''}`}
                               style={{ 
                                 backgroundColor: opaqueColor,
                                 borderLeft: isStart ? `3px solid ${isCompleted ? '#94a3b8' : itemColor}` : 'none',
                                 color: isCompleted ? '#64748b' : itemColor,
                                 fontSize: '10px',
                                 fontWeight: '900',
                                 paddingLeft: isStart ? '10px' : '0px',
                                 paddingRight: isEnd ? '10px' : '0px',
                                 marginLeft: isStart ? '4px' : '-1px',
                                 marginRight: isEnd ? '4px' : '-1px',
                                 borderTopLeftRadius: isStart ? '8px' : '0',
                                 borderBottomLeftRadius: isStart ? '8px' : '0',
                                 borderTopRightRadius: isEnd ? '8px' : '0',
                                 borderBottomRightRadius: isEnd ? '8px' : '0',
                                 textDecoration: isCompleted ? 'line-through' : 'none'
                               }}
                             >
                               {showTitle && (
                                 <div className="flex items-center gap-1.5 truncate pl-1">
                                   <span className={`material-symbols-outlined text-[10px] font-black`} style={{ color: isCompleted ? '#10b981' : itemColor }}>
                                     {it.type === 'EVENT' ? 'calendar_today' : 'task_alt'}
                                   </span>
                                   <span className="truncate">{it.title}</span>
                                 </div>
                               )}
                             </div>
                           );
                         })}
                         {dayItems.length > 3 && (
                           <div className="text-[8px] font-black text-gray-300 pl-4 uppercase tracking-tighter pt-1">
                             {t('moreDetails', { count: (dayItems.length - 3).toString() })}
                           </div>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
               {gridDays.map((d, idx) => {
                 const current = startOfDay(new Date(d.year, d.month, d.day)).getTime();
                 const dayItems = items.filter(it => {
                   const s = startOfDay(new Date(it.date)).getTime();
                   const e = startOfDay(new Date(it.dateEnd || it.date)).getTime();
                   return current >= s && current <= e;
                 });

                 return (
                   <div key={idx} className={`bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm ${d.isToday ? 'border-blue-300 shadow-xl shadow-blue-50/50' : ''}`}>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                           <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${d.isToday ? 'bg-[#1151d3] text-white shadow-lg' : 'bg-gray-50 text-[#031a6b]'}`}>
                              <span className="text-xl leading-none">{d.day}</span>
                              <span className="text-[9px] uppercase tracking-widest mt-1 opacity-70">
                                {idx === 0 ? t('mon') : idx === 1 ? t('tue') : idx === 2 ? t('wed') : idx === 3 ? t('thu') : idx === 4 ? t('fri') : idx === 5 ? t('sat') : t('sun')}
                              </span>
                           </div>
                           <p className="text-lg font-black text-[#031a6b]">{d.isToday ? t('today') : `${d.day}/${d.month + 1}`}</p>
                        </div>
                        {dayItems.length > 0 && (
                          <div className="px-5 py-2 rounded-xl bg-[#eff4ff] text-[#1151d3] text-[10px] font-black uppercase tracking-widest border border-blue-50">
                            {dayItems.length} {t('tasksLower')}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {dayItems.length === 0 ? (
                          <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-2xl">
                             <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{t('emptyDay')}</p>
                          </div>
                        ) : (
                          dayItems.map((it, itIdx) => (
                            <CalendarItemCard key={itIdx} it={it} onDetail={() => setSelectedTaskForDetail(it)} router={router} />
                          ))
                        )}
                      </div>
                   </div>
                 );
               })}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center gap-3 border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1151d3] shadow-inner">
                <span className="material-symbols-outlined text-2xl font-black">event</span>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-[#031a6b] tracking-tighter leading-none">{items.filter(it => it.type === 'EVENT').length}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase mt-2 tracking-widest">{t('events')}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center gap-3 border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                <span className="material-symbols-outlined text-2xl font-black">task</span>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-[#031a6b] tracking-tighter leading-none">{items.filter(it => it.type === 'TASK').length}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase mt-2 tracking-widest">{t('tasks')}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center gap-3 border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
                <span className="material-symbols-outlined text-2xl font-black">pending_actions</span>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-[#031a6b] tracking-tighter leading-none">{items.filter(it => it.type === 'TASK' && !it.isCompleted).length}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase mt-2 tracking-widest">{t('remaining')}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center gap-3 border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                <span className="material-symbols-outlined text-2xl font-black">check_circle</span>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-[#031a6b] tracking-tighter leading-none">{items.filter(it => it.type === 'TASK' && it.isCompleted).length}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase mt-2 tracking-widest">{t('completed')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col h-full min-h-[600px]">
            <div className="flex justify-between items-center mb-10 text-left">
              <div>
                <h3 className="font-black text-[#031a6b] text-2xl tracking-tighter">{t('scheduleTitle')}</h3>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
                  {new Intl.DateTimeFormat(lang === 'VI' ? 'vi-VN' : 'en-US', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(selectedDate)}
                </p>
              </div>
            </div>

            <div className="space-y-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {selectedDateItems.length === 0 ? (
                <div className="text-center py-20 border-3 border-dashed border-gray-50 rounded-[32px]">
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{t('emptyDay')}</p>
                </div>
              ) : (
                <>
                  {selectedDateItems.filter(it => it.type === 'EVENT').length > 0 && (
                    <div className="space-y-4">
                      <div className="text-left flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('events')} ({selectedDateItems.filter(it => it.type === 'EVENT').length})</h4>
                      </div>
                      {selectedDateItems.filter(it => it.type === 'EVENT').map((it, idx) => (
                        <CalendarItemCard key={`ev-${idx}`} it={it} onDetail={() => setSelectedTaskForDetail(it)} router={router} />
                      ))}
                    </div>
                  )}

                  {selectedDateItems.filter(it => it.type === 'TASK' && !it.isCompleted).length > 0 && (
                    <div className="space-y-4">
                      <div className="text-left flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
                        <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest font-black">{t('remaining')} ({selectedDateItems.filter(it => it.type === 'TASK' && !it.isCompleted).length})</h4>
                      </div>
                      {selectedDateItems.filter(it => it.type === 'TASK' && !it.isCompleted).map((it, idx) => (
                        <CalendarItemCard key={`task-inc-${idx}`} it={it} onDetail={() => setSelectedTaskForDetail(it)} router={router} />
                      ))}
                    </div>
                  )}

                  {selectedDateItems.filter(it => it.type === 'TASK' && it.isCompleted).length > 0 && (
                    <div className="space-y-4">
                      <div className="text-left flex items-center gap-2 mb-2 opacity-50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('completed')} ({selectedDateItems.filter(it => it.type === 'TASK' && it.isCompleted).length})</h4>
                      </div>
                      {selectedDateItems.filter(it => it.type === 'TASK' && it.isCompleted).map((it, idx) => (
                        <CalendarItemCard key={`task-comp-${idx}`} it={it} onDetail={() => setSelectedTaskForDetail(it)} router={router} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-12">
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="w-full py-5 rounded-[24px] bg-[#1151d3] text-white font-black text-sm shadow-xl hover:bg-[#031a6b] transition-all flex items-center justify-center gap-3"
               >
                 <span className="material-symbols-outlined text-base font-black">add</span>
                 {t('createNewSchedule')}
               </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && <AddEventModal subjects={subjects} defaultDate={selectedDate} onClose={() => setIsModalOpen(false)} />}
      {selectedTaskForDetail && <TaskDetailModal task={selectedTaskForDetail} subject={selectedTaskForDetail.subject} allSubjects={subjects} onClose={() => setSelectedTaskForDetail(null)} />}
    </div>
  );
}
