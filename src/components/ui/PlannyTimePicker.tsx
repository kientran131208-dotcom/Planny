'use client';

import { useState } from 'react';

interface PlannyTimePickerProps {
  time: string; // HH:mm
  onChange: (time: string) => void;
  label?: string;
  className?: string;
}

export default function PlannyTimePicker({ time, onChange, label, className = "" }: PlannyTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Time slots generator
  const timeSlots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  return (
    <div className={`relative ${className}`}>
      {label && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{label}</label>}
      <button 
        type="button"
        onMouseDown={(e) => { e.preventDefault(); setShowPicker(!showPicker); }}
        className="w-full bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1151d3]/10 text-sm py-4 px-4 font-bold text-[#031a6b] transition-all flex items-center justify-between h-13 group hover:bg-white hover:border-blue-100/50"
      >
        <div className="flex items-center gap-3 min-w-0">
           <span className="material-symbols-outlined text-[#1151d3] text-lg shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">schedule</span>
           <span className="whitespace-nowrap">{time}</span>
        </div>
        <span className="material-symbols-outlined text-gray-300 text-[20px] shrink-0 group-hover:text-[#1151d3] transition-colors">expand_more</span>
      </button>

      {showPicker && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setShowPicker(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-[120] max-h-[220px] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
            {timeSlots.map(t => (
              <button 
                key={t}
                type="button"
                onClick={() => { onChange(t); setShowPicker(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl mb-1 last:mb-0 transition-all font-black text-[10px] flex justify-between items-center ${
                  time === t ? 'bg-blue-50 text-[#1151d3]' : 'hover:bg-gray-50 text-gray-500'
                }`}
              >
                {t}
                {time === t && <span className="material-symbols-outlined text-[12px]">check</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
