import { useState, createContext, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './services/api';
import { 
  Menu, X, Search, User, BookOpen, Book, Award, Play, Star, 
  ChevronRight, CheckCircle, Clock, Users, DollarSign,
  TrendingUp, Video, FileText, Settings,
  LogOut, Heart, Download, Shield, Globe, Zap, Target,
  ArrowRight, PlayCircle, BarChart3, Bell,
  Filter, Grid, List, Mail, Phone, MapPin, Lock, Eye, LayoutDashboard,
  CreditCard, ClipboardList, MessageSquare, Trash,
  Radio, FileCheck, UserCheck, Tag, History, Wifi, Copy, Calendar, Send, Plus, Printer
} from 'lucide-react';

// Types
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
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  whatYouLearn: string[];
  requirements: string[];
  isFeatured?: boolean;
  isBestseller?: boolean;
  videos?: { id: string; title: string; url: string; duration: string }[];
}

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  category: string;
  pdfUrl?: string;
  selarUrl?: string;
  amazonUrl?: string;
  price: number;
  pages: number;
  downloads: number;
  rating: number;
}


interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'admin' | 'instructor';
  enrolledCourses?: string[];
  completedCourses?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
}

// Context
const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Mock Data
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Foundations of Prophetic Ministry',
    instructor: 'Prophet Elijah Mensah',
    price: 29999,
    originalPrice: 59999,
    rating: 4.9,
    students: 14520,
    thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=450&fit=crop',
    category: 'Prophetic',
    duration: '24 hours',
    lessons: 86,
    level: 'Beginner',
    description: 'Learn the biblical foundations of the prophetic office, hearing God\'s voice, and operating in the gift of prophecy with accuracy and integrity.',
    whatYouLearn: ['Hearing God\'s voice clearly', 'Understanding prophetic gifts', 'Delivering prophetic words', 'Prophetic protocol & ethics', 'Building a prophetic lifestyle'],
    requirements: ['A Bible (any version)', 'A sincere desire to grow spiritually', 'Willingness to practice hearing God'],
    isFeatured: true,
    isBestseller: true
  },
  {
    id: '2',
    title: 'The School of Intercessory Prayer',
    instructor: 'Prophetess Grace Adeyemi',
    price: 19999,
    originalPrice: 39999,
    rating: 4.8,
    students: 11230,
    thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=450&fit=crop',
    category: 'Prayer',
    duration: '18 hours',
    lessons: 52,
    level: 'Intermediate',
    description: 'Master the art of intercessory prayer, travailing in the Spirit, and standing in the gap for nations, communities, and individuals.',
    whatYouLearn: ['Principles of intercession', 'Travailing prayer', 'Spiritual warfare prayers', 'Prayer watches & schedules', 'Prophetic intercession'],
    requirements: ['Basic understanding of prayer', 'Committed prayer life'],
    isFeatured: true
  },
  {
    id: '3',
    title: 'Spiritual Warfare & Deliverance Mastery',
    instructor: 'Apostle David Okonkwo',
    price: 35000,
    rating: 4.7,
    students: 8945,
    thumbnail: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=450&fit=crop',
    category: 'Warfare',
    duration: '32 hours',
    lessons: 64,
    level: 'Advanced',
    description: 'Understand the dynamics of spiritual warfare, discerning demonic operations, and ministering deliverance with biblical authority.',
    whatYouLearn: ['Armor of God deep study', 'Identifying demonic strongholds', 'Deliverance ministry protocols', 'Self-deliverance techniques', 'Maintaining freedom'],
    requirements: ['Strong biblical foundation', 'Experience in prayer ministry'],
    isBestseller: true
  },
  {
    id: '4',
    title: 'Divine Healing & Miracles',
    instructor: 'Pastor Sarah Johnson',
    price: 24999,
    originalPrice: 44999,
    rating: 4.8,
    students: 9876,
    thumbnail: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&h=450&fit=crop',
    category: 'Healing',
    duration: '20 hours',
    lessons: 48,
    level: 'Intermediate',
    description: 'Explore the biblical basis for divine healing, learn to minister healing, and walk in the miraculous power of the Holy Spirit.',
    whatYouLearn: ['Theology of divine healing', 'Ministering healing to the sick', 'Operating in the gift of miracles', 'Building faith for the impossible', 'Healing testimonies & case studies'],
    requirements: ['Faith in God\'s healing power', 'Basic Bible knowledge']
  },
  {
    id: '5',
    title: 'Prophetic Worship & Psalmistry',
    instructor: 'Minister Ruth Okafor',
    price: 19999,
    rating: 4.9,
    students: 7654,
    thumbnail: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=450&fit=crop',
    category: 'Worship',
    duration: '16 hours',
    lessons: 40,
    level: 'Beginner',
    description: 'Learn to lead prophetic worship, flow in spontaneous songs of the Spirit, and create an atmosphere for God\'s presence.',
    whatYouLearn: ['Prophetic worship principles', 'Spontaneous worship flow', 'Psalmistry & new songs', 'Creating atmospheres of glory', 'Leading worship teams prophetically'],
    requirements: ['Musical ability helpful but not required', 'Love for worship']
  },
  {
    id: '6',
    title: 'Complete Bible School: Genesis to Revelation',
    instructor: 'Bishop James Eze',
    price: 49999,
    originalPrice: 99999,
    rating: 4.9,
    students: 23451,
    thumbnail: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&h=450&fit=crop',
    category: 'Bible Study',
    duration: '120 hours',
    lessons: 200,
    level: 'Beginner',
    description: 'A comprehensive journey through the entire Bible — understanding every book, key themes, prophetic patterns, and practical applications.',
    whatYouLearn: ['Old Testament survey', 'New Testament survey', 'Biblical theology', 'Hermeneutics & interpretation', 'Applying scripture to daily life', 'Prophetic patterns in scripture'],
    requirements: ['A Bible', 'Notebook for study', 'No prior theological training needed'],
    isFeatured: true,
    isBestseller: true
  },
  {
    id: '7',
    title: 'Kingdom Leadership & Apostolic Governance',
    instructor: 'Apostle Peter Nwachukwu',
    price: 39999,
    rating: 4.8,
    students: 6543,
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop',
    category: 'Leadership',
    duration: '28 hours',
    lessons: 72,
    level: 'Advanced',
    description: 'Learn the principles of apostolic governance, fivefold ministry, and kingdom leadership for building strong churches and ministries.',
    whatYouLearn: ['Fivefold ministry understanding', 'Apostolic governance structures', 'Church planting principles', 'Mentoring & discipleship', 'Ministry administration'],
    requirements: ['Active ministry involvement', 'Leadership experience']
  },
  {
    id: '8',
    title: 'Prophetic Evangelism & Soul Winning',
    instructor: 'Evangelist Mary Afolabi',
    price: 15000,
    rating: 4.7,
    students: 5432,
    thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=450&fit=crop',
    category: 'Evangelism',
    duration: '14 hours',
    lessons: 36,
    level: 'Beginner',
    description: 'Combine prophetic gifting with evangelism to reach souls effectively. Learn to use words of knowledge, prophecy, and compassion in outreach.',
    whatYouLearn: ['Prophetic evangelism principles', 'Words of knowledge in outreach', 'Street & marketplace ministry', 'Follow-up & discipleship', 'Building evangelism teams'],
    requirements: ['Heart for the lost', 'Basic evangelism experience helpful']
  }
];

const categories = [
  { name: 'Prophetic', icon: Target, color: 'bg-purple-500' },
  { name: 'Prayer', icon: Heart, color: 'bg-indigo-500' },
  { name: 'Worship', icon: Play, color: 'bg-amber-500' },
  { name: 'Bible Study', icon: BookOpen, color: 'bg-blue-500' },
  { name: 'Healing', icon: Shield, color: 'bg-green-500' },
  { name: 'Warfare', icon: Zap, color: 'bg-red-500' },
  { name: 'Leadership', icon: Users, color: 'bg-cyan-500' },
  { name: 'Evangelism', icon: Globe, color: 'bg-pink-500' }
];

const testimonials = [
  {
    name: 'Sister Chidinma Okafor',
    role: 'Prophetic Intercessor',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    text: 'SOP Academy transformed my prayer life completely. I now hear God\'s voice with clarity, and the prophetic training gave me confidence to minister in my local church. This is a life-changing platform!'
  },
  {
    name: 'Brother Emmanuel Adeyemi',
    role: 'Youth Pastor',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    text: 'The Bible School course deepened my understanding of Scripture in ways seminary couldn\'t. The spiritual warfare training equipped me to lead my youth ministry with greater authority and power.'
  },
  {
    name: 'Minister Grace Okoro',
    role: 'Worship Leader',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    text: 'The Prophetic Worship course unlocked a new dimension in my worship leading. I now flow in spontaneous songs and my worship team has been transformed. Thank you SOP Academy!'
  }
];

