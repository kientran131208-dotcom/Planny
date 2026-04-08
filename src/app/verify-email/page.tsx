"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/actions/auth";
import Link from "next/link";

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1); // Only take last char
    if (!/^\d*$/.test(value)) return; // Only digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Vui lòng nhập đủ 6 chữ số");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await verifyEmail(email, fullCode);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setError(res.error || "Mã xác nhận không đúng");
      setIsLoading(false);
    }
  };

  // Auto-submit when last digit is entered
  useEffect(() => {
    if (code.every(digit => digit !== "") && !success) {
      handleVerify();
    }
  }, [code]);

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f8faff] p-6">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-3xl font-black text-[#031a6b]">Xác thực thành công!</h2>
          <p className="text-gray-500 font-medium">Email của bạn đã được xác minh. Đang chuyển hướng bạn đến trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8faff] p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center space-y-4 mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-[#1151d3]">
            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
          </div>
          <h2 className="text-3xl font-black text-[#031a6b]">Xác thực Email</h2>
          <p className="text-gray-500 font-medium px-4">
            Chúng tôi đã gửi mã xác nhận 6 chữ số đến <span className="text-[#1151d3] font-bold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

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

          <button
            type="submit"
            disabled={isLoading || code.some(d => !d)}
            className="w-full bg-[#1151d3] text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-[#031a6b] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? "Đang xác thực..." : "Xác nhận"}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-400 font-medium">
            Không nhận được mã? <button className="text-[#1151d3] font-bold hover:underline">Gửi lại mã</button>
          </p>
          <Link href="/login" className="inline-block text-xs font-bold text-gray-400 hover:text-[#031a6b] uppercase tracking-widest">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
