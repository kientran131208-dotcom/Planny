'use client';

import { useLanguage } from '../LanguageProvider';

export default function PomodoroHeader() {
  const { t } = useLanguage();

  return (
    <header className="mb-16 flex items-start justify-between px-4">
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-[#1151d3] rounded shadow-[0_0_10px_rgba(17,81,211,0.3)]"></div>
                <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.5em] leading-none">{t('focusCognitiveHub')}</p>
            </div>
            <h1 className="text-7xl font-black text-[#031a6b] tracking-tighter leading-none">{t('focusTitle')}</h1>
            <p className="text-sm font-bold text-gray-400 max-w-lg tracking-tight leading-relaxed">
               {t('focusSub')}
            </p>
        </div>
        
        <div className="flex items-center gap-12 pt-8">
           <div className="text-right">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{t('statusLabel')}</p>
              <p className="text-lg font-black text-[#1151d3] flex items-center justify-end gap-2 leading-none uppercase">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span> {t('live')}
              </p>
           </div>
           <div className="w-20 h-20 rounded-[2.5rem] bg-white border border-blue-50 flex items-center justify-center shadow-xl shadow-blue-50/50">
              <span className="material-symbols-outlined text-[#1151d3] text-4xl font-black">timer</span>
           </div>
        </div>
    </header>
  );
}
