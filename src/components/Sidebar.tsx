"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "./LanguageProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const user = session?.user;

  const navigation = [
    { name: t('dashboard'), href: "/", icon: "dashboard" },
    { name: t('calendar'), href: "/calendar", icon: "calendar_today" },
    { name: t('goals'), href: "/goals", icon: "emoji_events" },
    { name: t('tasks'), href: "/tasks", icon: "task_alt" },
    { name: t('events'), href: "/events", icon: "event_note" },
    { name: t('focusMode'), href: "/pomodoro", icon: "timer" },
    { name: t('analytics'), href: "/analytics", icon: "bar_chart" },
    { name: t('settings'), href: "/settings", icon: "settings" },
  ];

  return (
    <aside className="w-[240px] h-screen fixed left-0 top-0 bg-[#031A6B] flex flex-col py-6 z-20">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1151d3] to-[#031a6b] flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Planny</h1>
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">
            Smart Study Planning
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors group ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <span
                className={`material-symbols-outlined mr-3 ${
                  isActive ? "text-[#dbe1ff]" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-4 pt-6 border-t border-white/10 space-y-3">
        <div className="flex items-center p-2 rounded-xl bg-white/5 relative group cursor-pointer" onClick={() => signOut()}>
          {user?.image ? (
            <img
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover"
              src={user.image}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className="ml-3 overflow-hidden transition-all group-hover:opacity-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name || (t('account'))}</p>
            <p className="text-white/50 text-xs truncate">{user?.email || ""}</p>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#1151d3] rounded-xl text-white font-bold text-sm gap-2">
            <span className="material-symbols-outlined text-sm">logout</span> {t('logout')}
          </div>
        </div>
      </div>
    </aside>
  );
}
