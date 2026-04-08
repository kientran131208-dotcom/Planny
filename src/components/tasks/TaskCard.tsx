'use client';

import { useState } from 'react';
import { toggleTask, deleteTask } from '@/lib/actions/tasks';
import { useRouter } from 'next/navigation';
import { Task, Subject } from '@prisma/client';
import TaskDetailModal from './TaskDetailModal';
import { useLanguage } from '@/components/LanguageProvider';

export default function TaskCard({ task, subject, allSubjects }: { task: Task, subject?: Subject | null, allSubjects?: any[] }) {
  const { lang, t } = useLanguage();
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (isPending) return;
    setIsPending(true);
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    const result = await toggleTask(task.id, newStatus);
    if (result.success) {
      router.refresh();
    } else {
      setIsCompleted(!newStatus); // Rollback
    }
    setIsPending(false);
  };

  const handleDelete = async () => {
    if (isDeleting) {
      setIsPending(true);
      const result = await deleteTask(task.id);
      if (result.success) {
        router.refresh();
      } else {
        setIsPending(false);
        setIsDeleting(false);
        alert(t('deleteError'));
      }
    } else {
      setIsDeleting(true);
      // Automatically cancel after 3 seconds if not clicked again
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsDetailOpen(true)}
        className={`bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 flex items-center justify-between group hover:bg-[#f8faff] hover:shadow-xl hover:shadow-blue-50/50 hover:-translate-y-1 transition-all cursor-pointer ${isPending ? 'opacity-70' : ''}`}
      >
        <div className="flex items-center gap-6 flex-1">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-white cursor-pointer transition-all border-2 ${
              isCompleted ? 'bg-[#10b981] border-[#10b981] shadow-lg shadow-green-100' : 'border-gray-200 hover:border-[#1151d3] hover:bg-blue-50'
            }`}
          >
            {isCompleted && <span className="material-symbols-outlined text-[18px] font-black">check</span>}
          </div>
          <div className="text-left">
            <h4 className={`text-lg font-black transition-all tracking-tight ${isCompleted ? 'text-gray-300 line-through' : 'text-[#031a6b]'}`}>
              {task.title}
            </h4>
            <div className="flex items-center gap-4 mt-2">
              {subject && (
                <span 
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg"
                  style={{ backgroundColor: `${subject.colorCode}15`, color: subject.colorCode }}
                >
                  {subject.name}
                </span>
              )}
              {task.time && !isCompleted && (
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-orange-50 text-orange-600 flex items-center gap-1 border border-orange-100/50">
                  <span className="material-symbols-outlined text-[12px] font-black">schedule</span>
                  {task.time}
                </span>
              )}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span> 
                  {new Date(task.date).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' })}
                  {task.dateEnd && new Date(task.dateEnd).getTime() > new Date(task.date).getTime() && (
                    <> - {new Date(task.dateEnd).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' })}</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div className="flex flex-col items-end gap-1">
            {isCompleted ? (
              <span className="bg-[#ecfdf5] text-[#10b981] text-[10px] font-black px-4 py-1.5 rounded-xl flex items-center gap-1 uppercase tracking-widest">
                {t('completed')} ✓
              </span>
            ) : (
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest ${
                task.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 
                task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 
                task.priority === 'URGENT' ? 'bg-purple-50 text-purple-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {t(task.priority.toLowerCase() as any)}
              </span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className={`transition-all p-3 rounded-xl flex items-center gap-2 ${
              isDeleting ? 'bg-red-500 text-white shadow-lg' : 'opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 hover:bg-red-50'
            }`}
            title={isDeleting ? t('confirmDeleteTitle') : t('deleteAction')}
          >
            <span className={`material-symbols-outlined font-black ${isPending ? 'animate-spin' : ''}`}>
              {isPending ? 'sync' : 'delete'}
            </span>
            {isDeleting && <span className="text-[9px] font-black uppercase tracking-widest">{t('confirm')}?</span>}
          </button>
        </div>
      </div>

      {isDetailOpen && (
        <TaskDetailModal 
          task={task as any} 
          subject={subject} 
          allSubjects={allSubjects || []}
          onClose={() => setIsDetailOpen(false)} 
        />
      )}
    </>
  );
}
