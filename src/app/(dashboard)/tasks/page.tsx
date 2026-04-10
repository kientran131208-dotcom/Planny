export const dynamic = 'force-dynamic';

import { getTasks } from '@/lib/actions/tasks';
import { getSubjects } from '@/lib/actions/subjects';
import TaskListContent from '@/components/tasks/TaskListContent';
import QuickAddForm from '@/components/tasks/QuickAddForm';

export default async function TasksPage() {
  const [tasks, subjects] = await Promise.all([
    getTasks(),
    getSubjects()
  ]);

  return (
    <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto px-4 py-8">
      {/* MAIN CONTENT - TASK LIST */}
      <div className="flex-1 min-w-0">
         <TaskListContent initialTasks={tasks} subjects={subjects} />
      </div>

      {/* SIDEBAR - QUICK ADD & STATS */}
      <aside className="w-full lg:w-[420px] flex-shrink-0 space-y-8">
        <QuickAddForm subjects={subjects} />
        
        {/* Productivity Tip Panel */}
        <div className="bg-gradient-to-br from-[#031a6b] to-[#1151d3] p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-900/10 border border-white/10 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
               <span className="material-symbols-outlined text-white text-2xl group-hover:scale-110 transition-transform">lightbulb</span>
            </div>
            <h4 className="text-xl font-black mb-4 tracking-tight">Mẹo năng suất</h4>
            <p className="text-blue-100/80 text-sm font-medium leading-relaxed">
              "Chia nhỏ các nhiệm vụ lớn thành những đầu việc nhỏ kéo dài 25-30 phút sẽ giúp bạn tập trung cao độ hơn."
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
        </div>
      </aside>
    </div>
  );
}
