import { useState, useRef, useEffect } from 'react';
import { 
  House, Layers, Compass, MessageSquare, Store, Search, Plus, 
  SquarePen, Image as ImageIcon, Video, Smile, X, RefreshCw, Send, Camera, Palette,
  ThumbsUp, MessageCircle, Share2, MoreHorizontal, Trash2, Edit3, Forward,
  Phone, Calendar, Clock, MapPin, Briefcase, DollarSign, UserCheck, PhoneCall, ChevronLeft,
  Mic, Square, User, Eraser, ShieldAlert, UserMinus, Flag, Play, Pause, Check,
  ShieldCheck, CreditCard, Info, HelpCircle, LogOut, Settings, ChevronRight,
  Bell, Globe, TrendingUp, FileText, Users, Sparkles, PartyPopper, ArrowRight,
  Lock, Mail, CheckCircle2, AlertCircle, FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { auth, db } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';

type Tab = 'Home' | 'GiGs' | 'Seekers' | 'Chat' | 'Market';

type MediaItem = {
  type: 'image' | 'video';
  url: string;
};

type Post = {
  id: string;
  text: string;
  timestamp: Date;
  fontFamily: string;
  color: string;
  media?: MediaItem[];
  likes: number;
  comments: { id: string; text: string; timestamp: Date }[];
  isLiked?: boolean;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
};

type Listing = {
  id: string;
  tab: Tab;
  title: string;
  info: string;
  experience: string;
  time: string;
  date: string;
  province: string;
  location: string;
  price: string;
  media: MediaItem[];
  timestamp: Date;
  contact: {
    whatsapp: string;
    phone: string;
  };
  likes: number;
  views: number;
  interested: number;
  isLiked?: boolean;
  ownerEmail?: string;
  ownerId?: string;
};

type Message = {
  id: string;
  sender: 'me' | 'other';
  senderId?: string;
  text: string;
  timestamp: Date;
  isLiked?: boolean;
  type?: 'text' | 'voice';
  audioUrl?: string;
  duration?: number;
};

type Conversation = {
  id: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  messages: Message[];
  isBlocked?: boolean;
  isTyping?: boolean;
  isOnline?: boolean;
  lastSeen?: Date;
  participants?: string[];
  participantDetails?: Record<string, { name: string; avatar: string }>;
};

const FONT_STYLES = [
  { name: 'Default', family: 'Inter, sans-serif' },
  { name: 'Elegant', family: "'Playfair Display', serif" },
  { name: 'Modern', family: "'Poppins', sans-serif" },
  { name: 'Monospace', family: "'Roboto Mono', monospace" },
  { name: 'Classic', family: "'Lora', serif" },
  { name: 'Clean', family: "'Montserrat', sans-serif" },
  { name: 'Soft', family: "'Nunito', sans-serif" },
  { name: 'Bold', family: "'Oswald', sans-serif" },
  { name: 'Handwriting', family: "'Caveat', cursive" },
  { name: 'Script', family: "'Dancing Script', cursive" },
  { name: 'Playful', family: "'Pacifico', cursive" },
  { name: 'Sketch', family: "'Shadows Into Light', cursive" },
  { name: 'Retro', family: "'Lobster', cursive" },
  { name: 'Cute', family: "'Indie Flower', cursive" },
  { name: 'Round', family: "'Comfortaa', cursive" },
  { name: 'Geometric', family: "'Quicksand', sans-serif" },
  { name: 'Artistic', family: "'Cinzel', serif" },
  { name: 'Sharp', family: "'Josefin Sans', sans-serif" },
  { name: 'Humanist', family: "'Ubuntu', sans-serif" },
  { name: 'Warm', family: "'Merriweather', serif" },
  { name: 'Minimal', family: "'Raleway', sans-serif" },
  { name: 'Standard', family: "'Lato', sans-serif" },
  { name: 'Technical', family: "'PT Sans', sans-serif" },
  { name: 'Strong', family: "'Bebas Neue', cursive" },
  { name: 'Neutral', family: "'Open Sans', sans-serif" }
];

const PRESET_COLORS = [
  '#000000', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE',
  '#FF2D55', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#607D8B', '#E64A19', '#F44336', '#388E3C', '#1976D2', '#D32F2F', '#7B1FA2'
];

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

const LOCATIONS: Record<string, string[]> = {
  'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto', 'Sandton', 'Midrand'],
  'Western Cape': ['Cape Town', 'Stellenbosch', 'Paarl', 'George', 'Knysna'],
  'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Umhlanga', 'Ballito'],
  'Eastern Cape': ['Gqeberha', 'East London', 'Mthatha'],
  'Free State': ['Bloemfontein', 'Welkom', 'Sasolburg'],
  'Limpopo': ['Polokwane', 'Tzaneen', 'Thohoyandou'],
  'Mpumalanga': ['Mbombela', 'Secunda', 'Emalahleni'],
  'North West': ['Mahikeng', 'Potchefstroom', 'Rustenburg'],
  'Northern Cape': ['Kimberley', 'Upington', 'Kuruman']
};

