import { getTasks, getSubjects } from '@/lib/actions/tasks';
import TaskListContent from '@/components/tasks/TaskListContent';
import QuickAddForm from '@/components/tasks/QuickAddForm';

export default async function Tasks() {
  const [tasks, subjects] = await Promise.all([getTasks(), getSubjects()]);

  // Dynamic stats calculation
  const completedTasksCount = tasks.filter((t: any) => t.isCompleted).length;
  const totalTasksCount = tasks.length;
  const progressPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  
  // SVG Calculations: Circumference = 2 * PI * R (R=40)
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="flex gap-10">
      {/* TASK LIST CONTENT */}
      <TaskListContent tasks={tasks} subjects={subjects} />

      {/* RIGHT PANEL - ADD QUICK TASK */}
      <aside className="w-[420px] flex-shrink-0 space-y-6">
        <QuickAddForm subjects={subjects} />

        {/* Stats Panel */}
        <section className="bg-[#031a6b] p-6 rounded-2xl text-white shadow-lg border border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-blue-200/60 text-left">Tiến độ tổng quát</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  className="text-white/5" 
                  cx="56" cy="56" fill="transparent" r="40" 
                  stroke="currentColor" strokeWidth="10"
                ></circle>
                <circle 
                  className="text-blue-400 transition-all duration-1000 ease-out" 
                  cx="56" cy="56" fill="transparent" r="40" 
                  stroke="currentColor" strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{progressPercentage}%</span>
              </div>
            </div>
            <div className="text-left flex-1">
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest opacity-60">Đã hoàn thành</p>
              <h4 className="text-2xl font-black mt-1 leading-tight">{completedTasksCount} / {totalTasksCount}</h4>
              <p className="text-xs text-blue-200/40 mt-2 font-medium">Bạn đang làm rất tốt, {progressPercentage >= 80 ? 'tuyệt vời!' : 'cố gắng lên!'} 🔥</p>
            </div>
          </div>
        </section>

        <div className="rounded-2xl overflow-hidden relative h-40 shadow-sm border border-gray-100">
          <img alt="Focus Quote" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#031a6b] to-transparent flex items-end p-4">
            <p className="text-xs font-medium text-white italic text-left">"Sự tập trung là nền tảng của mọi thành công học thuật."</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
