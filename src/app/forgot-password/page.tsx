"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/lib/actions/auth";
import Link from "next/link";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await forgotPassword(email);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 3000);
    } else {
      setError(res.error || "Đã có lỗi xảy ra");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8faff] p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center space-y-4 mb-10">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto text-orange-600">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
          <h2 className="text-3xl font-black text-[#031a6b]">Quên mật khẩu?</h2>
          <p className="text-gray-500 font-medium">Đừng lo lắng, chúng tôi sẽ gửi mã khôi phục cho bạn.</p>
        </div>

        {success ? (
          <div className="bg-green-50 text-green-700 p-6 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <span className="material-symbols-outlined text-4xl">mark_email_read</span>
            <p className="font-bold">Mã khôi phục đã được gửi!</p>
            <p className="text-sm">Vui lòng kiểm tra email <span className="font-black">${email}</span>. Đang chuyển hướng bạn đến trang đặt lại mật khẩu...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Email của bạn</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f8faff] border border-gray-100 text-gray-800 text-sm rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#1151d3]/30 focus:border-[#1151d3] outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1151d3] text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-[#031a6b] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? "Đang xử lý..." : "Gửi mã khôi phục"}
            </button>
            
            <div className="text-center">
              <Link href="/login" className="text-xs font-bold text-gray-400 hover:text-[#031a6b] uppercase tracking-widest">
                Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
