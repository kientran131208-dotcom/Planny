"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "EMAIL_NOT_VERIFIED") {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        setError(res.error === "CredentialsSignin" ? "Email hoặc mật khẩu không đúng" : res.error);
        setIsLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setError("Đã xảy ra lỗi không xác định");
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: "/" });
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
            The Cognitive <br /> Architect
          </h2>
          <p className="text-blue-200 text-lg max-w-md font-medium leading-relaxed">
            Ứng dụng lập kế hoạch học tập thông minh, giúp bạn chia nhỏ mục tiêu, kiểm soát thời gian và làm chủ kiến thức một cách khoa học.
          </p>
        </div>
        
        <div className="z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl max-w-sm">
            <p className="text-sm font-medium italic text-blue-100">"Sự chuẩn bị tốt nhất cho ngày mai là làm hết sức mình hôm nay."</p>
            <p className="text-xs font-bold text-white uppercase tracking-wider mt-3">— H. Jackson Brown Jr.</p>
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1151d3] opacity-30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[-20%] w-[600px] h-[600px] bg-indigo-500 opacity-20 rounded-full blur-[120px]"></div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-3">
            <h2 className="text-3xl font-black text-[#031a6b]">Đăng nhập</h2>
            <p className="text-gray-500 font-medium">Tiếp tục hành trình chinh phục kiến thức của bạn.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_10px_60px_rgba(0,0,0,0.03)] border border-gray-100">
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm text-gray-700"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Google
              </button>
              <button 
                onClick={() => handleSocialLogin('facebook')}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-[#1877F2] text-white rounded-xl hover:bg-[#166fe5] transition-all font-bold text-sm"
              >
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5 brightness-0 invert" alt="Facebook" />
                Facebook
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-8">
              <div className="border-t border-gray-100 w-full"></div>
              <span className="absolute px-4 bg-white text-xs font-bold text-gray-400 uppercase tracking-widest">Hoặc đăng nhập bằng</span>
            </div>

            <form onSubmit={handleCredentialsLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
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
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="rounded text-[#1151d3] focus:ring-[#1151d3]/30 border-gray-300 transition-all" />
                  <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Ghi nhớ tôi</span>
                </label>
                <Link href="/forgot-password" className="text-xs font-bold text-[#1151d3] hover:text-[#031a6b] transition-colors">Quên mật khẩu?</Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1151d3] text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-[#031a6b] hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Đăng nhập <span className="material-symbols-outlined text-sm">login</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm font-medium text-gray-500">
                Chưa có tài khoản Planny? <Link href="/signup" className="text-[#1151d3] font-black hover:underline underline-offset-4">Đăng ký ngay</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