// Components
const Header = ({ onNavigate, currentPage }: { onNavigate: (page: string) => void, currentPage: string }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/98 via-indigo-900/98 to-purple-900/98 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-600 to-amber-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                SOP Academy
              </h1>
              <p className="text-xs text-indigo-300 hidden sm:block">School of the Prophets</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {['Home', 'Courses', 'About'].map((item) => (
              <button
                key={item}
                onClick={() => onNavigate(item.toLowerCase())}
                className={`text-base font-semibold transition-colors ${
                  currentPage === item.toLowerCase() 
                    ? 'text-amber-400' 
                    : 'text-indigo-200 hover:text-amber-400'
                }`}
              >
                {item}
              </button>
            ))}
            {/* Return to Dashboard pill — only shown to logged-in users on the course browsing pages */}
            {user && (currentPage === 'courses' || currentPage === 'course-detail') && (
              <motion.button
                onClick={() => onNavigate(user.role === 'admin' || user.role === 'instructor' ? 'admin-dashboard' : 'student-dashboard')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400/20 to-orange-500/20 hover:from-amber-400/30 hover:to-orange-500/30 border border-amber-400/40 hover:border-amber-400/70 text-amber-300 hover:text-amber-200 text-sm font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25"
              >
                <LayoutDashboard className="w-4 h-4" />
                My Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </nav>




          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onNavigate(user.role === 'admin' || user.role === 'instructor' ? 'admin-dashboard' : 'student-dashboard')}
                  className="flex items-center gap-2 text-indigo-200 hover:text-amber-400 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-amber-500/30">
                    {user.name.charAt(0)}
                  </div>
                  <button
                    onClick={() => onNavigate(user.role === 'admin' || user.role === 'instructor' ? 'admin-dashboard' : 'student-dashboard')}
                    className="text-sm font-medium text-indigo-100 hover:text-amber-400 transition-colors"
                  >
                    {user.name}
                  </button>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-indigo-200 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-sm font-medium text-indigo-200 hover:text-amber-400 transition-colors"
                >
                  Log In
                </button>
                <motion.button
                  onClick={() => onNavigate('signup')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-sm font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all"
                >
                  Sign Up Free
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-indigo-200 hover:text-amber-400 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/10 py-4 bg-slate-900/50"
            >
              <nav className="flex flex-col gap-4">
                {['Home', 'Courses', 'About'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      onNavigate(item.toLowerCase());
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-sm font-medium text-indigo-200 hover:text-amber-400 transition-colors"
                  >
                    {item}
                  </button>
                ))}
                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                  {user ? (
                    <>
                      {/* Prominent Return-to-Dashboard CTA on mobile when browsing courses */}
                      {(currentPage === 'courses' || currentPage === 'course-detail') && (
                        <button
                          onClick={() => {
                            onNavigate(user.role === 'admin' || user.role === 'instructor' ? 'admin-dashboard' : 'student-dashboard');
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-amber-400/20 to-orange-500/20 border border-amber-400/40 text-amber-300 text-sm font-bold rounded-xl transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Return to My Dashboard
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onNavigate(user.role === 'admin' || user.role === 'instructor' ? 'admin-dashboard' : 'student-dashboard');
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 text-sm font-medium text-indigo-200 hover:text-amber-400 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('login');
                          setMobileMenuOpen(false);
                        }}
                        className="text-sm font-medium text-indigo-200 hover:text-amber-400 transition-colors"
                      >
                        Log In
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('signup');
                          setMobileMenuOpen(false);
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-sm font-semibold rounded-xl shadow-lg"
                      >
                        Sign Up Free
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-amber-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">SOP Academy</h2>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              A prophetic training platform raising end-time warriors through anointed courses in prophecy, prayer, worship, warfare, and biblical studies.
            </p>
            <div className="flex gap-4">
              {['F', 'T', 'I', 'L', 'Y'].map((letter, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-500 transition-all text-white font-semibold border border-white/10">
                  {letter}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {['About Us', 'Courses', 'Instructors', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-3">
              {['Prophetic', 'Prayer', 'Worship', 'Bible Study', 'Healing', 'Warfare'].map((cat) => (
                <li key={cat}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{cat}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                info@sopacademy.org
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +234 800 SOP ACADEMY
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 SOP Academy — School of the Prophets. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const CourseCard = ({ course, onClick }: { course: Course; onClick: () => void }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-pointer group border border-gray-100"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {course.isBestseller && (
            <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
              Bestseller
            </span>
          )}
          {course.originalPrice && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-6 h-6 text-purple-600 ml-1" />
          </motion.div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            {course.category}
          </span>
          <span className="text-xs text-gray-500">{course.level}</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <Play className="w-4 h-4" />
            {course.lessons} lessons
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-gray-900">{course.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({course.students.toLocaleString()})</span>
          </div>
          <div className="text-right">
            {course.originalPrice && (
              <span className="text-sm text-gray-400 line-through mr-2">
                ₦{course.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-lg font-bold text-purple-600">₦{course.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Pages
const HomePage = ({ courses, onNavigate, onSelectCourse }: { courses: Course[], onNavigate: (page: string) => void, onSelectCourse: (course: Course) => void }) => {
  const activeCourses = courses && courses.length > 0 ? courses : mockCourses;
  const featuredCourses = activeCourses.filter(c => c.isFeatured || c.rating >= 4.8 || c.id === '1');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-amber-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-amber-900/70"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-white">Over 50,000 believers trained</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Raise Up in the{' '}
                <span className="text-amber-400">Prophetic</span> Anointing
              </h1>
              <p className="text-lg text-gray-200 mb-8 max-w-xl">
                Access anointed courses in prophecy, prayer, spiritual warfare, worship, and more. Learn from seasoned men and women of God and deepen your walk with the Holy Spirit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('courses')}
                  className="px-8 py-4 bg-amber-500 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                >
                  Explore Courses
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('signup')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Begin Your Training
                </motion.button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/10">
                {[
                  { value: '50K+', label: 'Believers' },
                  { value: '200+', label: 'Courses' },
                  { value: '50+', label: 'Ministers' }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 to-purple-500/30 rounded-3xl blur-2xl"></div>
                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl border border-white/15 overflow-hidden shadow-2xl shadow-purple-900/30">
                  {/* Video Header Bar */}
                  <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                      <PlayCircle className="w-3.5 h-3.5" />
                      Platform Introduction
                    </div>
                    <div className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full">
                      2 min
                    </div>
                  </div>

                  {/* Video Container */}
                  <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-indigo-900">
                    {!isVideoPlaying ? (
                      <>
                        {/* Thumbnail */}
                        <img
                          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop"
                          alt="Platform Introduction Video"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-purple-900/40"></div>

                        {/* Play Button */}
                        <motion.button
                          onClick={() => setIsVideoPlaying(true)}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer group"
                          whileHover={{ scale: 1.01 }}
                        >
                          <motion.div
                            className="relative"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            {/* Pulse rings */}
                            <div className="absolute inset-0 w-20 h-20 bg-amber-400/20 rounded-full animate-ping"></div>
                            <div className="absolute -inset-3 w-26 h-26 bg-amber-400/10 rounded-full"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/40 group-hover:shadow-amber-500/60 transition-shadow">
                              <Play className="w-8 h-8 text-white ml-1 fill-white" />
                            </div>
                          </motion.div>
                          <div className="text-center">
                            <p className="text-white font-semibold text-lg drop-shadow-lg">Watch Introduction</p>
                            <p className="text-white/70 text-sm drop-shadow-md">See what makes us different</p>
                          </div>
                        </motion.button>

                        {/* Bottom info overlay */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">SOP Academy</p>
                              <p className="text-white/60 text-xs">School of the Prophets</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/50 text-xs">
                            <Eye className="w-3.5 h-3.5" />
                            12.4K views
                          </div>
                        </div>
                      </>
                    ) : (
                      <iframe
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1"
                        title="SOP Academy — School of the Prophets Introduction"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    )}
                  </div>

                  {/* Video footer */}
                  <div className="px-5 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {[
                        { icon: Users, label: '50K+ Believers' },
                        { icon: Star, label: '4.9 Rating' },
                      ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-white/60 text-xs">
                          <stat.icon className="w-3.5 h-3.5 text-amber-400" />
                          {stat.label}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => onNavigate('signup')}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-xs font-semibold rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Explore by Spiritual Discipline
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the training that matches your calling. From prophecy to worship, we equip you for every dimension of ministry.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category, i) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => onNavigate('courses')}
                className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl hover:bg-purple-50 transition-colors group"
              >
                <div className={`w-14 h-14 ${category.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Elite Repository — Featured Courses */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14"
          >
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-purple-500 mb-3 block">
                Elite Repository
              </span>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Curated Systems for<br />
                <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Maximum Impact.</span>
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('courses')}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-900 text-gray-900 text-xs font-bold tracking-[0.15em] uppercase rounded-full hover:bg-gray-900 hover:text-white transition-all"
            >
              Full Repository
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Course Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.slice(0, 3).map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                onClick={() => onSelectCourse(course)}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-purple-200/50 transition-all cursor-pointer group border border-gray-100/80"
              >
                {/* Image Container */}
                <div className="p-4 pb-0">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-lg">
                        Elite
                      </span>
                      {course.isBestseller && (
                        <span className="px-3 py-1 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase rounded-full">
                          Bestseller
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 pt-4">
                  {/* Category + Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-purple-600">
                      {course.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-gray-800">{course.rating}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 text-lg leading-snug mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors">
                    {course.title}
                  </h3>

                  {/* Instructor */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                      {course.instructor.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {course.instructor}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">{course.duration}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-gray-900">₦{course.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Train with SOP Academy?
            </h2>
            <p className="text-indigo-200 max-w-2xl mx-auto">
              We're committed to raising a generation of prophetic voices through anointed teaching, mentorship, and community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Anointed Teaching', desc: 'Learn from seasoned prophets, apostles, and ministers who carry the fire of God' },
              { icon: Award, title: 'Certificates', desc: 'Earn ministry certificates upon completion of each spiritual training module' },
              { icon: Users, title: 'Prophetic Community', desc: 'Join a global community of believers growing together in the prophetic' },
              { icon: Globe, title: 'Train Anywhere', desc: 'Access anointed courses on any device — in your prayer closet or on the go' }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-indigo-200 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-indigo-800 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              What Our Students Say
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Join thousands of believers who have deepened their prophetic gifting and transformed their ministries through our courses.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-white mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-300">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-2xl border border-amber-200/50">
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 bg-clip-text text-transparent mb-4">
                Ready to Step Into Your Prophetic Calling?
              </h2>
              <p className="text-gray-700 mb-8 max-w-xl mx-auto text-lg">
                Join over 50,000 believers who are already being trained and equipped at SOP Academy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('signup')}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all shadow-purple-500/30"
                >
                  Get Started Free
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('courses')}
                  className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                >
                  Browse Courses
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const CoursesPage = ({ courses, onSelectCourse }: { courses: Course[], onSelectCourse: (course: Course) => void }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');

  const activeCourses = courses && courses.length > 0 ? courses : mockCourses;

  const filteredCourses = selectedCategory === 'All' 
    ? activeCourses 
    : activeCourses.filter(c => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50 to-purple-50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">All Courses</h1>
          <p className="text-gray-600">Discover courses that match your interests and goals</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort & View */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Grid className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <List className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <CourseCard course={course} onClick={() => onSelectCourse(course)} />
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CourseDetailPage = ({ 
  course, 
  onBack, 
  onEnroll,
  onResume
}: { 
  course: Course; 
  onBack: () => void; 
  onEnroll: () => void;
  onResume: (course: Course) => void;
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const { user } = useAuth();
  const isEnrolled = user && user.role === 'student' && user.enrolledCourses?.includes(course.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
    {/* Course Header */}
    <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Courses
          </button>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-500 text-white text-sm font-medium rounded-full">
                  {course.category}
                </span>
                {course.isBestseller && (
                  <span className="px-3 py-1 bg-amber-500 text-gray-900 text-sm font-semibold rounded-full">
                    Bestseller
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-300 text-lg mb-6">{course.description}</p>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-400">({course.students.toLocaleString()} students)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Certificate of completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    {/* Main Content */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm mb-8 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(['overview', 'curriculum', 'instructor', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What you'll learn</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {course.whatYouLearn.map((item, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{course.videos ? course.videos.length : course.lessons} lessons</span>
                      <span>{course.duration} total</span>
                    </div>
                    {course.videos && course.videos.length > 0 ? (
                      course.videos.map((vid, i) => (
                        <div key={vid.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">Lesson {i + 1}: {vid.title}</h4>
                            <p className="text-sm text-gray-500">{vid.duration}</p>
                          </div>
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                      ))
                    ) : (
                      [...Array(Math.min(course.lessons, 10))].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">Lesson {i + 1}: Introduction to {course.title.split(' ')[0]}</h4>
                            <p className="text-sm text-gray-500">15 min</p>
                          </div>
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {course.instructor.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.instructor}</h3>
                      <p className="text-gray-600 mb-4">Expert instructor with over 10 years of experience in {course.category.toLowerCase()}.</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.students.toLocaleString()} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {course.rating} rating
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-5xl font-bold text-gray-900">{course.rating}</div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < Math.floor(course.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-gray-500">Based on {course.students.toLocaleString()} reviews</p>
                      </div>
                    </div>
                    {testimonials.map((t, i) => (
                      <div key={i} className="border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-3 mb-3">
                          <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <div className="font-medium text-gray-900">{t.name}</div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600">{t.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="aspect-video rounded-xl overflow-hidden mb-6">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="mb-6">
                {course.originalPrice && (
                  <span className="text-gray-400 line-through text-lg">₦{course.originalPrice.toLocaleString()}</span>
                )}
                <div className="text-3xl font-bold text-purple-600">₦{course.price.toLocaleString()}</div>
              </div>

              {isEnrolled ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onResume(course)}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg mb-4 flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  Resume Course
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onEnroll}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold rounded-xl shadow-lg mb-4"
                >
                  Enroll Now
                </motion.button>
              )}

              <button className="w-full py-4 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-colors mb-6">
                Add to Wishlist
              </button>

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-5 h-5 text-purple-600" />
                  <span>{course.duration} of on-demand video</span>
                </div>
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-purple-600" />
                  <span>Downloadable resources</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Login Page
const AdminLoginPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulated admin credentials
    setTimeout(() => {
      if (email === 'admin@sop.org' && password === 'admin123') {
        onNavigate('admin-dashboard');
      } else {
        setError('Invalid admin credentials. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back button */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-indigo-300 hover:text-amber-400 transition-colors mb-6 text-sm font-medium"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Home
        </button>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/40 p-8 lg:p-10 border border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-amber-500/30 relative"
            >
              <Shield className="w-10 h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center border-2 border-slate-950">
                <Lock className="w-3 h-3 text-slate-900" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-indigo-300 text-sm">SOP Academy — Authorized Personnel Only</p>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
                  placeholder="admin@sop.org"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
                  placeholder="••••••••"
                  required
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <Eye className={`w-5 h-5 transition-colors ${showPassword ? 'text-amber-400' : 'text-indigo-400/60 hover:text-indigo-300'}`} />
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full"
                  />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Access Admin Dashboard
                </>
              )}
            </motion.button>
          </form>

          {/* Credentials hint */}
          <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <p className="text-indigo-300 text-xs font-medium mb-2 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-indigo-400">Email:</span>
                <span className="text-white ml-1 font-mono">admin@sop.org</span>
              </div>
              <div>
                <span className="text-indigo-400">Pass:</span>
                <span className="text-white ml-1 font-mono">admin123</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-indigo-400 text-sm">
            Not an admin?{' '}
            <button onClick={() => onNavigate('login')} className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
              Student Login
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const LoginPage = ({ onNavigate, checkoutCourse }: { onNavigate: (page: string) => void; checkoutCourse?: Course | null }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [_password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, _password);
    } catch (err: any) {
      setError(err.message || 'Login failed: Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormContent = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 bg-clip-text text-transparent mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to continue learning</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700"
          >
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <X className="w-4 h-4 text-red-700" />
            </div>
            <p className="text-xs font-semibold">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="you@example.com"
              required
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={_password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <Eye className={`w-5 h-5 transition-colors ${showPassword ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <button type="button" className="text-sm text-purple-600 font-medium hover:text-purple-700">
            Forgot password?
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full"
              />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </motion.button>
      </form>

      {/* Credentials hint */}
      <div className="mt-6 p-4 bg-purple-50/50 border border-purple-100 rounded-2xl">
        <p className="text-purple-950 text-xs font-semibold mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          Demo Roles Credentials
        </p>
        <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-700">
          <div>
            <span className="font-bold text-gray-900 block">Student</span>
            <span className="font-mono text-purple-700 block">student@sop.org</span>
            <span className="text-[9px] text-gray-500 font-semibold">Pass: student123</span>
          </div>
          <div>
            <span className="font-bold text-gray-900 block">Instructor</span>
            <span className="font-mono text-purple-700 block">instructor@sop.org</span>
            <span className="text-[9px] text-gray-500 font-semibold">Pass: instructor123</span>
          </div>
          <div>
            <span className="font-bold text-gray-900 block">Admin</span>
            <span className="font-mono text-purple-700 block">admin@sop.org</span>
            <span className="text-[9px] text-gray-500 font-semibold">Pass: admin123</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Facebook</span>
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-gray-600">
        Don't have an account?{' '}
        <button onClick={() => onNavigate('signup')} className="text-purple-600 font-semibold hover:text-purple-700">
          Sign up
        </button>
      </p>

      <p className="mt-4 text-center text-gray-500 text-sm">
        Are you an administrator?{' '}
        <button onClick={() => onNavigate('admin-login')} className="text-amber-600 font-semibold hover:text-amber-700">
          Admin Portal
        </button>
      </p>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${checkoutCourse ? 'max-w-4xl' : 'max-w-md'}`}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {checkoutCourse ? (
            <div className="grid md:grid-cols-2">
              {/* Left Column: Course Preview */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-8 lg:p-10 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
                <div>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    Securing Enrollment
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-white mt-4 mb-3 leading-tight">
                    {checkoutCourse.title}
                  </h2>
                  <p className="text-indigo-200 text-sm mb-6">
                    by <span className="font-bold text-amber-300">{checkoutCourse.instructor}</span>
                  </p>
                  
                  {/* Course Quick Specs */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>{checkoutCourse.duration} of content</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span>{checkoutCourse.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>{checkoutCourse.level} track</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{checkoutCourse.rating} rating</span>
                    </div>
                  </div>

                  {/* Thumbnail / Image Card */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg mb-6">
                    <img src={checkoutCourse.thumbnail} alt={checkoutCourse.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                      <span className="text-xl font-black text-amber-400">₦{checkoutCourse.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 mt-6 md:mt-0">
                  <p className="text-xs text-indigo-200/70 font-medium leading-relaxed">
                    Sign in to your student account to complete checkout. You'll gain immediate lifetime access to the video lectures, assignments, and mentorship.
                  </p>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                {renderFormContent()}
              </div>
            </div>
          ) : (
            <div className="p-8 lg:p-10">
              {renderFormContent()}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const SignupPage = ({ onNavigate, checkoutCourse }: { onNavigate: (page: string) => void; checkoutCourse?: Course | null }) => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [_password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup(name, email, _password);
  };

  const renderFormContent = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 bg-clip-text text-transparent mb-2">Create Account</h1>
        <p className="text-gray-600">Start your learning journey today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="John Doe"
              required
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="you@example.com"
              required
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={_password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex items-start gap-2">
          <input type="checkbox" className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-1" required />
          <p className="text-sm text-gray-600">
            I agree to the <a href="#" className="text-purple-600 font-medium">Terms of Service</a> and <a href="#" className="text-purple-600 font-medium">Privacy Policy</a>
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl"
        >
          Create Account
        </motion.button>
      </form>

      <p className="mt-8 text-center text-gray-600">
        Already have an account?{' '}
        <button onClick={() => onNavigate('login')} className="text-purple-600 font-semibold hover:text-purple-700">
          Sign in
        </button>
      </p>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${checkoutCourse ? 'max-w-4xl' : 'max-w-md'}`}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {checkoutCourse ? (
            <div className="grid md:grid-cols-2">
              {/* Left Column: Course Preview */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-8 lg:p-10 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
                <div>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    Securing Enrollment
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-white mt-4 mb-3 leading-tight">
                    {checkoutCourse.title}
                  </h2>
                  <p className="text-indigo-200 text-sm mb-6">
                    by <span className="font-bold text-amber-300">{checkoutCourse.instructor}</span>
                  </p>
                  
                  {/* Course Quick Specs */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>{checkoutCourse.duration} of content</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span>{checkoutCourse.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>{checkoutCourse.level} track</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{checkoutCourse.rating} rating</span>
                    </div>
                  </div>

                  {/* Thumbnail / Image Card */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg mb-6">
                    <img src={checkoutCourse.thumbnail} alt={checkoutCourse.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                      <span className="text-xl font-black text-amber-400">₦{checkoutCourse.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 mt-6 md:mt-0">
                  <p className="text-xs text-indigo-200/70 font-medium leading-relaxed">
                    Create your student account to complete checkout. You'll gain immediate lifetime access to the video lectures, assignments, and mentorship.
                  </p>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                {renderFormContent()}
              </div>
            </div>
          ) : (
            <div className="p-8 lg:p-10">
              {renderFormContent()}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const CheckoutAuthPage = ({
  checkoutCourse,
  onNavigate,
  onSuccess
}: {
  checkoutCourse: Course;
  onNavigate: (page: string) => void;
  onSuccess: (user: User) => void;
}) => {
  const { signup, login } = useAuth();
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  
  // Account Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Checkout states
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const finalPrice = checkoutCourse.price - discount;

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    const code = couponCode.toUpperCase().trim();
    if (code === 'PROPHETIC10') {
      setDiscount(Math.round(checkoutCourse.price * 0.1));
      setAppliedCoupon(code);
    } else if (code === 'PRAYER50') {
      setDiscount(Math.min(checkoutCourse.price, 5000));
      setAppliedCoupon(code);
    } else {
      alert('Invalid or expired coupon code.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let authenticatedUser: User;
      
      // Step 1: Account Authentication/Creation
      if (authMode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        authenticatedUser = await api.auth.signup(name, email, password);
      } else {
        authenticatedUser = await api.auth.login(email, password);
      }

      // Step 2: Payment processing
      try {
        await api.transactions.create({
          student: authenticatedUser.name,
          course: checkoutCourse.title,
          amount: finalPrice
        });
        alert(`Account configured & enrolled in ${checkoutCourse.title} successfully!`);
        onSuccess(authenticatedUser);
      } catch (payErr) {
        console.error('Payment failed after account creation:', payErr);
        alert('Your account was created successfully, but payment failed. You can complete enrollment from your new dashboard.');
        onSuccess(authenticatedUser);
      }

    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2">
            
            {/* Left Column: Course Preview Card */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-8 lg:p-10 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
              <div>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Secure Guest Checkout
                </span>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white mt-4 mb-3 leading-tight">
                  {checkoutCourse.title}
                </h2>
                <p className="text-indigo-200 text-sm mb-6">
                  by <span className="font-bold text-amber-300">{checkoutCourse.instructor}</span>
                </p>
                
                {/* Course specs */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>{checkoutCourse.duration} of content</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>{checkoutCourse.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>{checkoutCourse.level} track</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-100/80 text-xs">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>{checkoutCourse.rating} rating</span>
                  </div>
                </div>

                {/* Course thumbnail image */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg mb-6">
                  <img src={checkoutCourse.thumbnail} alt={checkoutCourse.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xl font-black text-amber-400">₦{checkoutCourse.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 md:mt-0">
                <p className="text-xs text-indigo-200/70 font-medium leading-relaxed">
                  Enter your credentials and payment details to enroll. Creating your account takes just seconds, and you will gain immediate, lifetime access to the active lecture room.
                </p>
              </div>
            </div>

            {/* Right Column: Unified Form */}
            <div className="p-8 lg:p-10 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
              <div>
                
                {/* Unified Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
                    Secure Enrollment Portal
                  </h1>
                </div>

                {/* Switcher Tab */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      authMode === 'signup' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Create Account & Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      authMode === 'login' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Sign In & Pay
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
                    >
                      <X className="w-4 h-4 text-red-700 flex-shrink-0" />
                      <p className="text-xs font-semibold">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Account credentials */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Credentials</h3>
                    
                    {authMode === 'signup' && (
                      <div>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Full Name"
                            required
                            autoComplete="off"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Email Address"
                          required
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Password"
                          required
                          minLength={8}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          paymentMethod === 'card' 
                            ? 'border-purple-600 bg-purple-50/50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CreditCard className={`w-4 h-4 ${paymentMethod === 'card' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-bold text-gray-800">Debit Card</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          paymentMethod === 'bank' 
                            ? 'border-purple-600 bg-purple-50/50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <BookOpen className={`w-4 h-4 ${paymentMethod === 'bank' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-bold text-gray-800">Bank Transfer</span>
                      </button>
                    </div>
                  </div>

                  {/* Coupon section */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 uppercase font-mono"
                        disabled={!!appliedCoupon}
                      />
                      {appliedCoupon ? (
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon('');
                            setDiscount(0);
                            setCouponCode('');
                          }}
                          className="px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-xl"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    {appliedCoupon && (
                      <p className="text-[10px] text-green-600 font-semibold">
                        ✓ Discount Applied!
                      </p>
                    )}
                  </div>

                  {/* Pricing break-down */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Tuition Fee</span>
                      <span className="font-semibold text-gray-900">₦{checkoutCourse.price.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount Coupon</span>
                        <span>-₦{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-black text-gray-900">
                      <span>Amount to Pay</span>
                      <span className="text-purple-600">₦{finalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Primary submit action */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing registration & payment...</span>
                      </>
                    ) : (
                      <span>Complete Enrollment & Pay (₦{finalPrice.toLocaleString()})</span>
                    )}
                  </motion.button>
                </form>

              </div>

              {/* Bottom switches */}
              <div className="pt-6 border-t border-gray-100 mt-6 flex justify-between text-xs text-gray-500">
                <button type="button" onClick={() => onNavigate('home')} className="hover:text-purple-600 font-semibold">
                  ← Back to Home
                </button>
                
                <span className="text-slate-400">|</span>
                
                <button type="button" onClick={() => onNavigate('courses')} className="hover:text-purple-600 font-semibold">
                  Browse Catalog
                </button>
              </div>

            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

const StudentDashboard = ({ 
  onCheckout,
  initialActiveCourse,
  onClearInitialActiveCourse
}: { 
  onCheckout?: (course: Course) => void;
  initialActiveCourse?: Course | null;
  onClearInitialActiveCourse?: () => void;
}) => {
  const { user } = useAuth();
  const [printCert, setPrintCert] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'assignments' | 'mentorship' | 'certificates' | 'support' | 'scholarships'>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Backend entities
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [mentorshipGroups, setMentorshipGroups] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserDetails, setCurrentUserDetails] = useState<any>(null);

  // Active sub-views
  const [activeLectureCourse, setActiveLectureCourse] = useState<Course | null>(null);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  useEffect(() => {
    if (initialActiveCourse) {
      setActiveLectureCourse(initialActiveCourse);
      setActiveVideo(null);
      if (onClearInitialActiveCourse) {
        onClearInitialActiveCourse();
      }
    }
  }, [initialActiveCourse]);
  const [selectedLectureTab, setSelectedLectureTab] = useState<'details' | 'materials' | 'requirements'>('details');

  // Form states
  const [assignTitle, setAssignTitle] = useState('');
  const [assignCourse, setAssignCourse] = useState('');
  const [assignSub, setAssignSub] = useState('');
  const [ticketCat, setTicketCat] = useState('Technical Support');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [scholarshipCourse, setScholarshipCourse] = useState('');
  const [scholarshipReason, setScholarshipReason] = useState('');
  const [mentorMsg, setMentorMsg] = useState('');
  
  // Search / Browse Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [showCatalog, setShowCatalog] = useState(false);

  const refreshStudentData = async () => {
    setLoading(true);
    try {
      const [
        coursesList,
        assignmentsList,
        ticketsList,
        broadcastsList,
        certsList,
        groupsList,
        scholarshipsList,
        messagesList,
        usersList
      ] = await Promise.all([
        api.courses.list(),
        api.assignments.list(),
        api.support.list(),
        api.broadcasts.list(),
        api.certificates.list(),
        api.mentorship.groups.list(),
        api.promotions.scholarships.list(),
        api.mentorship.messages.list(),
        api.users.list()
      ]);

      setCourses(coursesList);
      setAssignments(assignmentsList);
      setTickets(ticketsList);
      setBroadcasts(broadcastsList);
      setCerts(certsList);
      setMentorshipGroups(groupsList);
      setScholarships(scholarshipsList);
      setMessages(messagesList);

      if (user) {
        const freshUser = usersList.find((u: any) => u.email === user.email);
        if (freshUser) {
          setCurrentUserDetails(freshUser);
        }
      }
    } catch (err) {
      console.error('Failed to load student dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStudentData();
  }, [user]);

  // Derived arrays
  const enrolledCourseIds = currentUserDetails?.enrolledCourses || [];
  const enrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id));
  const catalogCourses = courses.filter(c => !enrolledCourseIds.includes(c.id));
  const myAssignments = assignments.filter(a => a.student === currentUserDetails?.name);
  const myTickets = tickets.filter(t => t.name === currentUserDetails?.name);
  const myCerts = certs.filter(c => c.student === currentUserDetails?.name);
  const myScholarships = scholarships.filter(s => s.student === currentUserDetails?.name);

  // Mentorship details
  const myGroup = mentorshipGroups.find(g => g.students.includes(currentUserDetails?.name));
  const myGroupMessages = myGroup ? messages.filter(m => m.group === myGroup.name) : [];

  const handleEnrollCourse = (course: Course) => {
    if (onCheckout) {
      onCheckout(course);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserDetails || !assignCourse || !assignTitle || !assignSub) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      await api.assignments.submit({
        student: currentUserDetails.name,
        title: `${assignCourse} — ${assignTitle}`,
        submission: assignSub
      });
      alert('Assignment submitted successfully!');
      setAssignTitle('');
      setAssignSub('');
      await refreshStudentData();
    } catch (err) {
      alert('Submission failed.');
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserDetails || !ticketSubject || !ticketMsg) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      await api.support.create({
        name: currentUserDetails.name,
        category: ticketCat,
        subject: ticketSubject,
        message: ticketMsg
      });
      alert('Support ticket created successfully!');
      setTicketSubject('');
      setTicketMsg('');
      await refreshStudentData();
    } catch (err) {
      alert('Failed to raise ticket.');
    }
  };

  const handleScholarshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserDetails || !scholarshipCourse || !scholarshipReason) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      await api.promotions.scholarships.apply({
        student: currentUserDetails.name,
        course: scholarshipCourse,
        reason: scholarshipReason
      });
      alert('Discipleship financial aid application submitted successfully!');
      setScholarshipCourse('');
      setScholarshipReason('');
      await refreshStudentData();
    } catch (err) {
      alert('Failed to submit application.');
    }
  };

  const handleSendMentorshipMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserDetails || !myGroup || !mentorMsg) return;
    try {
      await api.mentorship.messages.create({
        from: currentUserDetails.name,
        to: myGroup.mentor,
        group: myGroup.name,
        message: mentorMsg
      });
      setMentorMsg('');
      await refreshStudentData();
    } catch (err) {
      alert('Failed to send mentorship log.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Entering the Tabernacle...</p>
        </div>
      </div>
    );
  }

  // LECTURE ROOM SUB-VIEW
  if (activeLectureCourse) {
    const courseVideos = activeLectureCourse.videos || [];

    // If no active video selected, show the Syllabus / Video Directory view
    if (!activeVideo) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
          {/* Syllabus Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setActiveLectureCourse(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                ← Back to Dashboard
              </button>
              <div>
                <h2 className="font-extrabold text-lg text-slate-900">{activeLectureCourse.title}</h2>
                <p className="text-xs text-purple-650 font-bold uppercase tracking-wider">{activeLectureCourse.category} • Instructor: {activeLectureCourse.instructor}</p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-bold bg-purple-100 text-purple-700 rounded-full">
              Syllabus Directory
            </span>
          </div>

          {/* Syllabus Content */}
          <div className="max-w-4xl mx-auto w-full px-6 py-8 flex-1">
            
            {/* Overview / Banner Card */}
            <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white rounded-3xl p-6 lg:p-8 shadow-xl mb-8 flex flex-col md:flex-row gap-6 items-center">
              <img src={activeLectureCourse.thumbnail} alt={activeLectureCourse.title} className="w-full md:w-56 aspect-video object-cover rounded-2xl border border-white/10 shadow-lg" />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black mb-2">{activeLectureCourse.title}</h3>
                <p className="text-sm text-indigo-200/90 leading-relaxed mb-4">{activeLectureCourse.description}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-xs text-purple-300 font-bold">
                  <span>⏱ {activeLectureCourse.duration} content</span>
                  <span>•</span>
                  <span>📖 {courseVideos.length || activeLectureCourse.lessons} lessons</span>
                </div>
              </div>
            </div>

            {/* List of Videos / Topics */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <PlayCircle className="w-6 h-6 text-purple-600 animate-pulse" />
                  Available Video Lectures ({courseVideos.length})
                </h3>
                <span className="text-xs font-medium text-slate-500">Click a video to open the Lecture Room</span>
              </div>

              {courseVideos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-slate-700 text-lg mb-1">No Video Uploads Yet</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    This course has no videos uploaded. Contact the school administration or your mentor for access.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {courseVideos.map((video: any, index: number) => (
                    <div 
                      key={video.id}
                      onClick={() => setActiveVideo(video)}
                      className="bg-white border border-slate-100 hover:border-purple-200 hover:shadow-md rounded-2xl p-5 flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-purple-50 group-hover:bg-purple-100 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                          <Play className="w-5 h-5 text-purple-600 fill-purple-200 group-hover:fill-purple-400 group-hover:scale-110 transition-all" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-purple-650 font-bold uppercase tracking-wider">Lesson {index + 1}</span>
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-purple-600 transition-colors mt-0.5 truncate pr-4">
                            {video.title}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-slate-500 font-medium bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                          {video.duration || '15 min'}
                        </span>
                        <span className="text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                          Play <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      );
    }

    // If activeVideo is NOT null, render the standard Lecture Room video player!
    const currentPlayingVideo = activeVideo;
    const embedUrl = currentPlayingVideo?.url || 'https://www.youtube.com/embed/dQw4w9WgXcQ';

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        {/* Lecture Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                // Clicking back takes us back to the Syllabus view (setting activeVideo to null)!
                setActiveVideo(null);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
            >
              ← Back to Syllabus
            </button>
            <div>
              <h2 className="font-bold text-lg text-white">{activeLectureCourse.title}</h2>
              <p className="text-xs text-purple-400 font-medium">{activeLectureCourse.instructor}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
            Lecture Room Active
          </span>
        </div>

        {/* Lecture Content */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Video Player Box */}
          <div className="flex-1 p-6 flex flex-col gap-6">
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <iframe
                src={embedUrl}
                title={currentPlayingVideo?.title || 'Lecture'}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Video metadata */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {currentPlayingVideo?.title || 'Introduction Lesson'}
              </h1>
              <p className="text-sm text-slate-400">Duration: {currentPlayingVideo?.duration || '15 min'}</p>
            </div>

            {/* Tabs details */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
              <div className="flex border-b border-slate-800 mb-6">
                {[
                  { id: 'details', label: 'Course details' },
                  { id: 'materials', label: 'Study materials' },
                  { id: 'requirements', label: 'Requirements' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedLectureTab(tab.id as any)}
                    className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${
                      selectedLectureTab === tab.id 
                        ? 'border-purple-500 text-purple-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {selectedLectureTab === 'details' && (
                <div>
                  <h3 className="font-bold text-white mb-2">About this Course</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">{activeLectureCourse.description}</p>
                  <h4 className="font-bold text-white mb-2">What you will learn:</h4>
                  <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                    {activeLectureCourse.whatYouLearn.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedLectureTab === 'materials' && (
                <div>
                  <h3 className="font-bold text-white mb-3">Downloadable Study Handouts</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert('Study handbook download simulation started.'); }}
                      className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-semibold text-white group-hover:text-purple-300">Course Handbook (PDF)</span>
                      </div>
                      <Download className="w-4 h-4 text-slate-400" />
                    </a>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert('Prophetic journal templates download simulation started.'); }}
                      className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-semibold text-white group-hover:text-purple-300">Journal Templates (PDF)</span>
                      </div>
                      <Download className="w-4 h-4 text-slate-400" />
                    </a>
                  </div>
                </div>
              )}

              {selectedLectureTab === 'requirements' && (
                <div>
                  <h3 className="font-bold text-white mb-2">Prerequisites & Materials</h3>
                  <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                    {activeLectureCourse.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Playlist Sidebar */}
          <div className="w-full lg:w-80 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-6 flex flex-col gap-4">
            <h3 className="font-bold text-white text-md">Course Syllabus</h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
              {courseVideos.length === 0 ? (
                <div className="text-slate-500 text-center py-6 text-sm">No lecture video uploads for this course yet.</div>
              ) : (
                courseVideos.map((video: any, index: number) => {
                  const isPlaying = currentPlayingVideo?.id === video.id;
                  return (
                    <button
                      key={video.id}
                      onClick={() => setActiveVideo(video)}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                        isPlaying 
                          ? 'bg-purple-950/40 border border-purple-500/30' 
                          : 'bg-slate-900 hover:bg-slate-800 border border-slate-900'
                      }`}
                    >
                      <div className="w-6 h-6 bg-slate-850 rounded-lg flex items-center justify-center text-xs font-bold text-purple-400">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-xs font-bold line-clamp-2 ${isPlaying ? 'text-purple-400' : 'text-slate-200'}`}>
                          {video.title}
                        </h4>
                        <span className="text-[10px] text-slate-500">{video.duration}</span>
                      </div>
                      <Play className={`w-3.5 h-3.5 mt-0.5 ${isPlaying ? 'text-purple-400 animate-pulse' : 'text-slate-400'}`} />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 max-w-xs bg-white h-full flex flex-col p-6 shadow-2xl border-r border-slate-200 z-50"
            >
              {/* Close button */}
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Sidebar logo/avatar */}
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold">S</div>
                <div>
                  <div className="font-bold text-slate-800 text-sm truncate max-w-[120px]">{currentUserDetails?.name}</div>
                  <div className="text-xs text-slate-500">Student Account</div>
                </div>
              </div>

              {/* Navigation list */}
              <nav className="flex-1 space-y-4 overflow-y-auto">
                {[
                  {
                    title: "Academy",
                    items: [
                      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                      { id: 'courses', label: 'My Courses', icon: BookOpen },
                      { id: 'assignments', label: 'Assignments', icon: ClipboardList }
                    ]
                  },
                  {
                    title: "Spiritual Community",
                    items: [
                      { id: 'mentorship', label: 'Mentorship', icon: MessageSquare },
                      { id: 'certificates', label: 'Certificates', icon: Award }
                    ]
                  },
                  {
                    title: "Support & Aid",
                    items: [
                      { id: 'scholarships', label: 'Scholarships', icon: Tag },
                      { id: 'support', label: 'Support Desk', icon: Radio }
                    ]
                  }
                ].map(group => (
                  <div key={group.title} className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-1">
                      {group.title}
                    </div>
                    {group.items.map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => { 
                            setActiveTab(tab.id as any); 
                            setShowCatalog(false);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            isActive 
                              ? 'bg-purple-50 text-purple-700' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation - Desktop */}
      <div className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold">S</div>
          <div>
            <div className="font-bold text-slate-800 text-sm">{currentUserDetails?.name}</div>
            <div className="text-xs text-slate-500">Student Account</div>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <nav className="flex-1 p-4 space-y-4">
          {[
            {
              title: "Academy",
              items: [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'courses', label: 'My Courses', icon: BookOpen },
                { id: 'assignments', label: 'Assignments', icon: ClipboardList }
              ]
            },
            {
              title: "Spiritual Community",
              items: [
                { id: 'mentorship', label: 'Mentorship', icon: MessageSquare },
                { id: 'certificates', label: 'Certificates', icon: Award }
              ]
            },
            {
              title: "Support & Aid",
              items: [
                { id: 'scholarships', label: 'Scholarships', icon: Tag },
                { id: 'support', label: 'Support Desk', icon: Radio }
              ]
            }
          ].map(group => (
            <div key={group.title} className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-1">
                {group.title}
              </div>
              {group.items.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setShowCatalog(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-purple-50 text-purple-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1 md:gap-3">
            {/* Hamburger button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors mr-1 flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-slate-900 text-lg md:text-xl truncate">
              {activeTab === 'overview' && 'Student Sanctuary'}
              {activeTab === 'courses' && (showCatalog ? 'Spiritual Course Catalog' : 'My Prophetic Lectures')}
              {activeTab === 'assignments' && 'Prophetic Exercises'}
              {activeTab === 'mentorship' && 'Mentorship Roundtable'}
              {activeTab === 'certificates' && 'Issued Certificates'}
              {activeTab === 'support' && 'Counseling & Support Desk'}
              {activeTab === 'scholarships' && 'Discipleship Scholarships'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {activeTab === 'courses' && (
              <button
                onClick={() => setShowCatalog(!showCatalog)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  showCatalog 
                    ? 'bg-purple-600 border-purple-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {showCatalog ? '← View My Courses' : 'Browse Course Catalog'}
              </button>
            )}
            <div className="text-xs font-bold text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded-full">
              Status: {currentUserDetails?.status}
            </div>
          </div>
        </div>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome card */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-500 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-lg">
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-white/20 rounded-full">FOV / SOP Academy</span>
                  <h2 className="text-3xl font-extrabold mt-3 mb-2">Welcome to the Portal, {currentUserDetails?.name}! 👋</h2>
                  <p className="text-white/80 text-sm leading-relaxed mb-6">
                    Grow in the prophetic office, deepen your intercession, and study course lessons systematically. Use the tabs in the left sidebar to access your courses, send logs to your mentor, and track your certificates.
                  </p>
                  <button 
                    onClick={() => setActiveTab('courses')}
                    className="px-5 py-2.5 bg-white text-purple-700 text-xs font-bold rounded-xl hover:scale-105 transition-transform shadow-md"
                  >
                    Go to Lecture Room
                  </button>
                </div>
                {/* Background decorative blob */}
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-12 translate-y-12 pointer-events-none"></div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Enrolled Lectures', value: enrolledCourses.length, icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
                  { label: 'Submitted Tasks', value: myAssignments.length, icon: ClipboardList, color: 'text-indigo-600 bg-indigo-50' },
                  { label: 'Counseling Tickets', value: myTickets.length, icon: Radio, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Awarded Credentials', value: myCerts.length, icon: Award, color: 'text-emerald-600 bg-emerald-50' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                      <div className="text-xs text-slate-500 font-semibold">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Broadcasts and activities */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Broadcasts panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Radio className="w-5 h-5 text-purple-600" />
                    <span>Live Impartation Broadcasts</span>
                  </h3>
                  <div className="space-y-4">
                    {broadcasts.filter(b => b.status === 'Upcoming').length === 0 ? (
                      <div className="text-slate-400 text-sm text-center py-8">No live sessions scheduled this week.</div>
                    ) : (
                      broadcasts.filter(b => b.status === 'Upcoming').map((bc) => (
                        <div key={bc.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                              {bc.type}
                            </span>
                            <h4 className="font-bold text-slate-800 mt-2 text-sm">{bc.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">Host: {bc.host} | Time: {bc.date} at {bc.time}</p>
                          </div>
                          <a
                            href={bc.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded-lg transition-all"
                          >
                            Join Stream
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mentorship panel */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      <span>Mentorship Circle</span>
                    </h3>
                    {myGroup ? (
                      <div className="space-y-3">
                        <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                          <div className="text-xs text-indigo-500 font-bold uppercase">Assigned Group</div>
                          <div className="font-bold text-slate-850 mt-1 text-sm">{myGroup.name}</div>
                          <div className="text-xs text-slate-500 mt-1">Mentor: {myGroup.mentor}</div>
                        </div>
                        <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <strong>Next session:</strong> {myGroup.nextSession}
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-sm py-6">You have not been assigned to a mentorship roundtable yet.</div>
                    )}
                  </div>
                  {myGroup && (
                    <button
                      onClick={() => setActiveTab('mentorship')}
                      className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Enter Discussion Room
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY COURSES */}
          {activeTab === 'courses' && (
            <div>
              {showCatalog ? (
                /* Course Catalog browsing */
                <div>
                  <div className="mb-6 max-w-md flex gap-2">
                    <input
                      type="text"
                      placeholder="Search prophetic catalog courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {catalogCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                    <div className="text-slate-500 text-center py-12 bg-white border border-slate-100 rounded-2xl">
                      No matching courses found in the catalog.
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {catalogCourses
                        .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((course) => (
                          <div key={course.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full justify-between">
                            <div>
                              <img src={course.thumbnail} alt={course.title} className="w-full h-44 object-cover" />
                              <div className="p-5">
                                <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                                  {course.category}
                                </span>
                                <h3 className="font-bold text-slate-850 mt-2 text-sm line-clamp-2">{course.title}</h3>
                                <p className="text-xs text-slate-500 mt-1 mb-3">By {course.instructor}</p>
                                <p className="text-xs text-slate-650 line-clamp-3">{course.description}</p>
                              </div>
                            </div>
                            <div className="p-5 border-t border-slate-100 flex items-center justify-between">
                              <span className="font-extrabold text-slate-900 text-sm">₦{course.price.toLocaleString()}</span>
                              <button
                                onClick={() => handleEnrollCourse(course)}
                                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg transition-all"
                              >
                                Buy & Enroll
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Enrolled courses */
                <div>
                  {enrolledCourses.length === 0 ? (
                    <div className="bg-white border border-slate-150 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
                      <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="font-bold text-slate-800 text-md mb-2">No enrolled lectures yet</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6">
                        You are not enrolled in any prophetic lectures. Switch to the Catalog tab to sign up for courses.
                      </p>
                      <button
                        onClick={() => setShowCatalog(true)}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all"
                      >
                        Browse Course Catalog
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {enrolledCourses.map((course) => (
                        <div key={course.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="relative group">
                              <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                  onClick={() => {
                                    setActiveLectureCourse(course);
                                    setActiveVideo(null);
                                  }}
                                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                  <Play className="w-4 h-4 text-purple-600 ml-0.5" />
                                </button>
                              </div>
                            </div>
                            <div className="p-5">
                              <span className="text-[10px] text-purple-650 font-bold uppercase tracking-wider">{course.category}</span>
                              <h3 className="font-bold text-slate-850 mt-1 text-sm line-clamp-1">{course.title}</h3>
                              <p className="text-xs text-slate-500 mb-4">{course.instructor}</p>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                  <span>Progress</span>
                                  <span className="text-purple-600">65%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full w-[65%] bg-purple-600 rounded-full"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-5 border-t border-slate-50">
                            <button
                              onClick={() => {
                                setActiveLectureCourse(course);
                                setActiveVideo(null);
                              }}
                              className="w-full py-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 text-slate-700 text-xs font-bold rounded-lg transition-all border border-slate-100 hover:border-purple-200"
                            >
                              Open Lecture Room
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}



          {/* TAB 3: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form Submission */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm self-start">
                <h3 className="font-bold text-slate-900 mb-4">Submit New Exercise</h3>
                <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 mb-1">Select Course</label>
                    <select
                      value={assignCourse}
                      onChange={(e) => setAssignCourse(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium"
                    >
                      <option value="">-- Choose Course --</option>
                      {enrolledCourses.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 mb-1">Task Title / Activation No.</label>
                    <input
                      type="text"
                      placeholder="e.g. Dream Journaling Exercise"
                      value={assignTitle}
                      onChange={(e) => setAssignTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 mb-1">Your Submission (Answers)</label>
                    <textarea
                      rows={5}
                      placeholder="Type your spiritual summary or dream logs here..."
                      value={assignSub}
                      onChange={(e) => setAssignSub(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:opacity-90"
                  >
                    Submit Assignment
                  </button>
                </form>
              </div>

              {/* Status Ledger */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">My Submitted Exercises</h3>
                <div className="space-y-4">
                  {myAssignments.length === 0 ? (
                    <div className="text-slate-400 text-xs py-8 text-center">No assignments submitted yet.</div>
                  ) : (
                    myAssignments.map((a) => (
                      <div key={a.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs">{a.title}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">Date: {a.date}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                            a.status === 'Graded' 
                              ? 'bg-green-50 border-green-200 text-green-700' 
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {a.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100 leading-relaxed font-mono">
                          {a.submission}
                        </p>
                        {a.status === 'Graded' && (
                          <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <strong className="text-purple-900 font-bold">Grader Evaluation</strong>
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-extrabold font-mono">
                                Grade: {a.grade}
                              </span>
                            </div>
                            <p className="text-xs text-slate-650 leading-relaxed italic">
                              "{a.feedback || 'Excellent discernment and spiritual sensitivity.'}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MENTORSHIP */}
          {activeTab === 'mentorship' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Group sidebar details */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5 self-start">
                <h3 className="font-bold text-slate-900 text-md">Roundtable Info</h3>
                {myGroup ? (
                  <div className="space-y-4">
                    <div className="pb-4 border-b border-slate-100">
                      <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Group Name</div>
                      <div className="font-bold text-slate-800 text-sm mt-1">{myGroup.name}</div>
                    </div>
                    <div className="pb-4 border-b border-slate-100">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assigned Mentor</div>
                      <div className="font-bold text-slate-800 text-sm mt-1">{myGroup.mentor}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{myGroup.mentorEmail}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Roundtable Schedule</div>
                      <div className="font-bold text-slate-800 text-xs mt-1 leading-relaxed">{myGroup.nextSession}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs text-center py-6">No assigned mentorship group.</div>
                )}
              </div>

              {/* Chat portal log */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[500px]">
                <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center justify-between">
                  <span>Mentorship Group Messages</span>
                  {myGroup && (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-green-50 text-green-700 rounded border border-green-200">
                      Active
                    </span>
                  )}
                </div>

                {/* Chat window */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                  {!myGroup ? (
                    <div className="text-slate-400 text-xs text-center pt-20">You must be in a mentorship circle to chat.</div>
                  ) : myGroupMessages.length === 0 ? (
                    <div className="text-slate-400 text-xs text-center pt-20">No conversation history yet. Send a message to start!</div>
                  ) : (
                    myGroupMessages.map((m) => {
                      const isMe = m.from === currentUserDetails?.name;
                      return (
                        <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="text-[9px] text-slate-450 font-bold mb-1">{m.from}</div>
                          <div className={`p-3 rounded-2xl text-xs max-w-sm font-medium ${
                            isMe 
                              ? 'bg-purple-600 text-white rounded-tr-none' 
                              : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                          }`}>
                            {m.message}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 font-mono">{m.date}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input prompt */}
                {myGroup && (
                  <form onSubmit={handleSendMentorshipMessage} className="p-4 border-t border-slate-100 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a log message to your mentor..."
                      value={mentorMsg}
                      onChange={(e) => setMentorMsg(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">My Awarded Credentials</h3>
              {myCerts.length === 0 ? (
                <div className="text-slate-450 text-xs text-center py-12">
                  No certificates generated yet. Complete courses and earn top grades to receive credential documents.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {myCerts.map((cert) => (
                    <div key={cert.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] font-bold rounded-full font-mono">
                            {cert.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            cert.status === 'Issued'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-red-50 border-red-200 text-red-700'
                          }`}>
                            {cert.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{cert.course}</h4>
                        <p className="text-xs text-slate-500 mt-1">Completion Date: {cert.completionDate}</p>
                        <p className="text-xs text-purple-700 font-bold mt-2 font-mono">Final Grade: {cert.grade}</p>
                      </div>

                      {cert.status === 'Issued' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(cert.verificationUrl || `https://sop.org/verify/${cert.id}`);
                              alert('Certificate verification URL copied to clipboard!');
                            }}
                            className="flex-1 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Verifier Link</span>
                          </button>
                          <button
                            onClick={() => {
                              setPrintCert(cert);
                              setTimeout(() => {
                                window.print();
                              }, 300);
                            }}
                            className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Certificate</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SUPPORT DESK */}
          {activeTab === 'support' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form creation */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm self-start">
                <h3 className="font-bold text-slate-900 mb-4">Open Support Ticket</h3>
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 mb-1">Inquiry Category</label>
                    <select
                      value={ticketCat}
                      onChange={(e) => setTicketCat(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium"
                    >
                      <option value="Technical Support">Technical Support</option>
                      <option value="Prophetic Counseling">Prophetic Counseling</option>
                      <option value="Billing & Pricing">Billing & Pricing</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="Brief topic summary"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 mb-1">Detailed Message</label>
                    <textarea
                      rows={5}
                      placeholder="Please details what guidance or support you require..."
                      value={ticketMsg}
                      onChange={(e) => setTicketMsg(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:opacity-90"
                  >
                    Submit Ticket
                  </button>
                </form>
              </div>

              {/* Tickets list */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">My Support History</h3>
                <div className="space-y-4">
                  {myTickets.length === 0 ? (
                    <div className="text-slate-450 text-xs py-8 text-center">No open or resolved support logs.</div>
                  ) : (
                    myTickets.map((t) => (
                      <div key={t.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded border border-slate-200 font-mono">
                              {t.category}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mt-1">{t.subject}</h4>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                            t.status === 'Resolved'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                          {t.message}
                        </p>
                        {t.status === 'Resolved' && (
                          <div className="text-xs text-slate-500 italic">
                            ✓ Resolved by administrative support team.
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SCHOLARSHIPS */}
          {activeTab === 'scholarships' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form creation */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm self-start">
                <h3 className="font-bold text-slate-900 mb-4">Apply for Scholarship</h3>
                <form onSubmit={handleScholarshipSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 mb-1">Target Catalog Course</label>
                    <select
                      value={scholarshipCourse}
                      onChange={(e) => setScholarshipCourse(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium"
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 mb-1">Reason for Scholarship / Financial Aid Statement</label>
                    <textarea
                      rows={5}
                      placeholder="Please explain your financial difficulties or ministry recommendations..."
                      value={scholarshipReason}
                      onChange={(e) => setScholarshipReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:opacity-90"
                  >
                    Submit Application
                  </button>
                </form>
              </div>

              {/* Scholarships list */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">My Financial Aid Requests</h3>
                <div className="space-y-4">
                  {myScholarships.length === 0 ? (
                    <div className="text-slate-450 text-xs py-8 text-center">No scholarship requests logged.</div>
                  ) : (
                    myScholarships.map((s) => (
                      <div key={s.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-800 text-xs">{s.course}</h4>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                            s.status === 'Approved'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : s.status === 'Declined'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Applied Date: {s.dateApplied}</p>
                        <p className="text-xs text-slate-650 bg-white p-3 rounded-lg border border-slate-100 italic">
                          "{s.reason}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
      {printCert && (
        <div id="certificate-print-area" className="hidden print:flex flex-col items-center justify-center p-12 bg-white text-slate-900 border-[16px] border-double border-amber-600 rounded-3xl max-w-4xl mx-auto shadow-2xl relative overflow-hidden" style={{ minHeight: '600px', fontFamily: "'Cinzel', 'Playfair Display', 'Georgia', serif" }}>
          {/* Watermark/Background decoration */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <svg className="w-[500px] h-[500px] text-amber-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
            </svg>
          </div>
          
          <div className="text-center space-y-6 z-10 w-full">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl font-extrabold tracking-widest text-slate-800 uppercase" style={{ letterSpacing: '4px' }}>School of the Prophets</h1>
            <p className="text-sm font-semibold tracking-wider text-amber-600 uppercase">Academy Graduation Credential</p>
            
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-4"></div>

            <p className="text-sm italic text-slate-500 my-2">This is to certify that</p>
            <h2 className="text-3xl font-bold text-slate-900 border-b border-gray-200 pb-2 max-w-lg mx-auto italic" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
              {printCert.student || user?.name}
            </h2>

            <p className="text-sm text-slate-650 max-w-xl mx-auto leading-relaxed my-2">
              has successfully completed all required modules of the spiritual training curriculum and academic examinations for the course
            </p>
            <h3 className="text-xl font-bold text-slate-800 tracking-wide">
              {printCert.course}
            </h3>

            <p className="text-sm font-semibold text-indigo-700 font-mono my-1">
              Final Grade: {printCert.grade}
            </p>

            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-4"></div>
            
            <div className="flex justify-between items-end mt-12 px-12">
              <div className="text-center w-48 border-t border-slate-300 pt-2">
                <p className="text-xs font-semibold text-slate-700">Prophet Elijah Mensah</p>
                <p className="text-[10px] text-slate-500">Presiding Dean</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-400 font-mono mb-1">Code: {printCert.id}</span>
                <span className="text-[9px] text-slate-400 font-mono">Date: {printCert.completionDate || new Date().toLocaleDateString()}</span>
              </div>
              <div className="text-center w-48 border-t border-slate-300 pt-2">
                <p className="text-xs font-semibold text-slate-700">Academic Registry</p>
                <p className="text-[10px] text-slate-500">SOP Authority Seal</p>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const auth = useAuth();
  const user = auth?.user;
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'users' | 'transactions' | 'assignments' | 'support' | 'broadcasts' | 'certificates' | 'mentorship' | 'promotions' | 'audit' | 'settings'>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom course page action state
  const [currentCourseAction, setCurrentCourseAction] = useState<'list' | 'create'>('list');

  // Form states for new course
  const [newTitle, setNewTitle] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Prophetic');
  const [newLevel, setNewLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newDescription, setNewDescription] = useState('');
  const [newThumbnail, setNewThumbnail] = useState('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=450&fit=crop');
  const [newWhatYouLearn, setNewWhatYouLearn] = useState('');
  const [newRequirements, setNewRequirements] = useState('');

  // Video Lectures array state
  const [addedVideos, setAddedVideos] = useState<{ id: string; title: string; url: string; duration: string }[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [videoSource, setVideoSource] = useState<'url' | 'file'>('url');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Admin users list state
  const [usersList, setUsersList] = useState<any[]>([]);

  // Mock Transactions Ledger state
  const [transactionsList, setTransactionsList] = useState<any[]>([]);

  // Mock Assignments state
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);

  const [reviewAssignment, setReviewAssignment] = useState<any | null>(null);
  const [assignmentGrade, setAssignmentGrade] = useState('A');
  const [assignmentFeedback, setAssignmentFeedback] = useState('');

  // Mock Support counseling inquiries state
  const [supportList, setSupportList] = useState<any[]>([]);

  const [activeSupportMessage, setActiveSupportMessage] = useState<any | null>(null);
  const [supportReplyText, setSupportReplyText] = useState('');

  // ─── LIVE BROADCASTS STATE ───
  const [broadcastsList, setBroadcastsList] = useState<any[]>([]);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({ title: '', type: 'Live Stream', date: '', time: '', host: '', platform: 'YouTube Live', link: '' });

  // ─── CERTIFICATES STATE ───
  const [certificatesList, setCertificatesList] = useState<any[]>([]);
  const [certVerifyQuery, setCertVerifyQuery] = useState('');
  const [isIssueCertModalOpen, setIsIssueCertModalOpen] = useState(false);
  const [issueCertStudent, setIssueCertStudent] = useState('');
  const [issueCertCourse, setIssueCertCourse] = useState('');
  const [issueCertGrade, setIssueCertGrade] = useState('A');
  const [issueCertDate, setIssueCertDate] = useState('');

  // ─── MENTORSHIP STATE ───
  const [mentorshipGroups, setMentorshipGroups] = useState<any[]>([]);
  const [showMentorshipForm, setShowMentorshipForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', mentor: '', mentorEmail: '', capacity: '5' });
  const [mentorMessages, setMentorMessages] = useState<any[]>([]);

  // ─── PROMOTIONS & SCHOLARSHIPS STATE ───
  const [promosList, setPromosList] = useState<any[]>([]);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', type: 'Percentage', value: '', maxUses: '', expiry: '', description: '' });
  const [scholarshipsList, setScholarshipsList] = useState<any[]>([]);

  // ─── AUDIT LOGS & ROLES STATE ───
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [adminRoles, setAdminRoles] = useState<any[]>([]);

  // Load all dashboard tables from the backend REST API
  const refreshDashboardData = async () => {
    try {
      const [
        courses,
        users,
        transactions,
        assignments,
        tickets,
        broadcasts,
        certs,
        groups,
        messages,
        coupons,
        scholarships,
        logs,
        roles
      ] = await Promise.all([
        api.courses.list(),
        api.users.list(),
        api.transactions.list(),
        api.assignments.list(),
        api.support.list(),
        api.broadcasts.list(),
        api.certificates.list(),
        api.mentorship.groups.list(),
        api.mentorship.messages.list(),
        api.promotions.coupons.list(),
        api.promotions.scholarships.list(),
        api.audit.logs.list(),
        api.audit.roles.list()
      ]);
      setCoursesList(courses);
      setUsersList(users);
      setTransactionsList(transactions);
      setAssignmentsList(assignments);
      setSupportList(tickets);
      setBroadcastsList(broadcasts);
      setCertificatesList(certs);
      setMentorshipGroups(groups);
      setMentorMessages(messages);
      setPromosList(coupons);
      setScholarshipsList(scholarships);
      setAuditLogs(logs);
      setAdminRoles(roles);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    refreshDashboardData();
  }, []);

  const handleAddVideoLecture = async () => {
    if (!videoTitle) return;

    if (videoSource === 'file') {
      if (!videoFile) {
        setUploadError('Please select a video file.');
        return;
      }
      if (videoFile.size > 100 * 1024 * 1024) {
        setUploadError('File exceeds the 100MB size limit.');
        return;
      }
      setIsUploadingVideo(true);
      setUploadError(null);
      try {
        const res = await api.upload.video(videoFile);
        const newVideo = {
          id: String(addedVideos.length + 1),
          title: videoTitle,
          url: res.url,
          duration: videoDuration || '15 min',
        };
        setAddedVideos([...addedVideos, newVideo]);
        setVideoTitle('');
        setVideoFile(null);
        setVideoDuration('');
        
        // Reset file input element manually
        const fileInput = document.getElementById('video-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } catch (err: any) {
        console.error('Upload failed:', err);
        setUploadError(err.message || 'Failed to upload video file.');
      } finally {
        setIsUploadingVideo(false);
      }
    } else {
      if (!videoUrl) return;
      const newVideo = {
        id: String(addedVideos.length + 1),
        title: videoTitle,
        url: videoUrl,
        duration: videoDuration || '15 min',
      };
      setAddedVideos([...addedVideos, newVideo]);
      setVideoTitle('');
      setVideoUrl('');
      setVideoDuration('');
    }
  };

  const handleRemoveVideoLecture = (id: string) => {
    setAddedVideos(addedVideos.filter(v => v.id !== id));
  };

  const handlePublishCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newInstructor || !newPrice) return;

    // Calculate total duration from videos list
    const totalDuration = addedVideos.length > 0 
      ? `${addedVideos.reduce((acc, curr) => {
          const num = parseInt(curr.duration);
          return acc + (isNaN(num) ? 15 : num);
        }, 0)} min`
      : '10 hours';

    try {
      const courseData = {
        title: newTitle,
        instructor: newInstructor,
        price: Number(newPrice),
        thumbnail: newThumbnail,
        category: newCategory,
        duration: totalDuration,
        level: newLevel,
        description: newDescription || 'Newly registered prophetic training module.',
        whatYouLearn: newWhatYouLearn ? newWhatYouLearn.split('\n').filter(line => line.trim() !== '') : ['Introduction and spiritual foundations'],
        requirements: newRequirements ? newRequirements.split('\n').filter(line => line.trim() !== '') : ['A seeking heart'],
        videos: addedVideos.map(v => ({ title: v.title, url: getYouTubeEmbedUrl(v.url), duration: v.duration }))
      };

      await api.courses.create(courseData);
      await refreshDashboardData();
      
      // Clear forms
      setNewTitle('');
      setNewInstructor('');
      setNewPrice('');
      setNewDescription('');
      setNewWhatYouLearn('');
      setNewRequirements('');
      setAddedVideos([]);
      setCurrentCourseAction('list');
    } catch (err) {
      console.error('Failed to create course:', err);
    }
  };


  const toggleUserStatus = async (userId: string) => {
    const userItem = usersList.find(u => u.id === userId);
    if (!userItem) return;
    const nextStatus = userItem.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.users.updateStatus(userId, nextStatus);
      await refreshDashboardData();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  const deleteUser = (userId: string) => {
    toggleUserStatus(userId);
  };

  const deleteCourse = (courseId: string) => {
    setCoursesList(coursesList.filter(c => c.id !== courseId));
  };

  // Helper to get YouTube Embed
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 relative">
      
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden bg-slate-950 text-white p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              {activeTab}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-red-400 font-semibold text-xs py-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 max-w-xs bg-slate-950 text-white h-full flex flex-col p-6 shadow-2xl border-r border-slate-800 z-50"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Logo Header */}
              <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base leading-tight">SOP Control</h2>
                  <span className="text-xs text-indigo-400">Admin Portal</span>
                </div>
              </div>

              {/* Navigation list */}
              <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'courses', label: 'Courses', icon: BookOpen },
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'transactions', label: 'Transactions', icon: CreditCard },
                  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
                  { id: 'support', label: 'Support', icon: MessageSquare },
                  { id: 'broadcasts', label: 'Broadcasts', icon: Radio },
                  { id: 'certificates', label: 'Certificates', icon: FileCheck },
                  { id: 'mentorship', label: 'Mentorship', icon: UserCheck },
                  { id: 'promotions', label: 'Promos', icon: Tag },
                  { id: 'audit', label: 'Audit', icon: History },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].filter(item => {
                  if (user?.role === 'instructor') {
                    return ['overview', 'courses', 'assignments', 'mentorship'].includes(item.id);
                  }
                  return true;
                }).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setCurrentCourseAction('list');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-amber-400 text-slate-900 font-bold shadow-lg shadow-amber-400/20'
                          : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-indigo-400'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Bottom Profile details */}
              <div className="border-t border-slate-800 pt-4 mt-auto">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-slate-900 font-semibold text-xs">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white">{user?.name || 'System Admin'}</div>
                    <div className="text-[10px] text-indigo-300 truncate">{user?.email || 'admin@sop.org'}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-slate-950 text-white flex-shrink-0 border-r border-slate-800 flex-col justify-between p-6">
        <div>
          {/* Dashboard Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">SOP Control</h2>
              <span className="text-xs text-indigo-400">Admin Portal</span>
            </div>
          </div>

          {/* Nav list */}
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'transactions', label: 'Transactions', icon: CreditCard },
              { id: 'assignments', label: 'Assignments', icon: ClipboardList },
              { id: 'support', label: 'Support', icon: MessageSquare },
              { id: 'broadcasts', label: 'Broadcasts', icon: Radio },
              { id: 'certificates', label: 'Certificates', icon: FileCheck },
              { id: 'mentorship', label: 'Mentorship', icon: UserCheck },
              { id: 'promotions', label: 'Promos', icon: Tag },
              { id: 'audit', label: 'Audit', icon: History },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].filter(item => {
              if (user?.role === 'instructor') {
                return ['overview', 'courses', 'assignments', 'mentorship'].includes(item.id);
              }
              return true;
            }).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setCurrentCourseAction('list');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-400 text-slate-900 font-bold shadow-lg shadow-amber-400/20'
                      : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-indigo-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-slate-900 font-semibold text-xs">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white">{user?.name || 'System Admin'}</div>
              <div className="text-[10px] text-indigo-300 truncate">{user?.email || 'admin@sop.org'}</div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('home')}
            className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-xs font-semibold transition-all mt-2"
          >
            <LogOut className="w-4 h-4" />
            Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview Dashboard</h1>
                <p className="text-gray-600">Platform overview and management</p>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  Reports
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: '52,453', icon: Users, change: '+18%' },
                { label: 'Total Revenue', value: '₦12.5M', icon: DollarSign, change: '+32%' },
                { label: 'Active Courses', value: String(coursesList.length), icon: BookOpen, change: '+15' },
                { label: 'Completion Rate', value: '78%', icon: TrendingUp, change: '+5%' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-8 h-8 text-purple-600" />
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                <div className="h-64 bg-gradient-to-br from-purple-50 to-amber-50 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-16 h-16 text-purple-300 animate-pulse" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                <div className="h-64 bg-gradient-to-br from-green-50 to-cyan-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-16 h-16 text-green-300" />
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Approvals */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
                <div className="space-y-4">
                  {[
                    { type: 'Course', name: 'Advanced Prophetic Protocol', user: 'Prophet Elijah', date: '2 hours ago' },
                    { type: 'Instructor', name: 'Sarah Williams', user: 'sarah@example.com', date: '5 hours ago' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            {item.type}
                          </span>
                          <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.user} • {item.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors">
                          Approve
                        </button>
                        <button className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users list */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                <div className="space-y-4">
                  {usersList.slice(0, 4).map((user, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          user.role === 'Instructor' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">{user.joined}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && currentCourseAction === 'list' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Courses Directory</h1>
                <p className="text-gray-600">Add, update, or remove modules from the platform repository</p>
              </div>
              <button 
                onClick={() => {
                  setCurrentCourseAction('create');
                  if (user && user.role === 'instructor') {
                    setNewInstructor(user.name);
                  }
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 text-sm"
              >
                <Video className="w-4 h-4" />
                Add New Course
              </button>
            </div>

            {/* Courses grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Title</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Instructor</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Price</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Category</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Lessons</th>
                      <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coursesList.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900">{course.title}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{course.instructor}</td>
                        <td className="py-4 px-6 text-sm font-bold text-purple-600">₦{course.price.toLocaleString()}</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full font-medium">
                            {course.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">{course.videos ? course.videos.length : course.lessons} lectures</td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteCourse(course.id)}
                            className="px-3 py-1 bg-red-50 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* COURSES TAB - CREATE COURSE & VIDEOS SUBPAGE */}
        {activeTab === 'courses' && currentCourseAction === 'create' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h1 className="text-3xl font-bold text-gray-950">Create New Course</h1>
                <p className="text-sm text-gray-600">Design your prophetic course curriculum and add video lessons</p>
              </div>
              <button 
                onClick={() => setCurrentCourseAction('list')}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm"
              >
                Go Back
              </button>
            </div>

            <form onSubmit={handlePublishCourse} className="grid lg:grid-cols-3 gap-6">
              
              {/* Left Column: Metadata Forms */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Course Metadata
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Course Title</label>
                      <input 
                        type="text" 
                        value={newTitle} 
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Dimensions of the Prophetic" 
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Instructor Name</label>
                      <input 
                        type="text" 
                        value={newInstructor} 
                        onChange={(e) => setNewInstructor(e.target.value)}
                        placeholder="e.g. Prophet Elijah Mensah" 
                        disabled={user?.role === 'instructor'}
                        className={`w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          user?.role === 'instructor' ? 'opacity-70 cursor-not-allowed bg-gray-100' : ''
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price (₦)</label>
                      <input 
                        type="number" 
                        value={newPrice} 
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="25000" 
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Thumbnail URL</label>
                      <input 
                        type="text" 
                        value={newThumbnail} 
                        onChange={(e) => setNewThumbnail(e.target.value)}
                        placeholder="https://images.unsplash.com/..." 
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        value={newCategory} 
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option>Prophetic</option>
                        <option>Prayer</option>
                        <option>Worship</option>
                        <option>Warfare</option>
                        <option>Healing</option>
                        <option>Leadership</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                      <select 
                        value={newLevel} 
                        onChange={(e) => setNewLevel(e.target.value as any)}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Course Description</label>
                    <textarea 
                      value={newDescription} 
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Describe what this prophetic study covers..." 
                      rows={3}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">What students will learn (one item per line)</label>
                      <textarea 
                        value={newWhatYouLearn} 
                        onChange={(e) => setNewWhatYouLearn(e.target.value)}
                        placeholder="e.g. Learn to discern the voice of God" 
                        rows={3}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Requirements (one item per line)</label>
                      <textarea 
                        value={newRequirements} 
                        onChange={(e) => setNewRequirements(e.target.value)}
                        placeholder="e.g. A prayerful lifestyle" 
                        rows={3}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Publish actions */}
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setCurrentCourseAction('list')}
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold rounded-xl hover:opacity-90 shadow-lg transition-all"
                  >
                    Publish Course
                  </button>
                </div>
              </div>

              {/* Right Column: Video lectures list and add video panel */}
              <div className="space-y-6">
                
                {/* Add Video Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Video className="w-5 h-5 text-amber-500" />
                    Add Video Lecture
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Lecture Title</label>
                      <input 
                        type="text" 
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="e.g. Lesson 1: Hearing God's Voice" 
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Toggle between URL and File upload */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => { setVideoSource('url'); setUploadError(null); }}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          videoSource === 'url' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                        }`}
                      >
                        External Link
                      </button>
                      <button
                        type="button"
                        onClick={() => { setVideoSource('file'); setUploadError(null); }}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          videoSource === 'file' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                        }`}
                      >
                        Upload Local File
                      </button>
                    </div>

                    {videoSource === 'url' ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Video Link (YouTube, Vimeo, etc.)</label>
                        <input 
                          type="text" 
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..." 
                          className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Video File (Max 100MB)</label>
                        <input 
                          type="file" 
                          id="video-file-input"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 100 * 1024 * 1024) {
                                setUploadError('File exceeds the 100MB size limit.');
                                setVideoFile(null);
                              } else {
                                setUploadError(null);
                                setVideoFile(file);
                              }
                            }
                          }}
                          className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        {videoFile && (
                          <p className="text-[10px] text-green-600 font-semibold mt-1">
                            Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                          </p>
                        )}
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-xs text-red-500 font-semibold">{uploadError}</p>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Duration (e.g. 15m, 45m)</label>
                      <input 
                        type="text" 
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                        placeholder="25 min" 
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <button 
                      type="button"
                      disabled={isUploadingVideo || (videoSource === 'file' && !videoFile)}
                      onClick={handleAddVideoLecture}
                      className="w-full py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUploadingVideo ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Uploading (Max 100MB)...
                        </>
                      ) : (
                        'Add Lecture'
                      )}
                    </button>
                  </div>
                </div>

                {/* Added Video Lectures List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>Course Playlist</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                      {addedVideos.length} Lectures
                    </span>
                  </h3>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {addedVideos.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs">
                        No video lectures added yet. Add lessons above to populate playlist.
                      </div>
                    ) : (
                      addedVideos.map((video, idx) => (
                        <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
                          <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{video.title}</p>
                            <p className="text-[10px] text-gray-500 truncate">{video.duration} • {video.url}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewVideoUrl(video.url)}
                              className="w-7 h-7 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center hover:bg-amber-200 transition-colors"
                              title="Preview Lecture"
                            >
                              <Play className="w-3.5 h-3.5 fill-amber-700" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveVideoLecture(video.id)}
                              className="w-7 h-7 bg-red-100 text-red-700 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                              title="Delete Lecture"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </form>

            {/* Video preview modal */}
            {previewVideoUrl && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 rounded-2xl p-4 w-full max-w-3xl border border-slate-800 shadow-2xl relative">
                  <button 
                    onClick={() => setPreviewVideoUrl(null)}
                    className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                  <h3 className="text-white font-semibold mb-3">Video Lecture Preview</h3>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                    <iframe 
                      className="w-full h-full"
                      src={getYouTubeEmbedUrl(previewVideoUrl)}
                      title="Video preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Directory</h1>
              <p className="text-gray-600">Manage directory records of students and ministers</p>
            </div>

            {/* Filter/Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">User</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Email</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Role</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersList
                      .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                              user.role === 'Instructor' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                              user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button 
                              onClick={() => toggleUserStatus(user.id)}
                              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                user.status === 'Active' 
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                              }`}
                            >
                              {user.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Ledger</h1>
                <p className="text-gray-600">Monitor academy course purchases, payments, and financial summaries</p>
              </div>
            </div>

            {/* Financial Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Gross Sales</span>
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">₦12,499,500</div>
                <p className="text-xs text-green-600 font-semibold mt-1">▲ +24% from last month</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Successful Payments</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">324 Transactions</div>
                <p className="text-xs text-gray-500 mt-1">98.2% completion rate</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Average Cart Value</span>
                  <CreditCard className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">₦38,578</div>
                <p className="text-xs text-gray-500 mt-1">Based on premium catalog purchases</p>
              </div>
            </div>

            {/* Transactions table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 text-sm">Recent Sales</h3>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold">Live Data</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">TXID</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Student</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Course</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Amount</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactionsList.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-bold text-gray-400">{tx.id}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900">{tx.student}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 truncate max-w-[200px]">{tx.course}</td>
                        <td className="py-4 px-6 text-sm font-bold text-slate-900">₦{tx.amount.toLocaleString()}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">{tx.date}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                            tx.status === 'Successful' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => {
                              if (tx.status === 'Successful') {
                                setTransactionsList(transactionsList.map(t => t.id === tx.id ? { ...t, status: 'Refunded' } : t));
                              } else {
                                setTransactionsList(transactionsList.map(t => t.id === tx.id ? { ...t, status: 'Successful' } : t));
                              }
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                              tx.status === 'Successful'
                                ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                            }`}
                          >
                            {tx.status === 'Successful' ? 'Issue Refund' : 'Approve Sale'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Spiritual Activations & Assignments</h1>
                <p className="text-gray-600">Review, grade, and provide feedback on students' prophetic exercises and journals</p>
              </div>
            </div>

            {/* Assignments table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Student</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Assignment Title</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Date Submitted</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Grade</th>
                      <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assignmentsList.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900">{assignment.student}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{assignment.title}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">{assignment.date}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                            assignment.status === 'Graded' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {assignment.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-slate-800">{assignment.grade}</td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => {
                              setReviewAssignment(assignment);
                              setAssignmentGrade(assignment.grade !== '-' ? assignment.grade : 'A');
                              setAssignmentFeedback('');
                            }}
                            className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                          >
                            Review Entry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assignment Review Modal */}
            {reviewAssignment && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl border border-gray-100 shadow-2xl relative space-y-4">
                  <button 
                    onClick={() => setReviewAssignment(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                  
                  <div>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-bold">
                      Submission Review
                    </span>
                    <h3 className="text-lg font-bold text-gray-950 mt-2">{reviewAssignment.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Submitted by <strong className="text-gray-700">{reviewAssignment.student}</strong> on {reviewAssignment.date}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Student Submission Text</h4>
                    <p className="text-sm text-gray-800 leading-relaxed italic">"{reviewAssignment.submission}"</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label className="block text-xs font-semibold text-gray-700">Assign Grade</label>
                      <select 
                        value={assignmentGrade}
                        onChange={(e) => setAssignmentGrade(e.target.value)}
                        className="col-span-2 p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option>A</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B</option>
                        <option>C</option>
                        <option>Needs Revision</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Feedback / Prophetic Guidance</label>
                      <textarea
                        value={assignmentFeedback}
                        onChange={(e) => setAssignmentFeedback(e.target.value)}
                        placeholder="Write constructive notes and spiritual guidance for the student..."
                        rows={3}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => setReviewAssignment(null)}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await api.assignments.grade(reviewAssignment.id, {
                            grade: assignmentGrade,
                            feedback: assignmentFeedback,
                            grader: user?.name || 'Instructor'
                          });
                          await refreshDashboardData();
                          setReviewAssignment(null);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="px-5 py-2 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-xl hover:opacity-90 text-sm font-semibold shadow-md transition-all"
                    >
                      Submit Evaluation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUPPORT / COUNSELING TAB */}
        {activeTab === 'support' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Counseling & Support Inbox</h1>
                <p className="text-gray-600">Review counseling inquiries, prayer requests, and technical assistance messages</p>
              </div>
            </div>

            {/* Support Requests List */}
            <div className="grid gap-4">
              {supportList.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className={`bg-white p-5 rounded-2xl border shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    ticket.status === 'Open' ? 'border-amber-100 hover:border-amber-200 bg-amber-50/10' : 'border-gray-100'
                  }`}
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        ticket.category === 'Prophetic Counseling' 
                          ? 'bg-purple-100 text-purple-700' 
                          : ticket.category === 'Prayer Request' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        ticket.status === 'Open' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{ticket.date}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed italic">"{ticket.message}"</p>
                    <p className="text-xs text-gray-500 font-semibold">From: {ticket.name}</p>
                  </div>

                  <div className="flex-shrink-0">
                    <button 
                      onClick={() => {
                        setActiveSupportMessage(ticket);
                        setSupportReplyText('');
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      {ticket.status === 'Open' ? 'Reply & Resolve' : 'View History'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Support / Counseling Reply Modal */}
            {activeSupportMessage && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl border border-gray-100 shadow-2xl relative space-y-4">
                  <button 
                    onClick={() => setActiveSupportMessage(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>

                  <div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-bold">
                      {activeSupportMessage.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-950 mt-2">{activeSupportMessage.subject}</h3>
                    <p className="text-xs text-gray-500 mt-1">Submitted by <strong className="text-gray-700">{activeSupportMessage.name}</strong> on {activeSupportMessage.date}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Original Student Message</h4>
                    <p className="text-sm text-gray-800 leading-relaxed">"{activeSupportMessage.message}"</p>
                  </div>

                  {activeSupportMessage.status === 'Open' ? (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-700">Write Response</label>
                      <textarea
                        value={supportReplyText}
                        onChange={(e) => setSupportReplyText(e.target.value)}
                        placeholder="Type your response or counseling guidance..."
                        rows={4}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  ) : (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <h4 className="text-xs font-bold text-green-800 uppercase mb-1">Inquiry Status: Resolved</h4>
                      <p className="text-sm text-green-700">A response was sent to the student and the inquiry was closed successfully.</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => setActiveSupportMessage(null)}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors"
                    >
                      Close Window
                    </button>
                    {activeSupportMessage.status === 'Open' && (
                      <button 
                        onClick={async () => {
                          try {
                            await api.support.resolve(activeSupportMessage.id, {
                              replyText: supportReplyText,
                              resolver: user?.name || 'Admin'
                            });
                            await refreshDashboardData();
                            setSupportReplyText('');
                            setActiveSupportMessage(null);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="px-5 py-2 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-xl hover:opacity-90 text-sm font-semibold shadow-md transition-all"
                      >
                        Send & Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* BROADCASTS TAB */}
        {activeTab === 'broadcasts' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Impartation & Broadcasts</h1>
                <p className="text-gray-600">Schedule webinars, live prayer broadcasts, and mentorship video sessions</p>
              </div>
              <button 
                onClick={() => setShowBroadcastForm(!showBroadcastForm)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-xl hover:opacity-90 font-semibold shadow-md transition-all self-start"
              >
                <Plus className="w-4 h-4" />
                <span>{showBroadcastForm ? 'Hide Form' : 'Schedule Broadcast'}</span>
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Scheduled Streams</div>
                  <div className="text-2xl font-bold text-gray-950">
                    {broadcastsList.filter(b => b.status === 'Upcoming').length} Active
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <Wifi className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Live Platforms</div>
                  <div className="text-2xl font-bold text-gray-950">Zoom, YouTube</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Alert Notification Rate</div>
                  <div className="text-2xl font-bold text-gray-950">100% Sent</div>
                </div>
              </div>
            </div>

            {/* Schedule Form */}
            {showBroadcastForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-bold text-gray-950">New Broadcast Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Session Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Prophetic Insight & Impartation" 
                      value={newBroadcast.title}
                      onChange={e => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Session Type</label>
                    <select 
                      value={newBroadcast.type}
                      onChange={e => setNewBroadcast({ ...newBroadcast, type: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option>Live Stream</option>
                      <option>Zoom Meeting</option>
                      <option>Webinar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Broadcast Date</label>
                    <input 
                      type="text" 
                      placeholder="e.g., June 19, 2026" 
                      value={newBroadcast.date}
                      onChange={e => setNewBroadcast({ ...newBroadcast, date: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Broadcast Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g., 6:30 PM WAT" 
                      value={newBroadcast.time}
                      onChange={e => setNewBroadcast({ ...newBroadcast, time: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Host / Speaker</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Prophet Elijah Mensah" 
                      value={newBroadcast.host}
                      onChange={e => setNewBroadcast({ ...newBroadcast, host: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Streaming Platform</label>
                    <select 
                      value={newBroadcast.platform}
                      onChange={e => setNewBroadcast({ ...newBroadcast, platform: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option>YouTube Live</option>
                      <option>Zoom</option>
                      <option>Google Meet</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Live/Meeting Link</label>
                    <input 
                      type="text" 
                      placeholder="e.g., https://youtube.com/live/..." 
                      value={newBroadcast.link}
                      onChange={e => setNewBroadcast({ ...newBroadcast, link: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    onClick={() => setShowBroadcastForm(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      if (!newBroadcast.title || !newBroadcast.date) return;
                      try {
                        await api.broadcasts.create({
                          ...newBroadcast,
                          status: 'Upcoming',
                          notified: false
                        });
                        await refreshDashboardData();
                        setNewBroadcast({ title: '', type: 'Live Stream', date: '', time: '', host: '', platform: 'YouTube Live', link: '' });
                        setShowBroadcastForm(false);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Add Session
                  </button>
                </div>
              </motion.div>
            )}

            {/* Broadcast Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Broadcast Schedule Ledger</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Session</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Host & Platform</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date & Time</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {broadcastsList.map((broadcast) => (
                      <tr key={broadcast.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900">{broadcast.title}</div>
                          <span className="inline-block px-2 py-0.5 mt-1 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded">
                            {broadcast.type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-800">{broadcast.host}</div>
                          <div className="text-xs text-gray-500">{broadcast.platform}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-800 font-medium">{broadcast.date}</div>
                          <div className="text-xs text-gray-500">{broadcast.time}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                            broadcast.status === 'Completed'
                              ? 'bg-gray-100 text-gray-600'
                              : broadcast.status === 'Upcoming'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              broadcast.status === 'Completed'
                                ? 'bg-gray-400'
                                : broadcast.status === 'Upcoming'
                                ? 'bg-purple-500 animate-pulse'
                                : 'bg-amber-500'
                            }`}></span>
                            {broadcast.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            {broadcast.status === 'Upcoming' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await api.broadcasts.notify(broadcast.id);
                                    await refreshDashboardData();
                                    alert(`Prophetic broadcast notification sent to all active students!`);
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  broadcast.notified
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                                }`}
                              >
                                <Bell className="w-3.5 h-3.5 inline mr-1" />
                                {broadcast.notified ? 'Notified' : 'Notify Students'}
                              </button>
                            )}
                            {broadcast.status === 'Upcoming' && broadcast.link && (
                              <a
                                href={broadcast.link}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-amber-500 hover:opacity-90 text-white text-xs font-bold rounded-lg transition-all"
                              >
                                Start Stream
                              </a>
                            )}
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to cancel this broadcast?')) {
                                  try {
                                    await api.broadcasts.delete(broadcast.id);
                                    await refreshDashboardData();
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Broadcast"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* CERTIFICATES TAB */}
        {activeTab === 'certificates' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificates & Registry</h1>
                <p className="text-gray-600">Issue, revoke, and verify student training certificates of graduation</p>
              </div>
              <button
                onClick={() => {
                  setIsIssueCertModalOpen(true);
                  if (usersList.length > 0) setIssueCertStudent(usersList[0].name);
                  if (coursesList.length > 0) setIssueCertCourse(coursesList[0].title);
                  setIssueCertGrade("A");
                  const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  setIssueCertDate(todayStr);
                }}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Issue New Certificate</span>
              </button>
            </div>

            {/* Quick Verifier */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-950 mb-3 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                <span>Prophetic Registry Verification Portal</span>
              </h3>
              <div className="flex gap-2 max-w-xl">
                <input 
                  type="text" 
                  placeholder="Enter Certificate Verification Code (e.g. CERT-2026-0001)" 
                  value={certVerifyQuery}
                  onChange={e => setCertVerifyQuery(e.target.value)}
                  className="flex-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                  onClick={() => {
                    const match = certificatesList.find(c => c.id.toLowerCase() === certVerifyQuery.trim().toLowerCase());
                    if (match) {
                      alert(`VALID CERTIFICATE FOUND!\n\nID: ${match.id}\nGraduand: ${match.student}\nCourse: ${match.course}\nStatus: ${match.status}\nGrade: ${match.grade}`);
                    } else {
                      alert(`INVALID CERTIFICATE CODE.\nNo record matching "${certVerifyQuery}" was found in the SOP Academy Registry.`);
                    }
                  }}
                  className="px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all"
                >
                  Verify Code
                </button>
              </div>
            </div>

            {/* Ledger List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Graduation Registry</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Certificate ID</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Graduand Student</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Course Program</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">Grade</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {certificatesList.map((cert) => (
                      <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600">
                          {cert.id}
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                          {cert.student}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {cert.course}
                        </td>
                        <td className="py-4 px-6 text-center text-sm font-bold text-purple-600">
                          {cert.grade}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            cert.status === 'Issued'
                              ? 'bg-green-100 text-green-700'
                              : cert.status === 'Pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {cert.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {cert.status === 'Pending' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await api.certificates.updateStatus(cert.id, 'Issued');
                                    await refreshDashboardData();
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all"
                              >
                                Approve & Issue
                              </button>
                            )}
                            {cert.status === 'Issued' && (
                              <>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(cert.verificationUrl || `https://sop.org/verify/${cert.id}`);
                                    alert('Verification URL copied to clipboard!');
                                  }}
                                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
                                  title="Copy Verification Link"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.certificates.updateStatus(cert.id, 'Revoked');
                                      await refreshDashboardData();
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="px-2 py-1 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-all"
                                >
                                  Revoke
                                </button>
                              </>
                            )}
                            {cert.status === 'Revoked' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await api.certificates.updateStatus(cert.id, 'Issued');
                                    await refreshDashboardData();
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-all"
                              >
                                Re-Issue
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Issue Certificate Modal */}
            {isIssueCertModalOpen && (
              <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-100 shadow-2xl relative space-y-4">
                  <button 
                    onClick={() => setIsIssueCertModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                  
                  <div>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
                      New Credential
                    </span>
                    <h3 className="text-lg font-bold text-gray-950 mt-2">Issue Graduation Certificate</h3>
                    <p className="text-xs text-gray-500 mt-1">Select student graduand, course program, grade and date.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Student Select */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Student</label>
                      <select
                        value={issueCertStudent}
                        onChange={(e) => setIssueCertStudent(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {usersList.map((user) => (
                          <option key={user.id} value={user.name}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Course Select */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Course Program</label>
                      <select
                        value={issueCertCourse}
                        onChange={(e) => setIssueCertCourse(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {coursesList.map((course) => (
                          <option key={course.id} value={course.title}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Grade Select */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Grade</label>
                        <select
                          value={issueCertGrade}
                          onChange={(e) => setIssueCertGrade(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option>A+</option>
                          <option>A</option>
                          <option>A-</option>
                          <option>B+</option>
                          <option>B</option>
                          <option>C</option>
                          <option>Pass</option>
                          <option>Distinction</option>
                        </select>
                      </div>

                      {/* Completion Date */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Completion Date</label>
                        <input
                          type="text"
                          value={issueCertDate}
                          onChange={(e) => setIssueCertDate(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g. June 30, 2026"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => setIsIssueCertModalOpen(false)}
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!issueCertStudent) {
                            alert("Please select a student");
                            return;
                          }
                          if (!issueCertCourse) {
                            alert("Please select a course");
                            return;
                          }
                          
                          // Generate unique cert code: CERT-YYYY-XXXX
                          const yearStr = new Date().getFullYear();
                          const randomId = Math.floor(1000 + Math.random() * 9000);
                          const certId = `CERT-${yearStr}-${randomId}`;

                          try {
                            await api.certificates.create({
                              id: certId,
                              student: issueCertStudent,
                              course: issueCertCourse,
                              completionDate: issueCertDate,
                              grade: issueCertGrade
                            });
                            alert(`Certificate ${certId} issued successfully!`);
                            setIsIssueCertModalOpen(false);
                            await refreshDashboardData();
                          } catch (err: any) {
                            alert(`Error issuing certificate: ${err.message}`);
                          }
                        }}
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                      >
                        Issue Certificate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* MENTORSHIP TAB */}
        {activeTab === 'mentorship' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Prophetic Mentorship & Groups</h1>
                <p className="text-gray-600">Coordinate student mentorship circles and review personal logs shared with senior instructors</p>
              </div>
              <button 
                onClick={() => setShowMentorshipForm(!showMentorshipForm)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-xl hover:opacity-90 font-semibold shadow-md transition-all self-start"
              >
                <Plus className="w-4 h-4" />
                <span>{showMentorshipForm ? 'Hide Form' : 'New Mentorship Group'}</span>
              </button>
            </div>

            {/* Mentorship Form */}
            {showMentorshipForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-bold text-gray-950">New Mentorship Group Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Group Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Prophetic Watchmen" 
                      value={newGroup.name}
                      onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Mentor</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Prophet Elijah Mensah" 
                      value={newGroup.mentor}
                      onChange={e => setNewGroup({ ...newGroup, mentor: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mentor Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g., mentor@example.com" 
                      value={newGroup.mentorEmail}
                      onChange={e => setNewGroup({ ...newGroup, mentorEmail: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Capacity Limit</label>
                    <input 
                      type="number" 
                      placeholder="5" 
                      value={newGroup.capacity}
                      onChange={e => setNewGroup({ ...newGroup, capacity: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    onClick={() => setShowMentorshipForm(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      if (!newGroup.name || !newGroup.mentor) return;
                      try {
                        await api.mentorship.groups.create({
                          name: newGroup.name,
                          mentor: newGroup.mentor,
                          mentorEmail: newGroup.mentorEmail,
                          students: [],
                          capacity: Number(newGroup.capacity || 5),
                          status: 'Active',
                          nextSession: 'June 22, 2026 — 4:00 PM'
                        });
                        await refreshDashboardData();
                        setNewGroup({ name: '', mentor: '', mentorEmail: '', capacity: '5' });
                        setShowMentorshipForm(false);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Create Group
                  </button>
                </div>
              </motion.div>
            )}

            {/* Groups Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {mentorshipGroups.map((group) => (
                <div key={group.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">{group.name}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-green-50 text-green-700 rounded-full border border-green-200">
                        {group.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold text-gray-800">Mentor:</span> {group.mentor}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">{group.mentorEmail}</div>
                    
                    <div className="space-y-2 border-t border-gray-100 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Capacity:</span>
                        <span className="font-bold text-gray-900">
                          {group.students.length} / {group.capacity} Students
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full" 
                          style={{ width: `${(group.students.length / group.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Next Interactive Class</div>
                    <div className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{group.nextSession}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Student Log / Mentorship Messages */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Direct Mentoring Journal Submissions</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {mentorMessages.map((msg) => (
                  <div key={msg.id} className={`p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4 ${!msg.read ? 'bg-indigo-50/30' : ''}`}>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900">{msg.from}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-semibold text-purple-700">{msg.to}</span>
                        <span className="text-xs text-gray-500">({msg.group})</span>
                        {!msg.read && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">New Log</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 italic font-serif">"{msg.message}"</p>
                      <div className="text-[10px] text-gray-400 font-medium">{msg.date}</div>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-center">
                      {!msg.read && (
                        <button
                          onClick={() => {
                            setMentorMessages(mentorMessages.map(m => 
                              m.id === msg.id ? { ...m, read: true } : m
                            ));
                          }}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg shadow-sm transition-all"
                        >
                          Mark Viewed
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const reply = prompt(`Enter evaluation response guidance from ${msg.to} to ${msg.from}:`);
                          if (reply) {
                            alert(`Prophetic mentoring guidance response dispatched successfully to ${msg.from}'s student dashboard.`);
                            setMentorMessages(mentorMessages.map(m => 
                              m.id === msg.id ? { ...m, read: true } : m
                            ));
                          }
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-90 transition-all"
                      >
                        Reply Guidance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* PROMOTIONS & SCHOLARSHIPS TAB */}
        {activeTab === 'promotions' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Promotions & Scholarships</h1>
                <p className="text-gray-600">Create enrollment coupon codes and review financial aid requests</p>
              </div>
              <button 
                onClick={() => setShowPromoForm(!showPromoForm)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-xl hover:opacity-90 font-semibold shadow-md transition-all self-start"
              >
                <Plus className="w-4 h-4" />
                <span>{showPromoForm ? 'Hide Form' : 'Generate Promo Code'}</span>
              </button>
            </div>

            {/* Promo Code Form */}
            {showPromoForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-bold text-gray-950">New Coupon Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Coupon Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g., HARVEST50" 
                      value={newPromo.code}
                      onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Type</label>
                    <select 
                      value={newPromo.type}
                      onChange={e => setNewPromo({ ...newPromo, type: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option>Percentage</option>
                      <option>Fixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Value ({newPromo.type === 'Percentage' ? '%' : '₦'})</label>
                    <input 
                      type="number" 
                      placeholder="e.g., 20" 
                      value={newPromo.value}
                      onChange={e => setNewPromo({ ...newPromo, value: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Max Uses Limit</label>
                    <input 
                      type="number" 
                      placeholder="e.g., 50" 
                      value={newPromo.maxUses}
                      onChange={e => setNewPromo({ ...newPromo, maxUses: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Expiration Date</label>
                    <input 
                      type="text" 
                      placeholder="e.g., July 15, 2026" 
                      value={newPromo.expiry}
                      onChange={e => setNewPromo({ ...newPromo, expiry: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Brief Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Summer School Special Offer" 
                      value={newPromo.description}
                      onChange={e => setNewPromo({ ...newPromo, description: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    onClick={() => setShowPromoForm(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      if (!newPromo.code || !newPromo.value) return;
                      try {
                        await api.promotions.coupons.create({
                          code: newPromo.code,
                          type: newPromo.type,
                          value: Number(newPromo.value),
                          usageCount: 0,
                          maxUses: Number(newPromo.maxUses || 100),
                          expiry: newPromo.expiry || 'No Expiry',
                          status: 'Active',
                          description: newPromo.description || 'Custom promotion offer'
                        });
                        await refreshDashboardData();
                        setNewPromo({ code: '', type: 'Percentage', value: '', maxUses: '', expiry: '', description: '' });
                        setShowPromoForm(false);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Create Code
                  </button>
                </div>
              </motion.div>
            )}

            {/* Coupons Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Campaign Promotion Ledger</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Promo Code</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Description</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Discount Value</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">Usage Limit</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Expiry</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {promosList.map((promo) => (
                      <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-sm font-bold text-amber-600">
                          {promo.code}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {promo.description}
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-gray-900">
                          {promo.type === 'Percentage' ? `${promo.value}% Off` : `₦${promo.value.toLocaleString()}`}
                        </td>
                        <td className="py-4 px-6 text-center text-sm font-semibold text-gray-700">
                          {promo.usageCount} / {promo.maxUses}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                          {promo.expiry}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            promo.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {promo.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {promo.status === 'Active' ? (
                              <button
                                onClick={async () => {
                                  try {
                                    await api.promotions.coupons.updateStatus(promo.id, 'Expired');
                                    await refreshDashboardData();
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="px-2.5 py-1 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-all"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  try {
                                    await api.promotions.coupons.updateStatus(promo.id, 'Active');
                                    await refreshDashboardData();
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="px-2.5 py-1 border border-green-200 hover:bg-green-50 text-green-600 text-xs font-semibold rounded-lg transition-all"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this promo?')) {
                                  try {
                                    await api.promotions.coupons.delete(promo.id);
                                    await refreshDashboardData();
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Promo"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scholarships section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Discipleship & Scholarship Applications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Applicant</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Course Desired</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Ministry Purpose / Reason</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Applied Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {scholarshipsList.map((sch) => (
                      <tr key={sch.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                          {sch.student}
                        </td>
                        <td className="py-4 px-6 text-sm text-purple-700 font-semibold">
                          {sch.course}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate" title={sch.reason}>
                          {sch.reason}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                          {sch.dateApplied}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            sch.status === 'Approved'
                              ? 'bg-green-100 text-green-700'
                              : sch.status === 'Pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {sch.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {sch.status === 'Pending' && (
                              <>
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.promotions.scholarships.updateStatus(sch.id, 'Approved');
                                      await refreshDashboardData();
                                      alert(`Scholarship granted to ${sch.student}! Enrollment automatically processed.`);
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all"
                                >
                                  Grant Aid
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.promotions.scholarships.updateStatus(sch.id, 'Rejected');
                                      await refreshDashboardData();
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-all"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {sch.status !== 'Pending' && (
                              <span className="text-xs text-gray-400 italic font-medium">Processed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* AUDIT LOGS & ROLES TAB */}
        {activeTab === 'audit' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Logs & Admin Roles</h1>
                <p className="text-gray-600">Track administrative activities and configure staff role permissions</p>
              </div>
              <button 
                onClick={async () => {
                  const name = prompt("Enter new staff member name:");
                  const email = prompt("Enter staff member email:");
                  const role = prompt("Select Role (e.g. Instructor, Counselor, Support Agent):", "Instructor");
                  if (name && email) {
                    try {
                      await api.audit.roles.create({
                        name,
                        email,
                        role,
                        permissions: ['Grade Assignments', 'View Students'],
                        lastActive: 'Never'
                      });
                      await refreshDashboardData();
                      alert(`Access invitation sent to ${email}!`);
                    } catch (err) {
                      console.error(err);
                    }
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-xl hover:opacity-90 font-semibold shadow-md transition-all self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Invite Staff Member</span>
              </button>
            </div>

            {/* Grid of Roles and Audits */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left Column: Admin Roles */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Administrative Staff Registry</h3>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Administrator</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Role & Permissions</th>
                        <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">Last Active</th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {adminRoles.map((staff) => (
                        <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900">{staff.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{staff.email}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm font-bold text-purple-700 mb-1">{staff.role}</div>
                            <div className="flex flex-wrap gap-1">
                              {(staff.permissions as string[]).map((p: string, idx: number) => (
                                <span key={idx} className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center text-xs text-gray-500 font-medium">
                            {staff.lastActive}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={async () => {
                                  const newPermStr = prompt(`Update permissions for ${staff.name} (comma-separated):`, (staff.permissions as string[]).join(', '));
                                  if (newPermStr !== null) {
                                    try {
                                      await api.audit.roles.updatePermissions(staff.id, newPermStr.split(',').map(s => s.trim()).filter(Boolean));
                                      await refreshDashboardData();
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                }}
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg transition-all"
                              >
                                Edit Perms
                              </button>
                              {staff.role !== 'Super Admin' && (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Are you sure you want to revoke administrative access for ${staff.name}?`)) {
                                      try {
                                        await api.audit.roles.delete(staff.id);
                                        await refreshDashboardData();
                                        alert(`Administrative access credentials revoked for ${staff.name}.`);
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }
                                  }}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Revoke Staff Access"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Security Audits */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[550px]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                  <h3 className="font-bold text-gray-900">System Security Audit</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                    Live Logs
                  </span>
                </div>
                <div className="overflow-y-auto p-6 space-y-4 flex-1">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900">{log.admin}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                          log.severity === 'danger'
                            ? 'bg-red-100 text-red-800'
                            : log.severity === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {log.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-gray-700">
                        {log.action}: <span className="font-medium text-slate-900">{log.target}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{log.date}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
              <p className="text-gray-600">Configure core settings and preferences for SOP Academy</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* General Config Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Platform Title</label>
                    <input 
                      type="text" 
                      defaultValue="SOP Academy — School of the Prophets" 
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Support Email</label>
                    <input 
                      type="email" 
                      defaultValue="info@sopacademy.org" 
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance & Security Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Security & Maintenance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Maintenance Mode</div>
                      <p className="text-xs text-gray-500">Temporarily take the site offline for visitors</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 accent-purple-600 cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">New Enrollments</div>
                      <p className="text-xs text-gray-500">Allow visitors to sign up for new courses</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-purple-600 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-amber-800 text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-6xl font-bold mb-6"
          >
            About SOP Academy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-200 max-w-3xl mx-auto"
          >
            A prophetic training platform where believers are equipped in prophecy, prayer, 
            spiritual warfare, worship, and kingdom leadership — accessible to the global body of Christ.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg mb-6">
                We believe that every believer is called to hear God's voice and operate in the gifts of the Spirit. 
                SOP Academy is committed to raising prophetic voices across the nations 
                by providing anointed courses taught by seasoned men and women of God.
              </p>
              <p className="text-gray-600 text-lg">
                Our platform combines cutting-edge technology with Spirit-led teaching to create 
                an immersive training experience that equips believers to fulfill their prophetic 
                and ministerial callings.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '50K+', label: 'Believers' },
                { value: '200+', label: 'Courses' },
                { value: '50+', label: 'Ministers' },
                { value: '95%', label: 'Satisfaction' }
              ].map((stat, i) => (
                <div key={i} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-center text-white shadow-lg shadow-purple-500/30">
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-indigo-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Anointing', desc: 'We pursue Spirit-led excellence in everything we teach, ensuring each course carries the fire of God.', icon: Award },
              { title: 'Accessibility', desc: 'Prophetic training should be available to all believers. We work to make kingdom education affordable and accessible.', icon: Globe },
              { title: 'Community', desc: 'Iron sharpens iron. We foster a Spirit-filled community of believers growing together in the prophetic.', icon: Users }
            ].map((value, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 text-center hover:shadow-2xl hover:shadow-purple-500/10 transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 bg-clip-text text-transparent mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for your learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: 'Free',
              price: '₦0',
              period: 'forever',
              features: ['Access to free courses', 'Course previews', 'Community access', 'Mobile app access'],
              cta: 'Get Started',
              popular: false
            },
            {
              name: 'Pro',
              price: '₦9,999',
              period: 'per month',
              features: ['All free features', 'Unlimited course access', 'Certificates', 'Downloadable resources', 'Priority support', 'Offline viewing'],
              cta: 'Start Free Trial',
              popular: true
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: 'contact us',
              features: ['All Pro features', 'Team management', 'Custom branding', 'API access', 'Dedicated support', 'Analytics dashboard'],
              cta: 'Contact Sales',
              popular: false
            }
          ].map((plan, i) => (
            <div
              key={i}
              className={`bg-white rounded-3xl p-8 shadow-xl relative transition-all hover:shadow-2xl ${
                plan.popular ? 'ring-2 ring-amber-400 scale-105 shadow-amber-500/30' : 'hover:shadow-purple-500/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-sm font-semibold rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 shadow-lg shadow-amber-500/30 hover:shadow-xl'
                    : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 border border-indigo-200'
                }`}
              >
                {plan.cta}
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Checkout Modal State
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [autoOpenCourse, setAutoOpenCourse] = useState<Course | null>(null);
  const [enrollmentTrigger, setEnrollmentTrigger] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const fetchCoursesList = async () => {
    try {
      const data = await api.courses.list();
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses from API:', err);
      setCourses(mockCourses);
    }
  };

  useEffect(() => {
    fetchCoursesList();
  }, [enrollmentTrigger]);

  const authContext: AuthContextType = {
    user,
    login: async (_email: string, _password: string) => {
      const loggedUser = await api.auth.login(_email, _password);
      setUser(loggedUser);
      setCurrentPage(loggedUser.role === 'admin' || loggedUser.role === 'instructor' ? 'admin-dashboard' : 'student-dashboard');
    },
    logout: () => {
      setUser(null);
      setCurrentPage('home');
    },
    signup: async (name: string, email: string, _password: string) => {
      const registeredUser = await api.auth.signup(name, email, _password);
      setUser(registeredUser);
      setCurrentPage('student-dashboard');
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'courses' || page === 'home') {
      fetchCoursesList();
    }
    setCurrentPage(page);
    setSelectedCourse(null);
    if (page !== 'login' && page !== 'signup' && page !== 'checkout-auth') {
      setCheckoutCourse(null);
    }
    window.scrollTo(0, 0);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setCurrentPage('course-detail');
    window.scrollTo(0, 0);
  };

  const handleEnroll = () => {
    if (selectedCourse) {
      setCheckoutCourse(selectedCourse);
    }

    if (!user) {
      setCurrentPage('checkout-auth');
      return;
    }

    if (user.role !== 'student') {
      alert('Only student accounts can enroll in courses.');
      setCheckoutCourse(null);
      return;
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    const code = couponCode.toUpperCase().trim();
    if (code === 'PROPHETIC10') {
      if (checkoutCourse) {
        setDiscount(Math.round(checkoutCourse.price * 0.1));
        setAppliedCoupon(code);
      }
    } else if (code === 'PRAYER50') {
      if (checkoutCourse) {
        setDiscount(Math.min(checkoutCourse.price, 5000));
        setAppliedCoupon(code);
      }
    } else {
      alert('Invalid or expired coupon code.');
    }
  };

  const handleCompleteCheckout = async () => {
    if (!checkoutCourse || !user) return;
    setIsCheckingOut(true);
    setTimeout(async () => {
      try {
        const finalPrice = checkoutCourse.price - discount;
        await api.transactions.create({
          student: user.name,
          course: checkoutCourse.title,
          amount: finalPrice
        });
        alert(`Payment successful! Enrolled in ${checkoutCourse.title}.`);
        
        const purchasedCourse = checkoutCourse;
        setCheckoutCourse(null);
        setCouponCode('');
        setDiscount(0);
        setAppliedCoupon('');
        setPaymentMethod('card');
        setEnrollmentTrigger(prev => prev + 1);
        setAutoOpenCourse(purchasedCourse);
        setCurrentPage('student-dashboard');
      } catch (err) {
        alert('Payment processing failed.');
      } finally {
        setIsCheckingOut(false);
      }
    }, 1500);
  };

  const renderCheckoutModal = () => {
    if (!checkoutCourse || !user) return null;
    const finalPrice = checkoutCourse.price - discount;

    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md border border-gray-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Secure Checkout</h3>
                <p className="text-xs text-indigo-200 font-medium">Complete your prophetic enrollment</p>
              </div>
              <button
                onClick={() => {
                  setCheckoutCourse(null);
                  setCouponCode('');
                  setDiscount(0);
                  setAppliedCoupon('');
                  setPaymentMethod('card');
                }}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Course Summary */}
              <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <img src={checkoutCourse.thumbnail} alt={checkoutCourse.title} className="w-24 h-16 object-cover rounded-xl shadow-sm flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-bold uppercase">{checkoutCourse.category}</span>
                  <h4 className="font-bold text-gray-900 text-sm truncate mt-1">{checkoutCourse.title}</h4>
                  <p className="text-xs text-gray-500">Instructor: {checkoutCourse.instructor}</p>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                      paymentMethod === 'card' 
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-100' 
                        : 'border-gray-200 hover:border-gray-350'
                    }`}
                  >
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="text-xs font-bold text-gray-950">Debit Card</div>
                      <div className="text-[10px] text-gray-500">Pay securely instantly</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                      paymentMethod === 'bank' 
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-100' 
                        : 'border-gray-200 hover:border-gray-350'
                    }`}
                  >
                    <BookOpen className={`w-5 h-5 ${paymentMethod === 'bank' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="text-xs font-bold text-gray-950">Bank Transfer</div>
                      <div className="text-[10px] text-gray-500">Manual verification</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. PROPHETIC10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 uppercase font-mono"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon('');
                        setDiscount(0);
                        setCouponCode('');
                      }}
                      className="px-4 py-2.5 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2.5 bg-gray-900 text-white hover:bg-gray-800 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    ✓ Code <strong>{appliedCoupon}</strong> applied successfully!
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Course Tuition</span>
                  <span className="font-semibold text-gray-900">₦{checkoutCourse.price.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-₦{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-extrabold text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-purple-600">₦{finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
              <button
                onClick={handleCompleteCheckout}
                disabled={isCheckingOut}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-amber-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  `Pay & Enroll (₦${finalPrice.toLocaleString()})`
                )}
              </button>
              <p className="text-[10px] text-gray-400 text-center">
                By completing checkout, you agree to our Terms of Service. Purchases are immediately activated in your dashboard.
              </p>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  // Render admin login page
  if (currentPage === 'admin-login') {
    return (
      <AuthContext.Provider value={authContext}>
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        <AdminLoginPage onNavigate={handleNavigate} />
      </AuthContext.Provider>
    );
  }

  // Render Unified Checkout & Auth page
  if (currentPage === 'checkout-auth' && checkoutCourse) {
    return (
      <AuthContext.Provider value={authContext}>
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        <CheckoutAuthPage
          checkoutCourse={checkoutCourse}
          onNavigate={handleNavigate}
          onSuccess={(signedUser) => {
            setUser(signedUser);
            setAutoOpenCourse(checkoutCourse);
            setCheckoutCourse(null);
            setEnrollmentTrigger(prev => prev + 1);
            setCurrentPage('student-dashboard');
          }}
        />
      </AuthContext.Provider>
    );
  }

  // Render auth pages with header
  if (currentPage === 'login' || currentPage === 'signup') {
    return (
      <AuthContext.Provider value={authContext}>
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        {currentPage === 'login' ? (
          <LoginPage onNavigate={handleNavigate} checkoutCourse={checkoutCourse} />
        ) : (
          <SignupPage onNavigate={handleNavigate} checkoutCourse={checkoutCourse} />
        )}
      </AuthContext.Provider>
    );
  }

  // Render dashboard pages
  if (currentPage === 'student-dashboard') {
    return (
      <AuthContext.Provider value={authContext}>
        <div className="min-h-screen bg-gray-50">
          <Header onNavigate={handleNavigate} currentPage={currentPage} />
          <StudentDashboard 
            key={enrollmentTrigger} 
            onCheckout={(course) => setCheckoutCourse(course)} 
            initialActiveCourse={autoOpenCourse}
            onClearInitialActiveCourse={() => setAutoOpenCourse(null)}
          />
          {renderCheckoutModal()}
        </div>
      </AuthContext.Provider>
    );
  }



  if (currentPage === 'admin-dashboard') {
    return (
      <AuthContext.Provider value={authContext}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header onNavigate={handleNavigate} currentPage={currentPage} />
          <AdminDashboard onNavigate={handleNavigate} />
        </div>
      </AuthContext.Provider>
    );
  }

  // Render course detail page
  if (currentPage === 'course-detail' && selectedCourse) {
    return (
      <AuthContext.Provider value={authContext}>
        <div className="min-h-screen bg-gray-50">
          <Header onNavigate={handleNavigate} currentPage={currentPage} />
          <CourseDetailPage 
            course={selectedCourse} 
            onBack={() => handleNavigate('courses')}
            onEnroll={handleEnroll}
            onResume={(course) => {
              setAutoOpenCourse(course);
              setCurrentPage('student-dashboard');
            }}
          />
          {renderCheckoutModal()}
          <Footer />
        </div>
      </AuthContext.Provider>
    );
  }

  // Render main pages
  return (
    <AuthContext.Provider value={authContext}>
      <div className="min-h-screen bg-white">
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        
        <main>
          {currentPage === 'home' && (
            <HomePage courses={courses} onNavigate={handleNavigate} onSelectCourse={handleSelectCourse} />
          )}
          {currentPage === 'courses' && (
            <CoursesPage courses={courses} onSelectCourse={handleSelectCourse} />
          )}

          {currentPage === 'about' && (
            <AboutPage />
          )}
          {currentPage === 'pricing' && (
            <PricingPage />
          )}
        </main>
        {renderCheckoutModal()}
        <Footer />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
