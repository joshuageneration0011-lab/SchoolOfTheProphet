import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, Battery, Shield, Settings, LogOut, ChevronRight, Play, Star,
  BookOpen, Users, MessageSquare, Send, ArrowRight, Compass,
  Bell, PlayCircle, CheckCircle, Zap
} from 'lucide-react';
import { api } from '../services/api';

interface Course {
  id: string;
  title: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  rating: number;
  students: number;
  thumbnail: string;
  category: string;
  duration: string;
  lessons: number;
  level: string;
  description: string;
  whatYouLearn: string[];
  requirements: string[];
  videos?: { title: string; duration: string; url: string }[];
}

export const MobilePreviewPage = () => {
  // Mobile app navigation state: 'onboarding' | 'login' | 'app'
  const [appState, setAppState] = useState<'onboarding' | 'login' | 'app'>('login');
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  
  // App navigation state: 'portal' | 'library' | 'mentorship' | 'profile'
  const [activeTab, setActiveTab] = useState<'portal' | 'library' | 'mentorship' | 'profile'>('portal');
  
  // App Data & Session States
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [activeTabCourseDetails, setActiveTabCourseDetails] = useState<'overview' | 'lessons' | 'details'>('overview');
  
  // Login fields
  const [email, setEmail] = useState('student@sop.org');
  const [password, setPassword] = useState('student123');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Chat/Mentorship States
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      from: 'Sister Chidinma',
      message: 'Good evening Prophet, I had a vivid dream last night about golden scrolls. Can we discuss this?',
      date: 'June 12, 2026',
      isMe: false,
    },
    {
      id: 2,
      from: 'Prophet Elijah',
      message: 'Shalom Chidinma. Golden scrolls represent revelations ready to be unsealed in this season. We will discuss alignment tonight.',
      date: 'June 12, 2026',
      isMe: false,
    }
  ]);
  const [newMessageText, setNewMessageText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Daily Activation States
  const [activationInput, setActivationInput] = useState('');
  const [submittedActivations, setSubmittedActivations] = useState<string[]>([]);
  const [showActivationModal, setShowActivationModal] = useState(false);

  // Status Bar Clock
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    // Clock tick
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const hoursStr = hours < 10 ? `0${hours}` : `${hours}`;
      setCurrentTime(`${hoursStr}:${minutesStr}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch courses from backend api
    const loadCourses = async () => {
      try {
        const data = await api.courses.list();
        setCourses(data);
      } catch (err) {
        // Mock fallback courses
        setCourses([
          {
            id: '1',
            title: 'Foundations of Prophetic Ministry',
            instructor: 'Prophet Elijah Mensah',
            price: 29999,
            rating: 4.9,
            students: 14520,
            thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=450&fit=crop',
            category: 'Prophetic',
            duration: '24 hours',
            lessons: 5,
            level: 'Beginner',
            description: "Learn the biblical foundations of the prophetic office, hearing God's voice, and operating in the gift of prophecy.",
            whatYouLearn: ["Hearing God's voice clearly", "Understanding prophetic gifts", "Delivering prophetic words"],
            requirements: ["A Bible (any version)", "Sincere desire to grow"],
            videos: [
              { title: 'Lesson 1: The Calling of the Prophet', duration: '15 min', url: '' },
              { title: 'Lesson 2: Protocol of the Spirit', duration: '20 min', url: '' }
            ]
          },
          {
            id: '2',
            title: 'The School of Intercessory Prayer',
            instructor: 'Prophetess Grace Adeyemi',
            price: 19999,
            rating: 4.8,
            students: 11230,
            thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=450&fit=crop',
            category: 'Prayer',
            duration: '18 hours',
            lessons: 3,
            level: 'Intermediate',
            description: 'Master the art of intercessory prayer, travailing in the Spirit, and standing in the gap for nations.',
            whatYouLearn: ["Principles of intercession", "Travailing prayer", "Spiritual warfare"],
            requirements: ["Basic understanding of prayer"],
            videos: [
              { title: 'Lesson 1: Understanding Intercession', duration: '22 min', url: '' }
            ]
          }
        ]);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const data = await api.auth.login(email, password);
      setUser(data);
      setAppState('app');
    } catch (err: any) {
      // Offline fallback
      if (email === 'student@sop.org' && password === 'student123') {
        setUser({
          name: 'Demo Student',
          email: 'student@sop.org',
          role: 'student',
          enrolledCourses: ['1', '2']
        });
        setAppState('app');
      } else {
        setLoginError('Invalid email or password');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;
    const msg = {
      id: Date.now(),
      from: user?.name || 'Student',
      message: newMessageText,
      date: 'Just now',
      isMe: true,
    };
    setMessages(prev => [...prev, msg]);
    setNewMessageText('');

    // Trigger smart response
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        from: 'Prophet Elijah',
        message: getSpiritualReply(newMessageText),
        date: 'Just now',
        isMe: false,
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  const getSpiritualReply = (text: string): string => {
    const txt = text.toLowerCase();
    if (txt.includes('dream') || txt.includes('vision')) {
      return "Ensure you record it immediately. Dreams are spiritual telegraphs. Pay attention to repeating symbols like numbers, scrolls, or portals.";
    }
    if (txt.includes('voice') || txt.includes('hear')) {
      return "The voice of God often manifests as a still, small whisper or a sudden knowing. Silence your mind, focus on scripture, and test the spirit.";
    }
    if (txt.includes('help') || txt.includes('stuck')) {
      return "Do not be discouraged. Spiritual growth is cyclical. Keep your prayer altar burning daily, even for 5 minutes.";
    }
    return "Grace and peace to you. Let us continue to exercise our spiritual senses so we can discern what the Father is doing in this hour.";
  };

  const handleLogActivation = () => {
    if (!activationInput.trim()) return;
    setSubmittedActivations(prev => [activationInput, ...prev]);
    setActivationInput('');
    setShowActivationModal(false);
  };

  // Onboarding Slides
  const onboardingSlides = [
    {
      title: 'School of the Prophets',
      subtitle: 'Equipping believers in prophetic ministry, prayer, and kingdom leadership.',
      image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=800&fit=crop'
    },
    {
      title: 'Anointed Curriculum',
      subtitle: 'Learn from seasoned prophets and watchmen. Grow in spiritual gifts.',
      image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=800&fit=crop'
    },
    {
      title: 'Active Mentorship',
      subtitle: 'Engage in circles and share your activations directly with mentors.',
      image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=800&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden select-none">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* Left Side: Product/Features Info */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 to-amber-500/15 border border-purple-500/35">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">SOP Mobile Android App</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Premium Mobile <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 bg-clip-text text-transparent">
              E-Learning App
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            We have designed a professional and high-fidelity Flutter mobile application for students. Look inside the interactive simulator on the right to preview the layout, curriculum tabs, real-time API integrations, and mentorship chat!
          </p>

          {/* Key app features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0 pt-4">
            {[
              { title: 'Interactive Onboarding', desc: 'Smooth, beautiful introduction slides' },
              { title: 'Daily Activations', desc: 'Log responses and build spiritual habits' },
              { title: 'Mentorship Chats', desc: 'Ask questions and receive instant mentor replies' },
              { title: 'Video Lecture Player', desc: 'Curriculum lessons viewable instantly' }
            ].map((f, idx) => (
              <div key={idx} className="flex gap-3 p-4 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-colors">
                <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-bold text-sm text-white">{f.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Smartphone Simulator */}
        <div className="lg:col-span-5 flex justify-center">
          
          {/* Smartphone Frame Wrapper */}
          <div className="relative w-[360px] h-[740px] bg-slate-950 rounded-[44px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col ring-1 ring-white/10">
            
            {/* Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-5 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full mr-2"></div>
              <div className="w-12 h-1 bg-slate-950 rounded-full"></div>
            </div>

            {/* Simulated Status Bar */}
            <div className="h-9 bg-slate-950 px-6 flex items-center justify-between z-40 text-xs font-bold text-white/90">
              <span>{currentTime}</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] tracking-widest font-mono">5G</span>
                <Battery className="w-4 h-4 fill-white/80" />
              </div>
            </div>

            {/* Screen Content Wrapper */}
            <div className="flex-1 bg-slate-900 text-white overflow-hidden flex flex-col relative select-none">
              
              <AnimatePresence mode="wait">
                
                {/* 1. ONBOARDING SCREEN */}
                {appState === 'onboarding' && (
                  <motion.div
                    key="onboarding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col bg-gradient-to-b from-indigo-950 to-slate-900 justify-between p-6 relative"
                  >
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-extrabold text-sm text-amber-400">SOP ACADEMY</span>
                      <button onClick={() => setAppState('login')} className="text-xs font-bold text-white/60 hover:text-white">Skip</button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center my-4 space-y-6">
                      <img 
                        src={onboardingSlides[onboardingIndex].image} 
                        alt="slide" 
                        className="w-48 h-48 object-cover rounded-3xl shadow-lg border border-white/10 shadow-purple-500/10"
                      />
                      <div className="space-y-3 text-center">
                        <h3 className="text-2xl font-black">{onboardingSlides[onboardingIndex].title}</h3>
                        <p className="text-xs text-indigo-200 leading-relaxed max-w-[260px] mx-auto">
                          {onboardingSlides[onboardingIndex].subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      {/* Dots */}
                      <div className="flex gap-2">
                        {onboardingSlides.map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all ${onboardingIndex === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/30'}`}
                          />
                        ))}
                      </div>

                      {/* Next button */}
                      <button
                        onClick={() => {
                          if (onboardingIndex === onboardingSlides.length - 1) {
                            setAppState('login');
                          } else {
                            setOnboardingIndex(prev => prev + 1);
                          }
                        }}
                        className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-slate-950 font-bold hover:scale-105 transition-transform"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. LOGIN SCREEN */}
                {appState === 'login' && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex-1 flex flex-col bg-slate-950 p-6 justify-center"
                  >
                    <div className="space-y-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-2xl font-bold">Portal Login</h3>
                        <p className="text-xs text-gray-400 mt-1">SOP Academy Mobile App</p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4 pt-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                            placeholder="student@sop.org"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                          <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                            placeholder="student123"
                            required
                          />
                        </div>

                        {loginError && (
                          <p className="text-xs text-red-500 text-center font-semibold">{loginError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={isLoggingIn}
                          className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-3 rounded-xl text-sm transition-colors mt-6"
                        >
                          {isLoggingIn ? 'Verifying...' : 'Login to App'}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* 3. MAIN APP SHELL */}
                {appState === 'app' && (
                  <motion.div
                    key="app-shell"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col h-full relative"
                  >
                    
                    {/* Active screen rendering */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                      
                      {/* COURSE DETAIL SUB-PAGE (If selected) */}
                      {selectedCourse ? (
                        <div className="space-y-4">
                          <button 
                            onClick={() => {
                              setSelectedCourse(null);
                              setIsPlayingVideo(false);
                            }}
                            className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-2"
                          >
                            ← Back to Catalog
                          </button>

                          {/* Video Play Simulator */}
                          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10">
                            {isPlayingVideo ? (
                              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950">
                                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <span className="text-xs font-semibold text-gray-300">Playing lesson streaming...</span>
                              </div>
                            ) : (
                              <>
                                <img src={selectedCourse.thumbnail} alt="thumbnail" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <button onClick={() => setIsPlayingVideo(true)} className="p-3 bg-amber-400 text-slate-950 rounded-full hover:scale-105 transition-transform">
                                    <Play className="w-6 h-6 fill-slate-950" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase">{selectedCourse.category}</span>
                            <h3 className="font-extrabold text-lg pt-1">{selectedCourse.title}</h3>
                            <p className="text-xs text-gray-400">By {selectedCourse.instructor}</p>
                          </div>

                          {/* Tabs */}
                          <div className="flex border-b border-white/10">
                            {['overview', 'lessons', 'details'].map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setActiveTabCourseDetails(tab as any)}
                                className={`flex-1 py-2 text-xs font-bold uppercase border-b-2 transition-colors ${activeTabCourseDetails === tab ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-500'}`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>

                          {/* Tab Content */}
                          <div className="text-xs min-h-[160px] pb-4">
                            {activeTabCourseDetails === 'overview' && (
                              <p className="text-gray-400 leading-relaxed mt-2">{selectedCourse.description}</p>
                            )}
                            
                            {activeTabCourseDetails === 'lessons' && (
                              <div className="space-y-2 mt-2">
                                {(selectedCourse.videos || [
                                  { title: 'Lesson 1: Introduction', duration: '12 min' },
                                  { title: 'Lesson 2: Core Protocols', duration: '25 min' }
                                ]).map((v, i) => (
                                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2">
                                      <PlayCircle className="w-4 h-4 text-amber-400" />
                                      <span className="font-semibold text-white truncate max-w-[150px]">{v.title}</span>
                                    </div>
                                    <span className="text-gray-400 text-[10px]">{v.duration}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {activeTabCourseDetails === 'details' && (
                              <div className="space-y-3 mt-2">
                                <div>
                                  <h4 className="font-bold text-white mb-1">What you learn</h4>
                                  <ul className="list-disc pl-4 text-gray-400 space-y-1">
                                    {selectedCourse.whatYouLearn.map((w, i) => <li key={i}>{w}</li>)}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* PORTAL TAB */}
                          {activeTab === 'portal' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                              {/* Welcome Header */}
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Shalom,</span>
                                  <h3 className="text-lg font-bold">{user?.name || 'Student'}</h3>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center font-bold text-sm text-slate-950">
                                  {user?.name?.charAt(0) || 'S'}
                                </div>
                              </div>

                              {/* Daily Activation card */}
                              <div className="p-4 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden">
                                <div className="flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-amber-400" />
                                  <span className="text-[9px] font-bold text-amber-400 tracking-wider">DAILY ACTIVATION</span>
                                </div>
                                <h4 className="font-bold text-sm mt-2">Discerning Atmospheric Shifts</h4>
                                <p className="text-[10px] text-indigo-200 mt-1 leading-relaxed">
                                  Spend 10 minutes in absolute silence. Log the spiritual sensations in your environment.
                                </p>
                                <button
                                  onClick={() => setShowActivationModal(true)}
                                  className="mt-4 px-3 py-1.5 bg-white text-indigo-900 font-bold rounded-lg text-[10px]"
                                >
                                  Log Activation
                                </button>
                              </div>

                              {/* Submissions list if any */}
                              {submittedActivations.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-[10px] font-bold text-gray-400 uppercase">Your logged logs</h5>
                                  <div className="space-y-1.5">
                                    {submittedActivations.map((act, i) => (
                                      <div key={i} className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] text-gray-300">
                                        {act}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* My Courses */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase">My Enrolled Courses</h4>
                                {courses.slice(0, 2).map((c) => (
                                  <div 
                                    key={c.id} 
                                    onClick={() => setSelectedCourse(c)}
                                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors"
                                  >
                                    <img src={c.thumbnail} alt="thumb" className="w-16 h-10 object-cover rounded-lg" />
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-bold text-xs text-white truncate">{c.title}</h5>
                                      <p className="text-[9px] text-gray-400">{c.lessons} lessons</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          {/* LIBRARY CATALOG TAB */}
                          {activeTab === 'library' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                              <div>
                                <h3 className="text-lg font-bold">Catalog Library</h3>
                                <p className="text-[10px] text-gray-400">Expand your spiritual curriculum</p>
                              </div>

                              <div className="space-y-3">
                                {courses.map((c) => (
                                  <div 
                                    key={c.id} 
                                    onClick={() => setSelectedCourse(c)}
                                    className="p-3 bg-slate-900 border border-white/5 rounded-2xl hover:border-amber-400/20 transition-all cursor-pointer space-y-3"
                                  >
                                    <img src={c.thumbnail} alt="thumb" className="w-full h-28 object-cover rounded-xl" />
                                    <div className="space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[8px] bg-white/10 text-amber-400 px-2 py-0.5 rounded font-bold uppercase">{c.category}</span>
                                        <div className="flex items-center gap-1 text-[10px] font-bold">
                                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                          <span>{c.rating}</span>
                                        </div>
                                      </div>
                                      <h4 className="font-bold text-xs text-white">{c.title}</h4>
                                      <p className="text-[10px] text-gray-400 line-clamp-2">{c.description}</p>
                                      <div className="flex justify-between items-center pt-2">
                                        <span className="font-bold text-sm">₦{c.price.toLocaleString()}</span>
                                        <span className="text-[9px] text-amber-400 font-bold">View Curriculum →</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          {/* MENTORSHIP CHAT TAB */}
                          {activeTab === 'mentorship' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col -mx-4 -my-4 relative">
                              {/* Header */}
                              <div className="p-3 bg-slate-950 flex items-center gap-3 border-b border-white/5">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                                  <Users className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs">Eagles of Prophecy</h4>
                                  <p className="text-[8px] text-gray-400">Mentor: Prophet Elijah Mensah</p>
                                </div>
                              </div>

                              {/* Message Logs */}
                              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 h-[380px] bg-slate-900/50">
                                {messages.map((m) => (
                                  <div key={m.id} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[8px] text-gray-500 font-semibold mb-0.5">{m.from}</span>
                                    <div className={`p-2.5 rounded-2xl max-w-[80%] text-[10px] leading-relaxed ${m.isMe ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-200'}`}>
                                      {m.message}
                                    </div>
                                  </div>
                                ))}
                                <div ref={chatEndRef}></div>
                              </div>

                              {/* Input bar */}
                              <div className="p-2.5 bg-slate-950 flex items-center gap-2 border-t border-white/5">
                                <input 
                                  type="text" 
                                  value={newMessageText}
                                  onChange={e => setNewMessageText(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                  placeholder="Message circle..."
                                  className="flex-1 bg-white/5 border border-white/5 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                                <button 
                                  onClick={handleSendMessage}
                                  className="p-2 bg-amber-400 text-slate-950 rounded-full hover:scale-105 transition-transform"
                                >
                                  <Send className="w-3 h-3" />
                                </button>
                              </div>
                            </motion.div>
                          )}

                          {/* PROFILE TAB */}
                          {activeTab === 'profile' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
                              <div className="space-y-2 pt-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center font-bold text-2xl text-slate-950 mx-auto shadow-md">
                                  {user?.name?.charAt(0) || 'S'}
                                </div>
                                <h4 className="font-bold text-base">{user?.name || 'Demo Student'}</h4>
                                <p className="text-[10px] text-gray-400">{user?.email || 'student@sop.org'}</p>
                              </div>

                              <div className="space-y-1.5 text-left text-[11px] font-bold text-gray-300">
                                {[
                                  { title: 'Account Settings', icon: Settings },
                                  { title: 'Notification Settings', icon: Bell },
                                  { title: 'Privacy Shield', icon: Shield }
                                ].map((item, i) => (
                                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10">
                                    <div className="flex items-center gap-2">
                                      <item.icon className="w-4 h-4 text-amber-400" />
                                      <span>{item.title}</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                                  </div>
                                ))}
                              </div>

                              <button
                                onClick={() => {
                                  setUser(null);
                                  setAppState('login');
                                }}
                                className="w-full bg-red-900/40 border border-red-500/20 text-red-400 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-red-900/60"
                              >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                              </button>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Interactive Bottom Bar */}
                    {!selectedCourse && (
                      <div className="h-14 bg-slate-950 border-t border-white/5 flex items-center justify-around text-[9px] font-bold text-gray-500 select-none flex-shrink-0">
                        {[
                          { id: 'portal', label: 'Portal', icon: Compass },
                          { id: 'library', label: 'Library', icon: BookOpen },
                          { id: 'mentorship', label: 'Circle', icon: MessageSquare },
                          { id: 'profile', label: 'Profile', icon: Settings }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-amber-400' : 'text-gray-500'}`}
                          >
                            <tab.icon className="w-4.5 h-4.5" />
                            <span>{tab.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>

              {/* Home indicator bar (Simulated iOS/Android swipe) */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/30 rounded-full pointer-events-none"></div>

              {/* Simulated Daily Activation Modal */}
              {showActivationModal && (
                <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4 w-full max-w-[280px]">
                    <h5 className="font-bold text-xs text-white">Write Daily Log</h5>
                    <p className="text-[10px] text-gray-400">Describe the atmosphere sensations registered during silence.</p>
                    <textarea 
                      value={activationInput}
                      onChange={e => setActivationInput(e.target.value)}
                      placeholder="Type sensations here..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 h-20 resize-none"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowActivationModal(false)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-1.5 rounded-lg text-[10px] font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleLogActivation}
                        className="flex-1 bg-amber-400 text-slate-950 py-1.5 rounded-lg text-[10px] font-bold"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default MobilePreviewPage;
