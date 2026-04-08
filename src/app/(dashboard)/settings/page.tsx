'use client';

import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { updateProfile } from '@/lib/actions/user';
import { getUserSettings, updateUserSettings } from '@/lib/actions/user-settings';

type SettingsTab = 'ACCOUNT' | 'NOTI' | 'APPEARANCE' | 'SECURITY';

const AVATAR_OPTIONS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&h=200&auto=format&fit=crop', label: 'Classic' },
  { id: '2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop', label: 'Casual' },
  { id: '3', url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&h=200&auto=format&fit=crop', label: 'Productive' },
  { id: '4', url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&h=200&auto=format&fit=crop', label: 'Focused' },
  { id: '5', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop', label: 'Professional' },
  { id: '6', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop', label: 'Academic' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('ACCOUNT');
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [school, setSchool] = useState('');
  const [bio, setBio] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // New Settings State
  const [pomoSettings, setPomoSettings] = useState({
    pomoWorkMin: 25,
    pomoShortBreakMin: 5,
    pomoLongBreakMin: 15,
    pomoInterval: 4,
  });
  const [notiSettings, setNotiSettings] = useState({
    remindersEnabled: true,
    notificationSound: 'crystal',
    soundVolume: 0.5,
    streakWarningEnabled: true,
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setImage(user.image || '');
      setSchool((user as any).school || '');
      setBio((user as any).bio || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getUserSettings();
      if (settings) {
        setPomoSettings({
          pomoWorkMin: settings.pomoWorkMin,
          pomoShortBreakMin: settings.pomoShortBreakMin,
          pomoLongBreakMin: settings.pomoLongBreakMin,
          pomoInterval: settings.pomoInterval,
        });
        setNotiSettings({
          remindersEnabled: settings.remindersEnabled,
          notificationSound: settings.notificationSound,
          soundVolume: settings.soundVolume,
          streakWarningEnabled: settings.streakWarningEnabled,
        });
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (type: 'POMO' | 'NOTI') => {
    setIsUpdating(true);
    setStatus(null);
    try {
      const data = type === 'POMO' ? pomoSettings : notiSettings;
      const res = await updateUserSettings(data);
      if (res.success) {
        setStatus({ type: 'success', message: t('saveSuccess') || 'Đã lưu cài đặt!' });
      } else {
        setStatus({ type: 'error', message: res.error || 'Lỗi cập nhật.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Đã xảy ra lỗi kết nối.' });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    setStatus(null);
    try {
      const res = await updateProfile({ name, image, school, bio });
      if (res.success) {
        setStatus({ type: 'success', message: 'Cập nhật hồ sơ thành công!' });
        // Refresh session with new data
        await updateSession({ name, image, school, bio });
      } else {
        setStatus({ type: 'error', message: res.error || 'Lỗi cập nhật.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Đã xảy ra lỗi kết nối.' });
    } finally {
      setIsUpdating(false);
      // Clear message after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="mb-8 text-left">
        <h2 className="text-2xl font-bold text-[#031a6b] tracking-tight">{t('settings')}</h2>
        <p className="text-gray-500 text-sm mt-1">Quản lý tài khoản và tùy chỉnh cá nhân.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar for Settings */}
        <div className="col-span-1 space-y-2">
          {[
            { id: 'ACCOUNT', label: t('account'), icon: 'person' },
            { id: 'NOTI', label: t('notifications'), icon: 'notifications' },
            { id: 'APPEARANCE', label: t('appearance'), icon: 'palette' },
            { id: 'SECURITY', label: t('security'), icon: 'security' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#e5eeff] text-[#1151d3] shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="col-span-2 space-y-8">
          {activeTab === 'ACCOUNT' && (
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-[#031a6b] mb-6">Hồ sơ cá nhân</h3>
              
              {status && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {status.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  {status.message}
                </div>
              )}

              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  {image ? (
                    <img src={image} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-[#eff4ff] object-cover bg-gray-100" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#dce9ff] flex items-center justify-center text-[#1151d3] font-bold text-2xl border-4 border-[#eff4ff]">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <button 
                    onClick={() => setShowAvatarGallery(!showAvatarGallery)}
                    className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <span className="material-symbols-outlined text-xl">photo_camera</span>
                  </button>
                </div>

                <div>
                  <button 
                    onClick={() => setShowAvatarGallery(!showAvatarGallery)}
                    className="px-4 py-2 bg-[#eff4ff] text-[#1151d3] text-sm font-bold rounded-lg hover:bg-[#dce9ff] transition-colors mb-2 flex items-center gap-2"
                  >
                    Thay đổi ảnh đại diện
                    <span className="material-symbols-outlined text-sm">{showAvatarGallery ? 'expand_less' : 'expand_more'}</span>
                  </button>
                  <p className="text-xs text-gray-400">Chọn một trong những bộ sưu tập cao cấp của Planny.</p>
                </div>
              </div>

              {/* Avatar Gallery & Custom URL */}
              {showAvatarGallery && (
                <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-4 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
                    <button className="px-4 py-2 bg-white text-[#1151d3] shadow-sm rounded-lg text-xs font-bold transition-all">Bộ sưu tập</button>
                    <div className="px-4 py-2 text-gray-400 text-xs font-bold">Hoặc dán link ảnh cá nhân</div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button 
                        key={opt.id}
                        onClick={() => {
                          setImage(opt.url);
                          setShowAvatarGallery(false);
                        }}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          image === opt.url ? 'border-[#1151d3] ring-4 ring-[#1151d3]/10' : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-[#1151d3]/0 group-hover:bg-[#1151d3]/10 transition-colors" />
                      </button>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block text-left">URL ảnh đại diện tùy chỉnh</label>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={image}
                         onChange={(e) => setImage(e.target.value)}
                         className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-[#1151d3]"
                         placeholder="https://example.com/your-photo.jpg"
                       />
                       <button 
                         onClick={() => setShowAvatarGallery(false)}
                         className="px-4 py-2 bg-[#1151d3] text-white text-xs font-bold rounded-lg hover:bg-[#031a6b] transition-all"
                       >
                         Áp dụng
                       </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Họ và tên</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">person</span>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1151d3]/20 focus:border-[#1151d3] transition-all"
                      placeholder="Nhập họ và tên của bạn"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block text-left">Trường học</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">school</span>
                    <input 
                      type="text" 
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1151d3]/20 focus:border-[#1151d3] transition-all"
                      placeholder="Nhập tên trường của bạn"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block text-left">Mục tiêu tổng quát</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-4 text-gray-400 text-[20px]">flag</span>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1151d3]/20 focus:border-[#1151d3] transition-all min-h-[100px] resize-none"
                      placeholder="Chia sẻ về định hướng hoặc mục tiêu học tập lớn nhất của bạn..."
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Email</label>
                    <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">lock</span>
                      Không thể thay đổi
                    </span>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                    <input 
                      type="email" 
                      readOnly
                      disabled
                      value={user?.email || ""}
                      className="w-full pl-12 pr-4 py-3 bg-gray-100/50 border border-gray-100 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed italic"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400 font-medium">Email được liên kết với tài khoản của bạn và không thể sửa đổi vì lý do bảo mật.</p>
                </div>
              </div>

              <div className="flex justify-end mt-10">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="px-8 py-3 bg-gradient-to-r from-[#1151d3] to-[#031a6b] text-white text-sm font-black rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      Lưu thay đổi
                      <span className="material-symbols-outlined text-sm">save</span>
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {activeTab === 'APPEARANCE' && (
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-[#031a6b] mb-6 text-left">{t('appearance')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Light Mode Card */}
                <div 
                  onClick={() => setTheme('light')}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                    theme === 'light' ? 'border-[#1151d3] bg-blue-50/50 shadow-lg shadow-blue-900/5' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="aspect-[4/3] bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 flex flex-col gap-2 relative overflow-hidden">
                    <div className="w-full h-2 bg-blue-50 rounded" />
                    <div className="w-2/3 h-2 bg-gray-100 rounded" />
                    <div className="grid grid-cols-3 gap-1 mt-2">
                       <div className="h-8 bg-[#1151d3]/10 rounded" />
                       <div className="h-8 bg-orange-50 rounded" />
                       <div className="h-8 bg-emerald-50 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#031a6b]">Sáng (Light)</span>
                    {theme === 'light' && <span className="material-symbols-outlined text-[#1151d3] text-lg">check_circle</span>}
                  </div>
                </div>

                {/* Dark Mode Card */}
                <div 
                  onClick={() => setTheme('dark')}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                    theme === 'dark' ? 'border-[#3b82f6] bg-slate-800 shadow-lg shadow-black/20' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="aspect-[4/3] bg-[#020617] rounded-lg border border-[#1e293b] shadow-sm p-4 mb-4 flex flex-col gap-2 relative overflow-hidden">
                    <div className="w-full h-2 bg-blue-900/30 rounded" />
                    <div className="w-2/3 h-2 bg-slate-800 rounded" />
                    <div className="grid grid-cols-3 gap-1 mt-2">
                       <div className="h-8 bg-blue-500/20 rounded" />
                       <div className="h-8 bg-orange-500/20 rounded" />
                       <div className="h-8 bg-emerald-500/20 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-[#031a6b]'}`}>Tối (Dark)</span>
                    {theme === 'dark' && <span className="material-symbols-outlined text-[#3b82f6] text-lg">check_circle</span>}
                  </div>
                </div>
              </div>

              {/* LANGUAGE SELECTION */}
              <div className="mt-12 pt-10 border-t border-gray-100">
                 <div className="mb-6 text-left">
                   <h3 className="text-lg font-bold text-[#031a6b]">{t('language')}</h3>
                   <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Choose your preferred language</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setLang('VI')}
                     className={`flex items-center justify-between px-6 py-4 rounded-2xl border-2 font-black text-sm transition-all ${
                       lang === 'VI' 
                         ? 'border-[#1151d3] bg-blue-50 text-[#1151d3] shadow-md shadow-blue-500/10' 
                         : 'border-gray-50 text-gray-400 bg-gray-50/30 hover:border-gray-100 hover:text-gray-600'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                        <span className="text-xl">🇻🇳</span>
                        <span>Tiếng Việt</span>
                     </div>
                     {lang === 'VI' && <span className="material-symbols-outlined text-lg">check_circle</span>}
                   </button>

                   <button 
                     onClick={() => setLang('EN')}
                     className={`flex items-center justify-between px-6 py-4 rounded-2xl border-2 font-black text-sm transition-all ${
                       lang === 'EN' 
                         ? 'border-[#1151d3] bg-blue-50 text-[#1151d3] shadow-md shadow-blue-500/10' 
                         : 'border-gray-100 text-gray-100 bg-gray-100/10 hover:border-gray-200 hover:text-gray-400'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                        <span className="text-xl">🇺🇸</span>
                        <span>English</span>
                     </div>
                     {lang === 'EN' && <span className="material-symbols-outlined text-lg">check_circle</span>}
                   </button>
                 </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-3xl text-blue-800 text-xs font-bold flex items-start gap-4 border border-blue-100 shadow-sm shadow-blue-500/5">
                <span className="material-symbols-outlined text-lg">info</span>
                <p className="leading-relaxed text-left">
                  Tất cả các thay đổi về giao diện và ngôn ngữ sẽ được đồng bộ hoá ngay lập tức trên toàn bộ ứng dụng của bạn.
                </p>
              </div>
            </section>
          )}

          {activeTab === 'ACCOUNT' && (
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 overflow-hidden relative">
              <h3 className="text-lg font-bold text-red-600 mb-2">Vùng nguy hiểm</h3>
              <p className="text-sm text-gray-500 mb-6">Các hành động sau không thể hoàn tác.</p>
              
              <button className="px-6 py-2 bg-red-50 text-red-600 border border-red-100 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors">
                Xóa tài khoản
              </button>
            </section>
          )}

          {activeTab === 'NOTI' && (
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
               <h3 className="text-lg font-bold text-[#031a6b] mb-10">{t('notifAndSound')}</h3>

               <div className="space-y-10">
                  <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-50">
                     <div className="space-y-1">
                        <h4 className="text-sm font-black text-[#031a6b] uppercase tracking-tight">{t('enableReminders')}</h4>
                        <p className="text-xs text-gray-400">Nhận thông báo khi tới giờ học tập đã lên lịch.</p>
                     </div>
                     <button 
                        onClick={() => setNotiSettings(prev => ({ ...prev, remindersEnabled: !prev.remindersEnabled }))}
                        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${notiSettings.remindersEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                     >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${notiSettings.remindersEnabled ? 'left-7' : 'left-1'}`} />
                     </button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-blue-50/30 rounded-3xl border border-blue-50/50">
                     <div className="space-y-1">
                        <h4 className="text-sm font-black text-[#1151d3] uppercase tracking-tight">{t('streakRiskWarning')}</h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed max-w-sm">{t('streakWarningDesc')}</p>
                     </div>
                     <button 
                        onClick={() => setNotiSettings(prev => ({ ...prev, streakWarningEnabled: !prev.streakWarningEnabled }))}
                        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${notiSettings.streakWarningEnabled ? 'bg-[#1151d3]' : 'bg-gray-200'}`}
                     >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${notiSettings.streakWarningEnabled ? 'left-7' : 'left-1'}`} />
                     </button>
                  </div>

                  <div className="space-y-6 pt-6">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t('soundType')}</label>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: 'crystal', label: t('crystalSound'), icon: 'auto_awesome' },
                          { id: 'bell', label: t('bellSound'), icon: 'notifications_active' },
                          { id: 'digital', label: t('digitalSound'), icon: 'settings_input_component' }
                        ].map(s => (
                           <button 
                              key={s.id}
                              onClick={() => setNotiSettings(prev => ({ ...prev, notificationSound: s.id }))}
                              className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${
                                 notiSettings.notificationSound === s.id ? 'border-[#1151d3] bg-blue-50/50 shadow-lg shadow-blue-500/5' : 'border-gray-50 bg-gray-50/30 hover:border-gray-100'
                              }`}
                           >
                              <span className={`material-symbols-outlined text-2xl ${notiSettings.notificationSound === s.id ? 'text-[#1151d3]' : 'text-gray-300'}`}>{s.icon}</span>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${notiSettings.notificationSound === s.id ? 'text-[#1151d3]' : 'text-gray-400'}`}>{s.label}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4 pt-6">
                     <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                        <span>{t('notificationVolume')}</span>
                        <span className="text-[#1151d3] tabular-nums">{Math.round(notiSettings.soundVolume * 100)}%</span>
                     </div>
                     <input 
                        type="range" min="0" max="1" step="0.1"
                        value={notiSettings.soundVolume}
                        onChange={(e) => setNotiSettings(prev => ({ ...prev, soundVolume: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-blue-50 rounded-lg appearance-none cursor-pointer accent-[#1151d3]"
                     />
                  </div>
               </div>

               <div className="flex justify-end mt-12">
                  <button 
                    onClick={() => handleSaveSettings('NOTI')}
                    disabled={isUpdating}
                    className="px-10 py-4 bg-[#1151d3] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {isUpdating ? t('saving') || 'Đang lưu...' : t('saveChanges') || 'Lưu thay đổi'}
                  </button>
               </div>
            </section>
          )}

          {activeTab === 'SECURITY' && (
            <div className="py-20 text-center opacity-40">
              <span className="material-symbols-outlined text-5xl mb-4 text-[#031a6b]">security</span>
              <p className="text-sm font-bold text-gray-500 italic">Mục Bảo mật đang trong quá trình nâng cấp.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
