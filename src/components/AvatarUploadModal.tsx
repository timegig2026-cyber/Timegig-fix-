import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Upload, 
  Camera, 
  Check, 
  Trash2 
} from 'lucide-react';
import { compressImageToDataUrl } from '../utils/imageCompressor';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  userName?: string;
  onSaveAvatar: (avatarUrl: string) => Promise<void> | void;
  t: (key: string, fallback?: string) => string;
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  userName = 'User',
  onSaveAvatar,
  t
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessing(true);
      const dataUrl = await compressImageToDataUrl(file, 400, 0.85);
      setSelectedAvatar(dataUrl);
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      await onSaveAvatar(selectedAvatar);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetToDefault = () => {
    const defaultUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=000000&color=ffffff&size=200`;
    setSelectedAvatar(defaultUrl);
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-white z-[270] flex flex-col"
    >
      <header className="h-16 flex items-center px-6 border-b border-gray-50 bg-white">
        <button 
          onClick={onClose} 
          className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">
          {t('profile.upload_avatar', 'Profile Photo')}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col justify-between">
        <div className="max-w-sm mx-auto w-full flex flex-col items-center space-y-8 my-auto">
          {/* Avatar Preview Section */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative mb-4 cursor-pointer group"
              title="Tap to select photo"
            >
              <img
                src={selectedAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=000000&color=ffffff`}
                alt="Avatar Preview"
                className="w-36 h-36 rounded-[44px] object-cover shadow-2xl border-4 border-white bg-black/5 group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute -bottom-2 -right-2 bg-black text-white p-3 rounded-2xl shadow-xl group-hover:scale-110 active:scale-95 transition-transform">
                <Camera size={20} />
              </div>
            </div>
            <h3 className="text-[18px] font-bold text-black mt-2">{userName}</h3>
            <p className="text-[12px] font-medium text-black/40">Tap photo to select from your gallery or camera</p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Direct Actions */}
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-14 bg-black/[0.04] hover:bg-black/[0.08] active:scale-98 text-black rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2.5 transition-all border border-black/5"
            >
              <Upload size={18} />
              <span>Select Photo</span>
            </button>

            {selectedAvatar && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="w-full h-11 text-black/40 hover:text-red-500 active:scale-98 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} />
                <span>Reset to Default Monogram</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="max-w-sm mx-auto w-full pt-6 pb-4 space-y-2.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="w-full h-15 bg-black text-white rounded-3xl font-bold uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-98 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Updating Photo...</span>
            ) : (
              <>
                <Check size={18} />
                <span>{t('profile.save_changes', 'Apply Photo')}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 text-black/40 hover:text-black text-[13px] font-bold transition-colors"
          >
            {t('common.cancel', 'Cancel')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
