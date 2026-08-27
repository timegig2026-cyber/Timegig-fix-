import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Users, Check, Trash2 } from 'lucide-react';
import { CommunityUser } from '../App';

interface RelationshipChooserModalProps {
  targetUser: CommunityUser | null;
  currentCategory?: 'Friend' | 'Family' | null;
  onClose: () => void;
  onSelectCategory: (category: 'Friend' | 'Family') => void;
  onRemoveFriend?: () => void;
}

export const RelationshipChooserModal: React.FC<RelationshipChooserModalProps> = ({
  targetUser,
  currentCategory,
  onClose,
  onSelectCategory,
  onRemoveFriend
}) => {
  if (!targetUser) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[320] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-white rounded-[36px] shadow-2xl p-6 border border-black/5 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-black/50">Add to Connections</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/40 hover:text-black transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3.5 p-3 bg-black/[0.02] rounded-2xl mb-6">
            <img 
              src={targetUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.name || 'User')}&background=000000&color=ffffff`} 
              className="w-12 h-12 rounded-2xl object-cover border border-black/5"
              alt=""
            />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-black truncate">{targetUser.name}</p>
              <p className="text-[12px] font-medium text-black/40 truncate">{targetUser.title || targetUser.location || 'TimeGiG Member'}</p>
            </div>
          </div>

          <p className="text-[13px] font-medium text-black/60 mb-4 px-1">
            Choose how you want to connect with <strong className="text-black">{targetUser.name}</strong>:
          </p>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => onSelectCategory('Friend')}
              className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all text-left group ${
                currentCategory === 'Friend' 
                  ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                  : 'bg-black/[0.02] hover:bg-black/[0.05] border-black/5 text-black'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  currentCategory === 'Friend' ? 'bg-white/20 text-white' : 'bg-white text-black shadow-sm'
                }`}>
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[15px] font-bold">Friend</p>
                  <p className={`text-[11px] ${currentCategory === 'Friend' ? 'text-white/70' : 'text-black/40'}`}>
                    Colleague, client, partner or social connection
                  </p>
                </div>
              </div>
              {currentCategory === 'Friend' && <Check size={18} />}
            </button>

            <button
              onClick={() => onSelectCategory('Family')}
              className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all text-left group ${
                currentCategory === 'Family' 
                  ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                  : 'bg-black/[0.02] hover:bg-black/[0.05] border-black/5 text-black'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  currentCategory === 'Family' ? 'bg-white/20 text-white' : 'bg-white text-rose-500 shadow-sm'
                }`}>
                  <Heart size={20} className="fill-current" />
                </div>
                <div>
                  <p className="text-[15px] font-bold">Family</p>
                  <p className={`text-[11px] ${currentCategory === 'Family' ? 'text-white/70' : 'text-black/40'}`}>
                    Relative, household or close family member
                  </p>
                </div>
              </div>
              {currentCategory === 'Family' && <Check size={18} />}
            </button>
          </div>

          {currentCategory && onRemoveFriend && (
            <button
              onClick={onRemoveFriend}
              className="w-full py-3 px-4 text-red-500 hover:bg-red-50 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 transition-colors mb-2"
            >
              <Trash2 size={16} />
              <span>Remove Connection</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-black/[0.03] hover:bg-black/[0.06] text-black rounded-2xl font-bold text-[13px] transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
