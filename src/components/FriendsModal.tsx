import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Search, Users, Heart, UserPlus, UserCheck, 
  MessageSquare, UserMinus, Sparkles, MapPin, Briefcase, X 
} from 'lucide-react';
import { CommunityUser, FriendItem, FollowItem } from '../App';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'all' | 'friends' | 'family' | 'following' | 'followers' | 'find';
  setActiveTab: (tab: 'all' | 'friends' | 'family' | 'following' | 'followers' | 'find') => void;
  currentUserId?: string;
  friends: FriendItem[];
  following: FollowItem[];
  followers: FollowItem[];
  allUsers: CommunityUser[];
  onViewUser: (user: CommunityUser) => void;
  onToggleFollow: (user: CommunityUser) => void;
  onOpenRelationshipChooser: (user: CommunityUser) => void;
  onRemoveFriend: (userId: string) => void;
  onStartChat: (user: CommunityUser) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  currentUserId,
  friends,
  following,
  followers,
  allUsers,
  onViewUser,
  onToggleFollow,
  onOpenRelationshipChooser,
  onRemoveFriend,
  onStartChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const myFriends = friends;
  const myFriendsOnly = myFriends.filter(f => f.category === 'Friend');
  const myFamilyOnly = myFriends.filter(f => f.category === 'Family');

  // Filtered friends list
  const filteredFriends = myFriends.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.friendName?.toLowerCase().includes(q) ||
      f.friendTitle?.toLowerCase().includes(q) ||
      f.friendLocation?.toLowerCase().includes(q)
    );
  });

  // Filtered following list
  const filteredFollowing = following.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.followingName?.toLowerCase().includes(q) ||
      f.followingTitle?.toLowerCase().includes(q) ||
      f.followingLocation?.toLowerCase().includes(q)
    );
  });

  // Filtered followers list
  const filteredFollowers = followers.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.followingName?.toLowerCase().includes(q) ||
      f.followingTitle?.toLowerCase().includes(q) ||
      f.followingLocation?.toLowerCase().includes(q)
    );
  });

  // Find people (all users excluding current user)
  const discoverUsers = allUsers.filter(u => {
    if (u.id === currentUserId) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.title?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q) ||
      u.province?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const getIsFollowing = (userId: string) => {
    return following.some(f => f.followingId === userId);
  };

  const getFriendship = (userId: string) => {
    return friends.find(f => f.friendId === userId);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 bg-white z-[130] flex flex-col"
      >
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <button 
            onClick={onClose} 
            className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h2 className="text-[14px] font-bold tracking-[0.2em] uppercase">Friends & Family</h2>
            <p className="text-[10px] font-bold text-black/30 tracking-widest uppercase">
              {myFriends.length} Connected • {following.length} Following
            </p>
          </div>
          <div className="w-8" />
        </header>

        {/* Search Bar */}
        <div className="px-6 pt-4 pb-2 bg-white">
          <div className="max-w-md mx-auto relative flex items-center bg-black/[0.03] rounded-2xl border border-black/5 focus-within:border-black/20 transition-all">
            <Search size={18} className="text-black/30 ml-4 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, profession or city..."
              className="w-full h-12 pl-3 pr-10 bg-transparent border-none text-[14px] font-medium outline-none focus:ring-0 placeholder:text-black/30"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-black/30 hover:text-black"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="px-6 py-2 border-b border-black/[0.03] bg-white">
          <div className="max-w-md mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
            {[
              { id: 'all', label: 'Friends & Family', count: myFriends.length, icon: Users },
              { id: 'following', label: 'Following', count: following.length, icon: UserCheck },
              { id: 'followers', label: 'Followers', count: followers.length, icon: Sparkles },
              { id: 'find', label: 'Find People', count: discoverUsers.length, icon: UserPlus },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[12px] font-bold transition-all whitespace-nowrap active:scale-95 ${
                  activeTab === tab.id || (activeTab === 'friends' && tab.id === 'all') || (activeTab === 'family' && tab.id === 'all')
                    ? 'bg-black text-white shadow-md shadow-black/10'
                    : 'bg-black/[0.02] hover:bg-black/[0.05] text-black/60'
                }`}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === tab.id || (activeTab === 'friends' && tab.id === 'all') || (activeTab === 'family' && tab.id === 'all')
                    ? 'bg-white/20 text-white'
                    : 'bg-black/10 text-black/70'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content List */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
          <div className="max-w-md mx-auto space-y-3">
            
            {/* Friends & Family List */}
            {(activeTab === 'all' || activeTab === 'friends' || activeTab === 'family') && (
              <>
                {filteredFriends.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-3xl bg-black/[0.03] flex items-center justify-center text-black/20 mb-4">
                      <Users size={32} />
                    </div>
                    <h3 className="text-[16px] font-bold text-black mb-1">
                      {searchQuery ? 'No matching connections' : 'No connections yet'}
                    </h3>
                    <p className="text-[13px] text-black/40 max-w-xs mb-6 font-medium">
                      {searchQuery 
                        ? 'Try searching with another name or location.' 
                        : 'Discover community members, freelancers, and clients on TimeGiG and add them to your circle.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('find')}
                      className="px-6 py-3 bg-black text-white rounded-2xl text-[12px] font-bold uppercase tracking-wider hover:bg-black/80 transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                    >
                      <UserPlus size={16} />
                      <span>Find People</span>
                    </button>
                  </div>
                ) : (
                  filteredFriends.map((item) => {
                    const isFollowing = getIsFollowing(item.friendId);
                    const userObj: CommunityUser = {
                      id: item.friendId,
                      name: item.friendName,
                      email: item.friendEmail,
                      avatar: item.friendAvatar,
                      title: item.friendTitle,
                      location: item.friendLocation
                    };

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-black/[0.02] hover:bg-black/[0.04] border border-black/[0.03] rounded-3xl transition-all"
                      >
                        <div className="flex items-center gap-3.5">
                          <div 
                            onClick={() => onViewUser(userObj)}
                            className="relative cursor-pointer group"
                          >
                            <img 
                              src={item.friendAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.friendName)}&background=000000&color=ffffff`}
                              className="w-13 h-13 rounded-2xl object-cover border border-black/5 group-hover:scale-105 transition-transform"
                              alt=""
                            />
                            {item.category === 'Family' && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                                <Heart size={10} className="fill-current" />
                              </div>
                            )}
                          </div>

                          <div 
                            onClick={() => onViewUser(userObj)}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="text-[15px] font-bold text-black truncate">{item.friendName}</h4>
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider ${
                                item.category === 'Family' 
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                  : 'bg-blue-50 text-blue-600 border border-blue-100'
                              }`}>
                                {item.category}
                              </span>
                            </div>
                            <p className="text-[12px] font-medium text-black/40 truncate">
                              {item.friendTitle || item.friendLocation || 'TimeGiG Member'}
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onStartChat(userObj)}
                              title="Send Message"
                              className="w-10 h-10 rounded-2xl bg-white hover:bg-black hover:text-white text-black flex items-center justify-center transition-all shadow-sm border border-black/5 active:scale-95"
                            >
                              <MessageSquare size={17} />
                            </button>

                            <button
                              onClick={() => onOpenRelationshipChooser(userObj)}
                              title="Edit relationship category"
                              className="px-3 py-2 rounded-2xl bg-white hover:bg-black/5 text-black/70 text-[11px] font-bold border border-black/5 shadow-sm active:scale-95 transition-all"
                            >
                              {item.category}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </>
            )}

            {/* Following List */}
            {activeTab === 'following' && (
              <>
                {filteredFollowing.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-3xl bg-black/[0.03] flex items-center justify-center text-black/20 mb-4">
                      <UserCheck size={32} />
                    </div>
                    <h3 className="text-[16px] font-bold text-black mb-1">Not following anyone yet</h3>
                    <p className="text-[13px] text-black/40 max-w-xs mb-6 font-medium">
                      Follow creators, freelancers, and sellers to get updates on their new listings and posts.
                    </p>
                    <button
                      onClick={() => setActiveTab('find')}
                      className="px-6 py-3 bg-black text-white rounded-2xl text-[12px] font-bold uppercase tracking-wider hover:bg-black/80 transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                    >
                      <UserPlus size={16} />
                      <span>Find People</span>
                    </button>
                  </div>
                ) : (
                  filteredFollowing.map((item) => {
                    const userObj: CommunityUser = {
                      id: item.followingId,
                      name: item.followingName,
                      avatar: item.followingAvatar,
                      title: item.followingTitle,
                      location: item.followingLocation
                    };
                    const friendship = getFriendship(item.followingId);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-black/[0.02] hover:bg-black/[0.04] border border-black/[0.03] rounded-3xl transition-all flex items-center justify-between gap-3"
                      >
                        <div 
                          onClick={() => onViewUser(userObj)}
                          className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                        >
                          <img 
                            src={item.followingAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.followingName)}&background=000000&color=ffffff`}
                            className="w-12 h-12 rounded-2xl object-cover border border-black/5"
                            alt=""
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[15px] font-bold text-black truncate">{item.followingName}</h4>
                            <p className="text-[12px] font-medium text-black/40 truncate">
                              {item.followingTitle || item.followingLocation || 'TimeGiG Member'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onStartChat(userObj)}
                            className="w-10 h-10 rounded-2xl bg-white hover:bg-black hover:text-white text-black flex items-center justify-center transition-all shadow-sm border border-black/5 active:scale-95"
                          >
                            <MessageSquare size={17} />
                          </button>

                          <button
                            onClick={() => onToggleFollow(userObj)}
                            className="px-3.5 py-2 rounded-2xl bg-black text-white text-[11px] font-bold active:scale-95 transition-all shadow-sm"
                          >
                            Following
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </>
            )}

            {/* Followers List */}
            {activeTab === 'followers' && (
              <>
                {filteredFollowers.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-3xl bg-black/[0.03] flex items-center justify-center text-black/20 mb-4">
                      <Sparkles size={32} />
                    </div>
                    <h3 className="text-[16px] font-bold text-black mb-1">No followers yet</h3>
                    <p className="text-[13px] text-black/40 max-w-xs font-medium">
                      Create posts, publish GiGs, and engage in the Seekers and Market feed to build your audience!
                    </p>
                  </div>
                ) : (
                  filteredFollowers.map((item) => {
                    const userObj: CommunityUser = {
                      id: item.followingId,
                      name: item.followingName,
                      avatar: item.followingAvatar,
                      title: item.followingTitle,
                      location: item.followingLocation
                    };
                    const isFollowing = getIsFollowing(item.followingId);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-black/[0.02] hover:bg-black/[0.04] border border-black/[0.03] rounded-3xl transition-all flex items-center justify-between gap-3"
                      >
                        <div 
                          onClick={() => onViewUser(userObj)}
                          className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                        >
                          <img 
                            src={item.followingAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.followingName)}&background=000000&color=ffffff`}
                            className="w-12 h-12 rounded-2xl object-cover border border-black/5"
                            alt=""
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[15px] font-bold text-black truncate">{item.followingName}</h4>
                            <p className="text-[12px] font-medium text-black/40 truncate">
                              {item.followingTitle || item.followingLocation || 'TimeGiG Member'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onStartChat(userObj)}
                            className="w-10 h-10 rounded-2xl bg-white hover:bg-black hover:text-white text-black flex items-center justify-center transition-all shadow-sm border border-black/5 active:scale-95"
                          >
                            <MessageSquare size={17} />
                          </button>

                          <button
                            onClick={() => onToggleFollow(userObj)}
                            className={`px-3.5 py-2 rounded-2xl text-[11px] font-bold active:scale-95 transition-all shadow-sm ${
                              isFollowing 
                                ? 'bg-black/[0.05] text-black hover:bg-black/[0.1]' 
                                : 'bg-black text-white'
                            }`}
                          >
                            {isFollowing ? 'Following' : 'Follow Back'}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </>
            )}

            {/* Find People Tab */}
            {activeTab === 'find' && (
              <>
                {discoverUsers.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-3xl bg-black/[0.03] flex items-center justify-center text-black/20 mb-4">
                      <Search size={32} />
                    </div>
                    <h3 className="text-[16px] font-bold text-black mb-1">No community members found</h3>
                    <p className="text-[13px] text-black/40 max-w-xs font-medium">
                      Try searching with different keywords or clear the search bar.
                    </p>
                  </div>
                ) : (
                  discoverUsers.map((user) => {
                    const isFollowing = getIsFollowing(user.id);
                    const friendship = getFriendship(user.id);

                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-black/[0.02] hover:bg-black/[0.04] border border-black/[0.03] rounded-3xl transition-all"
                      >
                        <div className="flex items-center gap-3.5 mb-3">
                          <div 
                            onClick={() => onViewUser(user)}
                            className="cursor-pointer group"
                          >
                            <img 
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=000000&color=ffffff`}
                              className="w-12 h-12 rounded-2xl object-cover border border-black/5 group-hover:scale-105 transition-transform"
                              alt=""
                            />
                          </div>

                          <div 
                            onClick={() => onViewUser(user)}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <h4 className="text-[15px] font-bold text-black truncate">{user.name || 'Community Member'}</h4>
                            <p className="text-[12px] font-medium text-black/40 truncate">
                              {user.title ? user.title : (user.location ? `${user.location}, ${user.province || ''}` : 'TimeGiG Member')}
                            </p>
                          </div>
                        </div>

                        {user.bio && (
                          <p className="text-[12px] text-black/60 font-medium line-clamp-2 mb-3 bg-white p-2.5 rounded-xl border border-black/[0.03]">
                            {user.bio}
                          </p>
                        )}

                        <div className="flex items-center gap-2 pt-1 border-t border-black/[0.03]">
                          {/* Add Friend / Family button */}
                          <button
                            onClick={() => onOpenRelationshipChooser(user)}
                            className={`flex-1 py-2.5 px-3 rounded-2xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                              friendship 
                                ? (friendship.category === 'Family' 
                                    ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                                    : 'bg-blue-50 text-blue-600 border border-blue-200')
                                : 'bg-black text-white shadow-md shadow-black/10'
                            }`}
                          >
                            {friendship ? (
                              <>
                                {friendship.category === 'Family' ? <Heart size={14} className="fill-current" /> : <Users size={14} />}
                                <span>{friendship.category}</span>
                              </>
                            ) : (
                              <>
                                <UserPlus size={14} />
                                <span>Add Friend</span>
                              </>
                            )}
                          </button>

                          {/* Follow Button */}
                          <button
                            onClick={() => onToggleFollow(user)}
                            className={`py-2.5 px-4 rounded-2xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                              isFollowing 
                                ? 'bg-black/[0.06] text-black hover:bg-black/[0.1]' 
                                : 'bg-black/[0.03] hover:bg-black/[0.06] text-black border border-black/5'
                            }`}
                          >
                            {isFollowing ? <UserCheck size={14} /> : <Sparkles size={14} />}
                            <span>{isFollowing ? 'Following' : 'Follow'}</span>
                          </button>

                          {/* Chat Button */}
                          <button
                            onClick={() => onStartChat(user)}
                            className="w-10 h-10 rounded-2xl bg-black/[0.03] hover:bg-black/[0.06] text-black flex items-center justify-center transition-all active:scale-95 border border-black/5"
                            title="Direct Message"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </>
            )}

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
