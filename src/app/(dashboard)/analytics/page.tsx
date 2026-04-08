import { getAnalyticsStats, getHeatmapActivity, getRangeActivity, getSubjectBreakdown, getSubjectPerformance } from '@/lib/actions/analytics';
import AnalyticsContent from '@/components/analytics/AnalyticsContent';

export default async function Analytics(props: {
  searchParams: Promise<{ range?: string }>
}) {
  const resolvedParams = await props.searchParams;
  const currentRange = parseInt(resolvedParams.range || '7');

  const [stats, weekly, breakdown, performance, heatmapData] = await Promise.all([
    getAnalyticsStats(currentRange),
    getRangeActivity(currentRange),
    getSubjectBreakdown(currentRange),
    getSubjectPerformance(currentRange),
    getHeatmapActivity()
  ]);

  return (
    <AnalyticsContent 
      stats={stats}
      weekly={weekly}
      breakdown={breakdown}
      performance={performance}
      heatmapData={heatmapData}
      currentRange={currentRange}
    />
  );
}
