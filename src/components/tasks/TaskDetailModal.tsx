'use client';

import { useState, useEffect } from 'react';
import { updateTask, deleteTask } from '@/lib/actions/tasks';
import { updateEvent, deleteEvent } from '@/lib/actions/calendar';
import { useRouter } from 'next/navigation';
import PlannyDatePicker from '@/components/ui/PlannyDatePicker';
import PlannyTimePicker from '@/components/ui/PlannyTimePicker';
import PlannyPriorityPicker from '@/components/ui/PlannyPriorityPicker';
import { useLanguage } from '@/components/LanguageProvider';

export default function TaskDetailModal({ 
  task, 
  subject, 
  allSubjects = [],
  onClose 
}: { 
  task: any, 
  subject?: any | null, 
  allSubjects?: any[],
  onClose: () => void 
}) {
  const { t } = useLanguage();
  const [localTask, setLocalTask] = useState(task);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [date, setDate] = useState(new Date(task.date).toISOString().split('T')[0]);
  const [dateEnd, setDateEnd] = useState(new Date(task.dateEnd || task.date).toISOString().split('T')[0]);
  const [priority, setPriority] = useState(task.priority);
  const [subjectId, setSubjectId] = useState(subject?.id || task.subjectId || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  // Reset state if a different task is passed
  useEffect(() => {
    setLocalTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDate(new Date(task.date).toISOString().split('T')[0]);
    setDateEnd(new Date(task.dateEnd || task.date).toISOString().split('T')[0]);
    setPriority(task.priority);
    setSubjectId(subject?.id || task.subjectId || '');
    setShowDeleteConfirm(false);
  }, [task.id]);

  // Debounced auto-save for text fields
  useEffect(() => {
    if (title === localTask.title && description === (localTask.description || '')) return;
    
    const timer = setTimeout(() => {
      handleUpdate();
    }, 1500); 

    return () => clearTimeout(timer);
  }, [title, description]);

  const handleUpdate = async (overrides = {}) => {
    const data = {
      title,
      description,
      date,
      dateEnd,
      priority,
      subjectId: (subjectId && subjectId !== "") ? subjectId : undefined,
      ...overrides
    };

    setIsSaving(true);
    try {
      const isTask = task.type === 'TASK' || !task.type;
      const updateAction = isTask ? updateTask : updateEvent;

      const result = await updateAction(task.id, data);
      if (result.success) {
        setLocalTask({ ...localTask, ...data } as any);
        router.refresh();
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const isTask = task.type === 'TASK' || !task.type;
      const deleteAction = isTask ? deleteTask : deleteEvent;
      const result = await deleteAction(task.id);
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error || t('cannotDelete'));
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert(t('systemDeleteError'));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Immediate save for dropdowns/date
  const handleImmediateUpdate = (key: string, val: any) => {
    console.log(`Immediate update for ${key}:`, val);
    handleUpdate({ [key]: val });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-end bg-black/40 backdrop-blur-[4px]">
      <div 
        className="w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto custom-scrollbar border-l border-gray-100 flex flex-col relative"
      >
        {/* Custom Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-200">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-red-500 text-4xl font-black">delete_forever</span>
            </div>
            <h2 className="text-3xl font-black text-[#031a6b] mb-4 tracking-tighter">{t('confirmDeleteTitle')}</h2>
            <p className="text-gray-500 font-medium mb-12 max-w-sm">
                {t('deleteActionWarning', { type: task.type === 'EVENT' ? t('eventLower') : t('taskLower') })}
            </p>
            
            <div className="flex flex-col w-full max-w-xs gap-4">
              <button 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-full py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                    {t('deleting')}
                  </>
                ) : (
                  t('yesDeleteNow')
                )}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-4 rounded-2xl bg-gray-50 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all"
              >
                {t('goBack')}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 p-8 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={async () => {
                await handleUpdate();
                onClose();
              }}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-all group"
            >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-[#031a6b] font-black">arrow_back</span>
            </button>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                   {t('editingLabel', { type: task.type === 'EVENT' ? t('eventLower') : t('taskLower') })}
               </span>
               {isSaving ? (
                 <span className="text-[9px] text-[#1151d3] font-black animate-pulse">{t('savingChanges')}</span>
               ) : (
                 <span className="text-[9px] text-emerald-500 font-black flex items-center gap-1">
                   <span className="material-symbols-outlined text-[10px]">cloud_done</span>
                   {t('savedToSystem')}
                 </span>
               )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
              title={t('deleteThis')}
            >
              <span className={`material-symbols-outlined text-[24px] font-black ${isDeleting ? 'animate-spin' : ''}`}>
                {isDeleting ? 'sync' : 'delete'}
              </span>
            </button>
            <button 
               onClick={async () => {
                  await handleUpdate();
                  onClose();
               }}
               className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#031a6b] text-white hover:shadow-lg transition-all"
             >
               {t('doneClose')}
             </button>
          </div>
        </div>

        <div className="p-12 space-y-12 flex-1">
          {/* Title Section */}
          <div className="space-y-6">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">{t('tagCategoryDetail')}</h4>
                  {subjectId && (
                     <button 
                       onClick={() => {
                         setSubjectId('');
                         handleImmediateUpdate('subjectId', null);
                       }}
                       className="text-[9px] font-black text-[#1151d3] hover:underline"
                     >
                       {t('removeTag')}
                     </button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                   {allSubjects.map(s => (
                     <button 
                       key={s.id}
                       onClick={() => {
                         const newS = subjectId === s.id ? '' : s.id;
                         setSubjectId(newS);
                         handleImmediateUpdate('subjectId', newS || null);
                       }}
                       className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                         subjectId === s.id 
                           ? 'bg-blue-50 border-blue-200 text-[#1151d3] shadow-md shadow-blue-100/50 scale-105' 
                           : 'bg-white border-gray-100 text-gray-400 hover:border-blue-100 hover:text-gray-600'
                       }`}
                     >
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.colorCode }} />
                       {s.name}
                     </button>
                   ))}
                   
                   {allSubjects.length === 0 && (
                     <div className="text-[10px] font-bold text-gray-300 italic py-2">
                       {t('noTagsYet')}
                     </div>
                   )}
                </div>
              </div>

              <div className="w-full h-px bg-gray-100 my-4" />

              <div className="flex items-center gap-4">
                 <PlannyPriorityPicker 
                    priority={priority}
                    onChange={(newP) => {
                      setPriority(newP);
                      handleImmediateUpdate('priority', newP);
                    }}
                    className="min-w-[140px]"
                  />
              </div>

            <textarea
              className="w-full bg-transparent border-none p-0 text-4xl lg:text-5xl font-black text-[#031a6b] tracking-tighter leading-tight focus:ring-0 resize-none placeholder-gray-200"
              value={title}
              rows={2}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('enterTitlePlaceholder')}
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-50/50 rounded-[32px] border border-gray-100">
            <PlannyDatePicker 
              label={t('startDate')}
              date={date}
              onChange={(newD) => {
                setDate(newD);
                handleImmediateUpdate('date', newD);
                // Ensure end date is valid
                if (new Date(newD) > new Date(dateEnd)) {
                  setDateEnd(newD);
                  handleImmediateUpdate('dateEnd', newD);
                }
              }}
            />
            <PlannyDatePicker 
              label={t('endDate')}
              date={dateEnd}
              onChange={(newD) => {
                setDateEnd(newD);
                handleImmediateUpdate('dateEnd', newD);
              }}
            />
          </div>

          {/* Description Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-300">notes</span>
                <h3 className="text-[11px] font-black text-[#031a6b] uppercase tracking-widest">{t('detailedNotes')}</h3>
              </div>
              <button 
                onClick={() => handleUpdate()}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  isSaving ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-[#1151d3] hover:bg-blue-100'
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-xs">sync</span>
                    {t('savingLabel')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xs">save</span>
                    {t('saveNow')}
                  </>
                )}
              </button>
            </div>
            <textarea
              className="w-full bg-transparent border-none p-0 text-gray-600 leading-relaxed font-medium text-lg min-h-[350px] focus:ring-0 resize-none placeholder-gray-200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('detailedNotesPlaceholder')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
