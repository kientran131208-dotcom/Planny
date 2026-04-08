'use client';

import { useState } from 'react';
import { isToday, isThisWeek, parseISO, startOfDay, isWithinInterval } from 'date-fns';
import TaskCard from './TaskCard';
import { useLanguage } from '../LanguageProvider';

interface TaskListContentProps {
  tasks: any[];
  subjects: any[];
}

type FilterType = 'TODAY' | 'ALL' | 'WEEK' | 'COMPLETED' | 'RANGE';

export default function TaskListContent({ tasks, subjects }: TaskListContentProps) {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState<FilterType>('TODAY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const now = new Date();

  const getFilteredTasks = () => {
    let result = tasks;

    // First filter by the main categories
    switch (filter) {
      case 'TODAY':
        result = tasks.filter(t => {
          const taskDate = new Date(t.date);
          const taskEndDate = t.dateEnd ? new Date(t.dateEnd) : taskDate;
          const today = startOfDay(now);
          const start = startOfDay(taskDate);
          const end = startOfDay(taskEndDate);
          return today >= start && today <= end;
        });
        break;
      case 'WEEK':
        result = tasks.filter(t => isThisWeek(new Date(t.date), { weekStartsOn: 1 }));
        break;
      case 'COMPLETED':
        result = tasks.filter(t => t.isCompleted);
        break;
      case 'RANGE':
        if (startDate && endDate) {
          const s = startOfDay(new Date(startDate));
          const e = startOfDay(new Date(endDate));
          e.setHours(23, 59, 59, 999);
          result = tasks.filter(t => {
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

    // Then apply selection if in RANGE mode
    if (filter === 'RANGE' && selectedSubjectId) {
      result = result.filter(t => t.subjectId === selectedSubjectId);
    }

    return result;
  };

  const filteredTasks = getFilteredTasks();
  
  const overdueTasks = tasks.filter(t => {
    const end = t.dateEnd ? new Date(t.dateEnd) : new Date(t.date);
    return startOfDay(end) < startOfDay(now) && !t.isCompleted;
  });

  return (
    <div className="flex-1">
      {/* Filter Bar */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'TODAY', label: t('todayTasks'), count: tasks.filter(t => {
                 const start = startOfDay(new Date(t.date));
                 const end = startOfDay(t.dateEnd ? new Date(t.dateEnd) : start);
                 const today = startOfDay(new Date());
                 return today >= start && today <= end;
              }).length },
              { id: 'ALL', label: t('allTasks'), count: tasks.length },
              { id: 'WEEK', label: t('thisWeek'), count: tasks.filter(t => isThisWeek(new Date(t.date), { weekStartsOn: 1 })).length },
              { id: 'COMPLETED', label: t('completedTasksTitle'), count: tasks.filter(t => t.isCompleted).length },
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

      {/* OVERDUE SECTION */}
      {filter !== 'COMPLETED' && filter !== 'RANGE' && overdueTasks.length > 0 && (
        <div className="mb-10 p-6 bg-red-50/50 rounded-3xl border-2 border-red-100/50">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-red-500 text-lg">history</span>
            <h3 className="text-lg font-bold text-red-600 tracking-tight uppercase">{t('priorityUrgent')}</h3>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{overdueTasks.length}</span>
          </div>

          <div className="space-y-4">
            {overdueTasks.map(task => (
              <TaskCard key={task.id} task={task} subject={task.subject} allSubjects={subjects} />
            ))}
          </div>
        </div>
      )}

      {/* Main Task List Display */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-lg font-bold text-gray-800 tracking-tight uppercase">
            {filter === 'TODAY' && t('todayJourney')}
            {filter === 'ALL' && t('entireList')}
            {filter === 'WEEK' && t('weekPlan')}
            {filter === 'COMPLETED' && t('achievements')}
            {filter === 'RANGE' && t('filterResults')}
          </h3>
          <span className="bg-[#d3e4fe] text-[#1151d3] text-xs font-bold px-2 py-0.5 rounded-full">{filteredTasks.length}</span>
        </div>

        <div className={`space-y-4 ${filter === 'ALL' || filter === 'WEEK' || filter === 'RANGE' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0' : ''}`}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} subject={task.subject} allSubjects={subjects} />
            ))
          ) : (
            <div className="col-span-full p-12 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
              <span className="material-symbols-outlined text-gray-200 text-6xl mb-4">task</span>
              <p className="text-gray-400 font-bold">{t('noTasksFound')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
