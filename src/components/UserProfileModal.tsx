import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Users, Heart, UserPlus, UserCheck, MessageSquare, 
  Phone, MessageCircle, MapPin, Briefcase, ChevronRight, Sparkles 
} from 'lucide-react';
import { CommunityUser, FriendItem, FollowItem } from '../App';

interface UserProfileModalProps {
  user: CommunityUser | null;
  currentUserId?: string;
  isFollowing: boolean;
  friendship?: FriendItem;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  userListings: any[];
  onClose: () => void;
  onToggleFollow: () => void;
  onOpenRelationshipChooser: () => void;
  onStartChat: () => void;
  onViewListing: (listing: any) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  currentUserId,
  isFollowing,
  friendship,
  followersCount,
  followingCount,
  friendsCount,
  userListings,
  onClose,
  onToggleFollow,
  onOpenRelationshipChooser,
  onStartChat,
  onViewListing
}) => {
  if (!user) return null;

  const isSelf = user.id === currentUserId;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-black/5 max-h-[90vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="relative h-36 bg-gradient-to-r from-black/80 to-black/95 flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
            >
              <X size={18} />
            </button>
            <div className="absolute -bottom-10 left-6">
              <div className="relative">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=000000&color=ffffff`}
                  className="w-22 h-22 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
                  alt=""
                />
                {friendship?.category === 'Family' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md">
                    <Heart size={12} className="fill-current" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="pt-12 px-6 pb-6 overflow-y-auto flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[20px] font-black text-black">{user.name || 'Community Member'}</h3>
                  {friendship && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      friendship.category === 'Family' 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {friendship.category}
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-bold text-black/40">
                  {user.title || 'Freelancer / Member on TimeGiG'}
                </p>
              </div>
            </div>

            {(user.location || user.province) && (
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-black/50 mb-4">
                <MapPin size={14} className="text-black/40" />
                <span>{user.location}{user.province ? `, ${user.province}` : ''}</span>
              </div>
            )}

            {user.bio && (
              <p className="text-[13px] text-black/70 font-medium leading-relaxed mb-5 bg-black/[0.02] p-4 rounded-2xl border border-black/[0.03]">
                {user.bio}
              </p>
            )}

            {/* Social Stats */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-black/[0.02] rounded-2xl mb-6 border border-black/[0.03]">
              <div className="text-center">
                <p className="text-[16px] font-black text-black">{friendsCount}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Friends & Family</p>
              </div>
              <div className="text-center border-x border-black/5">
                <p className="text-[16px] font-black text-black">{followingCount}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Following</p>
              </div>
              <div className="text-center">
                <p className="text-[16px] font-black text-black">{followersCount}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Followers</p>
              </div>
            </div>

            {/* Action Buttons */}
            {!isSelf && (
              <div className="space-y-2 mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onOpenRelationshipChooser}
                    className={`h-12 rounded-2xl font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm ${
                      friendship
                        ? (friendship.category === 'Family'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-blue-50 text-blue-600 border border-blue-200')
                        : 'bg-black text-white shadow-md shadow-black/10'
                    }`}
                  >
                    {friendship ? (
                      <>
                        {friendship.category === 'Family' ? <Heart size={15} className="fill-current" /> : <Users size={15} />}
                        <span>{friendship.category}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={15} />
                        <span>Add Connection</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onToggleFollow}
                    className={`h-12 rounded-2xl font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all ${
                      isFollowing
                        ? 'bg-black/[0.05] text-black hover:bg-black/[0.1] border border-black/5'
                        : 'bg-black/[0.03] hover:bg-black/[0.06] text-black border border-black/5'
                    }`}
                  >
                    {isFollowing ? <UserCheck size={15} /> : <Sparkles size={15} />}
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                </div>

                <button
                  onClick={onStartChat}
                  className="w-full h-12 bg-black/[0.03] hover:bg-black/[0.06] text-black rounded-2xl font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 border border-black/5"
                >
                  <MessageSquare size={16} />
                  <span>Send Direct Message</span>
                </button>

                {(user.phone || user.whatsapp) && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {user.phone && (
                      <a
                        href={`tel:${user.phone}`}
                        className="h-11 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-2xl font-bold text-[12px] flex items-center justify-center gap-2 transition-colors border border-emerald-100"
                      >
                        <Phone size={14} />
                        <span>Call</span>
                      </a>
                    )}
                    {user.whatsapp && (
                      <a
                        href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-11 bg-green-50 text-green-700 hover:bg-green-100 rounded-2xl font-bold text-[12px] flex items-center justify-center gap-2 transition-colors border border-green-100"
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User's Posted GiGs and Listings */}
            {userListings.length > 0 && (
              <div className="pt-4 border-t border-black/5">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-black/40 mb-3">
                  GiGs & Listings ({userListings.length})
                </h4>
                <div className="space-y-2">
                  {userListings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => {
                        onClose();
                        onViewListing(listing);
                      }}
                      className="p-3 bg-black/[0.02] hover:bg-black/[0.05] rounded-2xl flex items-center gap-3 cursor-pointer transition-all border border-black/[0.02] group"
                    >
                      {listing.media[0] && (
                        <img
                          src={listing.media[0].url}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          alt=""
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-black truncate group-hover:text-black">{listing.title}</p>
                        <p className="text-[11px] font-bold text-black/40">{listing.price}</p>
                      </div>
                      <ChevronRight size={16} className="text-black/20 group-hover:text-black/40" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
