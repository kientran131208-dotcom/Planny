'use server';

import { getUserId } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export interface AIInsight {
  message: string;
  type: 'productivity' | 'rest' | 'motivation';
  suggestedAction: string;
  score: number;
}

export async function generateAIInsight(): Promise<AIInsight | null> {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    // Lấy dữ liệu học tập gần đây để phân tích (giả lập logic AI)
    const recentSessions = await prisma.studySession.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5
    });

    const totalMinutes = recentSessions.reduce((acc, s) => acc + s.durationMin, 0);

    // AI Logic giả lập dựa trên dữ liệu thực tế
    if (totalMinutes > 120) {
      return {
        message: "Bạn đã có một ngày học tập cực kỳ năng suất!",
        type: 'productivity',
        suggestedAction: "Hãy tiếp tục duy trì đà này bằng cách ôn tập lại các kiến thức quan trọng vào tối nay.",
        score: 92
      };
    } else if (totalMinutes > 0) {
      return {
        message: "Cố gắng lên, bạn đang đi đúng hướng!",
        type: 'motivation',
        suggestedAction: "Hãy thử một phiên Pomodoro 25 phút ngay bây giờ để hoàn thành mục tiêu ngày.",
        score: 65
      };
    } else {
      return {
        message: "Đã đến lúc bắt đầu hành trình chinh phục kiến thức mới!",
        type: 'motivation',
        suggestedAction: "Lên kế hoạch cho nhiệm vụ đầu tiên trong ngày để tạo cảm hứng học tập nhé.",
        score: 40
      };
    }
  } catch (error) {
    console.error('[AI] Error generating insight:', error);
    return {
       message: "Chào mừng bạn quay lại với Planny!",
       type: 'motivation',
       suggestedAction: "Hãy bắt đầu một ngày mới thật năng suất cùng AI trợ lý nhé.",
       score: 50
    };
  }
}
