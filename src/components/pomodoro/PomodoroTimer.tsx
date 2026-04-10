'use client';

import { useState, useEffect, useRef } from 'react';
import { Subject } from '@prisma/client';
import { useLanguage } from '@/components/LanguageProvider';
import { updateUserSettings } from '@/lib/actions/user-settings';

interface PomodoroTimerProps {
  subjects: { id: string; name: string; colorCode: string }[];
  onSessionComplete?: (session: { mode: Mode, minutes: number, subjectId: string | null, title?: string | null }) => void;
  userSettings?: {
    pomoWorkMin: number;
    pomoShortBreakMin: number;
    pomoLongBreakMin: number;
    pomoInterval: number;
    remindersEnabled: boolean;
    notificationSound: string;
    soundVolume: number;
    streakWarningEnabled: boolean;
  };
}

type Mode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

const SOUNDS: Record<string, string> = {
  crystal: 'https://cdn.pixabay.com/audio/2021/08/04/audio_062141505c.mp3',
  bell: 'https://cdn.pixabay.com/audio/2024/09/27/audio_d0ab8a93a6.mp3',
  digital: 'https://cdn.pixabay.com/audio/2022/03/15/audio_78ec791d29.mp3',
};

export default function PomodoroTimer({ subjects, onSessionComplete, userSettings }: PomodoroTimerProps) {
  const { t } = useLanguage();

  const MODES_CONFIG = {
    FOCUS: { label: t('modeFocus'), defaultTime: userSettings?.pomoWorkMin || 25 },
    SHORT_BREAK: { label: t('modeShortBreak'), defaultTime: userSettings?.pomoShortBreakMin || 5 },
    LONG_BREAK: { label: t('modeLongBreak'), defaultTime: userSettings?.pomoLongBreakMin || 15 },
  };

  const [customTimes, setCustomTimes] = useState({
    FOCUS: userSettings?.pomoWorkMin || 25,
    SHORT_BREAK: userSettings?.pomoShortBreakMin || 5,
    LONG_BREAK: userSettings?.pomoLongBreakMin || 15
  });
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<Mode>('FOCUS');
  const [timeLeft, setTimeLeft] = useState((userSettings?.pomoWorkMin || 25) * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionCount, setSessionCount] = useState(0); // Count how many focus sessions completed
  const [isLoaded, setIsLoaded] = useState(false);

  const hasCompletedRef = useRef(false);
  const STORAGE_KEY = 'clanny_pomo_v3';

  // 1. Initial Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.mode) setMode(state.mode);
        if (state.customTimes) setCustomTimes(state.customTimes);
        if (state.subjectId) setSelectedSubjectId(state.subjectId);
        if (state.title) setSessionTitle(state.title);
        if (state.sessionCount !== undefined) setSessionCount(state.sessionCount);

        if (state.isActive && state.endTime) {
          const now = Date.now();
          const remaining = Math.round((state.endTime - now) / 1000);
          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsActive(true);
          } else {
            setTimeLeft(0);
            setIsActive(false);
          }
        } else if (state.timeLeft !== undefined) {
          setTimeLeft(state.timeLeft);
        } else {
          const defaultMin = state.customTimes?.[state.mode || 'FOCUS'] || userSettings?.pomoWorkMin || 25;
          setTimeLeft(defaultMin * 60);
        }
      } catch (e) {
        console.error('Pomo Load Error:', e);
      }
    }
    setIsLoaded(true);
  }, [userSettings]);

  // 2. Save on Change (Post-Load only)
  useEffect(() => {
    if (!isLoaded) return;

    const endTime = isActive ? Date.now() + (timeLeft * 1000) : null;
    const state = {
      mode,
      customTimes,
      timeLeft,
      isActive,
      endTime,
      subjectId: selectedSubjectId,
      title: sessionTitle,
      sessionCount
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [mode, timeLeft, isActive, selectedSubjectId, customTimes, isLoaded, sessionTitle, sessionCount]);

  // Reset completion guard when starting a new session
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      hasCompletedRef.current = false;
    }
  }, [isActive, timeLeft]);

  // 3. Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    if (timeLeft === 0 && isActive && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const playNotificationSound = () => {
    if (!userSettings?.notificationSound || userSettings.notificationSound === 'none') return;
    try {
      const soundUrl = SOUNDS[userSettings.notificationSound] || SOUNDS.crystal;
      const audio = new Audio(soundUrl);
      audio.volume = userSettings.soundVolume || 0.5;
      audio.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    playNotificationSound();

    // Logic for next mode
    let nextMode: Mode = 'SHORT_BREAK';
    let nextSessionCount = sessionCount;

    if (mode === 'FOCUS') {
      nextSessionCount += 1;
      setSessionCount(nextSessionCount);

      const interval = userSettings?.pomoInterval || 4;
      if (nextSessionCount % interval === 0) {
        nextMode = 'LONG_BREAK';
      } else {
        nextMode = 'SHORT_BREAK';
      }
    } else {
      nextMode = 'FOCUS';
    }

    const resetTime = customTimes[mode] * 60;
    setTimeLeft(resetTime); // Reset current timer, but usually we auto-switch

    // Auto-switch to next mode
    setMode(nextMode);
    setTimeLeft(customTimes[nextMode] * 60);

    if (onSessionComplete) {
      onSessionComplete({
        mode,
        minutes: customTimes[mode],
        subjectId: selectedSubjectId,
        title: sessionTitle || null
      });
    }
    // Clear title after focus session complete
    if (mode === 'FOCUS') setSessionTitle('');
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (newMode: Mode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(customTimes[newMode] * 60);
    hasCompletedRef.current = false;
  };

  const updateCustomTime = (targetMode: Mode, minutes: number) => {
    const newTimes = { ...customTimes, [targetMode]: minutes };
    setCustomTimes(newTimes);
    if (!isActive && mode === targetMode) {
      setTimeLeft(minutes * 60);
    }
  };

  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [globalNotiSettings, setGlobalNotiSettings] = useState({
    notificationSound: userSettings?.notificationSound || 'crystal',
    soundVolume: userSettings?.soundVolume || 0.5,
  });

  // Sync state if userSettings change
  useEffect(() => {
    if (userSettings) {
      setCustomTimes({
        FOCUS: userSettings.pomoWorkMin,
        SHORT_BREAK: userSettings.pomoShortBreakMin,
        LONG_BREAK: userSettings.pomoLongBreakMin,
      });
      setGlobalNotiSettings({
        notificationSound: userSettings.notificationSound,
        soundVolume: userSettings.soundVolume,
      });
    }
  }, [userSettings]);

  const handleSaveGlobalSettings = async () => {
    setIsUpdatingSettings(true);
    try {
      await updateUserSettings({
        pomoWorkMin: customTimes.FOCUS,
        pomoShortBreakMin: customTimes.SHORT_BREAK,
        pomoLongBreakMin: customTimes.LONG_BREAK,
        pomoInterval: userSettings?.pomoInterval || 4,
        notificationSound: globalNotiSettings.notificationSound,
        soundVolume: globalNotiSettings.soundVolume,
      });
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const playPreviewSound = (soundId: string) => {
    try {
      const audio = new Audio(SOUNDS[soundId]);
      audio.volume = globalNotiSettings.soundVolume;
      audio.play();
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((customTimes[mode] * 60 - timeLeft) / (customTimes[mode] * 60)) * 100;

  return (
    <div className="bg-white dark:bg-[#0f172a] p-12 rounded-[3rem] shadow-[0_40px_100px_rgba(3,26,107,0.04)] dark:shadow-none border border-gray-50 dark:border-gray-800 space-y-10 relative overflow-hidden">
      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 bg-white/95 dark:bg-[#0f172a]/fb backdrop-blur-md z-50 p-12 overflow-y-auto animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-[#031a6b] dark:text-white tracking-tight">{t('pomoSettings')}</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-[#031a6b] dark:hover:text-white transition-all"
            >
              <span className="material-symbols-outlined font-black">close</span>
            </button>
          </div>

          <div className="space-y-10 pb-10">
            <div className="space-y-6">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('timerConfiguration') || 'Cấu hình thời gian'}</label>
              {(Object.keys(MODES_CONFIG) as Mode[]).map(m => (
                <div key={m} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>{MODES_CONFIG[m].label}</span>
                    <span className="text-[#1151d3] font-black">{customTimes[m]} {t('minute')}</span>
                  </div>
                  <input
                    type="range" min="1" max="60"
                    value={customTimes[m]}
                    onChange={(e) => updateCustomTime(m, parseInt(e.target.value))}
                    className="w-full h-2 bg-blue-50 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#1151d3]"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-6 pt-6 border-t border-gray-50">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('soundType')}</label>
              <div className="grid grid-cols-3 gap-3">
                {['crystal', 'bell', 'digital'].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setGlobalNotiSettings(prev => ({ ...prev, notificationSound: s }));
                      playPreviewSound(s);
                    }}
                    className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-tight transition-all border-2 ${globalNotiSettings.notificationSound === s ? 'border-[#1151d3] bg-blue-50 text-[#1151d3]' : 'border-gray-50 text-gray-400'
                      }`}
                  >
                    {t(`${s}Sound` as any) || s}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span>{t('notificationVolume')}</span>
                  <span>{Math.round(globalNotiSettings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.1"
                  value={globalNotiSettings.soundVolume}
                  onChange={(e) => setGlobalNotiSettings(prev => ({ ...prev, soundVolume: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-blue-50 rounded-lg appearance-none cursor-pointer accent-[#1151d3]"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleSaveGlobalSettings}
              disabled={isUpdatingSettings}
              className="w-full py-4 bg-[#031a6b] dark:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isUpdatingSettings ? t('saving') || 'Đang lưu...' : t('saveChanges') || 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex items-center gap-4">
        <div className="flex-1 flex justify-center gap-2 p-1.5 bg-gray-50 rounded-2xl">
          {(Object.keys(MODES_CONFIG) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => resetTimer(m)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m
                  ? 'bg-white dark:bg-[#1e293b] text-[#1151d3] shadow-sm shadow-blue-100/50 dark:shadow-none'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
            >
              {MODES_CONFIG[m].label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#1e293b] flex items-center justify-center text-gray-300 hover:text-[#1151d3] hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all"
        >
          <span className="material-symbols-outlined font-black">settings</span>
        </button>
      </div>

      {/* Session Title Input */}
      {mode === 'FOCUS' && (
        <div className="relative group/input">
          <input
            type="text"
            placeholder={t('timerPlaceholder')}
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            className="w-full text-center bg-gray-50 dark:bg-[#1e293b] border-none rounded-2xl py-4 px-6 text-sm font-bold text-[#031a6b] dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within/input:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-sm text-blue-400">edit</span>
          </div>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="relative flex justify-center py-4">
        <div className="relative w-80 h-80 flex items-center justify-center">
          <svg className="absolute w-full h-full -rotate-90 transform">
            <circle
              cx="160"
              cy="160"
              r="150"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-50 dark:text-gray-800"
            />
            <circle
              cx="160"
              cy="160"
              r="150"
              fill="transparent"
              stroke="url(#timerGradient)"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 150}
              strokeDashoffset={2 * Math.PI * 150 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1151d3" />
                <stop offset="100%" stopColor="#031a6b" />
              </linearGradient>
            </defs>
          </svg>

          <div className="text-center z-10">
            <div className="text-8xl font-black text-[#031a6b] dark:text-white tracking-tighter tabular-nums drop-shadow-sm">
              {formatTime(timeLeft)}
            </div>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/40 rounded-full">
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
              <span className="text-[9px] font-black text-blue-500 dark:text-blue-300 uppercase tracking-widest leading-none">
                {isActive ? t('timerRunning') : t('timerPaused')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-6">
        <button
          onClick={toggleTimer}
          className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all active:scale-90 shadow-2xl ${isActive
              ? 'bg-white dark:bg-[#1e293b] text-orange-500 border-2 border-orange-100 dark:border-orange-900/30'
              : 'bg-[#1151d3] text-white shadow-blue-200 dark:shadow-none'
            }`}
        >
          <span className="material-symbols-outlined text-4xl font-black">
            {isActive ? 'pause' : 'play_arrow'}
          </span>
        </button>
        <button
          onClick={() => resetTimer(mode)}
          className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-[#1e293b] text-gray-400 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl">refresh</span>
        </button>
      </div>

      {/* Subject Selection */}
      <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t('associateSubject')}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {subjects.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(selectedSubjectId === s.id ? null : s.id)}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-2 border-2 ${selectedSubjectId === s.id
                  ? 'bg-blue-50/50 dark:bg-blue-900/40 border-[#1151d3] text-[#1151d3] shadow-sm'
                  : 'bg-white dark:bg-[#1e293b] border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.colorCode }}></span>
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
