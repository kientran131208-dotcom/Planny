'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function getSubjects() {
  try {
    const userId = await getUserId();
    return await prisma.subject.findMany({
      where: { userId },
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

export async function createSubject(name: string, colorCode: string) {
  try {
    const userId = await getUserId();
    const subject = await prisma.subject.create({
      data: {
        name,
        colorCode,
        userId
      }
    });
    return { success: true, subject };
  } catch (error: any) {
    console.error('Error creating subject:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSubject(subjectId: string) {
  try {
    const userId = await getUserId();
    
    await Promise.all([
      prisma.task.updateMany({
        where: { subjectId },
        data: { subjectId: null }
      }),
      prisma.event.updateMany({
        where: { subjectId },
        data: { subjectId: null }
      }),
      prisma.studySession.updateMany({
        where: { subjectId },
        data: { subjectId: null }
      })
    ]);

    await prisma.subject.delete({
      where: { id: subjectId, userId }
    });

    revalidatePath('/tasks');
    revalidatePath('/calendar');
    revalidatePath('/pomodoro');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    return { success: false, error: error.message };
  }
}
