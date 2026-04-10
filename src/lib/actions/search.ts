'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth-utils';

export async function searchActivities(query: string) {
  if (!query || query.length < 2) return [];

  try {
    const userId = await getUserId();

    // Search Tasks
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 5,
      select: {
        id: true,
        title: true,
        isCompleted: true,
        date: true,
      }
    });

    // Search Events
    const events = await prisma.event.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 5,
      select: {
        id: true,
        title: true,
        timeStart: true,
        date: true,
      }
    });

    const results = [
      ...tasks.map(t => ({
        id: t.id,
        title: t.title,
        type: 'task',
        href: '/tasks',
        status: t.isCompleted ? 'Hoàn thành' : 'Đang làm',
        date: t.date?.toLocaleDateString('vi-VN'),
      })),
      ...events.map(e => ({
        id: e.id,
        title: e.title,
        type: 'event',
        href: '/calendar',
        status: 'Lịch học',
        date: e.date?.toLocaleDateString('vi-VN'),
      }))
    ];

    return results;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
