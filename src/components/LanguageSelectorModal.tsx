import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Search, Check, Globe, Sparkles, X } from 'lucide-react';
import { WORLD_LANGUAGES, LanguageOption } from '../i18n/languages';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguageCode: string;
  onSelectLanguage: (lang: LanguageOption) => void;
  t: (key: string, fallback?: string) => string;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLanguageCode,
  onSelectLanguage,
  t
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return WORLD_LANGUAGES;
    const q = searchQuery.toLowerCase();
    return WORLD_LANGUAGES.filter(lang => 
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

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
          {t('lang.title', 'App Language')}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-md mx-auto space-y-5">
          {/* Header Banner */}
          <div className="flex items-center gap-3.5 p-4 bg-black/[0.02] rounded-3xl border border-black/5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Globe size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[14px] font-bold text-black">Worldwide Languages</p>
                <Sparkles size={13} className="text-amber-500" />
              </div>
              <p className="text-[12px] font-medium text-black/40">
                {t('lang.immediate_desc', 'Language takes immediate effect across the app.')}
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('lang.search_placeholder', 'Search language or country...')}
              className="w-full h-13 pl-11 pr-10 bg-black/[0.02] border border-black/5 rounded-2xl text-[14px] font-bold placeholder:text-black/30 focus:bg-black/[0.04] focus:ring-0 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Language List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-black/30 px-1">
              Available Languages ({filteredLanguages.length})
            </span>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {filteredLanguages.map((lang) => {
                const isSelected = currentLanguageCode.toLowerCase() === lang.code.toLowerCase();
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onSelectLanguage(lang);
                      onClose();
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group active:scale-[0.99] ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-md'
                        : 'bg-black/[0.02] hover:bg-black/[0.04] text-black border-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl select-none" role="img" aria-label={lang.name}>
                        {lang.flag}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-[15px] font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                            {lang.nativeName}
                          </p>
                          {lang.rtl && (
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-black/40'
                            }`}>
                              RTL
                            </span>
                          )}
                        </div>
                        <p className={`text-[12px] font-medium ${isSelected ? 'text-white/70' : 'text-black/40'}`}>
                          {lang.name}
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
                        <Check size={15} strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-black/20 uppercase tracking-wider group-hover:text-black/40">
                        {lang.code.toUpperCase()}
                      </span>
                    )}
                  </button>
                );
              })}

              {filteredLanguages.length === 0 && (
                <div className="p-8 text-center bg-black/[0.02] rounded-3xl border border-black/5">
                  <p className="text-[14px] font-bold text-black/40">No matching languages found</p>
                  <p className="text-[12px] text-black/30 mt-1">Try typing another language name</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
