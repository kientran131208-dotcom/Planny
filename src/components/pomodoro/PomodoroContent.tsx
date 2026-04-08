'use client';

import { useEffect, useState, useMemo } from 'react';
import { Subject } from '@prisma/client';
import PomodoroTimer from './PomodoroTimer';
import { createStudySession, clearStudySessions, deleteStudySession, getSessionsByRange, getSessionsByDate, updatePomoGoals, updateStudySessionTitle } from '@/lib/actions/pomodoro';
import MiniCalendar from '@/components/ui/MiniCalendar';
import { useLanguage } from '@/components/LanguageProvider';

interface PomodoroSession {
  id?: string;
  mode?: string;
  durationMin: number;
  subjectId: string | null;
  createdAt: Date;
  subject?: Subject | null;
  title?: string | null;
}

interface PomodoroContentProps {
  initialSubjects: { id: string; name: string; colorCode: string }[];
  initialSessions?: any[];
  streakCount?: number;
  userSettings?: {
    pomoWorkMin: number;
    pomoShortBreakMin: number;
    pomoLongBreakMin: number;
    pomoInterval: number;
    remindersEnabled: boolean;
    notificationSound: string;
    soundVolume: number;
    streakWarningEnabled: boolean;
  };
}

export default function PomodoroContent({ 
  initialSubjects, 
  initialSessions = [], 
  streakCount = 0,
  userSettings
}: PomodoroContentProps) {
  const { t, lang } = useLanguage();
  const [sessions, setSessions] = useState<any[]>(initialSessions);
  const [isMounted, setIsMounted] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [currentRange, setCurrentRange] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [goals, setGoals] = useState({ day: 8 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const savedGoals = localStorage.getItem('planny_pomo_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (e) {
        console.error('Error loading goals:', e);
      }
    }
  }, []);

  const updateGoal = async (type: 'day', value: number) => {
    const newGoals = { ...goals, [type]: value };
    setGoals(newGoals);
    localStorage.setItem('planny_pomo_goals', JSON.stringify(newGoals));
    
    // We update all, but only 'day' is user-facing now
    await updatePomoGoals(newGoals.day, newGoals.day * 5, newGoals.day * 20);
  };

  const handleUpdateTitle = async (id: string) => {
    if (!id) return;
    await updateStudySessionTitle(id, editValue);
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editValue } : s));
    setEditingId(null);
  };

  useEffect(() => {
    setIsMounted(true);
    setSessions(initialSessions);
  }, [initialSessions]);

  useEffect(() => {
    if (!isMounted) return;
    
    const fetchRange = async () => {
       setIsLoading(true);
       try {
          let newSessions = [];
          if (currentRange === 'day') {
             newSessions = await getSessionsByDate(selectedDate);
          } else {
             newSessions = await getSessionsByRange(currentRange);
          }
          setSessions(newSessions);
       } catch (error) {
          console.error(error);
       } finally {
          setIsLoading(false);
       }
    };
    
    fetchRange();
  }, [currentRange, isMounted, selectedDate]);

  const stats = useMemo(() => {
    const seenIds = new Set();
    const uniqueFocusSessions = [];

    for (const s of sessions) {
      if (s.id && !seenIds.has(s.id)) {
        seenIds.add(s.id);
        const isFocus = !s.mode || s.mode === 'FOCUS';
        if (isFocus) {
          uniqueFocusSessions.push(s);
        }
      }
    }

    const currentGoalHours = goals.day;
    const completedMinutes = uniqueFocusSessions.reduce((acc, s) => acc + (s.durationMin || 0), 0);

    return {
      completedMinutes,
      totalMinutes: completedMinutes, 
      currentGoalMinutes: currentGoalHours * 60,
      currentGoalHours
    };
  }, [sessions, currentRange, goals]);

  const formatGoalTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h} ${t('hour')} ${m} ${t('minute')}`;
    if (h > 0) return `${h} ${t('hour')}`;
    return `${m} ${t('minute')}`;
  };

  const handleSessionComplete = async (session: any) => {
    if (session.mode === 'FOCUS') {
      const tempId = `temp-${Date.now()}`;
      const uiSession = {
        id: tempId,
        mode: 'FOCUS',
        durationMin: session.minutes,
        createdAt: new Date(),
        subject: initialSubjects.find(sub => sub.id === session.subjectId),
        title: session.title
      };
      setSessions(prev => [uiSession, ...prev]);
      const newSession = await createStudySession(session.minutes, session.subjectId, session.mode, session.title);
      if (newSession?.id) {
         setSessions(prev => prev.map(s => s.id === tempId ? newSession : s));
      }
    } else {
       setSessions(prev => [{
         id: `break-${Date.now()}`,
         mode: 'BREAK',
         durationMin: session.minutes,
         createdAt: new Date(),
       }, ...prev]);
       await createStudySession(session.minutes, session.subjectId, 'BREAK');
    }
  };

  const handleClearHistory = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      const res = await clearStudySessions();
      if (res.success) {
        setSessions([]);
      }
    } catch (e) {
       console.error(e);
    } finally {
       setIsClearing(false);
    }
  };

  const handleDelete = async (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    if (session.mode === 'BREAK' || id?.startsWith('temp-')) {
       setSessions(prev => prev.filter(s => s.id !== id));
    } else {
       const res = await deleteStudySession(id);
       if (res.success) {
          setSessions(prev => prev.filter(s => s.id !== id));
       }
    }
  };

  const getStartTime = (createdAt: Date | string, durationMin: number) => {
    const end = new Date(createdAt);
    const start = new Date(end.getTime() - durationMin * 60000);
    return start.toLocaleTimeString(lang === 'VI' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeDisplay = (date: Date | string) => {
    return new Date(date).toLocaleTimeString(lang === 'VI' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isMounted) return null;

  return (
    <div className="grid grid-cols-12 gap-10">
      <div className="col-span-12 lg:col-span-8 space-y-10">
        <PomodoroTimer subjects={initialSubjects} onSessionComplete={handleSessionComplete} />
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-10">
        <div className="grid grid-cols-2 gap-6">
            <div className="p-10 bg-white border border-gray-100 rounded-[3rem] shadow-[0_20px_50px_rgba(3,26,107,0.03)] text-center space-y-3 hover:scale-[1.02] transition-all">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">{t('focusMinutes')}</p>
               <div className="flex items-baseline justify-center gap-1">
                  <h3 className="text-5xl font-black text-[#031a6b] tabular-nums tracking-tighter">{stats.totalMinutes}</h3>
                  <span className="text-[10px] font-black text-gray-300">{t('min')}</span>
               </div>
               <div className="h-1.5 w-12 bg-blue-100 mx-auto rounded-full"></div>
            </div>
            
            <div className="p-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[3rem] shadow-[0_20px_50px_rgba(249,115,22,0.2)] text-white space-y-4 relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="material-symbols-outlined font-black">local_fire_department</span>
                     <p className="text-[10px] font-black uppercase tracking-widest leading-none opacity-80">{t('streak')}</p>
                  </div>
                  <h3 className="text-5xl font-black tabular-nums tracking-tighter">{streakCount}</h3>
               </div>
               <span className="material-symbols-outlined absolute right-[-10px] bottom-[-10px] text-[100px] opacity-10 group-hover:scale-110 transition-transform duration-700">local_fire_department</span>
            </div>
        </div>

        <div className="bg-blue-50/50 p-10 rounded-[3.5rem] border border-blue-50/50 space-y-6 relative group/goal overflow-hidden">
           {showGoalSettings && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 p-8 animate-in fade-in zoom-in-95 duration-300">
                 <div className="flex justify-between items-center mb-6">
                    <h5 className="text-[11px] font-black text-[#031a6b] uppercase tracking-[0.2em]">{t('goalSettings')}</h5>
                    <button onClick={() => setShowGoalSettings(false)} className="text-gray-400 hover:text-red-500">
                       <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <span>{t('dailyGoal')}</span>
                          <span className="text-blue-600 font-black tabular-nums">{goals.day} {t('hour')}</span>
                       </div>
                       <input 
                          type="range" 
                          min={1} 
                          max={12}
                          value={goals.day} 
                          onChange={(e) => updateGoal('day', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                       />
                    </div>
                 </div>
              </div>
           )}

           <div className="flex justify-between items-start relative z-10">
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <h4 className="text-[11px] font-black text-[#031a6b] uppercase tracking-[0.2em]">{t('goalProgress')}</h4>
                 </div>
                 <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#031a6b] tabular-nums tracking-tighter">
                      {formatGoalTime(stats.completedMinutes)}
                    </span>
                    <span className="text-xs font-black text-gray-300">/ {stats.currentGoalHours}h</span>
                 </div>
              </div>
              <button 
                 onClick={() => setShowGoalSettings(true)}
                 className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-100/50 transition-all opacity-0 group-hover/goal:opacity-100"
              >
                 <span className="material-symbols-outlined text-lg">settings</span>
              </button>
           </div>

           <div className="space-y-3 relative z-10">
              <div className="relative h-4 bg-white rounded-full overflow-hidden shadow-inner">
                 <div 
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${stats.completedMinutes >= stats.currentGoalMinutes ? 'from-emerald-500 to-green-600' : ''}`}
                    style={{ width: `${Math.min(100, (stats.completedMinutes / (stats.currentGoalMinutes || 1)) * 100)}%` }}
                 >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                 </div>
              </div>
              <div className="flex justify-between items-center px-1">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {stats.completedMinutes >= stats.currentGoalMinutes 
                      ? t('goalReached') 
                      : t('moreToGo', { time: formatGoalTime(Math.max(0, stats.currentGoalMinutes - stats.completedMinutes)) })}
                 </p>
                 <span className={`text-[10px] font-black tabular-nums ${stats.completedMinutes >= stats.currentGoalMinutes ? 'text-emerald-500' : 'text-blue-600'}`}>
                    {Math.min(100, Math.round((stats.completedMinutes / (stats.currentGoalMinutes || 1)) * 100))}%
                 </span>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-[0_30px_60px_rgba(3,26,107,0.04)] border border-gray-100 overflow-hidden flex flex-col min-h-[700px] animate-in fade-in slide-in-from-right-10 duration-700">
            <div className="p-10 border-b border-gray-50/50 bg-white">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-2.5 h-10 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
                  <h3 className="text-2xl font-black text-[#031a6b] tracking-tight">{t('historyAndCalendar')}</h3>
               </div>
               
               <MiniCalendar 
                  selectedDate={selectedDate} 
                  onDateSelect={(date) => {
                     setSelectedDate(date);
                     setCurrentRange('day');
                  }} 
               />
            </div>

            <div className="px-10 py-6 bg-gray-50/30 border-b border-gray-50/50">
               <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                     <button 
                        onClick={() => setCurrentRange('day')}
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all shadow-sm text-blue-600 bg-white ring-1 ring-blue-100/50"
                     >
                        {selectedDate.toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' }) === new Date().toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' }) 
                           ? t('today') 
                           : selectedDate.toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' })}
                     </button>
                  </div>
                  
                  <form action={handleClearHistory}>
                     <button 
                        type="submit"
                        disabled={sessions.length === 0 || isClearing}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-0"
                        title={t('clearHistoryTitle')}
                     >
                        <span className="material-symbols-outlined text-xl">delete_sweep</span>
                     </button>
                  </form>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar relative">
               {isLoading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center animate-in fade-in duration-200">
                     <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('loading')}</p>
                     </div>
                  </div>
               )}

               {sessions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-6 py-12">
                     <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-gray-400">event_note</span>
                     </div>
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-center leading-relaxed text-gray-400">
                        {t('noData', { range: currentRange === 'day' ? selectedDate.toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' }) : currentRange === 'week' ? t('thisWeek') : t('thisMonth') })}
                     </p>
                  </div>
               ) : (
                  sessions.map((s, idx) => (
                     <div key={s.id || idx} className="relative pl-10 group animate-in slide-in-from-left-6 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="absolute left-[3px] top-0 bottom-0 w-px bg-gray-100/60 group-last:bottom-auto group-last:h-4"></div>
                        <div className={`absolute left-[-2.5px] top-2 w-3 h-3 rounded-full ring-4 ring-white shadow-sm ${(!s.mode || s.mode === 'FOCUS') ? 'bg-blue-600 shadow-blue-200' : 'bg-green-500 shadow-green-200'}`}></div>
                        
                        <div className="flex justify-between items-start">
                           <div className="space-y-2.5">
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest tabular-nums">
                                    {getStartTime(s.createdAt, s.durationMin)} - {getTimeDisplay(s.createdAt)}
                                 </span>
                                 <div className="h-px w-6 bg-gray-100"></div>
                                 <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${(!s.mode || s.mode === 'FOCUS') ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'}`}>
                                    {s.durationMin}{t('minute').charAt(0)}
                                 </span>
                              </div>
                              <div className="space-y-1">
                                 <div className="flex items-center gap-2 group/title">
                                    {editingId === s.id ? (
                                       <div className="flex items-center gap-2">
                                          <input
                                             autoFocus
                                             className="bg-gray-50 px-2 py-1 rounded text-sm border border-gray-200 focus:outline-none focus:border-blue-500"
                                             value={editValue}
                                             onChange={(e) => setEditValue(e.target.value)}
                                             onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle(s.id)}
                                          />
                                          <button onClick={() => handleUpdateTitle(s.id)} className="text-green-600">
                                             <span className="material-symbols-outlined text-[16px] font-black">check</span>
                                          </button>
                                          <button onClick={() => setEditingId(null)} className="text-gray-400">
                                             <span className="material-symbols-outlined text-[16px] font-black">close</span>
                                          </button>
                                       </div>
                                    ) : (
                                       <>
                                          <h4 className="text-sm font-black text-[#031a6b] tracking-tight uppercase leading-none">
                                             {s.title || ((!s.mode || s.mode === 'FOCUS') ? t('focusSession') : t('breakSession'))}
                                          </h4>
                                          <button 
                                             onClick={() => { setEditingId(s.id); setEditValue(s.title || ''); }}
                                             className="opacity-0 group-hover/title:opacity-100 text-gray-300 hover:text-blue-600"
                                             title={t('editTitle')}
                                          >
                                             <span className="material-symbols-outlined text-[14px]">edit</span>
                                          </button>
                                       </>
                                    )}
                                 </div>
                                 {(s.subject) && (
                                    <div className="flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.subject.colorCode }}></div>
                                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.subject.name}</span>
                                    </div>
                                 )}
                              </div>
                           </div>
                           <button 
                               onClick={() => handleDelete(s.id)}
                               className="opacity-0 group-hover:opacity-100 w-10 h-10 rounded-2xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all transform hover:scale-110"
                           >
                               <span className="material-symbols-outlined text-lg">delete</span>
                           </button>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
