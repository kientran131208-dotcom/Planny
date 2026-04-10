'use client';

import { useState } from 'react';
import { createTask } from '@/lib/actions/tasks';
import { createSubject, deleteSubject } from '@/lib/actions/subjects';
import { createEvent } from '@/lib/actions/calendar';
import { useRouter } from 'next/navigation';
import PlannyDatePicker from '@/components/ui/PlannyDatePicker';
import PlannyTimePicker from '@/components/ui/PlannyTimePicker';
import PlannyPriorityPicker from '@/components/ui/PlannyPriorityPicker';
import { useLanguage } from '@/components/LanguageProvider';

const COLORS = ['#1151d3', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4'];

export default function AddEventModal({ 
  subjects: initialSubjects, 
  defaultDate,
  onClose 
}: { 
  subjects: any[], 
  defaultDate?: Date,
  onClose: () => void 
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'EVENT' | 'TASK'>('EVENT');
  
  const d = defaultDate || new Date();
  const initDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const [date, setDate] = useState(initDate);
  const [dateEnd, setDateEnd] = useState(initDate);
  const [priority, setPriority] = useState('MEDIUM');
  
  // Time Range States
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  
  const [subjects, setSubjects] = useState(initialSubjects);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const [selectedTagColor, setSelectedTagColor] = useState(COLORS[0]);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTag.toLowerCase())
  );

  const handleCreateTag = async () => {
    if (!searchTag.trim()) return;
    setIsPending(true);
    const result = await createSubject(searchTag.trim(), selectedTagColor);
    if (result.success && result.subject) {
      setSubjects([...subjects, result.subject]);
      setSelectedSubjectId(result.subject.id);
      setSearchTag('');
    }
    setIsPending(false);
  };

  const handleDeleteTag = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPending(true);
    try {
      const result = await deleteSubject(id);
      if (result.success) {
        setSubjects(subjects.filter(s => s.id !== id));
        if (selectedSubjectId === id) setSelectedSubjectId('');
      } else {
        alert(result.error || t('errorDeletingTag'));
      }
    } catch (err: any) {
      alert(t('errorClient') + err.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsPending(true);
    
    let result;
    if (type === 'TASK') {
      result = await createTask({
        title,
        description,
        date,
        dateEnd,
        priority,
        subjectId: selectedSubjectId || undefined
      });
    } else {
      result = await createEvent({
        title,
        description,
        date,
        dateEnd,
        timeStart: startTime,
        timeEnd: endTime,
        priority,
        subjectId: selectedSubjectId || undefined
      });
    }
    
    if (result.success) {
      router.refresh();
      onClose();
    } else {
      alert(t('errorPrefix') + result.error);
    }
    setIsPending(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => onClose()}>
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex justify-between items-center mb-10 text-left">
             <div>
                <h3 className="text-2xl font-black text-[#031a6b] tracking-tighter">{t('addNewSchedule')}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{t('planYourDay')}</p>
             </div>
             <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-2xl transition-all">
               <span className="material-symbols-outlined text-gray-300 font-black">close</span>
             </button>
          </div>

          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8">
            <button 
              type="button"
              onClick={() => setType('EVENT')}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${type === 'EVENT' ? 'bg-white text-[#1151d3] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              {t('eventInfo')}
            </button>
            <button 
              type="button"
              onClick={() => setType('TASK')}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${type === 'TASK' ? 'bg-white text-[#a855f7] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <span className="material-symbols-outlined text-sm">task_alt</span>
              {t('taskInfo')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 pb-4">
            <div className="text-left space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                {t('titleLabel', { type: type === 'EVENT' ? t('eventLower') : t('taskLower') })}
              </label>
              <input 
                autoFocus
                className="w-full bg-gray-50/50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl text-lg py-5 px-6 font-bold text-[#031a6b] placeholder-gray-300 transition-all outline-none" 
                placeholder={t('titlePlaceholder')} 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PlannyDatePicker 
                label={t('startDate')}
                date={date}
                onChange={(newDate) => {
                  setDate(newDate);
                  if (new Date(newDate) > new Date(dateEnd)) {
                    setDateEnd(newDate);
                  }
                }}
              />
              <PlannyDatePicker 
                label={t('endDate')}
                date={dateEnd}
                onChange={setDateEnd}
              />
              <PlannyPriorityPicker 
                label={t('priorityLabel')}
                priority={priority}
                onChange={setPriority}
              />
            </div>

            {/* Time Range Pickers - Only for EVENTS */}
            {type === 'EVENT' && (
              <div className="grid grid-cols-2 gap-6 p-6 bg-blue-50/30 rounded-3xl border border-blue-50/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <PlannyTimePicker 
                   label={t('fromStart')}
                  time={startTime}
                  onChange={setStartTime}
                />
                <PlannyTimePicker 
                   label={t('toEnd')}
                  time={endTime}
                  onChange={setEndTime}
                />
              </div>
            )}

            <div className="text-left space-y-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('tagCategory')}</label>
              <div className="p-5 bg-gray-50/50 rounded-[28px] border-2 border-gray-100/50 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <div key={s.id} className="flex items-center bg-white border-2 border-gray-100 p-1 rounded-2xl hover:border-blue-200 transition-all shadow-sm">
                      <button 
                        type="button"
                        onClick={() => setSelectedSubjectId(selectedSubjectId === s.id ? '' : s.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                          selectedSubjectId === s.id
                            ? 'bg-blue-50 text-[#1151d3]'
                            : 'bg-transparent text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.colorCode }}></span>
                        {s.name}
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleDeleteTag(s.id, e)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="relative">
                  <input 
                    type="text"
                    placeholder={t('searchCreateTag')}
                    value={searchTag}
                    onChange={(e) => setSearchTag(e.target.value)}
                    className="w-full bg-white border-2 border-gray-100 focus:border-blue-100 rounded-xl py-4 px-12 text-xs font-bold text-[#031a6b] outline-none transition-all shadow-inner"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-300">tag</span>
                </div>

                {searchTag.trim() && !subjects.some(s => s.name.toLowerCase() === searchTag.trim().toLowerCase()) && (
                  <div className="p-5 bg-white border-2 border-blue-50 rounded-[24px] animate-in fade-in zoom-in duration-300">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-left">
                      {t('suggestNewTag', { tag: searchTag })}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSelectedTagColor(c)}
                            className={`w-6 h-6 rounded-full transition-all ${selectedTagColor === c ? 'ring-4 ring-offset-2 ring-blue-400 scale-110' : 'opacity-40 hover:opacity-100'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <button 
                        type="button"
                        onClick={handleCreateTag}
                        className="bg-[#1151d3] text-white text-[10px] font-black px-5 py-2 rounded-xl"
                      >
                        {t('createTagBtn')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-left space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('notesLabel')}</label>
              <textarea 
                className="w-full bg-gray-50/50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl text-xs py-4 px-6 font-bold text-[#031a6b] placeholder-gray-300 transition-all outline-none min-h-[100px] resize-none" 
                placeholder={t('notesPlaceholder')} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isPending}
                className="w-full py-5 rounded-[24px] bg-[#1151d3] text-white font-black text-sm shadow-2xl shadow-blue-200 hover:bg-[#031a6b] active:scale-95 transition-all disabled:opacity-50"
              >
                {isPending ? t('savingSchedule') : t('confirmCreate')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
