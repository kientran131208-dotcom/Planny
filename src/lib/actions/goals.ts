'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getUserId } from '@/lib/auth-utils';

export async function getGoalsWithStats() {
  try {
    const userId = await getUserId();
    const now = new Date();
    
    // 1. Calculate global historical velocity (tasks per day over last 14 days)
    // This serves as a fallback for goals without milestone history
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);
    
    const recentlyCompletedTasksCount = await prisma.task.count({
      where: {
        userId,
        isCompleted: true,
        updatedAt: { gte: twoWeeksAgo }
      }
    });
    
    // Global velocity: tasks per day
    const globalDailyVelocity = Math.max(recentlyCompletedTasksCount / 14, 0.1);

    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        milestones: { 
          orderBy: { date: 'asc' } 
        },
        tasks: { 
          where: { isCompleted: false },
          include: { subject: true }
        }
      },
      orderBy: { deadline: 'asc' }
    });

    // 2. Add forecast to each goal using milestone-based logic where possible
    const goalsWithForecast = goals.map(goal => {
      const remainingTasksCount = goal.tasks.length;
      const completedMilestones = goal.milestones.filter(m => m.isCompleted)
        .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
      
      const remainingMilestonesCount = goal.milestones.filter(m => !m.isCompleted).length;
      
      if (goal.progress === 100) {
        return { ...goal, forecast: { status: 'COMPLETED' } };
      }

      let predictedDate: Date | null = null;
      let status: 'ON_TRACK' | 'AT_RISK' | 'UNKNOWN' = 'ON_TRACK';
      let message = '';
      let velocityType: 'milestone' | 'task' | 'none' = 'none';

      const deadline = new Date(goal.deadline);

      // STRATEGY A: Milestone-based velocity (Most accurate for goals with history)
      if (completedMilestones.length >= 1) {
        velocityType = 'milestone';
        // Calculate days per milestone
        // If only 1 completed, measure from goal creation
        const firstDate = completedMilestones.length > 1 
          ? completedMilestones[0].updatedAt 
          : goal.createdAt;
        const lastDate = completedMilestones[completedMilestones.length - 1].updatedAt;
        
        const daysDiff = Math.max((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24), 1);
        const milestonesDone = completedMilestones.length > 1 ? completedMilestones.length - 1 : 1;
        
        const daysPerMilestone = daysDiff / milestonesDone;
        const daysNeeded = Math.ceil(remainingMilestonesCount * daysPerMilestone);
        
        predictedDate = new Date();
        predictedDate.setDate(now.getDate() + daysNeeded);
      } 
      // STRATEGY B: Task-based fallback
      else if (remainingTasksCount > 0) {
        velocityType = 'task';
        const daysNeeded = Math.ceil(remainingTasksCount / globalDailyVelocity);
        predictedDate = new Date();
        predictedDate.setDate(now.getDate() + daysNeeded);
      }
      // STRATEGY C: No data
      else {
        return { ...goal, forecast: { status: 'UNKNOWN', message: 'No metrics available' } };
      }

      // Determine status
      if (predictedDate) {
        const isOverdue = predictedDate > deadline;
        status = isOverdue ? 'AT_RISK' : 'ON_TRACK';
        
        if (isOverdue) {
          const daysOver = Math.ceil((predictedDate.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
          message = `Dự kiến trễ ${daysOver} ngày. Cần tập trung hơn!`;
        } else {
          const daysSpare = Math.ceil((deadline.getTime() - predictedDate.getTime()) / (1000 * 60 * 60 * 24));
          message = daysSpare < 3 ? 'Sắp đến hạn, duy trì tốc độ!' : 'Đang đúng tiến độ.';
        }
      }

      return {
        ...goal,
        forecast: {
          predictedDate,
          status,
          message,
          velocityType,
          isOverdue: status === 'AT_RISK'
        }
      };
    });

    return goalsWithForecast;
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
}

export async function getOverallGoalMetrics() {
  try {
    const userId = await getUserId();
    const goals = await prisma.goal.findMany({
      where: { userId }
    });

    if (goals.length === 0) return { avgProgress: 0, total: 0, completed: 0, inProgress: 0, atRisk: 0 };

    const totalProgress = goals.reduce((acc, g) => acc + g.progress, 0);
    const completed = goals.filter(g => g.status === 'COMPLETED' || g.progress === 100).length;
    const atRisk = goals.filter(g => g.status === 'AT_RISK').length;
    const inProgress = goals.length - completed;

    return {
      avgProgress: Math.round(totalProgress / goals.length),
      total: goals.length,
      completed,
      inProgress,
      atRisk
    };
  } catch (error) {
    return { avgProgress: 0, total: 0, completed: 0, inProgress: 0, atRisk: 0 };
  }
}

export async function getTimelineMilestones() {
  try {
    const userId = await getUserId();
    const milestones = await prisma.milestone.findMany({
      where: { goal: { userId } },
      include: { goal: true },
      orderBy: { date: 'asc' },
      take: 50
    });
    return milestones;
  } catch (error) {
    return [];
  }
}

export async function createGoal(data: { title: string, description?: string, deadline: Date }) {
  try {
    const userId = await getUserId();
    const newGoal = await prisma.goal.create({
      data: {
        ...data,
        userId
      }
    });
    revalidatePath('/goals');
    revalidatePath('/');
    return { success: true, goal: newGoal };
  } catch (error) {
    console.error('Error creating goal:', error);
    return { success: false, error: 'Failed to create goal' };
  }
}

export async function updateGoalNote(goalId: string, note: string) {
  try {
    const userId = await getUserId();
    
    // Ensure user owns the goal
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== userId) throw new Error("Not authorized");

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { note }
    });
    revalidatePath('/goals');
    return { success: true, goal: updatedGoal };
  } catch (error) {
    console.error('Error updating goal note:', error);
    return { success: false, error: 'Failed to update note' };
  }
}
export async function addMilestone(goalId: string, title: string, date: Date) {
  try {
    const userId = await getUserId();
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== userId) throw new Error("Not authorized");

    const milestone = await prisma.milestone.create({
      data: {
        title,
        date,
        goalId
      }
    });
    revalidatePath('/goals');
    return { success: true, milestone };
  } catch (error) {
    console.error('Error adding milestone:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function toggleMilestone(milestoneId: string, isCompleted: boolean) {
  try {
    const userId = await getUserId();
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { goal: true }
    });
    
    if (!milestone || milestone.goal.userId !== userId) throw new Error("Not authorized");

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { isCompleted }
    });
    
    // Automatically update goal progress based on milestones
    const allMilestones = await prisma.milestone.findMany({ where: { goalId: milestone.goalId } });
    if (allMilestones.length > 0) {
      const completedCount = allMilestones.filter(m => m.isCompleted).length;
      const progress = Math.round((completedCount / allMilestones.length) * 100);
      await prisma.goal.update({
        where: { id: milestone.goalId },
        data: { progress }
      });
    }

    revalidatePath('/goals');
    revalidatePath('/');
    return { success: true, milestone: updated };
  } catch (error) {
    console.error('Error toggling milestone:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function deleteGoal(goalId: string) {
  try {
    const userId = await getUserId();
    
    // 1. Ownership check
    const goal = await prisma.goal.findUnique({ 
      where: { id: goalId }
    });
    
    if (!goal || goal.userId !== userId) throw new Error("Not authorized");

    // 2. Delete Goal itself. Milestones AND Tasks now have onDelete: Cascade in schema.
    await prisma.goal.delete({
      where: { id: goalId }
    });

    revalidatePath('/goals');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('CRITICAL Error deleting goal:', error);
    
    let errorMessage = "Lỗi hệ thống không xác định.";
    if (error.code === 'P2003') {
      errorMessage = "Không thể xoá: Vẫn còn dữ liệu liên quan đang ràng buộc (P2003).";
    } else if (error.message === "Not authorized") {
      errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
    } else {
      errorMessage = `Lỗi: ${error.message || 'Vui lòng thử lại sau.'}`;
    }

    return { 
      success: false, 
      error: errorMessage
    };
  }
}

export async function deleteMilestone(milestoneId: string) {
  try {
    const userId = await getUserId();
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { goal: true }
    });
    
    if (!milestone || milestone.goal.userId !== userId) throw new Error("Not authorized");

    await prisma.milestone.delete({ where: { id: milestoneId } });
    
    // Recalculate goal progress
    const allMilestones = await prisma.milestone.findMany({ where: { goalId: milestone.goalId } });
    const progress = allMilestones.length > 0 
      ? Math.round((allMilestones.filter(m => m.isCompleted).length / allMilestones.length) * 100)
      : 0;

    await prisma.goal.update({
      where: { id: milestone.goalId },
      data: { progress }
    });

    revalidatePath('/goals');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function updateGoalDeadline(goalId: string, deadline: Date) {
  try {
    const userId = await getUserId();
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== userId) throw new Error("Not authorized");

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { deadline }
    });

    revalidatePath('/goals');
    return { success: true, goal: updatedGoal };
  } catch (error) {
    console.error('Error updating goal deadline:', error);
    return { success: false, error: 'Failed to update deadline' };
  }
}

export async function updateGoal(goalId: string, data: { title?: string, description?: string }) {
  try {
    const userId = await getUserId();
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== userId) throw new Error("Not authorized");

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data
    });

    revalidatePath('/goals');
    revalidatePath('/');
    return { success: true, goal: updatedGoal };
  } catch (error) {
    console.error('Error updating goal:', error);
    return { success: false, error: 'Failed to update goal' };
  }
}
