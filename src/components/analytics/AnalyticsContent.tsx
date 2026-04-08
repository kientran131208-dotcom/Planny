'use client';

import React from 'react';
import StudyHeatmap from './StudyHeatmap';
import Link from 'next/link';
import ExportButton from './ExportButton';
import { useLanguage } from '@/components/LanguageProvider';

interface AnalyticsContentProps {
  stats: any;
  weekly: any[];
  breakdown: any[];
  performance: any[];
  heatmapData: any;
  currentRange: number;
}

export default function AnalyticsContent({
  stats,
  weekly,
  breakdown,
  performance,
  heatmapData,
  currentRange
}: AnalyticsContentProps) {
  const { t, lang } = useLanguage();

  const rangeOptions = [
    { label: t('last7Days'), value: '7' },
    { label: t('last30Days'), value: '30' },
    { label: t('last3Months'), value: '90' },
    { label: t('thisYear'), value: '365' },
  ];

  return (
    <div className="space-y-8" id="analytics-report">
      {/* PDF-only formal header */}
      <div className="hidden print:block border-b-2 border-[#1151d3] pb-6 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-[#031a6b] uppercase tracking-tighter">{t('analyticsReport')}</h1>
            <p className="text-gray-500 font-medium">{t('plannyApp')}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{t('studyStatus')}: {stats.totalHours}{t('hour')}</span>
              <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded">{t('streak')}: {stats.streak} {t('daySuffix')}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#1151d3]">{t('userLabel')}{stats.userName}</p>
            <p className="text-xs text-gray-400">{t('exportDate')}{new Date().toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US')} | {t('rangeLabel', { range: currentRange })}</p>
          </div>
        </div>
      </div>

      {/* Date Range & Export Header Options */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-full text-xs font-medium no-print">
          {rangeOptions.map((r) => (
            <Link
              key={r.value}
              href={`/analytics?range=${r.value}`}
              className={`px-4 py-1.5 rounded-full transition-all ${
                currentRange.toString() === r.value
                  ? 'bg-[#031a6b] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#1151d3]'
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors no-print">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            Date Range
          </button>
          <ExportButton data={stats} />
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="p-6 rounded-[14px] bg-white shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl bg-blue-50 text-[#1151d3]">
              <span className="material-symbols-outlined">menu_book</span>
            </span>
            <div className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full text-[10px] font-bold">
              <span className="material-symbols-outlined text-xs mr-0.5">arrow_upward</span>
              15%
            </div>
          </div>
          <div className="text-left">
            <h3 className="text-3xl font-extrabold text-[#031a6b]">{stats.totalHours}{t('hour')}</h3>
            <p className="text-sm text-gray-500 font-medium">{t('totalStudyHours')}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-[14px] bg-white shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl bg-green-100 text-green-600">
              <span className="material-symbols-outlined">check_circle</span>
            </span>
            <span className="text-[10px] font-bold text-gray-400">{t('thisWeek')}</span>
          </div>
          <div className="text-left">
            <h3 className="text-3xl font-extrabold text-[#031a6b]">{stats.completionRate}%</h3>
            <p className="text-sm text-gray-500 font-medium">{t('taskCompletion')}</p>
            <p className="text-[10px] text-gray-400 mt-1 italic">{stats.completedCount}/{stats.totalCount} tasks</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-[14px] bg-white shadow-sm flex flex-col justify-between h-40 border-l-4 border-amber-500">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <span className="material-symbols-outlined">local_fire_department</span>
            </span>
            <span className="text-[10px] font-bold text-amber-600 uppercase">{t('streak')}</span>
          </div>
          <div className="text-left">
            <h3 className="text-3xl font-extrabold text-amber-500">🔥 {stats.streak}</h3>
            <p className="text-sm text-gray-500 font-medium">{t('continuousStreak')}</p>
            <p className="text-[10px] text-gray-400 mt-1 italic">{t('streakRecord')}: {stats.maxStreak} {t('daySuffix')}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-6 rounded-[14px] bg-white shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl bg-blue-50 text-[#1151d3]">
              <span className="material-symbols-outlined">schedule</span>
            </span>
          </div>
          <div className="text-left">
            <h3 className="text-3xl font-extrabold text-[#031a6b]">{stats.averageHoursPerDay}</h3>
            <p className="text-sm text-gray-500 font-medium">{t('avgHoursPerDay')}</p>
            <p className="text-[10px] text-amber-600 mt-1 font-bold italic tracking-tighter">{t('dailyGoalLabel', { goal: stats.dailyGoal })}</p>
          </div>
        </div>
      </div>

      {/* MAIN CHARTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Bar Chart (60%) */}
        <div className="lg:col-span-3 p-8 rounded-[16px] bg-white shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-10">
            <div className="text-left">
              <h4 className="text-lg font-bold text-[#031a6b]">{t('dataProcessing', { range: currentRange })}</h4>
              <p className="text-xs text-gray-500 mt-1">{t('performanceChart')}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#031a6b]"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('actual')}</span>
            </div>
          </div>
          <div className="relative h-64 flex items-end justify-between gap-4 px-4">
            <div className="absolute bottom-[75%] left-0 w-full border-t-2 border-dashed border-amber-400 opacity-40 z-0">
              <span className="absolute -top-5 right-0 text-[10px] font-bold text-amber-600 bg-white px-2">{t('goalTarget', { goal: stats.dailyGoal })}</span>
            </div>
            {weekly.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-10 h-full justify-end">
                {/* Print-only static label */}
                <div className="hidden print:block text-[9px] font-black text-[#031a6b] mb-1 whitespace-nowrap">
                  {day.value}
                </div>
                
                <div 
                  className={`w-full rounded-t-xl relative group transition-all hover:scale-105 ${
                    day.isToday 
                      ? 'bg-gradient-to-t from-[#031a6b] to-[#1151d3] shadow-lg' 
                      : 'bg-[#eff4ff] hover:bg-blue-100'
                  }`} 
                  style={{ height: day.height }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#031a6b] text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 print:hidden transition-all font-black shadow-xl z-20 whitespace-nowrap">
                    {day.value}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#031a6b]"></div>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${day.isToday ? 'text-[#1151d3]' : 'text-gray-300'}`}>{t(day.label.toLowerCase() as any)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart (40%) */}
        <div className="lg:col-span-2 p-8 rounded-[16px] bg-white shadow-sm border border-gray-50 flex flex-col">
          <h4 className="text-lg font-bold text-[#031a6b] mb-6 text-left">{t('subjectDistribution')}</h4>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#eff4ff" strokeWidth="4"></circle>
                {breakdown.reduce((acc, b, i) => {
                  const offset = acc.total;
                  acc.total += b.percentage;
                  acc.elements.push(
                    <circle 
                      key={i} 
                      cx="18" cy="18" 
                      fill="transparent" r="15.915" 
                      stroke={b.color} 
                      strokeDasharray={`${b.percentage} ${100 - b.percentage}`} 
                      strokeDashoffset={-offset} 
                      strokeWidth="4"
                    ></circle>
                  );
                  return acc;
                }, { total: 0, elements: [] as React.ReactNode[] }).elements}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-[#031a6b]">
                  {Math.floor(stats.totalMinutes / 60) > 0 
                    ? `${Math.floor(stats.totalMinutes / 60)}${t('hour')}${stats.totalMinutes % 60 > 0 ? ` ${stats.totalMinutes % 60}${t('minute')}` : ''}` 
                    : `${stats.totalMinutes}${t('minute')}`}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{t('totalTime')}</span>
              </div>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-x-4 gap-y-3">
              {breakdown.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }}></div>
                  <span className="text-xs text-gray-600 font-medium">{b.name} ({b.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HEATMAP - STUDY STREAK */}
      <StudyHeatmap activity={heatmapData} />

      {/* BOTTOM - TOP SUBJECTS TABLE */}
      <div className="p-8 rounded-[16px] bg-white shadow-sm border border-gray-50 overflow-hidden">
        <h4 className="text-lg font-bold text-[#031a6b] mb-6 text-left">{t('subjectPerformance')}</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4 border-b border-gray-100">{t('subject')}</th>
                <th className="pb-4 border-b border-gray-100">{t('hoursStudyTab')}</th>
                <th className="pb-4 border-b border-gray-100">{t('completedTasksTab')}</th>
                <th className="pb-4 border-b border-gray-100">{t('progressPercentage')}</th>
                <th className="pb-4 border-b border-gray-100">{t('trend')}</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {performance.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors group border-t border-gray-50 first:border-0">
                  <td className="py-4 flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                    <span className="text-gray-800 font-bold">{p.name}</span>
                  </td>
                  <td className="py-4 text-[#031a6b] font-bold">{p.hours}{t('hour')}</td>
                  <td className="py-4 text-gray-600">{p.completedTasks}</td>
                  <td className="py-6 w-1/3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100 shadow-inner">
                        <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(3,26,107,0.1)]" style={{ width: `${p.progress}%`, backgroundColor: p.color }}></div>
                      </div>
                      <span className="text-[10px] text-[#031a6b] font-black tracking-tighter w-8">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`material-symbols-outlined ${
                      p.trend === 'up' ? 'text-emerald-600' : p.trend === 'down' ? 'text-rose-500' : 'text-gray-400'
                    }`}>
                      {p.trend === 'up' ? 'trending_up' : p.trend === 'down' ? 'trending_down' : 'trending_flat'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
