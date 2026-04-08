'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

interface PlannyPriorityPickerProps {
  priority: string; // LOW, MEDIUM, HIGH, URGENT
  onChange: (priority: string) => void;
  label?: string;
  className?: string;
}

export default function PlannyPriorityPicker({ priority, onChange, label, className = "" }: PlannyPriorityPickerProps) {
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  const priorities = [
    { val: 'LOW', color: 'text-blue-500', bg: 'hover:bg-blue-50', icon: 'flag' },
    { val: 'MEDIUM', color: 'text-amber-500', bg: 'hover:bg-amber-50', icon: 'flag' },
    { val: 'HIGH', color: 'text-red-500', bg: 'hover:bg-red-50', icon: 'flag' },
    { val: 'URGENT', color: 'text-purple-600', bg: 'hover:bg-purple-50', icon: 'notification_important' }
  ];

  const currentPriority = priorities.find(p => p.val === priority) || priorities[1];

  return (
    <div className={`relative ${className}`}>
      {label && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{label}</label>}
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
        className={`w-full bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-100/10 text-sm py-4 px-3 font-bold transition-all flex items-center justify-between h-13 group hover:bg-white hover:border-blue-100/50 ${currentPriority.color}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-lg shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">{currentPriority.icon}</span>
          <span className="whitespace-nowrap">{t(currentPriority.val.toLowerCase() as any)}</span>
        </div>
        <span className="material-symbols-outlined text-gray-300 text-[20px] shrink-0 group-hover:text-blue-400 transition-colors">expand_more</span>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setShowMenu(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-[120] animate-in slide-in-from-top-2 duration-200">
            {priorities.map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => {
                  onChange(p.val);
                  setShowMenu(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 last:mb-0 flex items-center gap-3 ${p.color} ${p.bg}`}
              >
                <span className="material-symbols-outlined text-sm">{p.icon}</span>
                {t(p.val.toLowerCase() as any)}
                {priority === p.val && <span className="material-symbols-outlined ml-auto text-[12px]">check</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
