'use client';

import { useState } from 'react';
import { isToday, isThisWeek, startOfDay } from 'date-fns';
import EventCard from './EventCard';
import { useLanguage } from '../LanguageProvider';

interface EventListContentProps {
  events: any[];
  subjects: any[];
}

type FilterType = 'TODAY' | 'ALL' | 'WEEK' | 'COMPLETED' | 'RANGE';

export default function EventListContent({ events, subjects }: EventListContentProps) {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState<FilterType>('TODAY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const now = new Date();

  const getFilteredEvents = () => {
    let result = events;

    switch (filter) {
      case 'TODAY':
        result = events.filter(e => {
          const start = startOfDay(new Date(e.date));
          const end = startOfDay(e.dateEnd ? new Date(e.dateEnd) : start);
          const today = startOfDay(now);
          return today >= start && today <= end;
        });
        break;
      case 'WEEK':
        result = events.filter(e => isThisWeek(new Date(e.date), { weekStartsOn: 1 }));
        break;
      case 'COMPLETED':
        result = events.filter(e => e.isCompleted);
        break;
      case 'RANGE':
        if (startDate && endDate) {
          const s = startOfDay(new Date(startDate));
          const e = startOfDay(new Date(endDate));
          e.setHours(23, 59, 59, 999);
          result = events.filter(t => {
            const tStart = new Date(t.date);
            const tEnd = t.dateEnd ? new Date(t.dateEnd) : tStart;
            return (tStart <= e && tEnd >= s);
          });
        }
        break;
      case 'ALL':
      default:
        break;
    }

    if (filter === 'RANGE' && selectedSubjectId) {
      result = result.filter(e => e.subjectId === selectedSubjectId);
    }

    return result;
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div className="flex-1">
      {/* Filter Bar */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'TODAY', label: t('todayTasks'), count: events.filter(e => {
                 const start = startOfDay(new Date(e.date));
                 const end = startOfDay(e.dateEnd ? new Date(e.dateEnd) : start);
                 const today = startOfDay(new Date());
                 return today >= start && today <= end;
              }).length },
              { id: 'ALL', label: t('allTasks'), count: events.length },
              { id: 'WEEK', label: t('thisWeek'), count: events.filter(e => isThisWeek(new Date(e.date), { weekStartsOn: 1 })).length },
              { id: 'COMPLETED', label: t('completedTasksTitle'), count: events.filter(e => e.isCompleted).length },
              { id: 'RANGE', label: t('customFilter'), count: -1 }
            ].map((f) => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id as FilterType)}
                className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap ${
                  filter === f.id 
                    ? 'bg-[#031a6b] text-white shadow-lg shadow-blue-900/10 -translate-y-0.5' 
                    : 'bg-[#eff4ff] text-gray-500 hover:bg-blue-100 hover:text-[#1151d3]'
                }`}
              >
                {f.label} {f.count >= 0 ? `(${f.count})` : ''}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-[#eff4ff] p-1 rounded-lg">
              <button className="p-1.5 bg-white shadow-sm rounded-md text-[#1151d3]">
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
              <button className="p-1.5 text-gray-500 hover:text-[#1151d3] transition-colors opacity-40">
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
            </div>
          </div>
        </div>

        {/* Custom Filter Selector */}
        {filter === 'RANGE' && (
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="w-full">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1 tracking-widest">{t('fromDate')}</label>
                <div className="relative">
                   <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-[#031a6b] focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">calendar_today</span>
                </div>
              </div>

              <div className="w-full">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1 tracking-widest">{t('toDate')}</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-[#031a6b] focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">event</span>
                </div>
              </div>

              <div className="w-full">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1 tracking-widest">{t('filterByTag')}</label>
                <select 
                  value={selectedSubjectId || ''}
                  onChange={(e) => setSelectedSubjectId(e.target.value || null)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-[15px] text-sm font-bold text-[#031a6b] focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="">{t('allSubjects')}</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); setSelectedSubjectId(null); }}
                  className="w-full px-6 py-3.5 bg-gray-100 text-gray-500 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  {t('reset')}
                </button>
              </div>
            </div>
            {(startDate || endDate || selectedSubjectId) && (
              <p className="text-[10px] font-bold text-blue-500 mt-4 flex items-center gap-1.5 ml-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                {t('applyingFilter')} 
                {startDate && ` ${t('from')} ${new Date(startDate).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US')}`}
                {endDate && ` ${t('to')} ${new Date(endDate).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US')}`}
                {selectedSubjectId && ` ${t('subjectPrefix')} ${subjects.find(s => s.id === selectedSubjectId)?.name}`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Event List Display */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-lg font-bold text-gray-800 tracking-tight uppercase">
            {filter === 'TODAY' && t('todayEvents')}
            {filter === 'ALL' && t('allEvents')}
            {filter === 'WEEK' && t('thisWeekSchedule')}
            {filter === 'COMPLETED' && t('completedEvents')}
            {filter === 'RANGE' && t('customFilterResults')}
          </h3>
          <span className="bg-[#d3e4fe] text-[#1151d3] text-xs font-bold px-2 py-0.5 rounded-full">{filteredEvents.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <EventCard key={event.id} event={event} subject={event.subject} allSubjects={subjects} />
            ))
          ) : (
            <div className="col-span-full p-12 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
              <span className="material-symbols-outlined text-gray-200 text-6xl mb-4">event_busy</span>
              <p className="text-gray-400 font-bold">{t('noEventsFound')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
