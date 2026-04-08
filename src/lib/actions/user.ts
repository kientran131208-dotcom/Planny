'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function updateProfile(data: { name?: string, image?: string, school?: string, bio?: string }) {
  try {
    const userId = await getUserId();
    
    console.log(`[USER] Updating profile for user ${userId}:`, data);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.image && { image: data.image }),
        ...(data.school !== undefined && { school: data.school }),
        ...(data.bio !== undefined && { bio: data.bio }),
        // Sync avatarUrl if we are using image
        ...(data.image && { avatarUrl: data.image })
      }
    });

    console.log(`[USER] Profile updated successfully for ${userId}`);

    revalidatePath('/settings');
    revalidatePath('/');
    
    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error('[USER] Error updating profile:', error);
    return { success: false, error: error.message || 'Không thể cập nhật hồ sơ.' };
  }
}
