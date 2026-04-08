'use client';

import { useLanguage } from '../LanguageProvider';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4 animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] gap-2 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isAssistant ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {isAssistant ? 'smart_toy' : 'person'}
          </span>
        </div>
        
        <div className={`p-4 rounded-2xl shadow-sm border ${
          isAssistant 
            ? 'bg-white border-gray-100 text-gray-800 rounded-tl-none' 
            : 'bg-indigo-600 border-indigo-700 text-white rounded-tr-none'
        }`}>
          <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}
