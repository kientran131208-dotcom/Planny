"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/actions/auth";
import { signIn } from "next-auth/react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      const res = await registerUser(formData);

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        // Redirect to verification page instead of logging in
        router.push(`/verify-email?email=${encodeURIComponent(formData.get("email") as string)}`);
      }
    } catch (error) {
      console.error(error);
      setError("Đã xảy ra lỗi không xác định");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8faff]">
      {/* Left side: branding/imagery */}
      <div className="hidden lg:flex w-1/2 bg-[#031a6b] text-white p-16 flex-col justify-between relative overflow-hidden">
        <div className="z-10 mt-8 relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1151d3] to-blue-400 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-[24px]">school</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Planny.</h1>
          </div>
          <h2 className="text-5xl font-black leading-tight mb-6">
            Join the <br /> Revolution
          </h2>
          <p className="text-blue-200 text-lg max-w-md font-medium leading-relaxed">
            Tạo tài khoản ngay để bắt đầu xây dựng lộ trình học tập tối ưu và cá nhân hóa riêng cho bạn.
          </p>
        </div>
        
        <div className="z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl max-w-sm">
            <p className="text-sm font-medium italic text-blue-100">"Hành trình vạn dặm bắt đầu từ một bước chân nhỏ bé."</p>
            <p className="text-xs font-bold text-white uppercase tracking-wider mt-3">— Lão Tử</p>
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1151d3] opacity-30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[-20%] w-[600px] h-[600px] bg-indigo-500 opacity-20 rounded-full blur-[120px]"></div>
      </div>

      {/* Right side: Signup form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-3">
            <h2 className="text-3xl font-black text-[#031a6b]">Đăng ký</h2>
            <p className="text-gray-500 font-medium">Bắt đầu quản lý hành trình của bạn ngay hôm nay.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_10px_60px_rgba(0,0,0,0.03)] border border-gray-100">
            <form onSubmit={handleSignup} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">person</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f8faff] border border-gray-100 text-gray-800 text-sm rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#1151d3]/30 focus:border-[#1151d3] transition-all outline-none"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8faff] border border-gray-100 text-gray-800 text-sm rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#1151d3]/30 focus:border-[#1151d3] transition-all outline-none"
                    placeholder="example@mail.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f8faff] border border-gray-100 text-gray-800 text-sm rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#1151d3]/30 focus:border-[#1151d3] transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">enhanced_encryption</span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#f8faff] border border-gray-100 text-gray-800 text-sm rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#1151d3]/30 focus:border-[#1151d3] transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1151d3] text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-[#031a6b] hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    Tạo tài khoản <span className="material-symbols-outlined text-sm">person_add</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-gray-500">
                Đã có tài khoản? <Link href="/login" className="text-[#1151d3] font-black hover:underline underline-offset-4">Đăng nhập</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
