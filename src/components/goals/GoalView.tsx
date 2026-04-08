"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import AddGoalModal from "./AddGoalModal";
import GoalDetailModal from "./GoalDetailModal";
import { deleteGoal, toggleMilestone, deleteMilestone } from "@/lib/actions/goals";
import { useLanguage } from "@/components/LanguageProvider";

interface GoalViewProps {
  goals: any[];
  metrics: any;
  timeline: any[];
}

export default function GoalView({ goals, metrics, timeline }: GoalViewProps) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  
  // States for confirmations and processing
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [milestoneConfirmId, setMilestoneConfirmId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Optimistic UI state for milestones
  const [optimisticMilestones, setOptimisticMilestones] = useState<Record<string, boolean>>({});

  // Sync selected goal with live data
  useEffect(() => {
    if (selectedGoal) {
      const updated = goals.find(g => g.id === selectedGoal.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedGoal)) {
        setSelectedGoal(updated);
      }
    }
  }, [goals, selectedGoal]);

  const handleDelete = async (goalId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await deleteGoal(goalId);
      if (result.success) {
        setConfirmDeleteId(null);
        startTransition(() => {
          router.refresh();
        });
      } else {
        alert(t('errorDeletingGoal') + " " + (result.error || ""));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggle = async (mId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Set optimistic state immediately
    setOptimisticMilestones(prev => ({ ...prev, [mId]: nextStatus }));
    
    try {
      const result = await toggleMilestone(mId, nextStatus);
      if (result.success) {
        startTransition(() => {
          router.refresh();
        });
      } else {
        // Rollback on error
        setOptimisticMilestones(prev => ({ ...prev, [mId]: currentStatus }));
        alert("Error: " + (result.error || "Update failed."));
      }
    } catch (err: any) {
      setOptimisticMilestones(prev => ({ ...prev, [mId]: currentStatus }));
      alert("Connection error: " + err.message);
    }
  };

  const handleDeleteMilestone = async (mId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await deleteMilestone(mId);
      if (result.success) {
        setMilestoneConfirmId(null);
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 mt-12">
        <span className="material-symbols-outlined text-6xl text-gray-100 mb-4 font-thin italic">target</span>
        <h3 className="text-xl font-black text-[#031a6b]">{t('noGoals')}</h3>
        <p className="text-gray-400 font-medium text-center">{t('startJourney')}</p>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="mt-8 px-8 py-3 bg-[#1151d3] text-white font-black rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          {t('addGoalBtn')}
        </button>
        {isAddModalOpen && <AddGoalModal onClose={() => setIsAddModalOpen(false)} />}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-12 pb-20">
        {/* Header Hero Area */}
        <section className="bg-gradient-to-br from-[#031A6B] to-[#010c31] rounded-[2rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/30 mt-6 min-h-[400px] flex flex-col justify-center">
            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase border border-white/20 whitespace-nowrap">
                        {t('goalsRunning', { count: metrics.total.toString() })}
                    </span>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#4D7CFE] hover:bg-[#3d6de5] text-white px-5 py-2 rounded-2xl text-[11px] font-black tracking-[0.1em] border border-[#4D7CFE] transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        <span className="material-symbols-outlined text-sm">add</span> {t('addNewBtn')}
                    </button>
                </div>
                <div className="flex items-baseline gap-4 mt-8">
                    <h1 className="text-8xl lg:text-9xl font-black tracking-tighter drop-shadow-2xl">{metrics.avgProgress}%</h1>
                    <div className="mb-4">
                        <p className="text-blue-300 font-black text-xl lg:text-2xl uppercase tracking-tighter">{t('overallProgress')}</p>
                        <p className="text-white/60 font-medium text-sm">{t('realTimeUpdate')}</p>
                    </div>
                </div>
                <div className="w-full max-w-2xl h-4 bg-white/5 rounded-full mt-4 p-1 border border-white/10 relative overflow-hidden shadow-inner translate-y-4 animate-in slide-in-from-bottom duration-1000">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-out"
                        style={{ width: `${metrics.avgProgress}%` }}
                    />
                </div>
            </div>
            
            <div className="absolute -right-20 -top-20 w-80 h-80 border-[40px] border-white/5 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-blue-500/10 rounded-full blur-[100px]" />
        </section>

        {/* Goals Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {goals.map((g: any) => {
            return (
              <div key={g.id} className="bg-white rounded-[2.5rem] p-10 shadow-[0_10px_50px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col group relative hover:shadow-[0_20px_80px_rgba(0,0,0,0.08)] transition-all duration-500">
                <div className="flex justify-between items-start mb-8 flex-wrap gap-2">
                   <div className="px-5 py-2 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-widest">
                     {t('periodLabel', { year: new Date(g.deadline).getFullYear().toString() })}
                   </div>
                   
                   {g.forecast && g.forecast.status !== 'COMPLETED' && (
                     <div className="group/forecast relative">
                       <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 transition-all hover:scale-105 cursor-help ${
                         g.forecast.status === 'AT_RISK' 
                         ? 'bg-orange-50 text-orange-600 border-orange-100 shadow-sm shadow-orange-500/10' 
                         : g.forecast.status === 'ON_TRACK'
                         ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/10'
                         : 'bg-gray-50 text-gray-400 border-gray-100'
                       }`}>
                         <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                         {g.forecast.status === 'AT_RISK' ? t('atRisk') : g.forecast.status === 'ON_TRACK' ? t('onTrack') : t('forecast')}
                       </div>
                       
                       {/* Forecast Tooltip */}
                       <div className="absolute top-full left-0 mt-2 w-48 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover/forecast:opacity-100 group-hover/forecast:visible transition-all z-30 scale-95 group-hover/forecast:scale-100 origin-top-left">
                         <p className="text-[11px] font-black text-[#031a6b] uppercase tracking-tighter mb-2">{t('forecastStatus')}</p>
                         <p className="text-[13px] font-bold text-gray-600 leading-tight mb-3">
                           {g.forecast.message || (g.forecast.status === 'ON_TRACK' ? 'Bạn đang đi đúng lộ trình đề ra.' : 'Gặp khó khăn trong tiến độ.')}
                         </p>
                         {g.forecast.predictedDate && (
                           <div className="pt-3 border-t border-gray-50">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('estimatedCompletion')}</p>
                             <p className="text-[12px] font-black text-[#1151d3]">
                               {new Date(g.forecast.predictedDate).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                             </p>
                           </div>
                         )}
                         <div className="absolute -top-1 left-6 w-2 h-2 bg-white border-t border-l border-gray-100 rotate-45" />
                       </div>
                     </div>
                   )}

                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:text-blue-200 transition-colors shrink-0">
                     <span className="material-symbols-outlined text-[20px]">flag</span>
                   </div>
                </div>

                <h3 className="text-3xl font-black text-[#031a6b] mb-4 leading-tight">{g.title}</h3>
                <p className="text-gray-400 text-[15px] font-medium leading-relaxed mb-10 line-clamp-2">{g.description}</p>
                
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between text-[11px] font-black text-[#031a6b] uppercase tracking-widest">
                    <span>{t('completedLabel')}</span>
                    <span>{g.progress}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden p-1 border border-gray-100 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-[#1151d3] to-[#4D7CFE] rounded-full transition-all duration-[1s] ease-in-out relative shadow-[0_0_15px_rgba(17,81,211,0.2)]"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones List */}
                <div className="space-y-4 border-t border-gray-100 pt-10 flex-1">
                  {g.milestones?.slice(0, 4).map((m: any, mIdx: number) => {
                    const isCompleted = optimisticMilestones[m.id] !== undefined ? optimisticMilestones[m.id] : m.isCompleted;
                    
                    return (
                      <div key={m.id} className="flex items-center gap-5 group/item">
                        <div 
                          onClick={() => handleToggle(m.id, m.isCompleted)}
                          className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
                            isCompleted 
                              ? 'bg-emerald-500 border-emerald-500 shadow-xl shadow-emerald-100 scale-110 rotate-[360deg]' 
                              : 'bg-white border-gray-200 group-hover/item:border-[#1151d3] hover:scale-105'
                          }`}
                        >
                          {isCompleted && (
                            <span className="material-symbols-outlined text-white text-[14px] font-black animate-in zoom-in duration-300">
                              check
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span 
                            onClick={() => handleToggle(m.id, m.isCompleted)}
                            className={`text-[15px] font-bold transition-all duration-500 cursor-pointer truncate ${
                              isCompleted ? 'text-gray-300 line-through opacity-70' : 'text-[#031a6b] group-hover/item:text-blue-600'
                            }`}
                          >
                            {m.title}
                          </span>
                          {m.date && (
                            <span className="text-[10px] font-black text-gray-300 whitespace-nowrap ml-2">
                              {new Date(m.date).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' })}
                            </span>
                          )}
                        </div>
                        
                        {milestoneConfirmId === m.id ? (
                          <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-200">
                            <button 
                              onClick={() => handleDeleteMilestone(m.id)}
                              className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase rounded-lg"
                            >
                              {t('confirmDeleteMilestone')}
                            </button>
                            <button 
                              onClick={() => setMilestoneConfirmId(null)}
                              className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-lg"
                            >
                              {t('cancelBtn')}
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setMilestoneConfirmId(m.id)}
                            className="opacity-0 group-hover/item:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12 flex gap-3">
                  {confirmDeleteId === g.id ? (
                    <div className="flex-1 flex gap-2 animate-in zoom-in-95 duration-200">
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(g.id); }}
                            disabled={isProcessing}
                            className="flex-1 py-4 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl"
                         >
                            {isProcessing ? t('deletingUpper') : t('confirmDeleteUpper')}
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                            className="px-6 py-4 bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl"
                         >
                            {t('cancelBtn').toUpperCase()}
                         </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => setSelectedGoal(g)}
                        className="flex-1 py-4 bg-[#eff4ff] text-[#1151d3] font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-[#e5eeff] transition-all"
                      >
                        {t('viewDetails')}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(g.id); }}
                        className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all border border-red-100 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Career Timeline */}
        {timeline.length > 0 && (
          <section className="bg-white p-12 rounded-[3.5rem] shadow-[0_10px_60px_rgba(0,0,0,0.02)] border border-gray-50">
             <div className="flex items-center justify-between mb-12">
                <div className="text-left">
                  <h3 className="text-4xl font-black tracking-tight text-[#031a6b]">{t('careerPlan')}</h3>
                  <p className="text-gray-400 font-medium text-lg">{t('careerPlanDesc')}</p>
                </div>
                <div className="w-14 h-14 bg-[#eff4ff] rounded-2xl flex items-center justify-center text-[#1151d3]">
                  <span className="material-symbols-outlined text-[24px]">timeline</span>
                </div>
             </div>

             <div className="relative pt-12 pb-8 overflow-x-auto scrollbar-hide">
                {/* Connecting Line */}
                <div className="absolute top-[138px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-100 to-transparent z-0" />
                
                <div className="relative flex justify-between gap-16 px-4 min-w-max pb-10">
                   {timeline.map((m: any, idx: number) => (
                      <div key={idx} className="flex flex-col items-center text-center space-y-6 w-56 relative">
                        <p className="text-[12px] font-black text-[#1151d3] uppercase tracking-[0.1em] bg-blue-50/50 z-10 px-4 py-2 rounded-xl border border-blue-100/50 shadow-sm shadow-blue-100/20 transition-all hover:bg-[#1151d3] hover:text-white cursor-default">
                          {new Date(m.date).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                        <div className={`z-10 w-14 h-14 rounded-[1.25rem] flex items-center justify-center border-4 border-white shadow-xl transition-all duration-500 hover:scale-110 ${
                          m.isCompleted 
                            ? 'bg-emerald-500 text-white shadow-emerald-100' 
                            : 'bg-white text-gray-200 border-gray-50'
                        }`}>
                           <span className="material-symbols-outlined text-[20px] font-bold">
                             {m.isCompleted ? 'verified' : 'circle'}
                           </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-blue-400 mb-0.5 truncate max-w-[180px]" title={m.goal?.title}>
                            {m.goal?.title}
                          </p>
                          <p className={`text-[16px] font-black leading-tight max-w-[200px] ${m.isCompleted ? 'text-gray-300' : 'text-[#031a6b]'}`}>
                            {m.title}
                          </p>
                          <p className="text-[8px] font-bold text-gray-200 mt-1 uppercase tracking-tighter">{t('timelineStep', { number: (idx + 1).toString() })}</p>
                        </div>
                      </div>
                   ))}
                </div>
             </div>
          </section>
        )}
      </div>

      {isAddModalOpen && <AddGoalModal onClose={() => setIsAddModalOpen(false)} />}
      {selectedGoal && <GoalDetailModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />}
    </>
  );
}
