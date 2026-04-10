export const dynamic = 'force-dynamic';

import { fetchAppEvents } from '@/lib/actions/calendar';
import { getSubjects } from '@/lib/actions/subjects';
import EventListContent from '@/components/events/EventListContent';
import QuickAddEventForm from '@/components/events/QuickAddEventForm';

export default async function Events() {
  const [events, subjects] = await Promise.all([fetchAppEvents(), getSubjects()]);

  // Dynamic stats calculation (Mirroring Tasks page)
  const totalEvents = events.length;
  const highPriorityEvents = events.filter((e: any) => e.priority === 'HIGH').length;

  return (
    <div className="flex gap-10">
      {/* EVENT LIST CONTENT */}
      <EventListContent events={events} subjects={subjects} />

      {/* RIGHT PANEL - ADD QUICK EVENT */}
      <aside className="w-[420px] flex-shrink-0 space-y-6">
        <QuickAddEventForm subjects={subjects} />

        {/* Stats Panel */}
        <section className="bg-gradient-to-br from-[#031a6b] to-[#1151d3] p-8 rounded-[40px] text-white shadow-xl shadow-blue-900/10 border border-white/5">
          <div className="flex flex-col gap-8">
            <div className="text-left flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-200/60 uppercase tracking-[0.2em] mb-3">Tổng hợp sự kiện</p>
                <h4 className="text-4xl font-black leading-tight">{totalEvents} <span className="text-sm font-bold text-blue-200/40">sự kiện</span></h4>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                 <span className="material-symbols-outlined text-white text-2xl font-bold">calendar_month</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm text-left">
                 <p className="text-[10px] font-black text-blue-200/40 uppercase tracking-widest mb-3">Ưu tiên cao</p>
                 <div className="flex items-center gap-3">
                   <span className="text-2xl font-black text-white">{highPriorityEvents}</span>
                   <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                 </div>
              </div>
              <div className="p-5 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm text-left">
                 <p className="text-[10px] font-black text-blue-200/40 uppercase tracking-widest mb-3">Tuần này</p>
                 <div className="flex items-center gap-3">
                   <span className="text-2xl font-black text-white">
                      {events.filter((e: any) => {
                         const d = new Date(e.date);
                         const now = new Date();
                         const weekEnd = new Date(now);
                         weekEnd.setDate(now.getDate() + 7);
                         return d >= now && d <= weekEnd;
                      }).length}
                   </span>
                   <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                 </div>
              </div>
            </div>

            <div className="p-6 bg-amber-400/10 rounded-3xl border border-amber-400/20 text-left">
               <p className="text-xs text-amber-200 font-bold leading-relaxed">
                 Đừng quên kiểm tra các sự kiện quan trọng để chuẩn bị tâm thế tốt nhất nhé!
               </p>
            </div>
          </div>
        </section>

        <div className="rounded-[40px] overflow-hidden relative h-48 shadow-sm group">
          <img 
            alt="Event Background" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            src="https://images.unsplash.com/photo-1506784919141-10c57d77085a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#031a6b] via-[#031a6b]/20 to-transparent flex items-end p-8">
            <p className="text-xs font-bold text-white leading-relaxed text-left opacity-80">"Mỗi sự kiện là một cơ hội để trau dồi và phát triển bản thân."</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
