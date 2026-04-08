"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/actions/auth";
import Link from "next/link";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    
    if (fullCode.length < 6) {
      setError("Vui lòng nhập đủ mã 6 chữ số");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await resetPassword(email, fullCode, newPassword);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
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
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-[#1151d3]">
            <span className="material-symbols-outlined text-3xl">password</span>
          </div>
          <h2 className="text-3xl font-black text-[#031a6b]">Đặt lại mật khẩu</h2>
          <p className="text-gray-500 font-medium px-4">
            Nhập mã khôi phục đã gửi đến <span className="text-[#1151d3] font-bold">{email}</span> và mật khẩu mới của bạn.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 text-green-700 p-8 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
            <p className="font-bold text-xl">Thành công!</p>
            <p className="text-sm">Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng bạn đến trang đăng nhập...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Mã khôi phục (6 chữ số)</label>
              <div className="flex justify-between gap-2">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 bg-[#f8faff] border border-gray-100 text-center text-xl font-black text-[#031a6b] rounded-xl focus:ring-2 focus:ring-[#1151d3]/30 focus:border-[#1151d3] outline-none transition-all shadow-sm"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Mật khẩu mới</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#f8faff] border border-gray-100 text-gray-800 text-sm rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#1151d3]/30 focus:border-[#1151d3] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.some(d => !d) || !newPassword}
              className="w-full bg-[#1151d3] text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-[#031a6b] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
