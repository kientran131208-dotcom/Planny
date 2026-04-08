"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGoal } from "@/lib/actions/goals";
import PlannyDatePicker from "@/components/ui/PlannyDatePicker";
import { useLanguage } from "@/components/LanguageProvider";

interface AddGoalModalProps {
  onClose: () => void;
}

export default function AddGoalModal({ onClose }: AddGoalModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    setIsSubmitting(true);
    const result = await createGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: new Date(deadline),
    });

    setIsSubmitting(false);
    if (result.success) {
      router.refresh();
      onClose();
    } else {
      alert(t('errorCreatingGoal'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <h2 className="text-2xl font-black text-[#031a6b] mb-6">{t('addNewGoalTitle')}</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#031a6b] mb-2 uppercase tracking-widest">{t('goalTitleLabel')}</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#f8faff] border border-gray-200 focus:border-[#1151d3] focus:ring-2 focus:ring-[#1151d3]/20 rounded-xl outline-none font-medium transition-all"
              placeholder={t('goalTitlePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#031a6b] mb-2 uppercase tracking-widest">{t('descriptionOptional')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-[#f8faff] border border-gray-200 focus:border-[#1151d3] focus:ring-2 focus:ring-[#1151d3]/20 rounded-xl outline-none font-medium transition-all resize-none"
              placeholder={t('goalDescPlaceholder')}
            />
          </div>

          <PlannyDatePicker 
            label={t('deadlineLabel')}
            date={deadline || new Date().toISOString().split('T')[0]}
            onChange={setDeadline}
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1151d3] hover:bg-[#0c40ad] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-[#1151d3]/30 hover:scale-[1.02] transform transition-all active:scale-95"
            >
              {isSubmitting ? t('savingLabelGoal') : t('createGoalBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
