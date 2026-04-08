"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateGoalNote, addMilestone, toggleMilestone, updateGoalDeadline, deleteGoal, deleteMilestone, updateGoal } from "@/lib/actions/goals";
import PlannyDatePicker from "@/components/ui/PlannyDatePicker";
import { useLanguage } from "@/components/LanguageProvider";

interface GoalDetailModalProps {
  goal: any;
  onClose: () => void;
}

export default function GoalDetailModal({ goal, onClose }: GoalDetailModalProps) {
  const { t, lang } = useLanguage();
  const [note, setNote] = useState(goal.note || "");
  const [title, setTitle] = useState(goal.title || "");
  const [description, setDescription] = useState(goal.description || "");
  const [deadline, setDeadline] = useState(new Date(goal.deadline).toISOString().split('T')[0]);
  const [newPlan, setNewPlan] = useState("");
  const [newPlanDate, setNewPlanDate] = useState(new Date(goal.deadline).toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // New state for internal confirmation
  const [milestoneConfirmId, setMilestoneConfirmId] = useState<string | null>(null);
  const [goalConfirmDelete, setGoalConfirmDelete] = useState(false);

  // Save the note when user leaves or closes it
  const handleSaveNote = async () => {
    if (note !== goal.note) {
      setIsSaving(true);
      await updateGoalNote(goal.id, note);
      setIsSaving(false);
      router.refresh();
    }
  };

  const handleSaveBasicInfo = async () => {
    if (title !== goal.title || description !== goal.description) {
      setIsSaving(true);
      await updateGoal(goal.id, { title, description });
      setIsSaving(false);
      router.refresh();
    }
  };

  const handleClose = () => {
    handleSaveNote();
    handleSaveBasicInfo();
    onClose();
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.trim()) return;
    
    setIsSaving(true);
    await addMilestone(goal.id, newPlan.trim(), new Date(newPlanDate));
    setNewPlan("");
    setIsSaving(false);
    router.refresh();
  };

  const handleTogglePlan = async (milestoneId: string, currentStatus: boolean) => {
    setIsSaving(true);
    await toggleMilestone(milestoneId, !currentStatus);
    setIsSaving(false);
    router.refresh();
  };

  const handleDeleteMilestone = async (id: string) => {
    setIsSaving(true);
    const result = await deleteMilestone(id);
    if (result.success) {
      setMilestoneConfirmId(null);
      router.refresh();
    } else {
      alert(t('errorDeletingMilestone'));
    }
    setIsSaving(false);
  };

  // Setup auto-resize text area
  useEffect(() => {
    const tx = document.getElementsByTagName("textarea");
    for (let i = 0; i < tx.length; i++) {
        if(tx[i].dataset.autoresize) {
            tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
            tx[i].addEventListener("input", function(this: any) {
                this.style.height = "auto";
                this.style.height = (this.scrollHeight) + "px";
            }, false);
        }
    }
  }, [note]);

  return (
    <>
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />
      
      {/* Slide-over Panel from Right */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-20 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-[#031a6b] transition-colors group"
              >
                <span className="material-symbols-outlined text-[20px] font-bold group-hover:-translate-x-0.5 transition-transform">arrow_forward</span>
              </button>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-gray-100 text-gray-400 rounded-lg">
                {t('goalDetailTitle')}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {isSaving && <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full animate-pulse">{t('savingLabel')}</span>}
              
              {goalConfirmDelete ? (
                <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
                  <button 
                    onClick={async () => {
                      setIsSaving(true);
                      const result = await deleteGoal(goal.id);
                      if (result.success) {
                        onClose();
                        router.refresh();
                        window.location.reload();
                      } else {
                        alert(result.error);
                      }
                      setIsSaving(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-red-100"
                  >
                    {t('confirmDeleteAll')}
                  </button>
                  <button 
                    onClick={() => setGoalConfirmDelete(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-xl"
                  >
                    {t('cancelBtn')}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setGoalConfirmDelete(true)}
                  className="p-2.5 rounded-xl text-red-100 hover:text-red-500 hover:bg-red-50 transition-all flex items-center gap-2 group"
                  title={t('deleteGoalBtn')}
                >
                  <span className="material-symbols-outlined">delete</span>
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{t('deleteGoalBtn')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Content Body */}
          <div className="p-12 pb-32 flex-1">
            <div className="mb-6 group">
              <textarea
                data-autoresize
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveBasicInfo}
                className="w-full text-4xl font-black text-[#031a6b] leading-tight bg-transparent border-none outline-none resize-none p-0 focus:ring-0"
              />
            </div>

            <div className="w-16 h-1.5 bg-gradient-to-r from-[#1151d3] to-blue-200 rounded-full mb-10 opacity-30" />
            
            <div className="mb-12 group">
              <textarea
                data-autoresize
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSaveBasicInfo}
                placeholder={t('goalDetailDescPlaceholder')}
                className="w-full text-lg text-gray-500 font-medium italic border-l-4 border-gray-100 pl-4 bg-transparent border-none outline-none resize-none focus:ring-0 py-1 transition-all focus:border-[#1151d3]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 p-8 bg-[#f8faff] rounded-[2.5rem] border border-blue-50 shadow-sm shadow-blue-900/5 relative">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12">
                <span className="material-symbols-outlined text-8xl text-blue-900">analytics</span>
              </div>
              
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {t('completionRate')}
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-[#031a6b] tracking-tighter">{goal.progress}</p>
                  <span className="text-xs font-black text-blue-300">%</span>
                </div>
              </div>

              <div className="relative z-30">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {t('deadlineShort')}
                </p>
                <PlannyDatePicker 
                  date={deadline}
                  onChange={async (newD) => {
                    setDeadline(newD);
                    setIsSaving(true);
                    await updateGoalDeadline(goal.id, new Date(newD));
                    setIsSaving(false);
                    router.refresh();
                  }}
                  className="font-black text-[#031a6b]"
                />
              </div>

              {goal.forecast && (
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${goal.forecast.status === 'AT_RISK' ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
                    {t('forecastStatus')}
                  </p>
                  <div className="space-y-1">
                    <p className={`text-sm font-black uppercase tracking-widest ${goal.forecast.status === 'AT_RISK' ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {goal.forecast.status === 'AT_RISK' ? t('atRisk') : goal.forecast.status === 'ON_TRACK' ? t('onTrack') : t('forecast')}
                    </p>
                    {goal.forecast.predictedDate && (
                      <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">event_repeat</span>
                        {t('estimatedCompletion')}: {new Date(goal.forecast.predictedDate).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Plans / Milestones Section */}
            <div className="mb-12">
              <h3 className="text-lg font-black text-[#031a6b] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">checklist</span> 
                {t('myActions')}
              </h3>
              
              <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
                {goal.milestones?.map((m: any, mIdx: number) => (
                  <div key={mIdx} className="flex items-center gap-4 group/item py-1.5">
                    <div 
                      onClick={() => handleTogglePlan(m.id, m.isCompleted)}
                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
                        m.isCompleted ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-100 scale-110' : 'bg-white border-gray-300 group-hover/item:border-[#1151d3]'
                      }`}
                    >
                      {m.isCompleted && <span className="material-symbols-outlined text-white text-[14px] font-black pointer-events-none">check</span>}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <span 
                        onClick={() => handleTogglePlan(m.id, m.isCompleted)}
                        className={`text-[16px] font-bold transition-all cursor-pointer truncate ${
                          m.isCompleted ? 'text-gray-300 line-through' : 'text-[#031a6b] group-hover/item:text-[#1151d3]'
                        }`}
                      >
                        {m.title}
                      </span>
                      {m.date && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="material-symbols-outlined text-[12px] text-gray-300">calendar_today</span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">
                            {t('deadlinePrefix')} {new Date(m.date).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {milestoneConfirmId === m.id ? (
                      <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                        <button 
                          onClick={() => handleDeleteMilestone(m.id)}
                          className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg shadow-md shadow-red-100 hover:bg-red-700 transition-all"
                        >
                          {t('deleteAction')}
                        </button>
                        <button 
                          onClick={() => setMilestoneConfirmId(null)}
                          className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-lg hover:bg-gray-200 transition-all"
                        >
                          {t('cancelBtn')}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setMilestoneConfirmId(m.id)}
                        className="opacity-0 group-hover/item:opacity-100 p-2 text-gray-200 hover:text-red-500 transition-all transform hover:scale-110"
                        title={t('deleteMilestoneTitle')}
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                ))}

                <form onSubmit={handleAddPlan} className="flex flex-col gap-4 pt-6 mt-4 border-t border-gray-100/50">
                  <div className="flex items-center gap-4">
                    <button type="submit" disabled={isSaving} className="w-8 h-8 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 shrink-0 hover:bg-[#eff4ff] hover:text-[#1151d3] hover:border-[#1151d3] transition-all">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                    <input 
                      type="text" 
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value)}
                      placeholder={t('addActionPlaceholder')}
                      className="flex-1 bg-transparent border-none outline-none text-[16px] font-bold text-gray-800 placeholder-gray-300 focus:placeholder-gray-200 transition-all"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 pl-12">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest whitespace-nowrap">{t('deadlinePrefixShort')}</span>
                      <input 
                        type="date" 
                        value={newPlanDate}
                        onChange={(e) => setNewPlanDate(e.target.value)}
                        className="bg-transparent border-none outline-none text-[12px] font-extrabold text-[#1151d3] cursor-pointer"
                      />
                    </div>
                    {isSaving && <span className="text-[10px] font-black text-gray-300 uppercase animate-pulse">{t('processing')}</span>}
                  </div>
                </form>
              </div>
            </div>

            {/* Note Editor */}
            <div className="group relative">
              <h3 className="text-lg font-black text-[#031a6b] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">subject</span> 
                {t('progressNotes')}
              </h3>
              <textarea
                data-autoresize
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleSaveNote}
                placeholder={t('progressNotesPlaceholder')}
                className="w-full text-lg leading-relaxed text-gray-800 bg-transparent border-none outline-none resize-none placeholder-gray-200 font-medium min-h-[300px]"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
