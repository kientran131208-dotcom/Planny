'use client';

import { useLanguage } from '../LanguageProvider';

interface AIInsightProps {
  insight: {
    message: string;
    type: 'productivity' | 'rest' | 'motivation';
    suggestedAction: string;
    score: number;
  } | null;
}

export default function AIInsight({ insight }: AIInsightProps) {
  const { t } = useLanguage();

  if (!insight) return null;

  const getIcon = () => {
    switch (insight.type) {
      case 'productivity': return 'rocket_launch';
      case 'rest': return 'bedtime';
      case 'motivation': return 'auto_awesome';
      default: return 'psychology';
    }
  };

  const getColor = () => {
    switch (insight.type) {
      case 'productivity': return 'from-blue-500 to-indigo-600 shadow-blue-200/50';
      case 'rest': return 'from-emerald-500 to-teal-600 shadow-emerald-200/50';
      case 'motivation': return 'from-purple-500 to-pink-600 shadow-purple-200/50';
      default: return 'from-gray-500 to-gray-700 shadow-gray-200/50';
    }
  };

  return (
    <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${getColor()} text-white shadow-2xl relative overflow-hidden group animate-in fade-in slide-in-from-bottom-6 duration-700`}>
      {/* Decorative patterns */}
      <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
      <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined font-black text-2xl">{getIcon()}</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-90">{t('aiInsightTitle')}</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest">
            {t('productivityScore')}: {insight.score}%
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-black leading-tight tracking-tight">
            {insight.message}
          </h3>
          <p className="text-sm font-medium opacity-80 leading-relaxed max-w-md">
            {insight.suggestedAction}
          </p>
        </div>

        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-3 bg-white text-[#031a6b] rounded-2xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/5">
          {t('takeAction')}
          <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
        </button>
      </div>

      {/* Background AI brain icon */}
      <span className="material-symbols-outlined absolute right-[-10px] bottom-[-20px] text-[180px] opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
        psychology
      </span>
    </div>
  );
}
