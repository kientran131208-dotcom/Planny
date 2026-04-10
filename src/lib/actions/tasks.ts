'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getUserId } from '@/lib/auth-utils';





export async function getTasks() {
  try {
    const userId = await getUserId();
    return await prisma.task.findMany({
      where: { userId },
      include: { 
        subject: true, 
        goal: true 
      },
      orderBy: { date: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function toggleTask(id: string, isCompleted: boolean) {
  try {
    await prisma.task.update({
      where: { id },
      data: { isCompleted },
    });
    revalidatePath('/tasks');
    revalidatePath('/calendar');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error toggling task:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

export async function createTask(data: {
  title: string;
  date: string;
  dateEnd?: string;
  time?: string;
  timeEnd?: string;
  priority: string;
  subjectId?: string;
  description?: string;
}) {
  try {
    const userId = await getUserId();
    const taskDate = new Date(data.date);
    
    await prisma.task.create({
      data: {
        title: data.title,
        date: taskDate,
        dateEnd: data.dateEnd ? new Date(data.dateEnd) : taskDate,
        time: data.time || '',
        timeEnd: data.timeEnd || '',
        priority: data.priority || 'MEDIUM',
        subjectId: (data.subjectId && typeof data.subjectId === 'string' && !data.subjectId.includes('undefined')) ? data.subjectId : null,
        description: data.description || '',
        userId,
      },
    });

    revalidatePath('/tasks');
    revalidatePath('/calendar');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('CRITICAL Error creating task:', error);
    if (error.message?.includes('Unknown argument')) {
      return { success: false, error: 'Lỗi đồng bộ Database (dateEnd). Hãy thử CTRL+C và khởi động lại "npm run dev".' };
    }
    return { success: false, error: error.message || 'Failed to create task' };
  }
}

export async function updateTask(taskId: string, data: {
  title?: string;
  description?: string;
  date?: string;
  dateEnd?: string;
  time?: string;
  timeEnd?: string;
  priority?: string;
  subjectId?: string;
}) {
  try {
    const userId = await getUserId();
    if (!taskId) return { success: false, error: "Task ID required" };

    // Explicitly mapping to ensure no fields are lost
    const updatePayload: any = {};
    
    if (typeof data.title === 'string') updatePayload.title = data.title;
    if (typeof data.description === 'string') updatePayload.description = data.description;
    if (data.date) updatePayload.date = new Date(data.date);
    if (data.dateEnd) updatePayload.dateEnd = new Date(data.dateEnd);
    if (typeof data.time === 'string') updatePayload.time = data.time;
    if (typeof data.timeEnd === 'string') updatePayload.timeEnd = data.timeEnd;
    if (typeof data.priority === 'string') updatePayload.priority = data.priority;
    if (data.subjectId !== undefined) updatePayload.subjectId = data.subjectId || null;

    console.log(`[SERVER] Final Update Payload for ${taskId}:`, updatePayload);

    const updatedTask = await prisma.task.update({
      where: { 
        id: taskId,
        userId: userId 
      },
      data: updatePayload
    });

    if (updatedTask) {
      console.log(`[SERVER] Update successful for task: ${updatedTask.id}`);
      revalidatePath('/tasks');
      revalidatePath('/calendar');
      revalidatePath('/');
      return { success: true };
    }
    
    return { success: false, error: "Prisma update returned no result" };
  } catch (error) {
    console.error('[SERVER] CRITICAL Error updating task:', error);
    return { success: false, error: String(error) };
  }
}



export async function getStats() {
  try {
    const userId = await getUserId();
    const tasks = await prisma.task.findMany({
      where: { userId },
    });

    const completed = tasks.filter(t => t.isCompleted).length;
    const total = tasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      progress,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { completed: 0, total: 0, progress: 0 };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const userId = await getUserId();
    await prisma.task.delete({
      where: { id: taskId, userId }
    });
    revalidatePath('/tasks');
    revalidatePath('/calendar');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return { success: false, error: error.message || 'Failed to delete task' };
  }
}
