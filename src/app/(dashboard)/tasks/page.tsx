export const dynamic = 'force-dynamic';

import { getTasks } from '@/lib/actions/tasks';
import { getSubjects } from '@/lib/actions/subjects';
import TaskListContent from '@/components/tasks/TaskListContent';

export default async function TasksPage() {
  const [tasks, subjects] = await Promise.all([
    getTasks(),
    getSubjects()
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <TaskListContent initialTasks={tasks} subjects={subjects} />
    </div>
  );
}
