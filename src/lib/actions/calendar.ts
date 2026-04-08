'use server';

import { database as prisma } from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { getUserId } from '@/lib/auth-utils';

export async function getCalendarItems(month?: number, year?: number, startDate?: string, endDate?: string) {
  try {
    const userId = await getUserId();
    
    let whereClause: any = { userId };
    
    let start: Date | null = null;
    let end: Date | null = null;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else if (month !== undefined && year !== undefined) {
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    }

    if (start && end) {
       whereClause = {
         userId,
         OR: [
           { date: { gte: start, lte: end } },
           { dateEnd: { gte: start, lte: end } },
           { AND: [
               { date: { lte: start } },
               { dateEnd: { gte: end } }
             ] 
           }
         ]
       };
    }

    const [events, tasks] = await Promise.all([
      prisma.event.findMany({ where: whereClause, include: { subject: true } }),
      prisma.task.findMany({ where: whereClause, include: { subject: true } })
    ]);

    return [
      ...events.map(e => ({ ...e, type: 'EVENT' as const })), 
      ...tasks.map(t => ({ ...t, type: 'TASK' as const }))
    ];
  } catch (error) {
    console.error('Error fetching calendar items:', error);
    return [];
  }
}

export async function getTodaySummary() {
  return { count: 0 };
}

export async function getUpcomingAlerts() {
  try {
    const userId = await getUserId();
    const now = new Date();
    // Start of today to include tasks due today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Mốc 3 ngày tới
    const threeDaysLater = new Date(startOfToday);
    threeDaysLater.setDate(startOfToday.getDate() + 4); // +4 to be safe including the 3rd day

    const [tasks, events] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          isCompleted: false,
          OR: [
            // Include overdue (date < today) and upcoming (within 3 days)
            { date: { lte: threeDaysLater } },
            { dateEnd: { lte: threeDaysLater } }
          ]
        },
        include: { subject: true },
        orderBy: { date: 'asc' }
      }),
      prisma.event.findMany({
        where: {
          userId,
          isCompleted: false,
          // For events, usually only upcoming ones matter, but let's include today
          date: { lte: threeDaysLater, gte: startOfToday }
        },
        include: { subject: true },
        orderBy: { date: 'asc' }
      })
    ]);

    return [
      ...tasks.map(t => ({ id: t.id, title: t.title, type: 'TASK', date: t.date, dateEnd: t.dateEnd, priority: t.priority })),
      ...events.map(e => ({ id: e.id, title: e.title, type: 'EVENT', date: e.date, priority: e.priority }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching upcoming alerts:', error);
    return [];
  }
}

export async function createEvent(data: any) {
  try {
    const userId = await getUserId();
    const result = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        dateEnd: data.dateEnd ? new Date(data.dateEnd) : new Date(data.date),
        timeStart: data.timeStart,
        timeEnd: data.timeEnd,
        priority: data.priority || 'MEDIUM',
        isCompleted: false,
        subjectId: data.subjectId || null,
        userId: userId,
      },
      include: { subject: true }
    });

    revalidatePath('/calendar');
    revalidatePath('/events');
    revalidatePath('/');
    return { success: true, event: result };
  } catch (error: any) {
    console.error('Error creating event:', error);
    return { success: false, error: error.message || 'Failed' };
  }
}

export async function updateEvent(id: string, data: any) {
  try {
    const userId = await getUserId();
    const result = await prisma.event.update({
      where: { id, userId },
      data: {
        title: data.title,
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
        dateEnd: data.dateEnd ? new Date(data.dateEnd) : undefined,
        timeStart: data.timeStart,
        timeEnd: data.timeEnd,
        priority: data.priority,
        subjectId: data.subjectId,
      },
      include: { subject: true }
    });

    revalidatePath('/calendar');
    revalidatePath('/events');
    revalidatePath('/');
    return { success: true, event: result };
  } catch (error: any) {
    console.error('Error updating event:', error);
    return { success: false, error: 'Failed to update' };
  }
}

export async function deleteEvent(id: string) {
  try {
    const userId = await getUserId();
    await prisma.event.delete({ where: { id, userId } });
    revalidatePath('/calendar');
    revalidatePath('/events');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function toggleEvent(id: string, isCompleted: boolean) {
  try {
    const userId = await getUserId();
    await prisma.event.update({
      where: { id, userId },
      data: { isCompleted }
    });
    revalidatePath('/calendar');
    revalidatePath('/events');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling event:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function fetchAppEvents() {
  try {
    const userId = await getUserId();
    return await prisma.event.findMany({
      where: { userId },
      include: { subject: true },
      orderBy: { date: 'asc' }
    });
  } catch (error) {
    console.error('Error fetching app events:', error);
    return [];
  }
}
