"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { searchActivities } from "@/lib/actions/search";
import { getUpcomingAlerts } from "@/lib/actions/calendar";
import { useLanguage } from "./LanguageProvider";

export default function Header() {
  const { lang, t } = useLanguage();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const notiDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotis = async () => {
      const alerts = await getUpcomingAlerts();
      setNotifications(alerts);
    };
    
    fetchNotis();
    
    // Refresh periodically and on focus
    const interval = setInterval(fetchNotis, 5000); // 5 seconds
    window.addEventListener('focus', fetchNotis);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchNotis);
    };
  }, [pathname]); // Refresh when navigating

  // Click away implementation
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notiDropdownRef.current && !notiDropdownRef.current.contains(event.target as Node)) {
        setShowNotiDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const res = await searchActivities(searchQuery);
        setResults(res);
        setIsSearching(false);
        setShowSearchDropdown(true);
      } else {
        setResults([]);
        setShowSearchDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Mapping url to title
  const titles: Record<string, string> = {
    "/": t('hiUser', { name: user?.name ? user.name.split(" ").slice(-1)[0] : t('account') }),
    "/calendar": t('calendar'),
    "/goals": t('myGoals'),
    "/tasks": t('manageTasks'),
    "/analytics": t('studyAnalytics'),
    "/settings": t('settingsProfile'),
  };

  const currentTitle = titles[pathname] || "Planny Dashboard";
  
  // Format current date
  const locale = lang === 'VI' ? 'vi-VN' : 'en-US';
  const today = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="h-16 w-[calc(100%-240px)] fixed top-0 right-0 z-50 bg-white flex justify-between items-center px-8 shadow-sm no-print">
      <div className="flex items-center text-left">
        <h2 className="text-lg font-semibold text-[#031a6b]">{currentTitle}</h2>
        {pathname === "/" && (
          <>
            <span className="mx-4 h-4 w-[1px] bg-gray-300"></span>
            <span className="text-sm text-gray-500 font-medium capitalize">{today}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={searchDropdownRef}>
              <div className="relative group">
            <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1151d3] transition-colors ${isSearching ? 'animate-spin' : ''}`}>
              {isSearching ? 'sync' : 'search'}
            </span>
            <input
              className="pl-10 pr-4 py-2 bg-[#eff4ff] border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-[#1151d3]/20 transition-all outline-none placeholder:text-gray-400"
              placeholder={t('searchHint')}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchDropdown && results.length > 0 && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-50 p-2 z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-50 text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1151d3]">{t('searchResults')}</span>
              </div>
              <div className="max-h-64 overflow-y-auto pt-1">
                {results.map((res, i) => (
                  <Link 
                    key={i} 
                    href={res.href}
                    onClick={() => setShowSearchDropdown(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#eff4ff] transition-all group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${res.type === 'task' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                      <span className="material-symbols-outlined text-sm">{res.type === 'task' ? 'task_alt' : 'event'}</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#1151d3]">{res.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-black uppercase text-gray-400">{res.status}</span>
                        {res.date && <span className="text-[9px] text-gray-400 font-medium italic">{res.date}</span>}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {showSearchDropdown && results.length === 0 && !isSearching && searchQuery.length >= 2 && (
             <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl p-6 z-50 text-center border border-gray-50">
                <span className="material-symbols-outlined text-gray-200 text-4xl mb-2">search_off</span>
                <p className="text-xs text-gray-400 font-medium">{t('notFound', { query: searchQuery })}</p>
             </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notiDropdownRef}>
          <button 
            onClick={() => setShowNotiDropdown(!showNotiDropdown)}
            className={`relative p-2 rounded-full transition-all ${showNotiDropdown ? 'bg-blue-100 text-[#1151d3]' : 'text-gray-500 hover:text-[#1151d3] hover:bg-[#eff4ff]'}`}
          >
            <span className="material-symbols-outlined">notifications</span>
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotiDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-50 p-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('deadlineNotifications')}</span>
                <span className="bg-red-50 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase italic">{t('priorityAlert')}</span>
              </div>
              
              <div className="max-h-80 overflow-y-auto py-1">
                {notifications.length > 0 ? (
                  notifications.map((noti) => (
                    <Link 
                      key={noti.id}
                      href={noti.type === 'TASK' ? '/tasks' : '/calendar'}
                      onClick={() => setShowNotiDropdown(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group border-b border-gray-50 last:border-0"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        noti.priority === 'HIGH' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                      }`}>
                        <span className="material-symbols-outlined text-xl">
                          {noti.type === 'TASK' ? 'warning' : 'event'}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-[#031a6b] leading-snug group-hover:text-[#1151d3] transition-colors">{noti.title}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          <span className="text-[10px] font-bold">
                            {new Date(noti.date).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}
                          </span>
                          <span className="h-2 w-[1px] bg-gray-200" />
                          <span className={`text-[10px] font-black uppercase ${noti.priority === 'HIGH' ? 'text-red-400' : 'text-blue-400'}`}>
                            {noti.type === 'TASK' ? t('dueSoon') : t('upcoming')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 px-4 text-center opacity-40">
                    <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                    <p className="text-xs font-bold text-gray-500">{t('noUrgentDeadlines')}</p>
                  </div>
                )}
              </div>
              
              <div className="p-2 border-t border-gray-50">
                <Link 
                  href="/tasks" 
                  onClick={() => setShowNotiDropdown(false)}
                  className="w-full py-2 text-center text-[10px] font-black uppercase text-[#1151d3] hover:bg-blue-50 rounded-lg block transition-all tracking-widest"
                >
                  {t('viewYourPath')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {user?.image ? (
          <img
            alt="Avatar"
            className="w-8 h-8 rounded-full border-2 border-[#eff4ff] object-cover"
            src={user.image}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-[#eff4ff]">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    </header>
  );
}
