'use server';

import { database as prisma } from '@/lib/database';
import { getUserId } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function getUserSettings() {
  try {
    const userId = await getUserId();
    // Raw SQL to bypass Prisma model validation errors
    const users: any[] = await prisma.$queryRaw`
      SELECT 
        pomoWorkMin, pomoShortBreakMin, pomoLongBreakMin, pomoInterval,
        remindersEnabled, notificationSound, soundVolume, streakWarningEnabled,
        pomoGoalDay, pomoGoalWeek, pomoGoalMonth
      FROM "User"
      WHERE id = ${userId} 
      LIMIT 1
    `;
    
    if (!users || users.length === 0) return null;
    
    const user = users[0];
    return {
      pomoWorkMin: user.pomoworkmin ?? user.pomoWorkMin ?? 25,
      pomoShortBreakMin: user.pomoshortbreakmin ?? user.pomoShortBreakMin ?? 5,
      pomoLongBreakMin: user.pomolongbreakmin ?? user.pomoLongBreakMin ?? 15,
      pomoInterval: user.pomointerval ?? user.pomoInterval ?? 4,
      remindersEnabled: Boolean(user.remindersenabled ?? user.remindersEnabled ?? true),
      notificationSound: user.notificationsound ?? user.notificationSound ?? 'crystal',
      soundVolume: user.soundvolume ?? user.soundVolume ?? 0.5,
      streakWarningEnabled: Boolean(user.streakwarningenabled ?? user.streakWarningEnabled ?? true),
      pomoGoalDay: user.pomogoalday ?? user.pomoGoalDay ?? 8,
      pomoGoalWeek: user.pomogoalweek ?? user.pomoGoalWeek ?? 40,
      pomoGoalMonth: user.pomogoalmonth ?? user.pomoGoalMonth ?? 150,
    };
  } catch (error) {
    console.error('[SETTINGS] Error fetching user settings:', error);
    return null;
  }
}

export async function updateUserSettings(data: {
  pomoWorkMin?: number;
  pomoShortBreakMin?: number;
  pomoLongBreakMin?: number;
  pomoInterval?: number;
  remindersEnabled?: boolean;
  notificationSound?: string;
  soundVolume?: number;
  streakWarningEnabled?: boolean;
}) {
  try {
    const userId = await getUserId();
    
    // Construct SQL fragments for update
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        // Handle booleans for SQLite (0 or 1)
        if (typeof value === 'boolean') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    });

    if (updates.length > 0) {
      const sql = `UPDATE User SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      await prisma.$executeRawUnsafe(sql, ...values, userId);
    }

    console.log(`[SETTINGS] Updated settings for user ${userId} via Raw SQL`);
    
    revalidatePath('/settings');
    revalidatePath('/pomodoro');
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    console.error('[SETTINGS] Error updating user settings:', error);
    return { success: false, error: error.message };
  }
}
