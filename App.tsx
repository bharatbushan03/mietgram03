
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Search, SquarePlus, Heart, MessageCircle, 
  Send, Bookmark, MoreHorizontal, User as UserIcon,
  Sparkles, MapPin, Compass, Clapperboard, LogOut, Loader2,
  Bell, Globe, Info, Settings, Grid, Play, ShieldAlert,
  ChevronLeft, Camera, Smile, CheckCircle2, History,
  X, Music, Volume2, Share2, Facebook
} from 'lucide-react';
import { MIET_DOMAIN, DOMAIN_REGEX, OAUTH_CONFIG } from './constants';
import { User, Post, Story, Notification, Chat, Message, CampusRole } from './types';
import { generateSmartCaption, searchCampusEvents, getCampusLocations } from './services/geminiService';

// --- UTILS ---
const clsx = (...classes: any[]) => classes.filter(Boolean).join(' ');

// --- MOCK DATA ---
const MOCK_CURRENT_USER: User = {
  id: 'me',
  username: 'aman_miet',
  fullName: 'Aman Sharma',
  email: 'aman.sharma@mietjammu.in',
  profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aman',
  role: 'Student',
  bio: 'CSE 2025 | Building the future at MIET 🏛️💻',
  followers: ['1', '2', '3'],
  following: ['4', '5'],
  isPrivate: false,
  isVerified: true,
  streakCount: 12
};

const MOCK_REELS: Post[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `reel-${i}`,
  userId: `u${i}`,
  username: `campus_star_${i}`,
  userImage: `https://i.pravatar.cc/150?u=r${i}`,
  mediaUrl: `https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4`, // Mock video
  mediaType: 'reel',
  caption: `Campus life is a movie! 🍿 #MIETReels #${i}`,
  likes: Array.from({ length: 150 }).map(() => 'id'),
  comments: [],
  createdAt: new Date().toISOString(),
  reelAudio: 'Campus Vibes - Original Audio'
}));

// --- SHARED COMPONENTS ---

const Skeleton = ({ className }: { className?: string }) => (
  <div className={clsx("animate-pulse bg-gray-200 rounded", className)} />
);

const HeartBurst = ({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      >
        <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl" />
      </motion.div>
    )}
  </AnimatePresence>
);

// --- REELS VIEW ---

