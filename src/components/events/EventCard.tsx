'use client';

import { useState } from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { deleteEvent, toggleEvent } from '@/lib/actions/calendar';
import { useRouter } from 'next/navigation';
import TaskDetailModal from '../tasks/TaskDetailModal';
import { useLanguage } from '@/components/LanguageProvider';

interface EventCardProps {
  event: any;
  subject?: any;
  allSubjects?: any[];
}

export default function EventCard({ event, subject, allSubjects = [] }: EventCardProps) {
  const { t, lang } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [completed, setCompleted] = useState(event.isCompleted);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToggling(true);
    const newStatus = !completed;
    setCompleted(newStatus);
    const res = await toggleEvent(event.id, newStatus);
    if (!res.success) {
      setCompleted(!newStatus);
      alert(t('errorPrefix') + res.error);
    } else {
      router.refresh();
    }
    setIsToggling(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!showConfirm) {
      setShowConfirm(true);
      // Auto-reset after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteEvent(event.id);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error || t('deleteError'));
        setShowConfirm(false);
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert(t('systemDeleteError'));
      setShowConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = () => {
    switch (event.priority) {
      case 'HIGH': return 'text-red-500 bg-red-50';
      case 'MEDIUM': return 'text-amber-500 bg-amber-50';
      case 'LOW': return 'text-emerald-500 bg-emerald-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const dateLabel = isToday(new Date(event.date)) 
    ? t('today') 
    : isTomorrow(new Date(event.date)) 
      ? t('tomorrow') 
      : format(new Date(event.date), 'dd/MM', { locale: lang === 'VI' ? vi : enUS });

  const displayEvent = { ...event, type: 'EVENT' };

  return (
    <>
      <div 
        onClick={() => setIsDetailOpen(true)}
        className={`group bg-white p-6 rounded-[32px] border-2 border-gray-50 hover:border-blue-100 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-900/5 relative overflow-hidden cursor-pointer ${isDeleting || isToggling ? 'opacity-50 grayscale' : ''} ${completed ? 'bg-gray-50/50' : ''}`}
      >
        {subject && (
          <div 
            className="absolute top-0 left-0 w-1.5 h-full" 
            style={{ backgroundColor: subject.colorCode }}
          />
        )}
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             <button 
               onClick={handleToggle}
               disabled={isToggling}
               className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 hover:border-blue-300 bg-white'}`}
             >
               {completed && <span className="material-symbols-outlined text-[20px] font-black">done</span>}
             </button>
             <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getPriorityColor()}`}>
               {t(event.priority.toLowerCase() as any)}
             </span>
             <div className="flex items-center gap-1.5 text-gray-400">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{dateLabel}</span>
             </div>
          </div>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${
              showConfirm 
                ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-bounce' 
                : 'opacity-40 group-hover:opacity-100 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500'
            }`}
            aria-label={t('deleteEvent')}
          >
            {showConfirm ? (
              <>
                <span className="text-[10px] font-black uppercase tracking-tighter">{t('confirm')}?</span>
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              </>
            ) : (
              <span className="material-symbols-outlined text-[24px]">
                {isDeleting ? 'sync' : 'delete'}
              </span>
            )}
          </button>
        </div>

        <h4 className={`text-lg font-black tracking-tight mb-2 line-clamp-1 transition-all ${completed ? 'text-gray-300 line-through' : 'text-[#031a6b]'}`}>{event.title}</h4>
        
        {event.description && (
          <p className={`text-xs font-medium mb-5 line-clamp-2 leading-relaxed transition-all ${completed ? 'text-gray-200' : 'text-gray-400'}`}>{event.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div className="flex items-center gap-4">
            {(event.timeStart || event.timeEnd) && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${completed ? 'bg-gray-100/50 opacity-40' : 'bg-gray-50'}`}>
                <span className="material-symbols-outlined text-[18px] text-blue-500">schedule</span>
                <span className="text-[12px] font-black text-gray-600">
                  {event.timeStart}{event.timeEnd ? ` - ${event.timeEnd}` : ''}
                </span>
              </div>
            )}
            {subject && (
              <div className={`flex items-center gap-2 transition-all ${completed ? 'opacity-30' : ''}`}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.colorCode }}></span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{subject.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDetailOpen && (
        <TaskDetailModal
          task={displayEvent}
          subject={subject}
          allSubjects={allSubjects}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </>
  );
}
