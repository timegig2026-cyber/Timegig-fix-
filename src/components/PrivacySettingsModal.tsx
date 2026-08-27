import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Eye, 
  Phone, 
  Activity, 
  CheckCircle2, 
  MessageSquare, 
  Share2,
  Lock,
  Globe,
  Users
} from 'lucide-react';

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  contactVisibility: 'everyone' | 'friends' | 'only_me';
  showOnlineStatus: boolean;
  showReadReceipts: boolean;
  messagePermission: 'everyone' | 'friends';
  allowGigSharing: boolean;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'public',
  contactVisibility: 'everyone',
  showOnlineStatus: true,
  showReadReceipts: true,
  messagePermission: 'everyone',
  allowGigSharing: true
};

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings?: Partial<PrivacySettings>;
  onSave: (newSettings: PrivacySettings) => Promise<void>;
  t: (key: string, fallback?: string) => string;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
  t
}) => {
  const [settings, setSettings] = useState<PrivacySettings>({
    ...DEFAULT_PRIVACY_SETTINGS,
    ...currentSettings
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: 'showOnlineStatus' | 'showReadReceipts' | 'allowGigSharing') => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to save privacy settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

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
          {t('privacy.title', 'Privacy & Security')}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header info */}
          <div className="flex items-center gap-3.5 p-4 bg-black/[0.02] rounded-3xl border border-black/5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-black">Your Privacy Matters</p>
              <p className="text-[12px] font-medium text-black/40">
                Control how you appear and who can contact you on TimeGiG.
              </p>
            </div>
          </div>

          {/* Profile Visibility */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Eye size={16} className="text-black/40" />
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/40">
                {t('privacy.profile_visibility', 'Profile Visibility')}
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'public', label: 'Public', icon: Globe, desc: 'Everyone' },
                { id: 'friends', label: 'Connections', icon: Users, desc: 'Friends only' },
                { id: 'private', label: 'Private', icon: Lock, desc: 'Hidden' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, profileVisibility: opt.id as any }))}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    settings.profileVisibility === opt.id
                      ? 'bg-black text-white border-black shadow-md'
                      : 'bg-black/[0.02] hover:bg-black/[0.04] text-black border-black/5'
                  }`}
                >
                  <opt.icon size={16} className={settings.profileVisibility === opt.id ? 'text-white' : 'text-black/50'} />
                  <span className="text-[12px] font-bold mt-1">{opt.label}</span>
                  <span className={`text-[9px] font-medium ${settings.profileVisibility === opt.id ? 'text-white/60' : 'text-black/30'}`}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Visibility */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Phone size={16} className="text-black/40" />
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/40">
                {t('privacy.contact_visibility', 'Phone & WhatsApp Visibility')}
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'everyone', label: 'Everyone' },
                { id: 'friends', label: 'Friends' },
                { id: 'only_me', label: 'Only Me' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, contactVisibility: opt.id as any }))}
                  className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                    settings.contactVisibility === opt.id
                      ? 'bg-black text-white border-black font-bold shadow-sm'
                      : 'bg-black/[0.02] hover:bg-black/[0.04] text-black/70 border-black/5 font-semibold text-[12px]'
                  }`}
                >
                  <span className="text-[12px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles Group */}
          <div className="space-y-2 pt-2">
            {/* Show Online Status */}
            <div className="flex items-center justify-between p-4 bg-black/[0.02] hover:bg-black/[0.04] rounded-3xl border border-black/5 transition-all">
              <div className="flex items-center gap-3.5 pr-2">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-black shadow-sm">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-black">{t('privacy.online_status', 'Show Online Status')}</p>
                  <p className="text-[11px] text-black/40 font-medium">Let others see when you are active</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('showOnlineStatus')}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  settings.showOnlineStatus ? 'bg-black' : 'bg-black/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    settings.showOnlineStatus ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Read Receipts */}
            <div className="flex items-center justify-between p-4 bg-black/[0.02] hover:bg-black/[0.04] rounded-3xl border border-black/5 transition-all">
              <div className="flex items-center gap-3.5 pr-2">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-black shadow-sm">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-black">{t('privacy.read_receipts', 'Read Receipts')}</p>
                  <p className="text-[11px] text-black/40 font-medium">Show blue checks when messages are read</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('showReadReceipts')}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  settings.showReadReceipts ? 'bg-black' : 'bg-black/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    settings.showReadReceipts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Direct Messaging */}
            <div className="flex items-center justify-between p-4 bg-black/[0.02] hover:bg-black/[0.04] rounded-3xl border border-black/5 transition-all">
              <div className="flex items-center gap-3.5 pr-2">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-black shadow-sm">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-black">{t('privacy.messaging', 'Direct Messaging')}</p>
                  <p className="text-[11px] text-black/40 font-medium">
                    {settings.messagePermission === 'everyone' ? 'Anyone can message you' : 'Only Friends & Family'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ 
                  ...prev, 
                  messagePermission: prev.messagePermission === 'everyone' ? 'friends' : 'everyone' 
                }))}
                className="px-3 py-1.5 bg-white text-black text-[11px] font-bold rounded-xl border border-black/5 shadow-sm active:scale-95 transition-all"
              >
                {settings.messagePermission === 'everyone' ? 'Everyone' : 'Friends'}
              </button>
            </div>

            {/* Allow GiG Sharing */}
            <div className="flex items-center justify-between p-4 bg-black/[0.02] hover:bg-black/[0.04] rounded-3xl border border-black/5 transition-all">
              <div className="flex items-center gap-3.5 pr-2">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-black shadow-sm">
                  <Share2 size={18} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-black">Allow GiG Sharing</p>
                  <p className="text-[11px] text-black/40 font-medium">Let community members share your listings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('allowGigSharing')}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  settings.allowGigSharing ? 'bg-black' : 'bg-black/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    settings.allowGigSharing ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 pb-8">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full h-15 rounded-3xl font-bold uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 transition-all shadow-xl ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black text-white active:scale-98 shadow-black/10'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Saved</span>
                </>
              ) : isSaving ? (
                <span>Saving...</span>
              ) : (
                <span>{t('profile.save_changes', 'Save Privacy Settings')}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