const ReelsFeed = () => {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPos = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    const index = Math.round(scrollPos / height);
    if (index !== activeReelIndex) setActiveReelIndex(index);
  };

  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-screen bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      {MOCK_REELS.map((reel, idx) => (
        <div key={reel.id} className="h-screen w-full snap-start relative flex items-center justify-center">
          <video 
            src={reel.mediaUrl} 
            className="h-full w-full object-cover" 
            autoPlay={idx === activeReelIndex} 
            loop 
            muted 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          
          {/* Interaction Bar */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 text-white">
            <div className="flex flex-col items-center">
              <button className="p-2 active:scale-125 transition-transform">
                <Heart className="w-8 h-8" />
              </button>
              <span className="text-xs font-bold">{reel.likes.length}</span>
            </div>
            <div className="flex flex-col items-center">
              <button className="p-2"><MessageCircle className="w-8 h-8" /></button>
              <span className="text-xs font-bold">42</span>
            </div>
            <button className="p-2"><Send className="w-8 h-8 -rotate-45" /></button>
            <button className="p-2"><Bookmark className="w-8 h-8" /></button>
            <button className="p-2"><MoreHorizontal className="w-8 h-8" /></button>
          </div>

          {/* Reel Info */}
          <div className="absolute left-4 bottom-24 right-16 text-white space-y-4">
            <div className="flex items-center space-x-3">
              <img src={reel.userImage} className="w-8 h-8 rounded-full border border-white" alt="" />
              <span className="font-bold text-sm">{reel.username}</span>
              <button className="bg-transparent border border-white px-3 py-1 rounded-lg text-xs font-bold">Follow</button>
            </div>
            <p className="text-sm line-clamp-2">{reel.caption}</p>
            <div className="flex items-center space-x-2 text-xs font-medium">
              <Music className="w-4 h-4" />
              <span className="animate-marquee whitespace-nowrap overflow-hidden">{reel.reelAudio}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- SEARCH VIEW ---

const SearchOverlay = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ users: User[], posts: Post[] }>({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);

  const performSearch = async (q: string) => {
    if (!q) {
      setResults({ users: [], posts: [] });
      return;
    }
    setLoading(true);
    // Mocking search logic
    setTimeout(() => {
      setResults({
        users: [MOCK_CURRENT_USER].filter(u => u.username.includes(q)),
        posts: []
      });
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => performSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-xl mx-auto pt-14 md:pt-10 px-4 pb-20 h-screen">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for students, tags, or clubs..." 
          className="w-full h-12 pl-12 pr-10 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900 font-medium"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
        ) : query ? (
          <>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Recent Hits</h3>
            {results.users.map(u => (
              <Link to={`/profile/${u.username}`} key={u.id} className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <img src={u.profilePic} className="w-14 h-14 rounded-full border object-cover" alt="" />
                <div>
                  <p className="font-bold text-sm">{u.username}</p>
                  <p className="text-xs text-gray-500">{u.fullName} · {u.role}</p>
                </div>
              </Link>
            ))}
            {results.users.length === 0 && (
              <div className="text-center py-10">
                <Compass className="w-12 h-12 mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm font-medium">No MIET members found for "{query}"</p>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-3 gap-1">
             {Array.from({ length: 12 }).map((_, i) => (
               <div key={i} className="aspect-square bg-gray-100 animate-pulse" />
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- AUTH VIEW (Enhanced with OAuth) ---

const AuthView = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!DOMAIN_REGEX.test(email)) {
      setError("Please use your official @mietjammu.in email.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onLogin({
        ...MOCK_CURRENT_USER,
        email,
        username: email.split('@')[0],
      });
      setLoading(false);
    }, 1500);
  };

  const handleOAuth = (provider: 'google' | 'fb') => {
    // In a real app, this would redirect: window.location.href = OAUTH_CONFIG[provider];
    setLoading(true);
    setTimeout(() => {
      onLogin(MOCK_CURRENT_USER);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter text-indigo-600 italic">mietGram</h1>
          <p className="text-gray-400 font-medium">Campus vibes restricted to MIET Jammu.</p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => handleOAuth('google')}
            className="w-full h-12 flex items-center justify-center space-x-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm text-gray-700"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-5 h-5" alt="" />
            <span>Continue with Google</span>
          </button>
          <button 
            onClick={() => handleOAuth('fb')}
            className="w-full h-12 flex items-center justify-center space-x-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm text-gray-700"
          >
            <Facebook className="w-5 h-5 text-blue-600 fill-blue-600" />
            <span>Continue with Facebook</span>
          </button>
        </div>

        <div className="relative flex items-center">
          <div className="flex-1 border-t border-gray-100"></div>
          <span className="px-4 text-[10px] font-bold text-gray-300 uppercase">Or use email</span>
          <div className="flex-1 border-t border-gray-100"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="College Email (@mietjammu.in)" 
              className="w-full h-14 px-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full h-14 px-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isRegister ? "Create Account" : "Log In"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="ml-1 text-indigo-600 font-bold hover:underline"
            >
              {isRegister ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('miet_user_v3');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('miet_user_v3', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('miet_user_v3');
  };

  if (!user) return <AuthView onLogin={handleLogin} />;

  return (
    <HashRouter>
      <div className="min-h-screen bg-white md:bg-gray-50 flex flex-col md:flex-row">
        {/* Sidebar Nav (Desktop) */}
        <nav className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 border-r bg-white p-4 pt-10 z-50">
          <Link to="/" className="text-3xl font-bold tracking-tighter text-indigo-600 mb-12 px-4 italic">mietGram</Link>
          <div className="flex flex-col space-y-2 flex-1">
            <Link to="/" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
              <Home className="w-6 h-6" /> <span>Home</span>
            </Link>
            <Link to="/search" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
              <Search className="w-6 h-6" /> <span>Search</span>
            </Link>
            <Link to="/reels" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
              <Clapperboard className="w-6 h-6" /> <span>Reels</span>
            </Link>
            <Link to="/messages" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
              <MessageCircle className="w-6 h-6" /> <span>Messages</span>
            </Link>
            <Link to="/notifications" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
              <Heart className="w-6 h-6" /> <span>Notifications</span>
            </Link>
            <Link to="/create" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
              <SquarePlus className="w-6 h-6" /> <span>Create</span>
            </Link>
            <Link to={`/profile/${user.username}`} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
              <img src={user.profilePic} className="w-6 h-6 rounded-full border object-cover" alt="" />
              <span>Profile</span>
            </Link>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-4 p-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all mt-auto">
            <LogOut className="w-6 h-6" /> <span>Logout</span>
          </button>
        </nav>

        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b flex justify-between items-center px-4 z-50">
          <span className="text-xl font-bold italic tracking-tighter text-indigo-600">mietGram</span>
          <div className="flex items-center space-x-4">
            <Link to="/notifications" className="text-gray-900"><Heart className="w-6 h-6" /></Link>
            <Link to="/messages" className="text-gray-900"><MessageCircle className="w-6 h-6" /></Link>
          </div>
        </header>

        {/* Mobile Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex justify-around items-center z-50 px-6">
          <Link to="/" className="text-gray-400"><Home className="w-7 h-7" /></Link>
          <Link to="/search" className="text-gray-400"><Search className="w-7 h-7" /></Link>
          <Link to="/create" className="text-gray-400"><SquarePlus className="w-7 h-7" /></Link>
          <Link to="/reels" className="text-gray-400"><Clapperboard className="w-7 h-7" /></Link>
          <Link to={`/profile/${user.username}`}>
            <img src={user.profilePic} className="w-7 h-7 rounded-full border" alt="" />
          </Link>
        </nav>

        <main className="flex-1 md:ml-64 relative min-h-screen">
          <Routes>
            <Route path="/" element={<HomeViewWrapper />} />
            <Route path="/search" element={<SearchOverlay />} />
            <Route path="/reels" element={<ReelsFeed />} />
            <Route path="/create" element={<CreateView />} />
            <Route path="/profile/:username" element={<ProfileView user={user} />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

// Reuse existing views or placeholders
const HomeViewWrapper = () => {
  return (
    <div className="max-w-xl mx-auto pt-14 md:pt-8 pb-20">
      {/* Stories Tray */}
      <div className="flex space-x-4 overflow-x-auto p-4 md:px-0 no-scrollbar mb-4">
        <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group">
          <div className="relative w-16 h-16 rounded-full border border-gray-200 p-[2px]">
            <img src={MOCK_CURRENT_USER.profilePic} className="w-full h-full rounded-full object-cover" alt="" />
            <div className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-0.5 border-2 border-white">
              <SquarePlus className="w-3 h-3" />
            </div>
          </div>
          <span className="text-[10px] text-gray-500">Your Story</span>
        </div>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600 transition-transform group-hover:scale-105">
              <img src={`https://i.pravatar.cc/150?u=s${i}`} className="w-full h-full rounded-full border-2 border-white object-cover" alt="" />
            </div>
            <span className="text-[10px] text-gray-500 truncate w-16 text-center">miet_peer_{i}</span>
          </div>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
         {Array.from({ length: 5 }).map((_, i) => (
           <PostCard key={i} post={{
             id: `${i}`,
             userId: 'u1',
             username: `miet_student_${i + 101}`,
             userImage: `https://i.pravatar.cc/150?u=${i + 10}`,
             mediaUrl: `https://picsum.photos/seed/miet${i + 50}/800/800`,
             mediaType: 'image',
             caption: 'Working on my new project at the library! 📚 #MIET #CSE',
             likes: [],
             comments: [],
             createdAt: new Date().toISOString()
           }} onLike={() => {}} />
         ))}
      </div>
    </div>
  );
};

const PostCard = ({ post, onLike }: { post: Post; onLike: () => void }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
  };

  return (
    <div className="bg-white border-y md:border md:rounded-xl overflow-hidden mb-4 shadow-sm">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <img src={post.userImage} className="w-10 h-10 rounded-full border object-cover" alt="" />
          <div>
            <p className="text-sm font-bold">{post.username}</p>
            <p className="text-[10px] text-gray-500">MIET Jammu Campus</p>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-500" />
      </div>

      <div className="relative aspect-square bg-gray-50" onDoubleClick={handleLike}>
        <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
        <HeartBurst show={showHeart} />
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={handleLike} className="active:scale-125 transition-transform">
              <Heart className={clsx("w-7 h-7", isLiked ? "text-red-500 fill-red-500" : "text-gray-800")} />
            </button>
            <MessageCircle className="w-7 h-7" />
            <Send className="w-7 h-7 -rotate-45" />
          </div>
          <Bookmark className="w-7 h-7" />
        </div>
        <p className="text-sm font-bold">1,200 likes</p>
        <p className="text-sm"><span className="font-bold mr-2">{post.username}</span>{post.caption}</p>
      </div>
    </div>
  );
};

const CreateView = () => {
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'reel'>('image');
  const [caption, setCaption] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleMagic = async () => {
    if (!prompt) return;
    setLoading(true);
    const text = await generateSmartCaption(prompt);
    setCaption(text);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto pt-14 md:pt-10 px-4 pb-20">
      <div className="bg-white md:border md:rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6" /></button>
          <h2 className="text-lg font-bold">Create MIET Moment</h2>
          <button className="text-indigo-600 font-bold">Share</button>
        </div>

        <div className="flex space-x-4 mb-6">
           {['image', 'video', 'reel'].map((type) => (
             <button 
              key={type} 
              onClick={() => setMediaType(type as any)}
              className={clsx("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all", 
                mediaType === type ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 text-gray-400"
              )}
             >
               {type}
             </button>
           ))}
        </div>

        <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 mb-8 cursor-pointer hover:bg-gray-100 transition-colors">
          <Camera className="w-12 h-12 mb-2" />
          <p className="text-sm font-medium">Select {mediaType}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2 mb-3 text-indigo-600">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">AI Caption Assistant</span>
            </div>
            <div className="flex gap-2">
              <input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What's happening?" 
                className="flex-1 text-sm bg-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300 border text-gray-900" 
              />
              <button onClick={handleMagic} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Magic"}
              </button>
            </div>
          </div>

          <textarea 
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full h-32 text-sm border-none bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-200 resize-none text-gray-900"
            placeholder="Write a caption..."
          />
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ user }: { user: User }) => {
  return (
    <div className="max-w-4xl mx-auto pt-14 md:pt-10 px-4 pb-20">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12">
        <div className="w-24 h-24 md:w-44 md:h-44 rounded-full p-[3px] bg-gradient-to-tr from-indigo-500 to-purple-500">
          <img src={user.profilePic} className="w-full h-full rounded-full border-4 border-white object-cover" alt="" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h2 className="text-2xl font-light">{user.username}</h2>
            <button className="bg-gray-100 px-4 py-1.5 rounded-lg text-sm font-semibold">Edit Profile</button>
          </div>
          <div className="flex justify-center md:justify-start gap-8">
            <span><strong className="block">42</strong> <small className="text-gray-400 uppercase">Posts</small></span>
            <span><strong className="block">1.2k</strong> <small className="text-gray-400 uppercase">Followers</small></span>
            <span><strong className="block">342</strong> <small className="text-gray-400 uppercase">Following</small></span>
          </div>
          <div>
            <p className="font-bold">{user.fullName}</p>
            <p className="text-sm text-gray-600">{user.bio}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 md:gap-4 border-t pt-4">
         {Array.from({ length: 9 }).map((_, i) => (
           <div key={i} className="aspect-square bg-gray-100 overflow-hidden">
             <img src={`https://picsum.photos/seed/prof${i}/500/500`} className="w-full h-full object-cover" alt="" />
           </div>
         ))}
      </div>
    </div>
  );
};
