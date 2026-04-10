'use client';

import { useState, useEffect } from 'react';
import { createTask } from '@/lib/actions/tasks';
import { createSubject, deleteSubject } from '@/lib/actions/subjects';
import { Subject } from '@prisma/client';
import { useRouter } from 'next/navigation';
import PlannyDatePicker from '@/components/ui/PlannyDatePicker';
import PlannyTimePicker from '@/components/ui/PlannyTimePicker';
import PlannyPriorityPicker from '@/components/ui/PlannyPriorityPicker';
import { useLanguage } from '@/components/LanguageProvider';

const COLORS = ['#1151d3', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4'];

const PRIORITY_KEYWORDS: Record<string, string[]> = {
  URGENT: ['gấp', 'ngay', 'khẩn', 'urgent', 'asap', 'deadline', 'ngay lập tức'],
  HIGH: ['thi', 'kiểm tra', 'exam', 'test', 'quan trọng', 'important', 'final', 'midterm'],
  LOW: ['đọc', 'xem', 'thêm', 'read', 'watch', 'optional', 'thư giãn', 'nhẹ', 'chill']
};

export default function QuickAddForm({ subjects: initialSubjects }: { subjects: Subject[] }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('MEDIUM');
  const [subjects, setSubjects] = useState(initialSubjects);
  const [subjectId, setSubjectId] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const [selectedTagColor, setSelectedTagColor] = useState(COLORS[0]);
  const [isPending, setIsPending] = useState(false);
  const [isAutoPriority, setIsAutoPriority] = useState(true);
  const [isAutoSubject, setIsAutoSubject] = useState(true);
  const router = useRouter();

  // Smart Classification Logic
  useEffect(() => {
    if (!title.trim()) return;
    const lowerTitle = title.toLowerCase();

    // 1. Suggest Priority
    if (isAutoPriority) {
      let suggestedPriority = 'MEDIUM';
      for (const [p, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
        if (keywords.some(k => lowerTitle.includes(k))) {
          suggestedPriority = p;
          break;
        }
      }
      if (suggestedPriority !== priority) {
        setPriority(suggestedPriority);
      }
    }

    // 2. Suggest Subject (Tag)
    if (isAutoSubject) {
      const matchedSubject = subjects.find(s => 
        lowerTitle.includes(s.name.toLowerCase()) || 
        s.name.toLowerCase().includes(lowerTitle) && lowerTitle.length > 2
      );
      if (matchedSubject && matchedSubject.id !== subjectId) {
        setSubjectId(matchedSubject.id);
      }
    }
  }, [title, isAutoPriority, isAutoSubject, subjects]);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTag.toLowerCase())
  );

  const handleCreateTag = async () => {
    if (!searchTag.trim()) return;
    setIsPending(true);
    const result = await createSubject(searchTag.trim(), selectedTagColor);
    if (result.success && result.subject) {
      setSubjects([...subjects, result.subject as any]);
      setSubjectId(result.subject.id);
      setSearchTag('');
    }
    setIsPending(false);
  };

  const handleDeleteTag = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(t('deleteTagStart'));
    setIsPending(true);
    try {
      const result = await deleteSubject(id);
      if (result.success) {
        setSubjects(subjects.filter(s => s.id !== id));
        if (subjectId === id) setSubjectId('');
      } else {
        alert(t('errorDeletingTag') || result.error);
      }
    } catch (err: any) {
      alert(t('errorClient') + err.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = async () => {
    if (!title) return;
    setIsPending(true);
    const result = await createTask({
      title,
      description,
      date,
      dateEnd,
      priority,
      subjectId: subjectId || undefined
    });
    
    if (result.success) {
      setTitle('');
      setDescription('');
      router.refresh();
    } else {
      alert(t('errorPrefix') + (result.error || "Error"));
    }
    setIsPending(false);
  };

  return (
    <section className="bg-white shadow-[0_20px_60px_rgba(3,26,107,0.04)] border border-gray-50 p-10 rounded-[3rem] hover:shadow-[0_40px_100px_rgba(3,26_107,0.08)] transition-all duration-700">
      <div className="flex items-center justify-between mb-10">
        <div className="text-left">
          <h3 className="text-xl font-black text-[#031a6b] tracking-tight">{t('quickAddTask')}</h3>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-1">{t('quickPlanSub')}</p>
        </div>
        <div className="w-12 h-12 bg-[#eff4ff] rounded-[1.25rem] flex items-center justify-center text-[#1151d3] shadow-sm">
           <span className="material-symbols-outlined font-black">bolt</span>
        </div>
      </div>
      <div className="space-y-6">
        <div className="text-left">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('taskNameLabel')}</label>
          <input 
            className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#1151d3] text-sm py-3 px-4 font-bold text-[#031a6b] transition-all outline-none h-12" 
            placeholder={t('taskNamePlaceholder')} 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="text-left">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('noteLabel')}</label>
          <textarea 
            className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#1151d3] text-sm py-3 px-4 font-medium text-[#031a6b] transition-all outline-none min-h-[80px] resize-none" 
            placeholder={t('notePlaceholder')} 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <PlannyDatePicker 
            label={t('startDate')}
            date={date}
            onChange={(newDate) => {
              setDate(newDate);
              // Ensure end date is at least the start date
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
            label={t('priority' as any)}
            priority={priority}
            onChange={(p) => {
              setPriority(p);
              setIsAutoPriority(false);
            }}
            className="col-span-2"
          />
          {isAutoPriority && title.trim().length > 3 && (
            <div className="col-span-2 -mt-4 mb-2 flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 rounded-lg w-fit animate-in fade-in slide-in-from-left-2">
              <span className="material-symbols-outlined text-[12px] text-blue-500 font-black">auto_awesome</span>
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Đã tự động tối ưu ưu tiên</span>
            </div>
          )}
        </div>

        <div className="text-left">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t('tagClassification' as any)}</label>
            {isAutoSubject && subjectId && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full animate-in zoom-in duration-300">
                <span className="material-symbols-outlined text-[10px] text-emerald-600 font-black">magic_button</span>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Gợi ý Tag tự động</span>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
             <div className="flex flex-wrap gap-1.5">
                {subjects.map((s) => (
                  <div key={s.id} className="flex items-center bg-white/80 rounded-2xl border-2 border-gray-100 p-1 hover:border-blue-200 transition-all shadow-sm">
                    <button 
                      type="button"
                      onClick={() => {
                        setSubjectId(subjectId === s.id ? '' : s.id);
                        setIsAutoSubject(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        subjectId === s.id ? 'bg-blue-50 text-[#1151d3]' : 'text-gray-400'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.colorCode }}></span>
                      {s.name}
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => handleDeleteTag(s.id, e)}
                      className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title={t('deleteTagTitle')}
                    >
                      <span className="material-symbols-outlined text-[18px] font-black">close</span>
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
                     className="w-full bg-white border border-gray-100 rounded-lg py-2.5 px-10 text-[10px] font-bold text-[#031a6b] outline-none transition-all focus:border-blue-100"
                   />
                   <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-300 text-sm">search</span>
                </div>
                
                {searchTag.trim() && !subjects.some(s => s.name.toLowerCase() === searchTag.trim().toLowerCase()) && (
                    <div className="p-5 bg-white border-2 border-blue-50 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-300 shadow-xl shadow-blue-50/20">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('createNewTagPrefix')} <span className="text-[#1151d3]">"{searchTag}"</span></p>
                      <div className="flex items-center justify-between">
                         <div className="flex gap-2">
                            {COLORS.map(c => (
                               <button
                                 key={c}
                                 type="button"
                                 onClick={() => setSelectedTagColor(c)}
                                 className={`w-5 h-5 rounded-full transition-all ${selectedTagColor === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-sm' : 'hover:scale-105'}`}
                                 style={{ backgroundColor: c }}
                               />
                            ))}
                         </div>
                         <button 
                           type="button"
                           onClick={handleCreateTag}
                           disabled={isPending}
                           className="bg-[#1151d3] text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-[#031a6b] transition-all disabled:opacity-50"
                         >
                           {t('confirmCreate')}
                         </button>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full py-4 rounded-2xl bg-[#1151d3] text-white font-black text-sm shadow-xl shadow-blue-100 hover:bg-[#031a6b] active:scale-95 transition-all disabled:opacity-50"
        >
          {isPending ? t('creating') : t('confirmCreateTask')}
        </button>
      </div>
    </section>
  );
}