export default function App() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotificationSound, setSelectedNotificationSound] = useState(0);
  const [selectedChatSound, setSelectedChatSound] = useState(1);
  const [isSoundSelectorOpen, setIsSoundSelectorOpen] = useState(false);
  const [isChatSoundSelectorOpen, setIsChatSoundSelectorOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'congratulations' | 'complete_profile' | null>(null);

  // Profile completion form states
  const [profileName, setProfileName] = useState('');
  const [profileTitle, setProfileTitle] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [profileProvince, setProfileProvince] = useState('Western Cape');
  const [profileLocation, setProfileLocation] = useState('Cape Town');
  const [profileBio, setProfileBio] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const currentUserProfile = userProfile || {
    name: 'Loading...',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.email || 'User')}&background=random`,
    email: currentUser?.email || ''
  };
  const NOTIFICATION_SOUNDS = [
    "Ping", "Blip", "Ding", "Chime", "Tinkle", 
    "Pop", "Sparkle", "Breeze", "Echo", "Synth",
    "Crystal", "Zen", "Pulse", "Magic", "Alert"
  ];

  const CHAT_SOUNDS = [
    "Snap", "Click", "Whistle", "Bell", "Harp",
    "Flute", "Techno", "Retro", "Laser", "Bird",
    "Water", "Wind", "Guitar", "Piano", "Drum"
  ];

  const playSound = (index: number, isChat: boolean = false) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      const frequencies = [880, 1108.73, 1318.51, 1760, 2200, 660, 783.99, 987.77, 1046.50, 1174.66, 1318.51, 1396.91, 1567.98, 1760, 1975.53];
      const chatFrequencies = [440, 523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.50, 1174.66, 1318.51, 1396.91, 1567.98, 1760, 1975.53].reverse();
      
      const selectedFreq = isChat ? chatFrequencies : frequencies;
      const types: OscillatorType[] = ['sine', 'square', 'triangle', 'sawtooth', 'sine', 'triangle', 'sine', 'sine', 'sine', 'sine', 'sine', 'sine', 'sine', 'sine', 'sine'];
      
      osc.type = types[index] || 'sine';
      osc.frequency.setValueAtTime(selectedFreq[index] || 880, ctx.currentTime);
      
      if (index === 1) osc.frequency.exponentialRampToValueAtTime(selectedFreq[index] * 1.5, ctx.currentTime + 0.1);
      if (index === 2) osc.frequency.exponentialRampToValueAtTime(selectedFreq[index] * 0.5, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  };

  const addNotification = (title: string, message: string, type: string) => {
    const newNotif = {
      id: Math.random().toString(36).substring(7),
      title,
      message,
      type,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    
    if (type === 'chat') {
      playSound(selectedChatSound, true);
    } else {
      playSound(selectedNotificationSound, false);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    if (isNotificationsOpen) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [isNotificationsOpen]);

  useEffect(() => {
    // Simulate an incoming message occasionally for demo purposes
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        addNotification("Sarah J.", "Hey! Is that Gig still available?", "chat");
      }
    }, 10000); // 10 seconds after load
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const [newCommentText, setNewCommentText] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handlePostComment = async () => {
    if (!newCommentText.trim() || !activeItemForInteractions || !currentUser) return;

    const commentData = {
      text: newCommentText,
      userId: currentUser.uid,
      userName: userProfile?.name || 'Anonymous',
      timestamp: serverTimestamp()
    };

    const parentCollection = activeTab === 'Home' ? 'posts' : 'listings';
    await addDoc(collection(db, parentCollection, activeItemForInteractions.id, 'comments'), commentData);

    setNewCommentText('');
    playSound(0, true);
  };

  const [isAppLoading, setIsAppLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareText, setShareText] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [messageToForward, setMessageToForward] = useState<Message | null>(null);
  const [viewingProfileContact, setViewingProfileContact] = useState<Conversation | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'Profit' | 'Agreements' | 'Agents' | 'Users' | 'Sellers'>('Profit');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastTapInfo, setLastTapInfo] = useState<{ id: string; time: number } | null>(null);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isReportingModalOpen, setIsReportingModalOpen] = useState(false);
  const [isCommentsFullscreenOpen, setIsCommentsFullscreenOpen] = useState(false);
  const [isLikesListOpen, setIsLikesListOpen] = useState(false);
  const [activeItemForInteractions, setActiveItemForInteractions] = useState<any>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressOccurredRef = useRef(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [voiceMediaRecorder, setVoiceMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [pendingVoiceUrl, setPendingVoiceUrl] = useState<string | null>(null);
  const [pendingVoiceDuration, setPendingVoiceDuration] = useState(0);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(blob);
        setPendingVoiceUrl(url);
        setPendingVoiceDuration(recordingDuration);
      };
      
      recorder.start();
      setVoiceMediaRecorder(recorder);
      setIsVoiceRecording(true);
      setRecordingDuration(0);
      setPendingVoiceUrl(null);
    } catch (err) {
      console.error('Recording error:', err);
      alert('Could not access microphone');
    }
  };

  const stopVoiceRecording = () => {
    if (voiceMediaRecorder && voiceMediaRecorder.state !== 'inactive') {
      voiceMediaRecorder.stop();
      audioStream?.getTracks().forEach(track => track.stop());
      setIsVoiceRecording(false);
    }
  };

  const sendVoiceMessage = (url: string, duration: number) => {
    if (!activeConversationId) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: 'Voice note',
      timestamp: new Date(),
      type: 'voice',
      audioUrl: url,
      duration
    };
    
    setConversations(conversations.map(conv => 
      conv.id === activeConversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, newMessage], 
            lastMessage: '🎤 Voice note', 
            timestamp: new Date() 
          } 
        : conv
    ));
    setPendingVoiceUrl(null);
  };

  useEffect(() => {
    if (!activeItemForInteractions || !isCommentsFullscreenOpen) return;

    const parentCollection = activeTab === 'Home' ? 'posts' : 'listings';
    const commentsQuery = query(collection(db, parentCollection, activeItemForInteractions.id, 'comments'), orderBy('timestamp', 'asc'));
    
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
      setActiveItemForInteractions((prev: any) => ({
        ...prev,
        comments: commentsData
      }));
    });

    return () => unsubscribeComments();
  }, [activeItemForInteractions?.id, isCommentsFullscreenOpen, activeTab]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVoiceRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVoiceRecording]);

  useEffect(() => {
    if (!isAuthenticated || !activeConversationId) return;

    const messagesQuery = query(collection(db, 'conversations', activeConversationId, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Message[];
      
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId ? { ...conv, messages: messagesData } : conv
      ));
    });

    return () => unsubscribeMessages();
  }, [isAuthenticated, activeConversationId]);

  const isOnlyEmoji = (str: string) => {
    const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+\s*$/;
    return emojiRegex.test(str.trim());
  };

  const removeConversation = (convId: string) => {
    if (window.confirm('Are you sure you want to remove this contact and all messages?')) {
      setConversations(conversations.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
      }
    }
  };

  const forwardMessage = (targetConvId: string) => {
    if (!messageToForward) return;
    
    setConversations(conversations.map(conv => {
      if (conv.id === targetConvId) {
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: 'me',
          text: `Forwarded: ${messageToForward.text}`,
          timestamp: new Date()
        };
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: newMessage.text,
          timestamp: newMessage.timestamp
        };
      }
      return conv;
    }));
    
    setMessageToForward(null);
    setSelectedMessageId(null);
    alert('Message forwarded successfully!');
  };

  const clearConversation = () => {
    if (!activeConversationId) return;
    setConversations(conversations.map(c => 
      c.id === activeConversationId ? { ...c, messages: [], lastMessage: '' } : c
    ));
    setIsChatMenuOpen(false);
  };

  const toggleBlockContact = () => {
    if (!activeConversationId) return;
    setConversations(conversations.map(c => 
      c.id === activeConversationId ? { ...c, isBlocked: !c.isBlocked } : c
    ));
    setIsChatMenuOpen(false);
  };

  const reportContact = () => {
    setIsReportingModalOpen(true);
    setIsChatMenuOpen(false);
  };

  const handleFinalReport = () => {
    if (!selectedReportReason) return;
    alert(`Contact reported for: ${selectedReportReason}. Thank you for keeping TimeGiG safe.`);
    setIsReportingModalOpen(false);
    setSelectedReportReason(null);
  };
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isListingOpen, setIsListingOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState(FONT_STYLES[0]);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<MediaItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  // New Listing Form State
  const [listingForm, setListingForm] = useState({
    title: '',
    info: '',
    experience: '',
    time: '',
    date: '',
    province: '',
    location: '',
    price: '',
    whatsapp: '',
    phone: ''
  });
  const [fullscreenMedia, setFullscreenMedia] = useState<MediaItem | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  
  const isListingFormValid = 
    listingForm.title.trim() !== '' &&
    listingForm.info.trim() !== '' &&
    listingForm.experience.trim() !== '' &&
    listingForm.price.trim() !== '' &&
    listingForm.time.trim() !== '' &&
    listingForm.date.trim() !== '' &&
    listingForm.province.trim() !== '' &&
    listingForm.location.trim() !== '' &&
    listingForm.phone.trim() !== '' &&
    listingForm.whatsapp.trim() !== '' &&
    pendingMedia.length >= 1;
  
  // Camera/Capture states
  const [captureMode, setCaptureMode] = useState<'none' | 'photo' | 'video'>('none');
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserProfile(data);
          setProfileName(data.name || '');
          setProfileTitle(data.title || '');
          setProfilePhone(data.phone || '');
          setProfileWhatsapp(data.whatsapp || '');
          setProfileProvince(data.province || 'Western Cape');
          setProfileLocation(data.location || 'Cape Town');
          setProfileBio(data.bio || '');
          setProfileAvatar(data.avatar || '');
        }
      } else {
        setUserProfile(null);
        setOnboardingStep(null);
      }
      setIsAppLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Posts Sync
    const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Post[];
      setPosts(postsData);
    });

    // Listings Sync
    const listingsQuery = query(collection(db, 'listings'), orderBy('timestamp', 'desc'));
    const unsubscribeListings = onSnapshot(listingsQuery, (snapshot) => {
      const listingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Listing[];
      setListings(listingsData);
    });

    // Conversations Sync
    const convQuery = query(collection(db, 'conversations'), orderBy('timestamp', 'desc'));
    const unsubscribeConv = onSnapshot(convQuery, (snapshot) => {
      const convData = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        const otherId = data.participants?.find((p: string) => p !== currentUser?.uid) || 'system';
        const details = data.participantDetails?.[otherId] || {};
        return {
          id: docSnapshot.id,
          ...data,
          participantName: details.name || 'Anonymous',
          participantAvatar: details.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          timestamp: data.timestamp?.toDate() || new Date(),
          messages: [] // Messages fetched in separate effect
        };
      }) as Conversation[];
      setConversations(convData);
    });

    return () => {
      unsubscribePosts();
      unsubscribeListings();
      unsubscribeConv();
    };
  }, [isAuthenticated]);

  const handleAuthAction = async () => {
    setAuthError(null);

    if (!email.trim()) {
      setAuthError('Please enter your email address.');
      return;
    }

    if (!password) {
      setAuthError('Please enter your password.');
      return;
    }

    if (authMode === 'signup') {
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters long.');
        return;
      }
      if (!termsAccepted) {
        setAuthError('You must accept the Terms and Conditions to sign up.');
        return;
      }
    }

    setIsAuthSubmitting(true);

    try {
      if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setAuthError(null);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        const initialAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName.trim() || email.split('@')[0] || 'User')}&background=000000&color=ffffff&size=200`;
        const profile = {
          name: fullName.trim() || email.split('@')[0] || 'User',
          email: user.email,
          avatar: initialAvatar,
          title: '',
          phone: '',
          whatsapp: '',
          province: 'Western Cape',
          location: 'Cape Town',
          bio: '',
          profileCompleted: false,
          termsAccepted: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', user.uid), profile);
        setUserProfile(profile);
        setProfileName(profile.name);
        setProfileAvatar(initialAvatar);
        setProfileProvince('Western Cape');
        setProfileLocation('Cape Town');
        setProfileBio('');
        setProfileTitle('');
        setProfilePhone('');
        setProfileWhatsapp('');
        
        // Trigger Congratulation view as requested
        setOnboardingStep('congratulations');
        playSound(0, true);
      }
    } catch (error: any) {
      let message = error.message;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      }
      setAuthError(message);
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSaveProfileAndGoToSeekers = async () => {
    if (!currentUser) return;
    setIsSavingProfile(true);
    try {
      const updatedData = {
        name: profileName.trim() || userProfile?.name || 'User',
        title: profileTitle.trim(),
        phone: profilePhone.trim(),
        whatsapp: profileWhatsapp.trim() || profilePhone.trim(),
        province: profileProvince,
        location: profileLocation,
        bio: profileBio.trim(),
        avatar: profileAvatar || userProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName || 'User')}&background=000000&color=ffffff`,
        profileCompleted: true,
        updatedAt: serverTimestamp()
      };
      await updateDoc(doc(db, 'users', currentUser.uid), updatedData);
      setUserProfile((prev: any) => ({ ...prev, ...updatedData }));
      setOnboardingStep(null);
      // Directly direct user to Seekers feature as requested
      setActiveTab('Seekers');
      addNotification(
        'Profile Completed 🎉',
        'Welcome! You have been directed to the Seekers feature to find and post gigs.',
        'listing'
      );
      playSound(0, true);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsSettingsOpen(false);
  };

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'Home', icon: House, label: 'Home' },
    { id: 'GiGs', icon: Layers, label: 'GiGs' },
    { id: 'Seekers', icon: Compass, label: 'Seekers' },
    { id: 'Chat', icon: MessageSquare, label: 'Chat' },
    { id: 'Market', icon: Store, label: 'Market' },
  ];

  const handleShare = async () => {
    if (!shareText.trim() && pendingMedia.length === 0) return;
    if (!currentUser) return;
    
    setIsPosting(true);

    await addDoc(collection(db, 'posts'), {
      text: shareText,
      timestamp: serverTimestamp(),
      fontFamily: selectedFont.family,
      color: selectedColor,
      media: pendingMedia.length > 0 ? pendingMedia : [],
      likes: 0,
      authorId: currentUser.uid,
      authorName: userProfile?.name || 'Anonymous',
      authorAvatar: userProfile?.avatar || ''
    });

    setShareText('');
    setPendingMedia([]);
    setSelectedFont(FONT_STYLES[0]);
    setSelectedColor('#000000');
    setIsPosting(false);
    setIsShareOpen(false);
    setIsEmojiPickerOpen(false);
    setIsFontPickerOpen(false);
  };

  const handleUpdatePost = () => {
    if (!editingPost) return;
    setPosts(posts.map(p => p.id === editingPost.id ? { ...p, text: editingPost.text } : p));
    setEditingPost(null);
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const handleLikeHoldStart = (item: any) => {
    longPressOccurredRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      longPressOccurredRef.current = true;
      setActiveItemForInteractions(item);
      setIsLikesListOpen(true);
    }, 1000);
  };

  const handleLikeHoldEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const toggleLike = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const isLiked = !post.isLiked;
    await updateDoc(doc(db, 'posts', id), {
      likes: isLiked ? post.likes + 1 : post.likes - 1,
      // Note: In a real app we'd track likes in a subcollection
    });
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim() || !currentUser) return;
    await addDoc(collection(db, 'posts', postId, 'comments'), {
      text: newComment,
      userId: currentUser.uid,
      userName: userProfile?.name || 'Anonymous',
      timestamp: serverTimestamp()
    });
    setNewComment('');
    setCommentingPostId(null);
  };

  const handleLikeListing = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;
    const isLiked = !listing.isLiked;
    await updateDoc(doc(db, 'listings', id), {
      likes: isLiked ? listing.likes + 1 : listing.likes - 1
    });
    if (selectedListing?.id === id) {
      setSelectedListing({ 
        ...selectedListing, 
        isLiked, 
        likes: isLiked ? selectedListing.likes + 1 : selectedListing.likes - 1 
      });
    }
  };

  const handleInterestListing = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;
    await updateDoc(doc(db, 'listings', id), {
      interested: listing.interested + 1
    });
    if (selectedListing?.id === id) {
      setSelectedListing({ ...selectedListing, interested: selectedListing.interested + 1 });
    }
  };

  const handleViewListing = async (listing: Listing) => {
    await updateDoc(doc(db, 'listings', listing.id), {
      views: listing.views + 1
    });
    setSelectedListing({ ...listing, views: listing.views + 1 });
  };

  const handleDeleteListing = async (id: string) => {
    await deleteDoc(doc(db, 'listings', id));
    if (selectedListing?.id === id) setSelectedListing(null);
  };

  const handleEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setListingForm({
      title: listing.title,
      info: listing.info,
      experience: listing.experience,
      time: listing.time,
      date: listing.date,
      province: listing.province,
      location: listing.location,
      price: listing.price,
      whatsapp: listing.contact.whatsapp,
      phone: listing.contact.phone
    });
    setPendingMedia(listing.media);
    setIsListingOpen(true);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !activeConversationId || !currentUser) return;
    
    const messageData = {
      senderId: currentUser.uid,
      sender: 'me',
      text: chatMessage,
      timestamp: serverTimestamp(),
      type: 'text'
    };

    await addDoc(collection(db, 'conversations', activeConversationId, 'messages'), messageData);
    await updateDoc(doc(db, 'conversations', activeConversationId), {
      lastMessage: chatMessage,
      timestamp: serverTimestamp()
    });

    addNotification("Message Sent", chatMessage, 'chat');
    setChatMessage('');
  };

  const toggleLikeMessage = (messageId: string) => {
    if (!activeConversationId) return;
    setConversations(conversations.map(conv => 
      conv.id === activeConversationId 
        ? { 
            ...conv, 
            messages: conv.messages.map(m => 
              m.id === messageId ? { ...m, isLiked: !m.isLiked } : m
            )
          } 
        : conv
    ));
  };

  const deleteMessage = (messageId: string) => {
    if (!activeConversationId) return;
    setConversations(conversations.map(conv => 
      conv.id === activeConversationId 
        ? { 
            ...conv, 
            messages: conv.messages.filter(m => m.id !== messageId),
            lastMessage: conv.messages.length > 1 
              ? conv.messages[conv.messages.length - 2].text 
              : ''
          } 
        : conv
    ));
    setSelectedMessageId(null);
  };

  const handleMessageTap = (messageId: string) => {
    const now = Date.now();
    if (lastTapInfo && lastTapInfo.id === messageId && now - lastTapInfo.time < 300) {
      toggleLikeMessage(messageId);
      setLastTapInfo(null);
      setSelectedMessageId(null);
    } else {
      setLastTapInfo({ id: messageId, time: now });
      setSelectedMessageId(selectedMessageId === messageId ? null : messageId);
    }
  };

  const startInAppChat = async (listing: Listing) => {
    if (!currentUser) return;
    
    const existing = conversations.find(c => 
      c.participants?.includes(currentUser.uid) && 
      c.participants?.includes(listing.ownerId || 'system')
    );
    
    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      const convData = {
        participants: [currentUser.uid, listing.ownerId || 'system'],
        participantDetails: {
          [listing.ownerId || 'system']: {
            name: listing.title,
            avatar: listing.media[0]?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
          },
          [currentUser.uid]: {
            name: userProfile?.name || 'User',
            avatar: userProfile?.avatar || ''
          }
        },
        lastMessage: `Hi, I am interested in: ${listing.title}`,
        timestamp: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'conversations'), convData);
      
      await addDoc(collection(db, 'conversations', docRef.id, 'messages'), {
        senderId: currentUser.uid,
        sender: 'me',
        text: `Hi, I am interested in: ${listing.title}. Is it still available?`,
        timestamp: serverTimestamp(),
        type: 'text'
      });

      setActiveConversationId(docRef.id);
    }
    setActiveTab('Chat');
    setSelectedListing(null);
  };

  const handleCreateListing = async () => {
    if (!isListingFormValid || !currentUser) return;
    
    setIsPosting(true);

    if (editingListing) {
      await updateDoc(doc(db, 'listings', editingListing.id), {
        ...listingForm,
        media: pendingMedia,
        contact: {
          whatsapp: listingForm.whatsapp,
          phone: listingForm.phone
        }
      });
      setEditingListing(null);
    } else {
      const newListingData = {
        tab: activeTab,
        ...listingForm,
        media: pendingMedia,
        timestamp: serverTimestamp(),
        contact: {
          whatsapp: listingForm.whatsapp,
          phone: listingForm.phone
        },
        likes: 0,
        views: 0,
        interested: 0,
        ownerEmail: currentUser.email,
        ownerId: currentUser.uid
      };
      await addDoc(collection(db, 'listings'), newListingData);
      addNotification(`New ${activeTab} Item`, listingForm.title, 'listing');
    }
    
    setListingForm({
      title: '',
      info: '',
      experience: '',
      time: '',
      date: '',
      province: '',
      location: '',
      price: '',
      whatsapp: '',
      phone: ''
    });
    setPendingMedia([]);
    setIsPosting(false);
    setIsListingOpen(false);
  };

  const handleNativeShare = async (post: Post) => {
    const shareData = {
      title: 'Check out this post',
      text: post.text,
      url: window.location.href, // In a real app, this would be a deep link to the post
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        // Show a custom notification instead of alert if possible, or just log
        setNotifications(prev => [{
          id: Math.random().toString(36).substring(7),
          title: 'Link Copied',
          text: 'The post link has been copied to your clipboard.',
          timestamp: new Date(),
          type: 'system',
          read: false
        }, ...prev]);
        playSound(selectedNotificationSound);
      }
    } catch (err: any) {
      // Don't log error if user simply canceled the share
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  const startCamera = async (mode: 'photo' | 'video') => {
    setCaptureMode(mode);
    setIsImageMenuOpen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: mode === 'video',
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCaptureMode('none');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCaptureMode('none');
    setIsRecording(false);
  };

  const toggleCamera = () => {
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);
    // Restart camera with new facing mode
    if (captureMode !== 'none') {
      stopCamera();
      startCamera(captureMode === 'photo' ? 'photo' : 'video');
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const url = canvas.toDataURL('image/jpeg');
      setPendingMedia(prev => [...prev, { type: 'image', url }]);
      stopCamera();
    }
  };

  const startRecording = () => {
    if (streamRef.current) {
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPendingMedia(prev => [...prev, { 
              type: 'video', 
              url: event.target?.result as string 
            }]);
          }
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopCamera();
    }
  };

  const handleFileUpload = (e: any, type: 'image' | 'video') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const url = URL.createObjectURL(file);
      setPendingMedia(prev => [...prev, { 
        type, 
        url
      }]);
    });
    setIsImageMenuOpen(false);
  };

  const onEmojiClick = (emojiObject: any) => {
    if (activeTab === 'Chat' && activeConversationId) {
      setChatMessage(prev => prev + emojiObject.emoji);
    } else {
      setShareText(prev => prev + emojiObject.emoji);
    }
  };

  if (isAppLoading) {
    return (
      <div className="fixed inset-0 bg-white z-[1000] flex flex-col items-center justify-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[42px] font-bold tracking-[0.3em] uppercase text-black mb-12"
        >
          TimeGiG
        </motion.h1>
        <div className="w-48 h-[2px] bg-black/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 5, ease: "linear" }}
            className="w-full h-full bg-black"
          />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="mb-8 text-center">
            <h2 className="text-[42px] font-black tracking-tighter text-black uppercase">TimeGiG</h2>
            <p className="text-[10px] font-bold tracking-[0.25em] text-black/30 uppercase mt-1">South Africa's GiG Marketplace</p>
          </div>
          
          <div className="text-center mb-8 w-full">
            <h3 className="text-[24px] font-bold text-black mb-1.5 tracking-tight">
              {authMode === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h3>
            <p className="text-black/40 text-[14px] font-medium">
              {authMode === 'signin' ? 'Sign in with your login details' : 'Register to connect with gigs, seekers & clients'}
            </p>
          </div>

          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] font-bold text-red-600 leading-tight">{authError}</p>
            </motion.div>
          )}

          <div className="w-full space-y-4">
            <div className="space-y-3">
              {authMode === 'signup' && (
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Full Name / Display Name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    className="w-full h-16 pl-14 pr-6 bg-black/[0.03] border-none rounded-3xl text-[15px] font-bold focus:ring-0 placeholder:text-black/25"
                  />
                </div>
              )}
              
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  className="w-full h-16 pl-14 pr-6 bg-black/[0.03] border-none rounded-3xl text-[15px] font-bold focus:ring-0 placeholder:text-black/25"
                />
              </div>

              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  className="w-full h-16 pl-14 pr-6 bg-black/[0.03] border-none rounded-3xl text-[15px] font-bold focus:ring-0 placeholder:text-black/25"
                />
              </div>
            </div>

            {/* Terms & Conditions Checkbox (Sign Up Mode) */}
            {authMode === 'signup' && (
              <div className="pt-2 px-1">
                <label className="flex items-start gap-3 cursor-pointer select-none group">
                  <div 
                    onClick={() => {
                      setTermsAccepted(!termsAccepted);
                      if (authError) setAuthError(null);
                    }}
                    className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all flex-shrink-0 mt-0.5 border ${
                      termsAccepted 
                        ? 'bg-black border-black text-white shadow-md' 
                        : 'border-black/20 bg-black/[0.02] group-hover:border-black/40'
                    }`}
                  >
                    {termsAccepted && <Check size={14} strokeWidth={3} />}
                  </div>
                  <span className="text-[13px] text-black/60 font-medium leading-tight">
                    I accept the{' '}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      className="font-bold text-black underline underline-offset-2 hover:text-black/80"
                    >
                      Terms and Conditions
                    </button>
                    {' '}and Privacy Policy.
                  </span>
                </label>
              </div>
            )}

            <button 
              onClick={handleAuthAction}
              disabled={isAuthSubmitting}
              className="w-full h-16 bg-black text-white rounded-3xl font-bold uppercase tracking-widest text-[12px] active:scale-[0.98] transition-all shadow-xl shadow-black/10 mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAuthSubmitting ? (
                <RefreshCw size={18} className="animate-spin text-white" />
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="flex items-center gap-4 py-3">
              <div className="flex-1 h-[1px] bg-black/5" />
              <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">or</span>
              <div className="flex-1 h-[1px] bg-black/5" />
            </div>

            <button 
              onClick={() => {
                setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                setAuthError(null);
              }}
              className="w-full h-16 bg-white text-black border-2 border-black/5 rounded-3xl font-bold uppercase tracking-widest text-[12px] active:scale-[0.98] transition-all hover:bg-black/[0.02]"
            >
              {authMode === 'signin' ? 'New to TimeGiG? Create Account' : 'Already have an account? Sign In'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <button 
              type="button" 
              onClick={() => setIsTermsModalOpen(true)}
              className="text-[12px] font-bold text-black/40 hover:text-black transition-colors"
            >
              Read TimeGiG Terms & Community Guidelines
            </button>
          </div>
        </div>

        {/* Terms and Conditions Modal */}
        <AnimatePresence>
          {isTermsModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[36px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="p-6 border-b border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-black/[0.03] flex items-center justify-center">
                      <FileCheck size={20} className="text-black" />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold text-black">Terms & Conditions</h3>
                      <p className="text-[11px] font-bold text-black/30 uppercase tracking-wider">TimeGiG South Africa</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsTermsModalOpen(false)}
                    className="p-2 rounded-full hover:bg-black/5 text-black/40 hover:text-black transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-5 text-[14px] text-black/70 leading-relaxed">
                  <div>
                    <h4 className="font-bold text-black mb-1">1. Acceptance of Terms</h4>
                    <p>By creating an account on TimeGiG, you agree to comply with and be bound by these Terms and Conditions and our Community Guidelines across South Africa.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-black mb-1">2. Marketplace & GiG Network</h4>
                    <p>TimeGiG provides a platform connecting independent service providers, freelancers, buyers, sellers, and gig seekers. TimeGiG facilitates discovery and communication.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-black mb-1">3. User Responsibilities & Verification</h4>
                    <p>You agree to provide accurate registration information, complete your profile truthfully, and maintain the confidentiality of your account credentials.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-black mb-1">4. Community Integrity & Safety</h4>
                    <p>All members must treat others with respect and dignity. Harassment, spam, fraudulent listings, and discriminatory behavior are strictly prohibited and result in immediate account termination.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-black mb-1">5. Direct Communication</h4>
                    <p>Members can connect via built-in chat, WhatsApp, and verified phone contact to negotiate and execute tasks safely and directly.</p>
                  </div>
                </div>

                <div className="p-6 border-t border-black/5 bg-black/[0.01] flex items-center gap-3">
                  <button
                    onClick={() => {
                      setTermsAccepted(true);
                      setIsTermsModalOpen(false);
                    }}
                    className="flex-1 h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-[12px] active:scale-[0.98] transition-all shadow-lg"
                  >
                    Accept & Continue
                  </button>
                  <button
                    onClick={() => setIsTermsModalOpen(false)}
                    className="px-6 h-14 bg-black/[0.04] text-black rounded-2xl font-bold text-[12px] uppercase tracking-widest hover:bg-black/10 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Onboarding Screen (Congratulations & Complete Profile Flow)
  if (onboardingStep === 'congratulations') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background decorative celebratory rings */}
        <div className="absolute w-[500px] h-[500px] bg-yellow-50 rounded-full blur-3xl -top-32 -left-32 pointer-events-none opacity-50" />
        <div className="absolute w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl -bottom-32 -right-32 pointer-events-none opacity-50" />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="w-full max-w-sm flex flex-col items-center text-center relative z-10"
        >
          {/* Animated Celebration Icon */}
          <div className="relative mb-8">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="w-28 h-28 rounded-[36px] bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 flex items-center justify-center shadow-2xl shadow-orange-500/20"
            >
              <PartyPopper size={48} className="text-white" />
            </motion.div>
            <div className="absolute -top-2 -right-2 bg-black text-white p-2 rounded-2xl shadow-lg animate-bounce">
              <Sparkles size={18} />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4">
            <CheckCircle2 size={14} />
            <span>Account Registered</span>
          </div>

          <h2 className="text-[32px] font-black text-black tracking-tight mb-3">
            Congratulations!
          </h2>

          <p className="text-[15px] text-black/60 font-medium leading-relaxed mb-8 px-2">
            Welcome to <strong className="text-black">TimeGiG</strong>! Your account has been successfully created with <span className="text-black font-bold">{currentUser?.email}</span>.
          </p>

          <div className="w-full p-5 bg-black/[0.02] border border-black/5 rounded-3xl text-left mb-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[12px] font-bold">1</div>
              <p className="text-[13px] font-bold text-black">Account Created & Verified</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black/10 text-black flex items-center justify-center text-[12px] font-bold">2</div>
              <p className="text-[13px] font-bold text-black/70">Complete Profile & Enter Seekers</p>
            </div>
          </div>

          <button
            onClick={() => {
              setOnboardingStep('complete_profile');
              playSound(1, true);
            }}
            className="w-full h-16 bg-black text-white rounded-3xl font-bold uppercase tracking-widest text-[12px] active:scale-[0.98] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
          >
            <span>Complete Your Profile</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  // Profile Completion Step
  if (onboardingStep === 'complete_profile') {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <header className="h-16 flex items-center px-6 border-b border-gray-50 bg-white sticky top-0 z-30">
          <button 
            onClick={() => setOnboardingStep('congratulations')} 
            className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 text-center mr-8">
            <h2 className="text-[14px] font-bold tracking-[0.2em] uppercase text-black">Complete Profile</h2>
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Step 2 of 2</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-md mx-auto space-y-8">
            {/* Avatar Selector Section */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <img 
                  src={profileAvatar || currentUserProfile.avatar} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-[32px] object-cover shadow-xl border-4 border-white bg-black/5" 
                />
                <button
                  type="button"
                  onClick={() => {
                    const seed = Math.random().toString(36).substring(7);
                    setProfileAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
                  }}
                  className="absolute -bottom-2 -right-2 bg-black text-white p-2.5 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                  title="Randomize Avatar"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              <p className="text-[12px] font-bold text-black/40">Tap icon to change avatar avatar style</p>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2 block px-1">
                  Full / Display Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Sipho Dlamini"
                  className="w-full h-14 px-5 bg-black/[0.02] border-none rounded-2xl text-[15px] font-bold focus:ring-0 placeholder:text-black/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2 block px-1">
                  Professional Title / GiG Specialty
                </label>
                <input 
                  type="text" 
                  value={profileTitle}
                  onChange={(e) => setProfileTitle(e.target.value)}
                  placeholder="e.g. Electrician, Web Developer, Photographer"
                  className="w-full h-14 px-5 bg-black/[0.02] border-none rounded-2xl text-[15px] font-bold focus:ring-0 placeholder:text-black/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2 block px-1">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+27 82 123 4567"
                    className="w-full h-14 px-5 bg-black/[0.02] border-none rounded-2xl text-[15px] font-bold focus:ring-0 placeholder:text-black/20"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2 block px-1">
                    WhatsApp Contact
                  </label>
                  <input 
                    type="tel" 
                    value={profileWhatsapp}
                    onChange={(e) => setProfileWhatsapp(e.target.value)}
                    placeholder="+27 82 123 4567"
                    className="w-full h-14 px-5 bg-black/[0.02] border-none rounded-2xl text-[15px] font-bold focus:ring-0 placeholder:text-black/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2 block px-1">
                    Province
                  </label>
                  <select 
                    value={profileProvince}
                    onChange={(e) => {
                      setProfileProvince(e.target.value);
                      const locs = LOCATIONS[e.target.value];
                      if (locs && locs[0]) setProfileLocation(locs[0]);
                    }}
                    className="w-full h-14 px-5 bg-black/[0.02] border-none rounded-2xl text-[15px] font-bold focus:ring-0"
                  >
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2 block px-1">
                    City / Area
                  </label>
                  <input 
                    type="text" 
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    placeholder="e.g. Cape Town, Sandton"
                    className="w-full h-14 px-5 bg-black/[0.02] border-none rounded-2xl text-[15px] font-bold focus:ring-0 placeholder:text-black/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2 block px-1">
                  Bio / About Me
                </label>
                <textarea 
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Tell clients and seekers about your skills, experience, or what services you are looking for..."
                  className="w-full p-5 bg-black/[0.02] border-none rounded-2xl text-[15px] font-bold focus:ring-0 resize-none h-28 placeholder:text-black/20"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleSaveProfileAndGoToSeekers}
                disabled={isSavingProfile}
                className="w-full h-16 bg-black text-white rounded-3xl font-bold uppercase tracking-widest text-[12px] active:scale-[0.98] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <RefreshCw size={18} className="animate-spin text-white" />
                ) : (
                  <>
                    <span>Done & Go to Seekers</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center px-6 bg-white z-40 border-b border-gray-50">
        <div className="flex-1 flex items-center justify-between">
          {activeTab === 'Home' ? (
            <div className="w-10" />
          ) : (
            <div className="w-10" />
          )}

          <h1 className="text-[14px] font-bold tracking-[0.2em] uppercase text-black">
            {activeTab === 'Chat' ? 'Messages' : activeTab}
          </h1>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-1 text-black active:scale-90 transition-transform outline-none"
            >
              <Bell size={22} strokeWidth={2.5} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
            {activeTab === 'Home' && (
              <button 
                onClick={() => setIsShareOpen(true)}
                className="text-black active:scale-90 transition-transform outline-none"
              >
                <SquarePen size={22} strokeWidth={2.5} />
              </button>
            )}
            <img 
              src={currentUserProfile.avatar} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover border border-black/5 cursor-pointer hover:ring-2 hover:ring-black/5 transition-all" 
              onClick={() => setIsProfileMenuOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* Sub-header for Search in specific tabs */}
      {(activeTab === 'GiGs' || activeTab === 'Seekers' || activeTab === 'Market') && (
        <div className="fixed top-16 left-0 right-0 px-4 py-3 bg-white z-30 border-b border-gray-50 overflow-x-hidden">
          <div className={`mx-auto relative flex items-center transition-all duration-300 ${activeTab === 'Market' ? 'max-w-none' : 'max-w-md'}`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none">
              <Search size={20} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full h-11 pl-12 pr-14 bg-black/[0.04] border-none rounded-xl text-[15px] font-medium placeholder:text-black/20 focus:ring-0 transition-all outline-none"
            />
            <button 
              onClick={() => setIsListingOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black text-white rounded-lg active:scale-95 transition-transform"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* Share Overlay */}
      <AnimatePresence>
        {isShareOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col"
          >
            <div className="flex justify-between items-center px-8 py-6">
              <span className="text-[12px] font-bold tracking-widest uppercase">New Share</span>
              <button 
                onClick={() => {
                  if (isPosting) return;
                  setIsShareOpen(false);
                  setIsEmojiPickerOpen(false);
                  setIsFontPickerOpen(false);
                  setIsColorPickerOpen(false);
                  setIsImageMenuOpen(false);
                }}
                disabled={isPosting}
                className="p-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-20"
              >
                <Plus className="rotate-45" size={28} strokeWidth={2} />
              </button>
            </div>

            {isPosting && (
              <div className="absolute top-20 left-0 right-0 h-1 bg-gray-100 overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-full h-full bg-black"
                />
              </div>
            )}
            
            <div className={`flex-1 flex flex-col px-8 ${isPosting ? 'opacity-50 pointer-events-none' : ''}`}>
              <textarea
                autoFocus
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder="What's on your mind?"
                style={{ fontFamily: selectedFont.family, color: selectedColor }}
                className="flex-1 w-full text-[24px] font-medium placeholder:text-black/10 border-none focus:ring-0 outline-none resize-none leading-relaxed"
              />
              
              {/* Media Preview */}
              {pendingMedia.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                  <AnimatePresence>
                    {pendingMedia.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden group shadow-sm"
                      >
                        {item.type === 'image' ? (
                          <img src={item.url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" muted playsInline onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />
                        )}
                        <button
                          onClick={() => setPendingMedia(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Feature Icons */}
            <div className={`px-8 pb-4 flex items-center gap-6 relative ${isPosting ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="relative">
                <button 
                  onClick={() => setIsImageMenuOpen(!isImageMenuOpen)}
                  className="text-black hover:opacity-60 transition-opacity"
                >
                  <ImageIcon size={24} strokeWidth={2} />
                </button>
                <AnimatePresence>
                  {isImageMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 mb-4 bg-white shadow-2xl rounded-2xl border border-black/5 overflow-hidden z-[70] min-w-[120px]"
                    >
                      <label className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 cursor-pointer transition-colors border-b border-black/5">
                        <Plus size={18} />
                        <span className="text-[14px] font-bold">Gallery</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'image')}
                        />
                      </label>
                      <button 
                        onClick={() => startCamera('photo')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/5 transition-colors text-left"
                      >
                        <Camera size={18} />
                        <span className="text-[14px] font-bold">Camera</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="relative">
                <label className="cursor-pointer text-black hover:opacity-60 transition-opacity flex items-center">
                  <Video size={24} strokeWidth={2} />
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'video')}
                  />
                </label>
              </div>

              <button 
                onClick={() => startCamera('video')}
                className="text-black hover:opacity-60 transition-opacity"
              >
                <Video size={24} strokeWidth={2} className="fill-current" />
              </button>

              <button 
                onClick={() => {
                  setIsEmojiPickerOpen(!isEmojiPickerOpen);
                  setIsFontPickerOpen(false);
                }}
                className="text-black hover:opacity-60 transition-opacity"
              >
                <Smile size={24} strokeWidth={2} />
              </button>

              <button 
                onClick={() => {
                  setIsFontPickerOpen(!isFontPickerOpen);
                  setIsEmojiPickerOpen(false);
                  setIsColorPickerOpen(false);
                }}
                className="flex items-center gap-1 text-black hover:opacity-60 transition-opacity"
              >
                <span className="text-[18px] font-serif">Aa</span>
              </button>

              <button 
                onClick={() => {
                  setIsColorPickerOpen(!isColorPickerOpen);
                  setIsEmojiPickerOpen(false);
                  setIsFontPickerOpen(false);
                }}
                className="relative flex items-center text-black hover:opacity-60 transition-opacity"
              >
                <Palette size={24} strokeWidth={2} />
              </button>
            </div>

            {isFontPickerOpen && (
              <div className="w-full h-24 bg-black/[0.02] border-t border-black/5 overflow-x-auto whitespace-nowrap px-6 py-4 flex items-center gap-4">
                {FONT_STYLES.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => {
                      setSelectedFont(font);
                      setIsFontPickerOpen(false);
                    }}
                    style={{ fontFamily: font.family }}
                    className={`px-4 py-2 rounded-xl transition-all border ${
                      selectedFont.name === font.name 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-black/10 hover:border-black/30'
                    }`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            )}

            {isColorPickerOpen && (
              <div className="w-full h-24 bg-black/[0.02] border-t border-black/5 overflow-x-auto whitespace-nowrap px-6 py-4 flex items-center gap-4">
                <div className="relative flex items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-black/10 flex items-center justify-center overflow-hidden bg-white">
                    <Palette size={20} className="text-black/30" />
                    <input 
                      type="color" 
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full flex-shrink-0 transition-all border-2 ${
                      selectedColor === color ? 'border-black scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-end p-8 border-t border-gray-50">
              <button 
                onClick={handleShare}
                disabled={isPosting}
                className="w-14 h-14 flex items-center justify-center bg-black text-white rounded-2xl shadow-lg active:scale-95 transition-all disabled:bg-gray-100"
              >
                {isPosting ? (
                  <RefreshCw className="animate-spin" size={24} />
                ) : (
                  <Send size={24} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Camera Capture Overlay */}
      <AnimatePresence>
        {captureMode !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col"
          >
            <video 
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            <div className="absolute top-8 left-0 right-0 px-8 flex justify-between items-center z-10">
              <button onClick={stopCamera} className="text-white">
                <X size={32} />
              </button>
              <button onClick={toggleCamera} className="text-white">
                <RefreshCw size={32} />
              </button>
            </div>

            <div className="absolute bottom-16 left-0 right-0 flex justify-center items-center z-10">
              {captureMode === 'photo' ? (
                <button 
                  onClick={takePhoto}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform"
                >
                  <div className="w-16 h-16 rounded-full bg-white" />
                </button>
              ) : (
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform"
                >
                  {isRecording ? (
                    <div className="w-8 h-8 rounded-sm bg-red-500" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-red-500" />
                  )}
                </button>
              )}
            </div>
            
            <div className="absolute bottom-8 left-0 right-0 text-center z-10">
              <span className="text-white text-sm font-bold tracking-widest uppercase">
                {captureMode === 'photo' ? 'Photo Mode' : 'Video Mode'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={`flex-1 w-full flex flex-col items-center pt-20 ${!(activeTab === 'Chat' && activeConversationId) ? 'pb-32' : 'pb-0'} overflow-y-auto overflow-x-hidden`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full ${(activeTab === 'GiGs' || activeTab === 'Seekers' || activeTab === 'Market') ? 'px-3 max-w-none' : 'px-6 max-w-md'}`}
          >
            {activeTab === 'Home' && (
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-black/10">
                    <House size={48} strokeWidth={1} className="mb-4" />
                    <p className="text-sm font-medium tracking-widest uppercase">No posts yet</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <motion.div 
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-black/[0.02] border border-black/[0.03] rounded-3xl"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img src={currentUserProfile.avatar} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="text-[14px] font-bold text-black">{currentUserProfile.name}</p>
                            <p className="text-[11px] font-bold text-black/20 uppercase tracking-widest">
                              {post.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setEditingPost(post)}
                            className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {post.text && (
                        <p 
                          className="text-[17px] font-medium leading-relaxed mb-4"
                          style={{ fontFamily: post.fontFamily, color: post.color }}
                        >
                          {post.text}
                        </p>
                      )}

                      {post.media && post.media.length > 0 && (
                        <div className={`grid gap-2 mb-4 ${
                          post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                        }`}>
                          {post.media.map((item, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => setFullscreenMedia(item)}
                              className="relative aspect-square rounded-2xl overflow-hidden bg-black/5 cursor-pointer hover:opacity-90 transition-opacity"
                            >
                              {item.type === 'image' ? (
                                <img src={item.url} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black/10">
                                  <Video className="text-black/20" size={32} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center gap-6 pt-4 border-t border-black/[0.03]">
                        <button 
                          onClick={() => {
                            if (longPressOccurredRef.current) return;
                            toggleLike(post.id);
                          }}
                          onPointerDown={() => handleLikeHoldStart(post)}
                          onPointerUp={handleLikeHoldEnd}
                          onPointerLeave={handleLikeHoldEnd}
                          className={`flex items-center gap-2 transition-colors ${post.isLiked ? 'text-blue-500' : 'text-black/40 hover:text-black'}`}
                        >
                          <ThumbsUp size={20} className={post.isLiked ? 'fill-current' : ''} />
                          <span className="text-[13px] font-bold">{post.likes}</span>
                        </button>
                        <button 
                          onClick={() => {
                            setActiveItemForInteractions(post);
                            setIsCommentsFullscreenOpen(true);
                          }}
                          className="flex items-center gap-2 text-black/40 hover:text-black transition-colors"
                        >
                          <MessageCircle size={20} />
                          <span className="text-[13px] font-bold">{post.comments.length}</span>
                        </button>
                        <button 
                          onClick={() => handleNativeShare(post)}
                          className="flex items-center gap-2 text-black/40 hover:text-black transition-colors ml-auto"
                        >
                          <Share2 size={20} />
                        </button>
                      </div>

                    </motion.div>
                  ))
                )}
              </div>
            )}
            
            {(activeTab === 'GiGs' || activeTab === 'Seekers' || activeTab === 'Market') && (
              <div className="space-y-6">
                {activeTab === 'Seekers' && listings.filter(l => l.tab === 'Seekers').length > 0 && (
                  <div className="mb-2 -mx-6 px-6">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-black/30">Recommended for you</span>
                      <div className="flex gap-1">
                        <div className="w-3 h-1 rounded-full bg-black" />
                        <div className="w-1 h-1 rounded-full bg-black/10" />
                        <div className="w-1 h-1 rounded-full bg-black/10" />
                      </div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                      {listings.filter(l => l.tab === 'Seekers').map((listing) => (
                        <motion.div
                          key={`slide-${listing.id}`}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleViewListing(listing)}
                          className="flex-shrink-0 w-[85%] aspect-[16/9] bg-black/5 rounded-2xl overflow-hidden relative snap-center shadow-sm"
                        >
                          {listing.media[0] && (
                            listing.media[0].type === 'image' ? (
                              <img 
                                src={listing.media[0].url} 
                                className="w-full h-full object-cover" 
                                alt=""
                              />
                            ) : (
                              <video src={listing.media[0].url} className="w-full h-full object-cover" muted loop playsInline onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />
                            )
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                            <div className="flex justify-between items-end">
                              <div>
                                <h3 className="text-white font-bold text-[16px] leading-tight mb-1">{listing.title}</h3>
                                <div className="flex items-center gap-1.5 text-white/60">
                                  <MapPin size={10} />
                                  <span className="text-[11px] font-medium">{listing.location}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
                                  <span className="text-white font-bold text-[12px]">{listing.price}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-white/60">
                                    <ThumbsUp size={12} className={listing.isLiked ? 'fill-blue-400 text-blue-400' : ''} />
                                    <span className="text-[10px] font-bold">{listing.likes}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-white/60">
                                    <Compass size={12} />
                                    <span className="text-[10px] font-bold">{listing.views}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-white/60">
                                    <UserCheck size={12} />
                                    <span className="text-[10px] font-bold">{listing.interested}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {listings.filter(l => l.tab === activeTab).length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-black/10">
                    <Layers size={48} strokeWidth={1} className="mb-4" />
                    <p className="text-sm font-medium tracking-widest uppercase">No {activeTab} yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-8">
                    {listings.filter(l => l.tab === activeTab).map((listing) => (
                      <motion.div 
                        key={listing.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleViewListing(listing)}
                        className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm cursor-pointer group"
                      >
                        <div className="relative aspect-[3/4] bg-black/5 overflow-hidden">
                          {listing.media && listing.media.length > 0 && (
                            listing.media[0].type === 'image' ? (
                              <img src={listing.media[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                            ) : (
                              <video src={listing.media[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" muted loop playsInline onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />
                            )
                          )}
                          
                          {/* Overlay Details */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                            <div className="flex flex-col mb-1.5">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="bg-white/20 backdrop-blur-md text-white px-1 py-0.5 rounded-full text-[6px] font-bold uppercase tracking-widest">
                                  {listing.tab}
                                </span>
                              </div>
                              <h3 className="text-[11px] font-bold text-white leading-tight line-clamp-1 mb-0.5">{listing.title}</h3>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-white/50">
                                  <MapPin size={8} />
                                  <span className="text-[9px] font-medium truncate max-w-[40px]">{listing.location}</span>
                                </div>
                                <p className="text-[13px] font-black text-white">{listing.price}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/10 pt-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-0.5 text-white/50">
                                  <ThumbsUp size={8} />
                                  <span className="text-[7px] font-bold">{listing.likes}</span>
                                </div>
                                <div className="flex items-center gap-0.5 text-white/50">
                                  <UserCheck size={8} />
                                  <span className="text-[7px] font-bold">{listing.interested}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveItemForInteractions(listing);
                                    setIsCommentsFullscreenOpen(true);
                                  }}
                                  className="text-white/70 hover:text-white"
                                >
                                  <MessageCircle size={10} fill="white" />
                                </button>
                                {listing.ownerEmail === 'timegig2026@gmail.com' && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteListing(listing.id); }}
                                    className="text-white/30 hover:text-red-400"
                                  >
                                    <Trash2 size={9} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'Chat' && (
              <div className="w-full flex flex-col min-h-[60vh]">
                {!activeConversationId ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-[20px] font-bold text-black uppercase tracking-widest">Messages</h2>
                      <div className="w-8 h-8 bg-black/[0.03] rounded-full flex items-center justify-center">
                        <MessageSquare size={16} className="text-black/30" />
                      </div>
                    </div>
                    
                        {conversations.length === 0 ? (
                          <div className="h-64 flex flex-col items-center justify-center text-black/10">
                            <MessageSquare size={48} strokeWidth={1} className="mb-4" />
                            <p className="text-sm font-medium tracking-widest uppercase">No messages yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {conversations.map((conv) => (
                              <div key={conv.id} className="relative group">
                                <motion.button
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setActiveConversationId(conv.id)}
                                  className="w-full p-4 bg-black/[0.02] border border-black/[0.02] rounded-3xl flex items-center gap-4 text-left hover:bg-black/[0.04] transition-colors"
                                >
                                  <div 
                                    className="relative cursor-pointer z-10"
                                    onClick={(e) => { e.stopPropagation(); setViewingProfileContact(conv); }}
                                  >
                                    <img src={conv.participantAvatar} className="w-14 h-14 rounded-full object-cover shadow-sm hover:ring-2 hover:ring-black/5 transition-all" alt="" />
                                    {conv.isOnline && (
                                      <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                      <h3 className="text-[15px] font-bold text-black truncate">{conv.participantName}</h3>
                                      <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold text-black/20 uppercase">
                                          {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-[13px] text-black/40 truncate font-medium">
                                      {conv.lastMessage}
                                    </p>
                                  </div>
                                </motion.button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeConversation(conv.id); }}
                                  className="absolute right-4 bottom-4 w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col h-[calc(100vh-200px)] w-full"
                  >
                    {/* Chat Header */}
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-black/[0.03]">
                      <button 
                        onClick={() => { 
                          setActiveConversationId(null); 
                          setIsChatMenuOpen(false); 
                          setIsEmojiPickerOpen(false); 
                          setSelectedMessageId(null);
                        }}
                        className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center text-black/40"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div className="flex-1 flex items-center gap-3">
                        <img 
                          src={conversations.find(c => c.id === activeConversationId)?.participantAvatar} 
                          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-black/5 transition-all" 
                          alt="" 
                          onClick={() => {
                            const conv = conversations.find(c => c.id === activeConversationId);
                            if (conv) setViewingProfileContact(conv);
                          }}
                        />
                        <div>
                          <h3 
                            className="text-[15px] font-bold text-black cursor-pointer"
                            onClick={() => {
                              const conv = conversations.find(c => c.id === activeConversationId);
                              if (conv) setViewingProfileContact(conv);
                            }}
                          >
                            {conversations.find(c => c.id === activeConversationId)?.participantName}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            {conversations.find(c => c.id === activeConversationId)?.isOnline && (
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                              {conversations.find(c => c.id === activeConversationId)?.isBlocked ? 'Blocked' : (
                                conversations.find(c => c.id === activeConversationId)?.isOnline ? 'Online' : ''
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isChatMenuOpen ? 'bg-black text-white' : 'bg-black/5 text-black/40'}`}
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        <AnimatePresence>
                          {isChatMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-12 w-48 bg-white border border-black/5 rounded-2xl shadow-xl z-[100] p-2"
                            >
                               <button 
                                onClick={() => {
                                  const conv = conversations.find(c => c.id === activeConversationId);
                                  if (conv) setViewingProfileContact(conv);
                                  setIsChatMenuOpen(false);
                                }} 
                                className="w-full flex items-center gap-3 p-3 hover:bg-black/5 rounded-xl transition-colors"
                              >
                                <User size={16} className="text-black/40" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">Profile</span>
                              </button>
                              <button 
                                onClick={() => {
                                  clearConversation();
                                  setIsChatMenuOpen(false);
                                }} 
                                className="w-full flex items-center gap-3 p-3 hover:bg-black/5 rounded-xl transition-colors"
                              >
                                <Eraser size={16} className="text-black/40" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">Clear Chat</span>
                              </button>
                              <button 
                                onClick={() => {
                                  toggleBlockContact();
                                  setIsChatMenuOpen(false);
                                }} 
                                className="w-full flex items-center gap-3 p-3 hover:bg-black/5 rounded-xl transition-colors"
                              >
                                <ShieldAlert size={16} className={conversations.find(c => c.id === activeConversationId)?.isBlocked ? 'text-green-500' : 'text-red-400'} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${conversations.find(c => c.id === activeConversationId)?.isBlocked ? 'text-green-500' : 'text-red-400'}`}>
                                  {conversations.find(c => c.id === activeConversationId)?.isBlocked ? 'Unblock' : 'Block'}
                                </span>
                              </button>
                              <button 
                                onClick={() => {
                                  reportContact();
                                  setIsChatMenuOpen(false);
                                }} 
                                className="w-full flex items-center gap-3 p-3 hover:bg-black/5 rounded-xl transition-colors border-t border-black/[0.03] mt-1 pt-3"
                              >
                                <Flag size={16} className="text-red-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Report</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide pb-28">
                      {conversations.find(c => c.id === activeConversationId)?.messages.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                        >
                          <div 
                            onClick={() => {
                              if (msg.type === 'voice') {
                                if (isPlayingVoice === msg.id) {
                                  if (audioRef.current) {
                                    audioRef.current.pause();
                                    audioRef.current = null;
                                  }
                                  setIsPlayingVoice(null);
                                  setPlaybackTime(0);
                                } else if (msg.audioUrl) {
                                  if (audioRef.current) audioRef.current.pause();
                                  setIsPlayingVoice(msg.id);
                                  setPlaybackTime(0);
                                  const audio = new Audio(msg.audioUrl);
                                  audioRef.current = audio;
                                  audio.ontimeupdate = () => setPlaybackTime(Math.floor(audio.currentTime));
                                  audio.onended = () => {
                                    setIsPlayingVoice(null);
                                    setPlaybackTime(0);
                                    audioRef.current = null;
                                  };
                                  audio.play().catch(err => {
                                    console.error('Audio playback failed:', err);
                                    setIsPlayingVoice(null);
                                  });
                                }
                              } else {
                                handleMessageTap(msg.id);
                              }
                            }}
                            className={`relative max-w-[80%] p-4 rounded-3xl text-[14px] font-medium shadow-sm active:scale-[0.98] transition-all cursor-pointer ${
                              msg.sender === 'me' 
                                ? 'bg-black text-white rounded-tr-none' 
                                : 'bg-black/[0.04] text-black rounded-tl-none'
                            } ${msg.type !== 'voice' && isOnlyEmoji(msg.text) ? 'bg-transparent shadow-none !p-2 !text-[32px] dancing-emoji' : ''}`}
                          >
                            {msg.type === 'voice' ? (
                              <div className="flex items-center gap-3 min-w-[120px]">
                                <div 
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.sender === 'me' ? 'bg-white text-black' : 'bg-black text-white'}`}
                                >
                                  {isPlayingVoice === msg.id ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                </div>
                                <div className="flex-1 h-1 bg-current opacity-20 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: isPlayingVoice === msg.id ? '100%' : 0 }}
                                    transition={{ duration: msg.duration || 0, ease: "linear" }}
                                    className="h-full bg-current"
                                  />
                                </div>
                                <span className="text-[10px] font-bold tabular-nums">
                                  {isPlayingVoice === msg.id 
                                    ? `${Math.floor(playbackTime / 60)}:${(playbackTime % 60).toString().padStart(2, '0')}`
                                    : `${Math.floor((msg.duration || 0) / 60)}:${((msg.duration || 0) % 60).toString().padStart(2, '0')}`
                                  }
                                </span>
                              </div>
                            ) : (
                              msg.text
                            )}
                            
                            {msg.isLiked && (
                              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border border-black/5">
                                <ThumbsUp size={12} className="text-blue-500 fill-blue-500" />
                              </div>
                            )}

                            <div className={`text-[9px] mt-1 opacity-40 font-bold uppercase ${
                              msg.sender === 'me' ? 'text-white/60' : 'text-black/40'
                            }`}>
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          <AnimatePresence>
                            {selectedMessageId === msg.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className={`flex gap-4 mt-2 px-2 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}
                              >
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setChatMessage(msg.text); deleteMessage(msg.id); }}
                                  className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                                >
                                  <Edit3 size={12} />
                                  Edit
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                                  className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={12} />
                                  Delete
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setMessageToForward(msg); }}
                                  className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                                >
                                  <Forward size={12} />
                                  Forward
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                      {conversations.find(c => c.id === activeConversationId)?.isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-black/[0.04] text-black p-4 rounded-3xl rounded-tl-none flex gap-1">
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-black/20 rounded-full" />
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-black/20 rounded-full" />
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-black/20 rounded-full" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.03] px-6 py-4 pb-8 z-50">
                      <div className="max-w-md mx-auto relative flex items-center gap-2">
                        {isVoiceRecording ? (
                          <div className="flex-1 flex items-center gap-4 bg-red-50 p-1.5 rounded-2xl border border-red-100">
                            <div className="flex-1 flex items-center gap-3 px-4">
                              <motion.div 
                                animate={{ opacity: [1, 0.4, 1] }} 
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-2 h-2 bg-red-500 rounded-full" 
                              />
                              <span className="text-[14px] font-bold text-red-500 tabular-nums">
                                Recording... {Math.floor(recordingDuration / 60)}:{((recordingDuration % 60)).toString().padStart(2, '0')}
                              </span>
                            </div>
                            <button 
                              onClick={stopVoiceRecording}
                              className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                            >
                              <Square size={18} fill="currentColor" />
                            </button>
                          </div>
                        ) : pendingVoiceUrl ? (
                          <div className="flex-1 flex items-center gap-3 bg-black/[0.02] p-1.5 rounded-2xl border border-black/[0.03]">
                            <button 
                              onClick={() => {
                                if (isPlayingVoice === 'pending') {
                                  setIsPlayingVoice(null);
                                } else {
                                  setIsPlayingVoice('pending');
                                  const audio = new Audio(pendingVoiceUrl);
                                  audio.play();
                                  audio.onended = () => setIsPlayingVoice(null);
                                }
                              }}
                              className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center active:scale-95 transition-all"
                            >
                              {isPlayingVoice === 'pending' ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            </button>
                            <div className="flex-1 h-1 bg-black/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: isPlayingVoice === 'pending' ? '100%' : 0 }}
                                transition={{ duration: pendingVoiceDuration, ease: "linear" }}
                                className="h-full bg-black"
                              />
                            </div>
                            <div className="flex items-center gap-2 pr-1">
                              <button 
                                onClick={() => {
                                  setPendingVoiceUrl(null);
                                  setIsPlayingVoice(null);
                                }}
                                className="w-9 h-9 text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                              <button 
                                onClick={() => sendVoiceMessage(pendingVoiceUrl, pendingVoiceDuration)}
                                className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                              >
                                <Send size={18} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex-1 flex items-center">
                            <button 
                              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                              className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-colors z-10 ${isEmojiPickerOpen ? 'bg-black text-white' : 'text-black/30'}`}
                            >
                              <Smile size={18} />
                            </button>
                            <input 
                              type="text"
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              disabled={conversations.find(c => c.id === activeConversationId)?.isBlocked}
                              placeholder={conversations.find(c => c.id === activeConversationId)?.isBlocked ? 'Contact is blocked' : 'Type a message...'}
                              className="w-full h-12 bg-black/[0.04] rounded-2xl pl-12 pr-24 font-medium text-[14px] outline-none focus:ring-0 disabled:opacity-50"
                            />
                            <div className="absolute right-1 top-1 flex items-center gap-1">
                              <button 
                                onClick={startVoiceRecording}
                                disabled={conversations.find(c => c.id === activeConversationId)?.isBlocked}
                                className="w-10 h-10 text-black/30 rounded-xl flex items-center justify-center active:bg-black active:text-white transition-all"
                              >
                                <Mic size={20} />
                              </button>
                              <button 
                                onClick={handleSendMessage}
                                disabled={!chatMessage.trim() || conversations.find(c => c.id === activeConversationId)?.isBlocked}
                                className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-20 shadow-sm"
                              >
                                <Send size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Full Screen Media Viewer */}
      <AnimatePresence>
        {fullscreenMedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[200] flex items-center justify-center"
          >
            <button 
              onClick={() => setFullscreenMedia(null)}
              className="absolute top-8 right-8 text-white z-10"
            >
              <X size={32} />
            </button>
            {fullscreenMedia.type === 'image' ? (
              <img src={fullscreenMedia.url} className="max-w-full max-h-full object-contain" />
            ) : (
              <video src={fullscreenMedia.url} controls autoPlay className="max-w-full max-h-full" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Post Overlay */}
      <AnimatePresence>
        {editingPost && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-white z-[150] flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-[12px] font-bold tracking-widest uppercase">Edit Post</span>
              <button onClick={() => setEditingPost(null)}><X size={28} /></button>
            </div>
            <textarea 
              autoFocus
              value={editingPost.text}
              onChange={(e) => setEditingPost({ ...editingPost, text: e.target.value })}
              className="flex-1 w-full text-[20px] font-medium border-none focus:ring-0 outline-none resize-none leading-relaxed"
              style={{ fontFamily: editingPost.fontFamily, color: editingPost.color }}
            />
            <div className="flex justify-end pt-8 border-t border-gray-50">
              <button 
                onClick={handleUpdatePost}
                className="px-8 py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-[12px]"
              >
                Update
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Listing Overlay */}
      <AnimatePresence>
        {isListingOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col"
          >
            <div className="flex justify-between items-center px-8 py-6 border-b border-black/5">
              <span className="text-[12px] font-bold tracking-widest uppercase">{editingListing ? 'Edit' : 'Create'} {activeTab}</span>
              <button 
                onClick={() => {
                  if (isPosting) return;
                  setIsListingOpen(false);
                  setEditingListing(null);
                  setListingForm({
                    title: '', info: '', experience: '', time: '', date: '',
                    province: '', location: '', price: '', whatsapp: '', phone: ''
                  });
                  setPendingMedia([]);
                }}
                disabled={isPosting}
                className="p-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-20"
              >
                <Plus className="rotate-45" size={28} strokeWidth={2} />
              </button>
            </div>

            {isPosting && (
              <div className="h-1 bg-gray-100 overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-full h-full bg-black"
                />
              </div>
            )}
            
            <div className={`flex-1 overflow-y-auto px-6 py-4 space-y-4 ${isPosting ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Media Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Media (Photos & Videos - Select as many as you need)</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-black/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-black/30 transition-colors">
                    <ImageIcon size={20} className="text-black/20 mb-0.5" />
                    <span className="text-[8px] font-bold text-black/30 uppercase">Photo</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                  </label>
                  <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-black/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-black/30 transition-colors">
                    <Video size={20} className="text-black/20 mb-0.5" />
                    <span className="text-[8px] font-bold text-black/30 uppercase">Video</span>
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                  </label>
                  <AnimatePresence>
                    {pendingMedia.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden shadow-sm bg-black/5"
                      >
                        {item.type === 'image' ? (
                          <img src={item.url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black/10">
                            <Video size={20} className="text-black/40" />
                          </div>
                        )}
                        <button
                          onClick={() => setPendingMedia(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 bg-black/50 text-white p-0.5 rounded-full"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Title</label>
                  <input 
                    value={listingForm.title}
                    onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                    placeholder="e.g. Professional Dog Walk"
                    className="w-full h-11 bg-black/[0.04] border-none rounded-xl px-4 text-[14px] font-medium outline-none focus:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Information</label>
                  <textarea 
                    value={listingForm.info}
                    onChange={(e) => setListingForm({ ...listingForm, info: e.target.value })}
                    placeholder="Details..."
                    className="w-full h-24 bg-black/[0.04] border-none rounded-xl p-4 text-[14px] font-medium outline-none focus:ring-0 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Experience</label>
                    <input 
                      value={listingForm.experience}
                      onChange={(e) => setListingForm({ ...listingForm, experience: e.target.value })}
                      placeholder="e.g. 2 Years"
                      className="w-full h-11 bg-black/[0.04] border-none rounded-xl px-4 text-[14px] font-medium outline-none focus:ring-0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Price</label>
                    <input 
                      value={listingForm.price}
                      onChange={(e) => setListingForm({ ...listingForm, price: e.target.value })}
                      placeholder="e.g. $50/hr"
                      className="w-full h-11 bg-black/[0.04] border-none rounded-xl px-4 text-[14px] font-medium outline-none focus:ring-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Time</label>
                    <input 
                      type="time"
                      value={listingForm.time}
                      onChange={(e) => setListingForm({ ...listingForm, time: e.target.value })}
                      className="w-full h-11 bg-black/[0.04] border-none rounded-xl px-4 text-[14px] font-medium outline-none focus:ring-0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Date</label>
                    <input 
                      type="date"
                      value={listingForm.date}
                      onChange={(e) => setListingForm({ ...listingForm, date: e.target.value })}
                      className="w-full h-11 bg-black/[0.04] border-none rounded-xl px-4 text-[14px] font-medium outline-none focus:ring-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Province</label>
                    <select 
                      value={listingForm.province}
                      onChange={(e) => setListingForm({ ...listingForm, province: e.target.value, location: '' })}
                      className="w-full h-11 bg-black/[0.04] border-none rounded-xl px-4 text-[14px] font-medium outline-none focus:ring-0 appearance-none"
                    >
                      <option value="" disabled>Select</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Location</label>
                    <select 
                      value={listingForm.location}
                      onChange={(e) => setListingForm({ ...listingForm, location: e.target.value })}
                      disabled={!listingForm.province}
                      className="w-full h-11 bg-black/[0.04] border-none rounded-xl px-4 text-[14px] font-medium outline-none focus:ring-0 appearance-none disabled:opacity-30"
                    >
                      <option value="" disabled>Select City</option>
                      {listingForm.province && LOCATIONS[listingForm.province]?.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                      {listingForm.province && <option value="Other">Other</option>}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Contact</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20">
                        <Phone size={14} />
                      </div>
                      <input 
                        value={listingForm.phone}
                        onChange={(e) => setListingForm({ ...listingForm, phone: e.target.value })}
                        placeholder="Phone"
                        className="w-full h-11 bg-black/[0.04] border-none rounded-xl pl-10 pr-4 text-[14px] font-medium outline-none focus:ring-0"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20">
                        <MessageSquare size={14} />
                      </div>
                      <input 
                        value={listingForm.whatsapp}
                        onChange={(e) => setListingForm({ ...listingForm, whatsapp: e.target.value })}
                        placeholder="WhatsApp"
                        className="w-full h-11 bg-black/[0.04] border-none rounded-xl pl-10 pr-4 text-[14px] font-medium outline-none focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-50">
              {!isListingFormValid && !isPosting && (
                <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest text-center mb-3">
                  Please complete all fields and upload at least 1 media item
                </p>
              )}
                <button 
                  onClick={handleCreateListing}
                  disabled={isPosting || !isListingFormValid}
                  className="w-full h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-[12px] active:scale-[0.98] transition-all disabled:bg-gray-100 shadow-lg"
                >
                  {isPosting ? <RefreshCw className="animate-spin mx-auto" size={20} /> : `${editingListing ? 'Update' : 'Create'} ${activeTab}`}
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Listing Viewer */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 bg-white z-[160] flex flex-col"
          >
            <div className="relative h-[50vh] bg-black">
              <button 
                onClick={() => setSelectedListing(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center z-10"
              >
                <X size={24} />
              </button>
              
              <div className="h-full overflow-x-auto flex snap-x snap-mandatory">
                {selectedListing.media.map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 w-full h-full snap-center bg-black">
                    {item.type === 'image' ? (
                      <img src={item.url} className="w-full h-full object-contain" alt="" />
                    ) : (
                      <video src={item.url} controls className="w-full h-full object-contain" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {selectedListing.media.map((_, idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 overflow-x-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div className="w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="bg-black/5 text-black/40 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block">
                      {selectedListing.tab}
                    </span>
                    <div className="flex flex-wrap items-center gap-3 ml-0 sm:ml-2">
                      <button 
                        onClick={() => {
                          if (longPressOccurredRef.current) return;
                          handleLikeListing(selectedListing.id);
                        }}
                        onPointerDown={() => handleLikeHoldStart(selectedListing)}
                        onPointerUp={handleLikeHoldEnd}
                        onPointerLeave={handleLikeHoldEnd}
                        className={`flex items-center gap-1.5 transition-colors ${selectedListing.isLiked ? 'text-blue-500' : 'text-black/20 hover:text-black'}`}
                      >
                        <ThumbsUp size={14} className={selectedListing.isLiked ? 'fill-current' : ''} />
                        <span className="text-[11px] font-bold">{selectedListing.likes}</span>
                      </button>
                      <button 
                        onClick={() => {
                          setActiveItemForInteractions(selectedListing);
                          setIsCommentsFullscreenOpen(true);
                        }}
                        className="flex items-center gap-1.5 text-black/20 hover:text-black transition-colors"
                      >
                        <MessageCircle size={14} />
                        <span className="text-[11px] font-bold">Comments</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-black/20">
                        <Compass size={14} />
                        <span className="text-[11px] font-bold">{selectedListing.views}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-black/20">
                        <UserCheck size={14} />
                        <span className="text-[11px] font-bold">{selectedListing.interested}</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-[24px] sm:text-[28px] font-bold text-black leading-tight break-words">{selectedListing.title}</h2>
                  <div className="flex items-center gap-2 text-black/40 mt-2">
                    <MapPin size={14} />
                    <span className="text-[13px] font-medium break-words">{selectedListing.location}, {selectedListing.province}</span>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-black/5 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[20px] sm:text-[24px] font-bold text-black">{selectedListing.price}</p>
                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Price</p>
                  </div>
                  {selectedListing.ownerEmail === 'timegig2026@gmail.com' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditListing(selectedListing)}
                        className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-black/40 hover:text-black transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteListing(selectedListing.id)}
                        className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-black/[0.02] rounded-2xl">
                  <div className="flex items-center gap-3 mb-1">
                    <Calendar size={14} className="text-black/40" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-black/20">Date</span>
                  </div>
                  <p className="text-[14px] font-bold text-black">{selectedListing.date}</p>
                </div>
                <div className="p-4 bg-black/[0.02] rounded-2xl">
                  <div className="flex items-center gap-3 mb-1">
                    <Clock size={14} className="text-black/40" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-black/20">Time</span>
                  </div>
                  <p className="text-[14px] font-bold text-black">{selectedListing.time}</p>
                </div>
                <div className="p-4 bg-black/[0.02] rounded-2xl col-span-2">
                  <div className="flex items-center gap-3 mb-1">
                    <UserCheck size={14} className="text-black/40" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-black/20">Experience</span>
                  </div>
                  <p className="text-[14px] font-bold text-black">{selectedListing.experience}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-black/20">Description</h3>
                <p className="text-[15px] text-black/70 leading-relaxed">
                  {selectedListing.info}
                </p>
              </div>

              <div className="space-y-4 pt-8 border-t border-black/5 pb-10">
                <button 
                  onClick={() => { 
                    handleInterestListing(selectedListing.id); 
                    const message = encodeURIComponent(`Hi, I am interested in your ${selectedListing.tab} listing: "${selectedListing.title}" for ${selectedListing.price}. Is it still available?`);
                    window.open(`https://wa.me/${selectedListing.contact.whatsapp}?text=${message}`, '_blank'); 
                  }}
                  className="w-full h-16 bg-[#25D366] text-white rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-[#25D366]/20"
                >
                  <MessageCircle size={24} fill="white" />
                  <span className="text-[14px] font-bold uppercase tracking-widest">Contact on WhatsApp</span>
                </button>
                <button 
                  onClick={() => { 
                    handleInterestListing(selectedListing.id); 
                    startInAppChat(selectedListing);
                  }}
                  className="w-full h-16 bg-black text-white rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-black/10"
                >
                  <MessageSquare size={24} />
                  <span className="text-[14px] font-bold uppercase tracking-widest">In-App Chat</span>
                </button>
                <button 
                  onClick={() => { handleInterestListing(selectedListing.id); }}
                  className="w-full h-16 border border-black/10 text-black rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                  <Phone size={24} />
                  <span className="text-[14px] font-bold uppercase tracking-widest">Call {selectedListing.contact.phone}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Menu Bar */}
      {!(activeTab === 'Chat' && activeConversationId) && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-6 z-50">
          <div className="max-w-md mx-auto flex justify-between items-center relative">
            {tabs.map((tab) => {
              const totalMessages = conversations.reduce((acc, conv) => acc + conv.messages.length, 0);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedMessageId(null);
                  }}
                  className="relative p-2 rounded-xl flex items-center justify-center transition-all duration-300 group outline-none"
                >
                  <tab.icon
                    size={20}
                    className="relative z-10 text-black"
                    strokeWidth={activeTab === tab.id ? 2.5 : 2}
                  />
                  
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute -bottom-1 w-1 h-1 bg-black rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Forward Message Modal */}
      <AnimatePresence>
        {messageToForward && (
          <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
            onClick={() => setMessageToForward(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-black/[0.03]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[14px] font-bold uppercase tracking-widest text-black">Forward to</h3>
                  <button onClick={() => setMessageToForward(null)} className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full text-black/40">
                    <X size={16} />
                  </button>
                </div>
                <div className="p-4 bg-black/[0.02] rounded-2xl border border-black/[0.03]">
                  <p className="text-[12px] text-black/60 italic line-clamp-2">"{messageToForward.text}"</p>
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => forwardMessage(conv.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-black/5 rounded-2xl transition-colors"
                  >
                    <img src={conv.participantAvatar} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 text-left">
                      <p className="text-[14px] font-bold text-black">{conv.participantName}</p>
                      <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{conv.isBlocked ? 'Blocked' : 'Online'}</p>
                    </div>
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                      <Forward size={18} />
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-4 bg-black/[0.02] border-t border-black/[0.03]">
                <p className="text-[9px] text-center font-bold uppercase tracking-widest text-black/20">Select a contact to forward</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Profile Modal */}
      <AnimatePresence>
        {viewingProfileContact && (
          <div 
            className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
            onClick={() => setViewingProfileContact(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="relative h-48 bg-black/[0.03]">
                <img src={viewingProfileContact.participantAvatar} className="w-full h-full object-cover" alt="" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setViewingProfileContact(null); }}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-20 hover:bg-black/40 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-[24px] font-bold text-white mb-1">{viewingProfileContact.participantName}</h2>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${viewingProfileContact.isBlocked ? 'bg-red-500' : 'bg-green-500'}`} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                      {viewingProfileContact.isBlocked ? 'Blocked' : 'Online'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2">About</h3>
                  <p className="text-[14px] text-black/60 leading-relaxed font-medium">
                    Trusted TimeGiG member since 2024. Active in the Market and Seeking professional GiGs.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/[0.02] rounded-3xl border border-black/[0.03]">
                    <p className="text-[18px] font-bold text-black mb-1">4.9</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 text-nowrap">Rating</p>
                  </div>
                  <div className="p-4 bg-black/[0.02] rounded-3xl border border-black/[0.03]">
                    <p className="text-[18px] font-bold text-black mb-1">128</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 text-nowrap">GiGs Done</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {viewingProfileContact.id !== 'me' ? (
                    <>
                      <button 
                        onClick={() => {
                          setActiveConversationId(viewingProfileContact.id);
                          setViewingProfileContact(null);
                        }}
                        className="w-full h-14 bg-black text-white rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[11px] active:scale-[0.98] transition-all"
                      >
                        <MessageSquare size={18} />
                        Send Message
                      </button>
                      <button 
                        onClick={() => {
                          setConversations(conversations.map(c => 
                            c.id === viewingProfileContact.id ? { ...c, isBlocked: !c.isBlocked } : c
                          ));
                          setViewingProfileContact(prev => prev ? { ...prev, isBlocked: !prev.isBlocked } : null);
                        }}
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[11px] border border-black/5 active:scale-[0.98] transition-all ${viewingProfileContact.isBlocked ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}
                      >
                        {viewingProfileContact.isBlocked ? 'Unblock Contact' : 'Block Contact'}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setViewingProfileContact(null)}
                      className="w-full h-14 bg-black text-white rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[11px] active:scale-[0.98] transition-all"
                    >
                      Close Profile
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Contact Modal */}
      <AnimatePresence>
        {isReportingModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldAlert size={24} />
                </div>
                <h2 className="text-[20px] font-bold text-black mb-2 leading-tight">Report Contact</h2>
                <p className="text-[13px] text-black/40 font-medium mb-8 leading-relaxed">
                  Help us understand what's happening. Your report is anonymous.
                </p>

                <div className="space-y-2 mb-8">
                  {['Spam', 'Harassment', 'Scams or Fraud', 'Inappropriate Content', 'Fake Profile', 'Other'].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setSelectedReportReason(reason)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                        selectedReportReason === reason 
                          ? 'bg-black border-black text-white shadow-lg' 
                          : 'bg-black/[0.02] border-transparent text-black/60 hover:bg-black/[0.04]'
                      }`}
                    >
                      <span className="text-[14px] font-bold">{reason}</span>
                      {selectedReportReason === reason && (
                        <motion.div layoutId="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check size={16} />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsReportingModalOpen(false);
                      setSelectedReportReason(null);
                    }}
                    className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-black/40 hover:bg-black/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinalReport}
                    disabled={!selectedReportReason}
                    className="flex-1 h-12 rounded-2xl bg-black text-white text-[14px] font-bold shadow-lg active:scale-95 transition-all disabled:opacity-20"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Centered Emoji Picker */}
      <AnimatePresence>
        {isEmojiPickerOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsEmojiPickerOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-black/[0.03]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 ml-2">Choose Emoji</span>
                <button 
                  onClick={() => setIsEmojiPickerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-black/5 rounded-full text-black/40 hover:text-black transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <EmojiPicker 
                onEmojiClick={onEmojiClick}
                width={320}
                height={400}
                theme={Theme.LIGHT}
                lazyLoadEmojis={true}
                searchDisabled={true}
                skinTonesDisabled={true}
                previewConfig={{ showPreview: false }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Profile Menu */}
      <AnimatePresence>
        {isProfileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[120] flex flex-col"
          >
            <header className="h-16 flex items-center px-6 border-b border-gray-50">
              <button onClick={() => setIsProfileMenuOpen(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">Profile</h2>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              {/* User Identity Section */}
              <div className="flex flex-col items-center mb-10">
                <div className="relative mb-4">
                  <img src={currentUserProfile.avatar} className="w-24 h-24 rounded-[32px] object-cover shadow-xl border-4 border-white" />
                  <div className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-xl shadow-lg">
                    <Edit3 size={16} />
                  </div>
                </div>
                <h3 className="text-[20px] font-bold text-black mb-1">{currentUserProfile.name}</h3>
                <p className="text-[12px] font-bold text-black/20 uppercase tracking-widest">Premium Member</p>
              </div>

              {/* Menu Actions */}
              <div className="space-y-2 max-w-sm mx-auto w-full">
                {[
                  { label: 'Edit profile', icon: User, onClick: () => setIsEditingProfile(true) },
                  { label: 'Admin', icon: ShieldCheck, onClick: () => setIsAdminOpen(true) },
                  { label: 'Subscription', icon: CreditCard, onClick: () => setIsSubscriptionOpen(true) },
                  { label: 'Settings', icon: Settings, onClick: () => setIsSettingsOpen(true) },
                  { label: 'About', icon: Info, onClick: () => setIsAboutOpen(true) },
                  { label: 'Help', icon: HelpCircle, onClick: () => setIsHelpOpen(true) },
                ].map((item) => (
                  <button 
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-5 bg-black/[0.02] hover:bg-black/[0.04] rounded-3xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <item.icon size={20} className="text-black" />
                      </div>
                      <span className="text-[15px] font-bold text-black">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-black/10 group-hover:text-black/40 transition-colors" />
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              <div className="mt-10 max-w-sm mx-auto w-full">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-4 p-5 text-red-500 hover:bg-red-50 rounded-3xl transition-all font-bold"
                >
                  <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
                    <LogOut size={20} />
                  </div>
                  <span className="text-[15px]">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel Overlay */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[130] flex flex-col"
          >
            <header className="h-16 flex items-center px-6 border-b border-gray-50 bg-white">
              <button onClick={() => setIsAdminOpen(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">Admin Dashboard</h2>
            </header>

            {/* Admin Navigation Bar */}
            <div className="flex items-center justify-around px-6 h-20 bg-black/[0.02] border-b border-black/5">
              {[
                { id: 'Profit', icon: TrendingUp },
                { id: 'Agreements', icon: FileText },
                { id: 'Agents', icon: UserCheck },
                { id: 'Users', icon: Users },
                { id: 'Sellers', icon: Store },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id as any)}
                  className={`flex flex-col items-center gap-1.5 transition-all ${
                    adminTab === item.id ? 'text-black scale-110' : 'text-black/20 hover:text-black/40'
                  }`}
                >
                  <item.icon size={22} strokeWidth={adminTab === item.id ? 2.5 : 2} />
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${adminTab === item.id ? 'opacity-100' : 'opacity-0'}`}>
                    {item.id}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="max-w-sm mx-auto w-full">
                {adminTab === 'Profit' && (
                  <div className="space-y-4">
                    <div className="p-8 bg-black text-white rounded-[40px] shadow-xl">
                      <p className="text-[12px] font-bold uppercase tracking-widest text-white/40 mb-2">Total Profit</p>
                      <h3 className="text-[32px] font-bold mb-1">R128,450</h3>
                      <p className="text-[10px] font-bold text-green-400">+12% from last month</p>
                    </div>
                    <div className="p-6 bg-black/[0.03] rounded-3xl border border-black/5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-4">Monthly Breakdown</p>
                      <div className="space-y-3">
                        {['August', 'July', 'June'].map(month => (
                          <div key={month} className="flex justify-between items-center">
                            <span className="text-[14px] font-bold">{month}</span>
                            <span className="text-[14px] font-bold">R42,800</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {adminTab === 'Agreements' && (
                  <div className="space-y-4">
                    <h3 className="text-[18px] font-bold mb-4">Agreement Forms</h3>
                    <div className="space-y-3">
                      {[
                        'Standard GiG Agreement',
                        'Marketplace Terms of Service',
                        'Freelance Safety Contract',
                        'Premium Membership Terms'
                      ].map((form, i) => (
                        <div key={i} className="p-5 bg-black/[0.02] rounded-3xl flex items-center justify-between group hover:bg-black/[0.04] transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                              <FileText size={18} className="text-black" />
                            </div>
                            <span className="text-[14px] font-bold">{form}</span>
                          </div>
                          <ChevronRight size={18} className="text-black/10 group-hover:text-black/40 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === 'Agents' && (
                  <div className="space-y-4">
                    <div className="p-8 bg-black/[0.03] rounded-[40px] border border-black/5 mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <UserCheck size={24} className="text-black" />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold uppercase tracking-widest text-black/30">Active Agents</p>
                          <h3 className="text-[24px] font-bold text-black">1,245</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-black/40">Real-time online agents</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 px-2">Recently Active</h4>
                      {['Mark S.', 'Sarah J.', 'David K.'].map((agent, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-black/[0.02] rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-black/5 rounded-xl flex items-center justify-center text-[10px] font-bold">
                              {agent[0]}
                            </div>
                            <p className="text-[14px] font-bold text-black">{agent}</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === 'Users' && (
                  <div className="space-y-4">
                    <div className="p-8 bg-black/[0.03] rounded-[40px] border border-black/5 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Users size={24} className="text-black" />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold uppercase tracking-widest text-black/30">Registered Users</p>
                          <h3 className="text-[24px] font-bold text-black">8,942</h3>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 px-2">New Signups</h4>
                      {[
                        { name: 'Michael R.', time: '2m ago' },
                        { name: 'Jessica L.', time: '15m ago' },
                        { name: 'Robert P.', time: '1h ago' }
                      ].map((user, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-black/[0.02] rounded-2xl text-[14px] font-bold">
                          <span>{user.name}</span>
                          <span className="text-[11px] text-black/20">{user.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === 'Sellers' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-[18px] font-bold text-black">Market Sellers</h3>
                      <div className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                        2 Pending
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { 
                          name: 'Zanele Khumalo', 
                          store: 'Zanele\'s Crafts', 
                          avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150',
                          status: 'Verified',
                          docType: 'SA National ID'
                        },
                        { 
                          name: 'Sipho Mokoena', 
                          store: 'Tech Haven', 
                          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                          status: 'Pending',
                          docType: 'SA Passport'
                        },
                        { 
                          name: 'Lerato Modise', 
                          store: 'Urban Fashion', 
                          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                          status: 'Verified',
                          docType: 'SA National ID'
                        }
                      ].map((seller, i) => (
                        <div key={i} className="p-6 bg-black/[0.02] border border-black/5 rounded-[32px] space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <img src={seller.avatar} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" alt="" />
                              <div>
                                <h4 className="text-[15px] font-bold text-black">{seller.name}</h4>
                                <p className="text-[12px] font-bold text-black/40">{seller.store}</p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                              seller.status === 'Verified' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                            }`}>
                              {seller.status}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-black/5 hover:bg-black/5 transition-all group">
                              <ShieldCheck size={20} className="text-black/20 group-hover:text-black mb-2" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 group-hover:text-black">View ID</span>
                              <p className="text-[8px] font-bold text-black/20 mt-1">{seller.docType}</p>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-black/5 hover:bg-black/5 transition-all group">
                              <FileText size={20} className="text-black/20 group-hover:text-black mb-2" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 group-hover:text-black">Agreement</span>
                              <p className="text-[8px] font-bold text-black/20 mt-1">Marketplace Terms</p>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile View */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[130] flex flex-col"
          >
            <header className="h-16 flex items-center px-6 border-b border-gray-50">
              <button onClick={() => setIsEditingProfile(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">Edit Profile</h2>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="max-w-sm mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border border-black/5">
                <div className="relative h-48 bg-black/[0.03]">
                  <img src={currentUserProfile.avatar} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors">
                      <Camera size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-[24px] font-bold text-white mb-1">{currentUserProfile.name}</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Active</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2 block px-1">Display Name</label>
                      <input 
                        type="text" 
                        defaultValue={currentUserProfile.name}
                        className="w-full h-14 px-5 bg-black/[0.02] border-none rounded-2xl text-[15px] font-bold focus:ring-0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2 block px-1">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue={currentUserProfile.email}
                        className="w-full h-14 px-5 bg-black/[0.02] border-none rounded-2xl text-[15px] font-bold focus:ring-0 opacity-50 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2 block px-1">Bio</label>
                      <textarea 
                        defaultValue="Passionate creator and freelancer on TimeGiG."
                        className="w-full p-5 bg-black/[0.02] border-none rounded-2xl text-[15px] font-bold focus:ring-0 resize-none h-32"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/[0.02] rounded-3xl border border-black/[0.03]">
                      <p className="text-[18px] font-bold text-black mb-1">5.0</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 text-nowrap">My Rating</p>
                    </div>
                    <div className="p-4 bg-black/[0.02] rounded-3xl border border-black/[0.03]">
                      <p className="text-[18px] font-bold text-black mb-1">0</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 text-nowrap">Listings</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="w-full h-16 bg-black text-white rounded-3xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[12px] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Overlay */}
      <AnimatePresence>
        {isAboutOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-white z-[200] flex flex-col"
          >
            <header className="h-16 flex items-center px-6 border-b border-gray-50">
              <button onClick={() => setIsAboutOpen(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">About TimeGiG</h2>
            </header>
            <div className="flex-1 overflow-y-auto px-8 py-12">
              <div className="max-w-sm mx-auto">
                <div className="w-20 h-20 bg-black rounded-[32px] flex items-center justify-center mb-10 shadow-2xl mx-auto">
                  <h1 className="text-white text-[24px] font-black tracking-tighter">TG</h1>
                </div>
                <h3 className="text-[28px] font-bold text-black mb-6 tracking-tight text-center">Empowering South Africa's Hustle</h3>
                <div className="space-y-6 text-black/60 leading-relaxed font-medium">
                  <p>
                    TimeGiG is more than just a marketplace; it's a community-driven ecosystem designed specifically for the South African landscape.
                  </p>
                  <p>
                    Whether you're a skilled professional looking for your next "GiG", a business owner seeking urgent services, or an enthusiast wanting to trade quality goods, TimeGiG provides a secure, high-contrast environment to connect and grow.
                  </p>
                  <p>
                    Our mission is to simplify the local economy by providing tools that are as hardworking as the people using them. From Cape Town to Sandton, we're building the future of local trade.
                  </p>
                </div>
                <div className="mt-12 pt-8 border-t border-black/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/20 text-center">Version 1.0.4 • Crafted with Passion</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Overlay */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-white z-[200] flex flex-col"
          >
            <header className="h-16 flex items-center px-6 border-b border-gray-50">
              <button onClick={() => setIsHelpOpen(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">Help Center</h2>
            </header>
            <div className="flex-1 overflow-y-auto px-8 py-12">
              <div className="max-w-sm mx-auto space-y-8">
                <section>
                  <h3 className="text-[18px] font-bold text-black mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-black rounded-full" />
                    How to use TimeGiG
                  </h3>
                  <div className="space-y-4">
                    {[
                      { q: 'What are GiGs?', a: 'GiGs are professional service listings. Post yours to find new clients or browse to find experts.' },
                      { q: 'How do Seekers work?', a: 'Post a Seeker listing when you need help with a specific task urgently.' },
                      { q: 'Is the Market safe?', a: 'Yes! Chat directly with sellers and arrange secure meetups in your local area.' }
                    ].map((item, i) => (
                      <div key={i} className="p-5 bg-black/[0.02] rounded-3xl">
                        <p className="text-[14px] font-bold text-black mb-2">{item.q}</p>
                        <p className="text-[13px] font-medium text-black/40">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-[18px] font-bold text-black mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-black rounded-full" />
                    Messaging Tips
                  </h3>
                  <div className="p-5 bg-black text-white rounded-[40px] shadow-xl">
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">1</div>
                        <p className="text-[13px] font-medium text-white/80">Always keep conversations within the app for safety.</p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">2</div>
                        <p className="text-[13px] font-medium text-white/80">Be clear about your pricing expectations and timelines when reaching out.</p>
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscription Overlay */}
      <AnimatePresence>
        {isSubscriptionOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[200] flex flex-col"
          >
            <header className="h-16 flex items-center px-6 border-b border-gray-50">
              <button onClick={() => setIsSubscriptionOpen(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">Subscription</h2>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="max-w-sm mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-[24px] font-bold text-black mb-2">Upgrade to Pro</h3>
                  <p className="text-black/40 text-[14px]">Unlock premium features and reach more people.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Basic Plan */}
                  <div className="p-8 bg-black/[0.02] border-2 border-black/5 rounded-[40px] relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-[18px] font-bold text-black mb-1">Standard</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/20">Monthly</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[24px] font-bold text-black">R49,99</p>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {['Up to 5 listings', 'Basic visibility', 'Standard support'].map((feat, i) => (
                        <li key={i} className="flex items-center gap-3 text-[13px] font-medium text-black/60">
                          <Check size={16} className="text-black" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full h-14 bg-black/5 text-black rounded-2xl font-bold text-[12px] uppercase tracking-widest active:scale-95 transition-all">
                      Choose Plan
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div className="p-8 bg-black text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white">Popular</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-[18px] font-bold text-white mb-1">Professional</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Monthly</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[24px] font-bold text-white">R99,99</p>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {['Unlimited listings', 'Priority visibility', '24/7 Support', 'Custom profile badge'].map((feat, i) => (
                        <li key={i} className="flex items-center gap-3 text-[13px] font-medium text-white/80">
                          <Check size={16} className="text-white" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full h-14 bg-white text-black rounded-2xl font-bold text-[12px] uppercase tracking-widest active:scale-95 transition-all">
                      Choose Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Overlay */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[250] flex flex-col"
          >
            <header className="h-16 flex items-center px-6 border-b border-gray-50 bg-white">
              <button onClick={() => setIsNotificationsOpen(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase">Notifications</h2>
              <button 
                onClick={clearNotifications}
                className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-5 bg-black/[0.02] rounded-[32px] border border-black/5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          notif.type === 'chat' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {notif.type === 'chat' ? <MessageSquare size={16} /> : <Store size={16} />}
                        </div>
                        <span className="text-[13px] font-bold text-black">{notif.title}</span>
                      </div>
                      <span className="text-[10px] font-bold text-black/20 uppercase">{notif.time}</span>
                    </div>
                    <p className="text-[14px] text-black/60 leading-relaxed pl-11">{notif.message}</p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-black/10 py-20">
                  <Bell size={48} strokeWidth={1} className="mb-4" />
                  <p className="text-sm font-medium tracking-widest uppercase">No notifications</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound Selector Overlay */}
      <AnimatePresence>
        {isSoundSelectorOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 bg-white z-[300] flex flex-col"
          >
            <header className="h-16 flex items-center px-6 border-b border-gray-50">
              <button onClick={() => setIsSoundSelectorOpen(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">Notification Sound</h2>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="max-w-sm mx-auto grid grid-cols-1 gap-3">
                {NOTIFICATION_SOUNDS.map((sound, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedNotificationSound(i);
                      playSound(i, false);
                    }}
                    className={`w-full p-5 rounded-3xl flex items-center justify-between transition-all ${
                      selectedNotificationSound === i ? 'bg-black text-white' : 'bg-black/[0.02] hover:bg-black/[0.04]'
                    }`}
                  >
                    <span className="text-[15px] font-bold">{sound}</span>
                    {selectedNotificationSound === i && <Check size={18} />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Chat Sound Selector Overlay */}
      <AnimatePresence>
        {isChatSoundSelectorOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 bg-white z-[300] flex flex-col"
          >
            <header className="h-16 flex items-center px-6 border-b border-gray-50">
              <button onClick={() => setIsChatSoundSelectorOpen(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">Chat Notification Sound</h2>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="max-w-sm mx-auto grid grid-cols-1 gap-3">
                {CHAT_SOUNDS.map((sound, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedChatSound(i);
                      playSound(i, true);
                    }}
                    className={`w-full p-5 rounded-3xl flex items-center justify-between transition-all ${
                      selectedChatSound === i ? 'bg-black text-white' : 'bg-black/[0.02] hover:bg-black/[0.04]'
                    }`}
                  >
                    <span className="text-[15px] font-bold">{sound}</span>
                    {selectedChatSound === i && <Check size={18} />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[200] flex flex-col"
          >
            <header className="h-16 flex items-center px-6 border-b border-gray-50">
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">Settings</h2>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="max-w-sm mx-auto space-y-6">
                {[
                  { label: 'Notifications', icon: Bell, value: 'System', onClick: () => setIsSoundSelectorOpen(true) },
                  { label: 'Chat Sounds', icon: MessageSquare, value: 'Custom', onClick: () => setIsChatSoundSelectorOpen(true) },
                  { label: 'Privacy & Security', icon: ShieldCheck, value: '' },
                  { label: 'Theme', icon: Palette, value: 'Light' },
                  { label: 'Language', icon: Globe, value: 'English (ZA)' },
                  { label: 'Account Deletion', icon: Trash2, value: '', color: 'text-red-500' },
                ].map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                    }}
                    className="w-full flex items-center justify-between p-5 bg-black/[0.02] rounded-3xl hover:bg-black/[0.04] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <item.icon size={20} className={item.color || "text-black"} />
                      </div>
                      <span className={`text-[15px] font-bold ${item.color || "text-black"}`}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && <span className="text-[12px] font-bold text-black/20">{item.value}</span>}
                      <ChevronRight size={16} className="text-black/10" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen Comments Overlay */}
      <AnimatePresence>
        {isCommentsFullscreenOpen && activeItemForInteractions && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[300] flex flex-col"
          >
            <header className="h-16 flex items-center px-6 border-b border-gray-50 bg-white sticky top-0 z-10">
              <button onClick={() => setIsCommentsFullscreenOpen(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="flex-1 text-center text-[14px] font-bold tracking-[0.2em] uppercase mr-8">Comments</h2>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Original Content Preview */}
              <div className="mb-8 p-6 bg-black text-white rounded-[40px] shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[10px] font-bold">
                    {(activeItemForInteractions.user?.[0] || activeItemForInteractions.title?.[0] || '?').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold">{activeItemForInteractions.user || activeItemForInteractions.title}</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {activeItemForInteractions.tab || 'Community Post'}
                    </p>
                  </div>
                </div>
                
                {/* Text Content */}
                <p className="text-[15px] font-medium leading-relaxed opacity-90 mb-4">
                  {activeItemForInteractions.text || activeItemForInteractions.content || activeItemForInteractions.info || activeItemForInteractions.title}
                </p>

                {/* Media Content */}
                {activeItemForInteractions.media && activeItemForInteractions.media.length > 0 && (
                  <div className={`grid gap-2 mb-2 ${
                    activeItemForInteractions.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  }`}>
                    {activeItemForInteractions.media.map((item: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="relative aspect-video rounded-2xl overflow-hidden bg-white/5"
                      >
                        {item.type === 'image' ? (
                          <img src={item.url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/10">
                            <Video className="text-white/20" size={24} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {activeItemForInteractions.price && (
                  <div className="mt-2 py-2 px-4 bg-white/10 rounded-xl inline-block">
                    <span className="text-[12px] font-bold text-white/60 mr-2 uppercase tracking-widest">Price</span>
                    <span className="text-[16px] font-bold text-white">{activeItemForInteractions.price}</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 px-2">Discussion</h3>
                {activeItemForInteractions.comments && activeItemForInteractions.comments.length > 0 ? (
                activeItemForInteractions.comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4">
                    <button 
                      onClick={() => {
                        const isMe = comment.user === 'You';
                        setViewingProfileContact({
                          id: isMe ? 'me' : comment.id,
                          participantName: isMe ? currentUserProfile.name : comment.user,
                          participantAvatar: isMe ? currentUserProfile.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user)}&background=random&color=fff&size=128`,
                          lastMessage: isMe ? 'Your professional profile' : 'View profile',
                          timestamp: new Date(),
                          unreadCount: 0,
                          isOnline: true,
                          isBlocked: false,
                          messages: []
                        });
                      }}
                      className="w-10 h-10 rounded-2xl bg-black/[0.05] flex-shrink-0 flex items-center justify-center overflow-hidden hover:bg-black/10 transition-all active:scale-90"
                    >
                      {comment.user === 'You' ? (
                        <img src={currentUserProfile.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-[10px] font-bold text-black/40 uppercase">
                          {(comment.user?.[0] || '?')}
                        </span>
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="bg-black/[0.02] p-4 rounded-3xl rounded-tl-none">
                        <p className="text-[14px] font-bold text-black mb-1">{comment.user}</p>
                        <p className="text-[14px] font-medium text-black/70">{comment.text}</p>
                      </div>
                      <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest mt-2 ml-1">
                        {comment.timestamp instanceof Date 
                          ? comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Just now'
                        }
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-black/10 py-20">
                  <MessageCircle size={48} strokeWidth={1} className="mb-4" />
                  <p className="text-sm font-medium tracking-widest uppercase">No comments yet</p>
                </div>
              )}
            </div>
          </div>

            <div className="p-6 border-t border-gray-50 bg-white">
              <div className="flex items-center gap-3 bg-black/[0.02] p-2 pr-2 pl-6 rounded-[32px] border border-black/5 focus-within:border-black/10 transition-all">
                <input 
                  type="text" 
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                  placeholder="Share your thoughts..."
                  className="flex-1 bg-transparent border-none outline-none text-[15px] py-3 text-black placeholder:text-black/20"
                />
                <button 
                  onClick={handlePostComment}
                  disabled={!newCommentText.trim()}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    newCommentText.trim() ? 'bg-black text-white active:scale-95 shadow-lg' : 'bg-black/5 text-black/20'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Likes List Overlay */}
      <AnimatePresence>
        {isLikesListOpen && activeItemForInteractions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[310] flex items-center justify-center px-6 pointer-events-none"
          >
            <div className="bg-white w-full max-w-xs rounded-[40px] shadow-2xl p-8 pointer-events-auto border border-black/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[14px] font-bold uppercase tracking-widest">Liked by</h3>
                <button onClick={() => setIsLikesListOpen(false)} className="text-black/20 hover:text-black transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {[
                  { name: 'Sarah J', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
                  { name: 'David Wilson', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150' },
                  { name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
                  { name: 'Marcus K', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }
                ].slice(0, activeItemForInteractions.likes || 4).map((user, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <img src={user.avatar} className="w-10 h-10 rounded-2xl object-cover border border-black/5" />
                    <span className="text-[15px] font-bold text-black">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

