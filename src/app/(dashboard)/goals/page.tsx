import { getGoalsWithStats, getOverallGoalMetrics, getTimelineMilestones } from '@/lib/actions/goals';
import GoalView from '@/components/goals/GoalView';

export default async function Goals() {
  const [goals, metrics, timeline] = await Promise.all([
    getGoalsWithStats(),
    getOverallGoalMetrics(),
    getTimelineMilestones()
  ]);

  return <GoalView goals={goals} metrics={metrics} timeline={timeline} />;
}
