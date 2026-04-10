'use client';

import { useState } from 'react';
import { createEvent } from '@/lib/actions/calendar';
import { createSubject, deleteSubject } from '@/lib/actions/subjects';
import { useRouter } from 'next/navigation';
import PlannyDatePicker from '../ui/PlannyDatePicker';
import PlannyTimePicker from '../ui/PlannyTimePicker';
import PlannyPriorityPicker from '../ui/PlannyPriorityPicker';
import { useLanguage } from '@/components/LanguageProvider';

const COLORS = ['#1151d3', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4'];

export default function QuickAddEventForm({ subjects: initialSubjects }: { subjects: any[] }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState('MEDIUM');
  
  const [subjects, setSubjects] = useState(initialSubjects);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const [selectedTagColor, setSelectedTagColor] = useState(COLORS[0]);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

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
    try {
      const result = await deleteSubject(id);
      if (result.success) {
        setSubjects(subjects.filter(s => s.id !== id));
        if (selectedSubjectId === id) setSelectedSubjectId('');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsPending(true);
    
    const result = await createEvent({
      title,
      description,
      date,
      dateEnd,
      timeStart: startTime,
      timeEnd: endTime,
      priority,
      subjectId: selectedSubjectId || undefined
    });
    
    if (result.success) {
      setTitle('');
      setDescription('');
      setSelectedSubjectId('');
      router.refresh();
    } else {
      alert(t('errorPrefix') + result.error);
    }
    setIsPending(false);
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border-2 border-gray-50 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-500 font-bold">add_circle</span>
        </div>
        <div className="text-left">
           <h3 className="text-lg font-black text-[#031a6b] tracking-tight">{t('addQuickEvent')}</h3>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{t('createQuickSchedule')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input 
          className="w-full bg-gray-50/50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl py-4 px-6 font-bold text-sm text-[#031a6b] placeholder-gray-300 transition-all outline-none" 
          placeholder={t('eventNamePlaceholder')} 
          required
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
           <PlannyDatePicker label={t('startDate')} date={date} onChange={setDate} />
           <PlannyDatePicker label={t('endDate')} date={dateEnd} onChange={setDateEnd} />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <PlannyTimePicker label={t('fromStart')} time={startTime} onChange={setStartTime} />
           <PlannyTimePicker label={t('toEnd')} time={endTime} onChange={setEndTime} />
        </div>

        <div className="p-1 bg-gray-50/30 rounded-2xl border border-gray-50">
           <PlannyPriorityPicker 
             label={t('priorityLevel')}
             priority={priority}
             onChange={setPriority}
           />
        </div>

        <div className="space-y-4">
           <div className="flex flex-wrap gap-2">
             {subjects.map((s) => (
               <div key={s.id} className="relative group">
                 <button 
                   type="button"
                   onClick={() => setSelectedSubjectId(selectedSubjectId === s.id ? '' : s.id)}
                   className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 border-2 ${
                     selectedSubjectId === s.id
                       ? 'bg-blue-50 border-blue-200 text-[#1151d3]'
                       : 'bg-white border-gray-50 text-gray-400'
                   }`}
                 >
                   <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.colorCode }}></span>
                   {s.name}
                 </button>
                 <button 
                   type="button"
                   onClick={(e) => handleDeleteTag(s.id, e)}
                   className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50"
                 >
                   <span className="material-symbols-outlined text-[10px] text-red-500">close</span>
                 </button>
               </div>
             ))}
           </div>
           
            <div className="space-y-4">
              <div className="relative">
                <input 
                   type="text"
                   placeholder={t('searchOrCreateTag')}
                   value={searchTag}
                   onChange={(e) => setSearchTag(e.target.value)}
                   className="w-full bg-gray-50/50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-xl py-3 px-10 text-[11px] font-bold text-[#031a6b] outline-none transition-all"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-300 text-sm">search</span>
              </div>
              
              {searchTag.trim() && !subjects.some(s => s.name.toLowerCase() === searchTag.trim().toLowerCase()) && (
                <div className="p-5 bg-white border-2 border-blue-50 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-300 shadow-xl shadow-blue-50/20">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('createNewTag')}: <span className="text-blue-600">"{searchTag}"</span></p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                       {COLORS.map(c => (
                         <button
                           key={c}
                           type="button"
                           onClick={() => setSelectedTagColor(c)}
                           className={`w-5 h-5 rounded-full transition-all ${selectedTagColor === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-sm' : 'hover:scale-105 opacity-40 hover:opacity-100'}`}
                           style={{ backgroundColor: c }}
                         />
                       ))}
                    </div>
                    <button 
                      type="button"
                      onClick={handleCreateTag}
                      disabled={isPending}
                      className="bg-blue-600 text-white text-[9px] font-black px-4 py-2 rounded-xl hover:bg-[#031a6b] transition-all disabled:opacity-50"
                    >
                      {t('confirmCreate').toUpperCase()}
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>

        <textarea 
          placeholder={t('notePlaceholder')}
          className="w-full bg-gray-50/50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl py-4 px-6 font-bold text-xs text-[#031a6b] placeholder-gray-300 transition-all outline-none h-24 resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button 
          type="submit"
          disabled={isPending}
          className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-xl shadow-blue-100 hover:bg-[#031a6b] active:scale-95 transition-all disabled:opacity-50"
        >
          {isPending ? t('saving') : t('confirmCreateNew').toUpperCase()}
        </button>
      </form>
    </div>
  );
}
