"use server";

import "server-only";
import { prisma } from "@/lib/database";
import bcrypt from "bcryptjs";
import { sendVerificationCode, sendResetCode } from "@/lib/email";

// Helper to generate a 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log(`[AUTH] Registration attempt for email: ${email}`);

  if (!email || !password || !name) {
    return { error: "Vui lòng nhập đầy đủ thông tin" };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`[AUTH] Registration failed: Email ${email} already exists`);
      return { error: "Email này đã được sử dụng" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate 6-digit code
    const vCode = generateCode();
    const vExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user with null emailVerified
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
        verificationCode: vCode,
        verificationExpires: vExpires,
        role: "Student",
        pomoGoalDay: 8,
        pomoGoalWeek: 40,
        pomoGoalMonth: 150,
      },
    });

    // Send the email
    const emailResult = await sendVerificationCode(email, vCode);
    
    if (!emailResult.delivered) {
      console.warn(`[AUTH] Verification email was NOT delivered to ${email}. This is normal in Resend Sandbox Mode.`);
      console.warn(`[AUTH] Please use this code to verify: ${vCode}`);
    }

    console.log(`[AUTH] User created with verification code: ${vCode}`);
    return { success: true, email: user.email, sandbox: !emailResult.delivered };
  } catch (error: any) {
    console.error("[AUTH] Registration error:", error);
    return { error: "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại sau." };
  }
}

export async function verifyEmail(email: string, code: string) {
  if (!email || !code) return { error: "Thông tin không hợp lệ" };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return { error: "Không tìm thấy người dùng" };
    if (user.emailVerified) return { error: "Email này đã được xác thực" };

    // Check code and expiration
    if (user.verificationCode !== code) return { error: "Mã xác nhận không chính xác" };
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return { error: "Mã xác nhận đã hết hạn" };
    }

    // Update user
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpires: null,
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[AUTH] Verification error:", err);
    return { error: "Lỗi hệ thống khi xác thực." };
  }
}

export async function forgotPassword(email: string) {
  if (!email) return { error: "Vui lòng nhập Email" };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "Không tìm thấy tài khoản với email này" };

    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { email },
      data: {
        resetCode: code,
        resetExpires: expires,
      }
    });

    const emailResult = await sendResetCode(email, code);
    
    if (!emailResult.delivered) {
      console.warn(`[AUTH] Reset email was NOT delivered to ${email}. This is normal in Resend Sandbox Mode.`);
      console.warn(`[AUTH] Please use this code to reset: ${code}`);
    }

    return { success: true, sandbox: !emailResult.delivered };
  } catch (err) {
    console.error("[AUTH] Forgot password error:", err);
    return { error: "Đã có lỗi xảy ra. Thử lại sau." };
  }
}

export async function resetPassword(email: string, code: string, newPass: string) {
  if (!email || !code || !newPass) return { error: "Vui lòng nhập đầy đủ thông tin" };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "Không tìm thấy tài khoản" };

    if (user.resetCode !== code) return { error: "Mã khôi phục không đúng" };
    if (user.resetExpires && user.resetExpires < new Date()) {
      return { error: "Mã khôi phục đã hết hạn" };
    }

    const hashed = await bcrypt.hash(newPass, 12);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashed,
        resetCode: null,
        resetExpires: null,
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[AUTH] Reset password error:", err);
    return { error: "Lỗi khôi phục mật khẩu." };
  }
}
