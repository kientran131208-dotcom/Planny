'use client';

import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import Link from 'next/link';
import { useLanguage } from '../LanguageProvider';

interface UpcomingEventsProps {
  events: any[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const { lang, t } = useLanguage();
  const dateLocale = lang === 'VI' ? vi : enUS;
  
  const upcomingEvents = events
    .filter(e => e.type === 'EVENT' && new Date(e.date).getTime() >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  if (upcomingEvents.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold text-[#031a6b] tracking-tight uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">event_upcoming</span>
          {t('upcomingEvents')}
        </h3>
        <Link href="/events" className="text-sm font-bold text-[#1151d3] hover:underline flex items-center gap-1">
          {t('seeAllEvents')}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {upcomingEvents.map((event) => {
          const eventDate = new Date(event.date);
          const isToday = format(eventDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div 
              key={event.id}
              className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 group relative overflow-hidden flex flex-col h-full"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-blue-100/50 transition-colors duration-500" />
              
              <div className="mb-4 flex items-center justify-between relative z-10">
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                  isToday ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                  {isToday ? t('today') : format(eventDate, 'eeee, dd/MM', { locale: dateLocale })}
                </div>
                <div className={`p-2 rounded-xl scale-90 ${event.priority === 'HIGH' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
                   <span className="material-symbols-outlined text-[18px]">
                     {event.priority === 'HIGH' ? 'priority_high' : 'stars'}
                   </span>
                </div>
              </div>

              <h4 className="text-[17px] font-extrabold text-[#031a6b] mb-3 leading-snug group-hover:text-[#1151d3] transition-colors duration-300 relative z-10">
                {event.title}
              </h4>

              <div className="mt-auto pt-4 space-y-2 relative z-10">
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span className="text-[11px] font-bold">{event.timeStart || t('allDay')} {event.timeEnd ? `- ${event.timeEnd}` : ''}</span>
                </div>
                {event.subject && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.subject.colorCode }} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{event.subject.name}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                 <span className="text-[10px] font-black text-blue-600 uppercase">{t('details')}</span>
                 <span className="material-symbols-outlined text-blue-600 text-sm">chevron_right</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
