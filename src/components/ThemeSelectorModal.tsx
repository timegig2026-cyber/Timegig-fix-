import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Check, Sparkles } from 'lucide-react';
import { APP_THEMES, ThemeConfig } from '../utils/themes';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  t: (key: string, fallback?: string) => string;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  t
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-white z-[260] flex flex-col"
    >
      <header className="h-16 flex items-center px-6 border-b border-gray-50 bg-white">
        <button 
          onClick={onClose} 
          className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">
          {t('theme.title', 'Theme & Appearance')}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-3 p-4 bg-black/[0.02] rounded-3xl border border-black/5 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-black">Instant Theme Engine</p>
              <p className="text-[12px] font-medium text-black/40">
                Choose a palette. Changes take immediate effect across TimeGiG.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {APP_THEMES.map((theme: ThemeConfig) => {
              const isSelected = currentThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                  }}
                  className={`w-full p-4.5 rounded-3xl border text-left transition-all flex items-center justify-between group active:scale-[0.99] ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-lg'
                      : 'bg-black/[0.02] hover:bg-black/[0.04] text-black border-black/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Theme Swatch */}
                    <div 
                      className="w-12 h-12 rounded-2xl border-2 border-black/10 shadow-sm flex items-center justify-center shrink-0 relative overflow-hidden"
                      style={{ backgroundColor: theme.previewColor }}
                    >
                      <div 
                        className="w-5 h-5 rounded-full shadow-md"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-[15px] font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                          {theme.name}
                        </p>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-extrabold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className={`text-[12px] font-medium mt-0.5 line-clamp-1 ${isSelected ? 'text-white/70' : 'text-black/40'}`}>
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center pl-2">
                    {isSelected ? (
                      <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-black/10 group-hover:border-black/30 transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-6">
            <button
              onClick={onClose}
              className="w-full h-14 bg-black text-white rounded-3xl font-bold uppercase tracking-widest text-[12px] shadow-lg active:scale-95 transition-all"
            >
              {t('common.close', 'Done')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
