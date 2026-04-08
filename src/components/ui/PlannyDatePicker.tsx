'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

interface PlannyDatePickerProps {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  className?: string;
}

export default function PlannyDatePicker({ date, onChange, label, className = "" }: PlannyDatePickerProps) {
  const { t, lang } = useLanguage();
  const [showPicker, setShowPicker] = useState(false);
  
  // Internal view state (what the user is LOOKING at in the popup)
  const initialDate = new Date(date);
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(v => v - 1);
    } else {
      setViewMonth(v => v - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(v => v + 1);
    } else {
      setViewMonth(v => v + 1);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    // Padding (Monday as first day)
    const prevPadding = (firstDay === 0 ? 7 : firstDay) - 1;
    for(let i=0; i<prevPadding; i++) days.push(null);
    
    // Real days
    for(let i=1; i<=lastDate; i++) days.push(i);
    return days;
  };

  const calendarDays = getDaysInMonth(viewMonth, viewYear);
  const selectedDate = new Date(date);

  const daysOfWeek = [
    t('mondayShort'), 
    t('tuesdayShort'), 
    t('wednesdayShort'), 
    t('thursdayShort'), 
    t('fridayShort'), 
    t('saturdayShort'), 
    t('sundayShort')
  ];

  return (
    <div className={`relative ${className}`}>
      {label && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{label}</label>}
      <button 
        type="button"
        onClick={(e) => { 
          if (!showPicker) {
            const current = new Date(date);
            setViewMonth(current.getMonth());
            setViewYear(current.getFullYear());
          }
          setShowPicker(!showPicker); 
        }}
        className="w-full bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1151d3]/10 text-sm py-4 px-3 font-bold text-[#031a6b] transition-all flex items-center justify-between h-13 group hover:bg-white hover:border-blue-100/50"
      >
        <div className="flex items-center gap-2 min-w-0">
           <span className="material-symbols-outlined text-[#1151d3] text-lg shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">calendar_today</span>
           <span className="whitespace-nowrap">
             {new Date(date).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
           </span>
        </div>
        <span className="material-symbols-outlined text-gray-300 text-[20px] shrink-0 group-hover:text-[#1151d3] transition-colors">expand_more</span>
      </button>

      {showPicker && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setShowPicker(false)} />
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-[120] animate-in slide-in-from-top-2 duration-200 w-[280px]">
            <div className="flex justify-between items-center mb-4 px-2">
              <button 
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                title={t('prevMonth')}
              >
                <span className="material-symbols-outlined text-gray-400 text-sm font-black">chevron_left</span>
              </button>
              <div className="flex flex-col items-center">
                <span className="font-black text-[#031a6b] text-[10px] uppercase tracking-widest text-center">
                  {lang === 'VI' ? `Tháng ${viewMonth + 1}` : new Date(viewYear, viewMonth).toLocaleString('en-US', { month: 'long' })}
                </span>
                <span className="text-[9px] font-black text-gray-400 tracking-tighter">{viewYear}</span>
              </div>
              <button 
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                title={t('nextMonth')}
              >
                <span className="material-symbols-outlined text-gray-400 text-sm font-black">chevron_right</span>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysOfWeek.map(d => (
                <span key={d} className="text-[9px] font-black text-gray-300 mb-1">{d}</span>
              ))}
              {calendarDays.map((day, idx) => (
                <div key={idx} className="h-8 flex items-center justify-center">
                  {day ? (
                    <button
                      type="button"
                      onClick={() => {
                        const newDate = new Date(viewYear, viewMonth, day);
                        onChange(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`);
                        setShowPicker(false);
                      }}
                      className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all flex items-center justify-center ${
                        selectedDate.getDate() === day && 
                        selectedDate.getMonth() === viewMonth && 
                        selectedDate.getFullYear() === viewYear
                          ? 'bg-[#1151d3] text-white shadow-md shadow-blue-100' 
                          : 'text-[#031a6b] hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  ) : <div className="w-7 h-7"></div>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
