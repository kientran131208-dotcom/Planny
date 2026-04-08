import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

/**
 * Sends a 6-digit verification code to the user's email.
 * If no Resend API key is provided, it logs the code to the console for development.
 */
export async function sendVerificationCode(email: string, code: string) {
  const subject = "Mã xác nhận tài khoản Planny";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 16px;">
      <h2 style="color: #031a6b; text-align: center;">Chào mừng bạn đến với Planny!</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất quá trình đăng ký:</p>
      <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-radius: 12px; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1151d3;">${code}</span>
      </div>
      <p style="color: #718096; font-size: 14px;">Mã này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="text-align: center; color: #a0aec0; font-size: 12px;">© 2024 Planny - Smart Study Planning</p>
    </div>
  `;

  // Always log to console for dev visibility
  console.log(`[EMAIL SENDING] To: ${email}, Code: ${code}`);

  if (!resend) {
    return { success: true, delivered: false, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error("[EMAIL] Resend error:", error);
      // We return success: true but delivered: false so the app can still proceed in dev
      return { success: true, delivered: false, error };
    }

    return { success: true, delivered: true, data };
  } catch (err) {
    console.error("[EMAIL] Unexpected error:", err);
    return { success: true, delivered: false, error: err };
  }
}

/**
 * Sends a 6-digit reset code for password recovery.
 */
export async function sendResetCode(email: string, code: string) {
  const subject = "Yêu cầu khôi phục mật khẩu Planny";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 16px;">
      <h2 style="color: #031a6b; text-align: center;">Khôi phục mật khẩu</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Chúng tôi nhận được yêu cầu khôi phục mật khẩu của bạn. Sử dụng mã bên dưới để đặt mật khẩu mới:</p>
      <div style="background-color: #fffaf0; padding: 20px; text-align: center; border-radius: 12px; margin: 30px 0; border: 1px solid #feebc8;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dd6b20;">${code}</span>
      </div>
      <p style="color: #718096; font-size: 14px;">Mã này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="text-align: center; color: #a0aec0; font-size: 12px;">© 2024 Planny - Smart Study Planning</p>
    </div>
  `;

  // Always log to console for dev visibility
  console.log(`[EMAIL SENDING] To: ${email}, Code: ${code}`);

  if (!resend) {
    return { success: true, delivered: false, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error("[EMAIL] Resend error:", error);
      return { success: true, delivered: false, error };
    }

    return { success: true, delivered: true, data };
  } catch (err) {
    console.error("[EMAIL] Unexpected error:", err);
    return { success: true, delivered: false, error: err };
  }
}
