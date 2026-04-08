import { getCalendarItems, getTodaySummary, getUpcomingAlerts } from '@/lib/actions/calendar';
import { getSubjects } from '@/lib/actions/tasks';
import CalendarView from '@/components/calendar/CalendarView';

export default async function Calendar(props: { 
  searchParams: Promise<{ month?: string, year?: string, day?: string, view?: string }> 
}) {
  const params = await props.searchParams;
  const now = new Date();
  
  const view = params.view || 'month';
  const currentMonth = params.month ? parseInt(params.month) : now.getMonth();
  const currentYear = params.year ? parseInt(params.year) : now.getFullYear();
  const currentDay = params.day ? parseInt(params.day) : (params.month ? 1 : now.getDate());

  const currentDate = new Date(currentYear, currentMonth, currentDay);
  
  let fetchStart: string | undefined;
  let fetchEnd: string | undefined;
  let gridDays: any[] = [];

  if (view === 'month') {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    let startDay = firstDayOfMonth.getDay();
    if (startDay === 0) startDay = 7;
    const paddingBefore = startDay - 1;

    // Prev month padding
    const lastDayOfPrevMonthDate = new Date(currentYear, currentMonth, 0);
    const prevMonthLastDay = lastDayOfPrevMonthDate.getDate();
    const prevMonthMonth = lastDayOfPrevMonthDate.getMonth();
    const prevMonthYear = lastDayOfPrevMonthDate.getFullYear();
    
    for (let i = paddingBefore - 1; i >= 0; i--) {
      gridDays.push({
        day: prevMonthLastDay - i,
        month: prevMonthMonth,
        year: prevMonthYear,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      gridDays.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        isToday: i === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()
      });
    }

    // Next month padding
    const firstDayOfNextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextMonthMonth = firstDayOfNextMonthDate.getMonth();
    const nextMonthYear = firstDayOfNextMonthDate.getFullYear();

    const remaining = 42 - gridDays.length;
    for (let i = 1; i <= remaining; i++) {
      gridDays.push({
        day: i,
        month: nextMonthMonth,
        year: nextMonthYear,
        isCurrentMonth: false
      });
    }

    fetchStart = new Date(currentYear, currentMonth, 1).toISOString();
    fetchEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

  } else if (view === 'week') {
    // Find Monday of the current week
    const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      gridDays.push({
        day: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        isCurrentMonth: d.getMonth() === currentMonth,
        isToday: d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      });
    }

    fetchStart = monday.toISOString();
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    fetchEnd = sunday.toISOString();

  } else if (view === 'day') {
    gridDays = [{
      day: currentDate.getDate(),
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      isCurrentMonth: true,
      isToday: currentDate.getDate() === now.getDate() && currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear()
    }];
    fetchStart = currentDate.toISOString();
    fetchEnd = currentDate.toISOString();
  }

  const [items, todayData, alerts, subjects] = await Promise.all([
    getCalendarItems(currentMonth, currentYear, fetchStart, fetchEnd),
    getTodaySummary(),
    getUpcomingAlerts(),
    getSubjects()
  ]);

  return (
    <CalendarView 
      items={items}
      todayData={todayData}
      alerts={alerts}
      subjects={subjects}
      gridDays={gridDays}
      currentMonth={currentMonth}
      currentYear={currentYear}
      currentDay={currentDay}
      view={view as 'month' | 'week' | 'day'}
    />
  );
}
