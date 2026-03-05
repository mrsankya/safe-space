import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Brain, 
  LineChart, 
  MessageCircle, 
  ShieldCheck, 
  AlertCircle,
  Moon,
  Zap,
  Smile,
  ChevronRight,
  LogOut,
  User,
  Trash2,
  Phone,
  Sparkles
} from 'lucide-react';
import { 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import Markdown from 'react-markdown';
import { analyzeSentimentAndRisk, getSupportSuggestions, generateMicroIntervention, getAIPeekMessage } from './services/geminiService';
import { RiskLevel, MoodEntry, AssessmentResult, ChatMessage, UserProfile, MicroIntervention, UserIntent } from './types';
import { Assessment } from './components/Assessment';
import { MicroInterventionCard } from './components/MicroInterventions';
import { BreathCoach } from './components/BreathCoach';
import { LANGUAGES, t } from './translations';

// --- Components ---

const Logo = ({ className = "w-12 h-12", light = false }: { className?: string, light?: boolean }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.2, 0.1]
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 bg-theme-primary rounded-full blur-2xl"
    />
    <div className="relative flex items-center justify-center">
      <Brain className="w-full h-full text-theme-primary" />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute"
      >
        <Heart className="w-1/2 h-1/2 text-theme-primary fill-theme-primary opacity-80" />
      </motion.div>
    </div>
  </div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as any
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 50,
      damping: 20,
      duration: 0.8
    }
  }
};

const Onboarding = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');

  const steps = [
    {
      title: t('welcome', language),
      content: t('tagline', language),
      icon: <Heart className="w-12 h-12 text-theme-primary" />
    },
    {
      title: t('privacy', language),
      content: t('privacyNote', language),
      icon: <ShieldCheck className="w-12 h-12 text-theme-primary" />
    },
    {
      title: t('disclaimer', language),
      content: "SafeSpace is an AI support tool, not a medical diagnosis or crisis intervention service. Always consult a professional for medical advice.",
      icon: <AlertCircle className="w-12 h-12 text-theme-primary" />
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({ name, consented: true, onboarded: true, language });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-theme-bg relative overflow-hidden">
      {/* Funky Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-20 -left-20 w-80 h-80 bg-theme-primary/20 rounded-full blur-[100px]"
      />
      <motion.div 
        animate={{ scale: [1.5, 1, 1.5], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-theme-secondary/20 rounded-full blur-[100px]"
      />
      <motion.div 
        animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 w-40 h-40 bg-theme-accent/20 rounded-full blur-[80px]"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full glass-tile p-10 text-center text-theme-text relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <Logo className="w-20 h-20 mb-6" />
          <h2 className="text-theme-primary font-sans font-medium text-lg tracking-[0.3em] uppercase opacity-100">SafeSpace</h2>
          <p className="text-[10px] text-theme-text font-medium uppercase tracking-[0.2em] mt-2 opacity-60">{t('tagline', language)}</p>
        </div>
        
        <div className="flex justify-center mb-8 opacity-100">
          {steps[step].icon}
        </div>
        <h1 className="text-2xl mb-4 font-sans font-medium text-theme-primary opacity-100">{steps[step].title}</h1>
        <p className="text-theme-text mb-10 leading-relaxed text-base opacity-60">
          {steps[step].content}
        </p>

        {step === 0 && (
          <div className="space-y-6 mb-10">
            <input 
              type="text" 
              placeholder="What should we call you?" 
              className="w-full px-6 py-4 rounded-2xl border-none focus:outline-none bg-theme-bg/50 text-theme-text placeholder:text-theme-text/40 transition-all duration-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-4 py-3 rounded-2xl border-none text-sm flex items-center gap-2 transition-all duration-700 ${
                    language === lang.code 
                      ? 'bg-theme-primary text-white opacity-100' 
                      : 'bg-theme-bg/30 text-theme-text opacity-60 hover:opacity-100'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={handleNext}
          disabled={step === 0 && !name}
          className="btn-neon w-full flex items-center justify-center gap-2 disabled:opacity-20"
        >
          <span className="opacity-100">{step === steps.length - 1 ? t('getStarted', language) : t('continue', language)}</span>
          <ChevronRight className="w-4 h-4 opacity-100" />
        </button>
      </motion.div>
    </div>
  );
};

const MoodCheckIn = ({ onSave, language }: { onSave: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void, language: string }) => {
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [note, setNote] = useState('');

  const emojis = ['😔', '😕', '😐', '🙂', '😊'];

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="glass-tile p-10 mb-8"
    >
      <motion.h2 variants={itemVariants} className="text-xl mb-10 flex items-center gap-4 font-medium text-theme-primary opacity-100">
        <Logo className="w-8 h-8" /> {t('moodCheckin', language)}
      </motion.h2>
      
      <div className="space-y-12">
        <motion.div variants={itemVariants}>
          <label className="block text-[10px] font-medium text-theme-text mb-8 uppercase tracking-[0.3em] opacity-60">How are you feeling?</label>
          <div className="flex justify-between items-center px-4">
            {emojis.map((emoji, i) => (
              <motion.button 
                key={i}
                whileHover={{ scale: 1.2, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMood(i + 1)}
                className={`text-5xl transition-all duration-700 ${mood === i + 1 ? 'grayscale-0 drop-shadow-[0_0_20px_rgba(47,127,115,0.2)] opacity-100' : 'grayscale opacity-20 hover:opacity-60'}`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <label className="block text-[10px] font-medium text-theme-text mb-6 uppercase tracking-widest flex items-center gap-2 opacity-60">
              <Zap className="w-4 h-4 text-theme-primary" /> Stress Level ({stress})
            </label>
            <input 
              type="range" min="1" max="5" value={stress} 
              onChange={(e) => setStress(parseInt(e.target.value))}
              className="w-full h-1 bg-theme-bg rounded-lg appearance-none cursor-pointer accent-theme-primary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-theme-text mb-6 uppercase tracking-widest flex items-center gap-2 opacity-60">
              <Moon className="w-4 h-4 text-theme-primary" /> Sleep (Hours: {sleep})
            </label>
            <input 
              type="range" min="1" max="12" value={sleep} 
              onChange={(e) => setSleep(parseInt(e.target.value))}
              className="w-full h-1 bg-theme-bg rounded-lg appearance-none cursor-pointer accent-theme-primary"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-[10px] font-medium text-theme-text mb-4 uppercase tracking-widest opacity-60">Daily Note</label>
          <textarea 
            className="w-full p-6 rounded-[32px] border-none bg-theme-bg/50 focus:outline-none transition-all duration-700 text-theme-text placeholder:text-theme-text/30"
            placeholder="What's on your mind today?"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </motion.div>

        <motion.button 
          variants={itemVariants}
          onClick={() => onSave({ mood, stress, sleep, energy, note })}
          className="btn-neon w-full py-5 text-base opacity-100"
        >
          {t('saveCheckin', language)}
        </motion.button>
      </div>
    </motion.div>
  );
};

const ChatInterface = ({ userProfile }: { userProfile: UserProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [riskAlert, setRiskAlert] = useState<boolean>(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // AI Analysis
    const analysis = await analyzeSentimentAndRisk(input, userProfile.language);
    
    if (analysis.crisisDetected) {
      setRiskAlert(true);
    }

    // Mock AI response for demo purposes (in real app, use Gemini chat)
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: analysis.summary || `I hear you. It sounds like you're feeling ${analysis.sentiment || 'a bit overwhelmed'}. How can I best support you right now?`,
        timestamp: Date.now(),
        sentiment: analysis.sentiment,
        riskFlag: analysis.riskLevel !== RiskLevel.LOW
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="glass-tile flex flex-col h-[600px] overflow-hidden text-theme-text">
      <div className="p-6 bg-theme-secondary/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="text-theme-primary w-5 h-5" />
          <span className="font-medium text-theme-primary opacity-100">{t('supportChat', userProfile.language)}</span>
        </div>
        {riskAlert && (
          <div className="bg-rose-500/20 text-rose-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
            {t('crisisAlert', userProfile.language)}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-theme-text/40 mt-16">
            <Brain className="w-12 h-12 mx-auto mb-6 opacity-10" />
            <p className="text-sm font-light leading-relaxed">{t('chatIntro', userProfile.language).replace('{name}', userProfile.name)}</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[28px] ${
              msg.role === 'user' 
                ? 'bg-theme-primary text-white font-medium rounded-tr-none shadow-[0_10px_30px_rgba(47,127,115,0.15)]' 
                : 'bg-white/70 text-theme-text rounded-tl-none border border-theme-primary/5'
            }`}>
              <p className="text-sm leading-relaxed opacity-100">{msg.text}</p>
              <span className="text-[10px] opacity-40 mt-3 block font-mono">
                {format(msg.timestamp, 'HH:mm')}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-theme-secondary/10 p-5 rounded-[28px] rounded-tl-none">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-theme-primary/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-theme-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-theme-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-theme-secondary/10">
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder={t('chatPlaceholder', userProfile.language)}
            className="flex-1 bg-white/50 text-theme-text px-6 py-3 rounded-full focus:outline-none transition-all duration-700 placeholder:text-theme-text/30 border border-theme-primary/5"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="w-12 h-12 bg-theme-primary text-white rounded-full flex items-center justify-center transition-all duration-700 hover:shadow-[0_0_20px_rgba(47,127,115,0.3)] active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AIPeek = ({ userProfile, message, onTriggerBreath }: { userProfile: UserProfile, message: string | null, onTriggerBreath: () => void }) => {
  if (!message) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-theme-primary px-8 py-4 flex items-center justify-between group cursor-pointer hover:bg-opacity-90 transition-all duration-700 shadow-[0_5px_20px_rgba(47,127,115,0.2)]"
      onClick={onTriggerBreath}
    >
      <div className="flex items-center gap-4">
        <Sparkles className="w-4 h-4 text-white animate-pulse" />
        <p className="text-sm font-medium text-white italic opacity-100">
          {message}
        </p>
      </div>
      <div className="flex items-center gap-3 text-[10px] font-bold text-white uppercase tracking-[0.3em] opacity-80">
        <span>Deepen Focus</span>
        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-700" />
      </div>
    </motion.div>
  );
};

const Dashboard = ({ moodHistory, language }: { moodHistory: MoodEntry[], language: string }) => {
  const data = moodHistory.map(m => ({
    date: format(m.timestamp, 'MMM dd'),
    mood: m.mood,
    stress: m.stress,
    sleep: m.sleep
  })).slice(-7);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="glass-tile p-10 flex items-center gap-8 group">
          <div className="p-5 bg-theme-bg/50 rounded-[32px] group-hover:scale-110 transition-transform duration-700">
            <Smile className="text-theme-primary w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] text-theme-text uppercase font-medium tracking-[0.3em] mb-2 opacity-60">{t('avgMood', language)}</p>
            <p className="text-3xl font-mono text-theme-primary opacity-100">
              {moodHistory.length > 0 
                ? (moodHistory.reduce((acc, curr) => acc + curr.mood, 0) / moodHistory.length).toFixed(1)
                : 'N/A'}
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-tile p-10 flex items-center gap-8 group">
          <div className="p-5 bg-theme-bg/50 rounded-[32px] group-hover:scale-110 transition-transform duration-700">
            <Zap className="text-theme-primary w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] text-theme-text uppercase font-medium tracking-[0.3em] mb-2 opacity-60">{t('avgStress', language)}</p>
            <p className="text-3xl font-mono text-theme-primary opacity-100">
              {moodHistory.length > 0 
                ? (moodHistory.reduce((acc, curr) => acc + curr.stress, 0) / moodHistory.length).toFixed(1)
                : 'N/A'}
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-tile p-10 flex items-center gap-8 group">
          <div className="p-5 bg-theme-bg/50 rounded-[32px] group-hover:scale-110 transition-transform duration-700">
            <Moon className="text-theme-primary w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] text-theme-text uppercase font-medium tracking-[0.3em] mb-2 opacity-60">{t('avgSleep', language)}</p>
            <p className="text-3xl font-mono text-theme-primary opacity-100">
              {moodHistory.length > 0 
                ? (moodHistory.reduce((acc, curr) => acc + curr.sleep, 0) / moodHistory.length).toFixed(1)
                : 'N/A'}h
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="glass-tile p-10">
        <h3 className="text-xl mb-10 font-medium text-theme-primary opacity-100">{t('moodTrends', language)}</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2F7F73" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2F7F73" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(45,55,72,0.05)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'rgba(45,55,72,0.4)', fontSize: 10, fontFamily: 'JetBrains Mono'}} />
              <YAxis hide domain={[0, 6]} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: 'none', 
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 20px 50px rgba(47,127,115,0.1)',
                  color: '#2D3748'
                }}
                itemStyle={{ color: '#2F7F73' }}
              />
              <Area type="monotone" dataKey="mood" stroke="#2F7F73" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
              <Area type="monotone" dataKey="stress" stroke="#2D3748" strokeWidth={1} fill="transparent" strokeDasharray="5 5" opacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CrisisModal = ({ onClose, language }: { onClose: () => void, language: string }) => {
  return (
    <div className="fixed inset-0 bg-theme-bg/60 backdrop-blur-xl z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-[48px] p-12 max-w-lg w-full shadow-2xl text-theme-text"
      >
        <div className="flex items-center gap-6 mb-10 text-theme-primary">
          <Logo className="w-14 h-14" />
          <h2 className="text-3xl font-medium tracking-tight opacity-100">{t('notAlone', language)}</h2>
        </div>
        <p className="text-theme-text mb-10 leading-relaxed opacity-60">
          {t('crisisText', language)}
        </p>
        
        <div className="space-y-4 mb-10">
          <div className="p-6 bg-theme-bg/40 rounded-[32px] flex items-center justify-between">
            <div>
              <p className="font-medium text-theme-primary opacity-100">National Suicide Prevention Lifeline</p>
              <p className="text-xs text-theme-text opacity-40 mt-1">Call or text 988 (USA)</p>
            </div>
            <a href="tel:988" className="w-12 h-12 bg-theme-primary text-white rounded-full flex items-center justify-center transition-all duration-700 hover:shadow-[0_0_20px_rgba(47,127,115,0.3)]">
              <Phone className="w-5 h-5" />
            </a>
          </div>
          <div className="p-6 bg-theme-bg/40 rounded-[32px] flex items-center justify-between">
            <div>
              <p className="font-medium text-theme-primary opacity-100">Crisis Text Line</p>
              <p className="text-xs text-theme-text opacity-40 mt-1">Text HOME to 741741</p>
            </div>
            <a href="sms:741741" className="w-12 h-12 bg-theme-primary text-white rounded-full flex items-center justify-center transition-all duration-700 hover:shadow-[0_0_20px_rgba(47,127,115,0.3)]">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="btn-neon w-full py-5 text-base opacity-100"
        >
          {t('imSafe', language)}
        </button>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checkin' | 'chat' | 'assessment'>('dashboard');
  const [showCrisis, setShowCrisis] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<{score: number, risk: RiskLevel} | null>(null);
  const [currentIntervention, setCurrentIntervention] = useState<MicroIntervention | null>(null);
  const [breathCoachCompleted, setBreathCoachCompleted] = useState(false);
  const [userIntent, setUserIntent] = useState<UserIntent | null>(null);
  const [aiPeekMessage, setAiPeekMessage] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', userProfile ? 'peaceful' : 'funky');
  }, [userProfile]);

  const handleAssessmentComplete = (score: number, risk: RiskLevel) => {
    setAssessmentResult({ score, risk });
    setActiveTab('dashboard');
    if (risk === RiskLevel.HIGH || risk === RiskLevel.CRITICAL) {
      setShowCrisis(true);
    }
  };

  useEffect(() => {
    const savedMoods = localStorage.getItem('safespace_moods') || localStorage.getItem('serene_moods');
    if (savedMoods) setMoodHistory(JSON.parse(savedMoods));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (moodHistory.length > 0) localStorage.setItem('safespace_moods', JSON.stringify(moodHistory));
    
    // Update AI Peek message
    if (userProfile && moodHistory.length > 0) {
      getAIPeekMessage(userProfile.name, moodHistory, userProfile.language, userIntent || undefined)
        .then(setAiPeekMessage);
    }
  }, [moodHistory, userProfile, userIntent]);

  const handleOnboarding = (profile: UserProfile) => {
    setUserProfile(profile);
    generateMicroIntervention(RiskLevel.LOW, 'neutral', profile.language, userIntent || undefined).then(setCurrentIntervention);
  };

  const handleMoodSave = (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setMoodHistory(prev => [...prev, newEntry]);
    setActiveTab('dashboard');
    
    // Get AI suggestions based on mood
    const risk = entry.mood <= 2 ? RiskLevel.MODERATE : RiskLevel.LOW;
    getSupportSuggestions(risk, entry.mood <= 2 ? 'sad' : 'neutral', userProfile?.language, userIntent || undefined).then(setSuggestions);
    generateMicroIntervention(risk, entry.mood <= 2 ? 'sad' : 'neutral', userProfile?.language, userIntent || undefined).then(setCurrentIntervention);
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to delete all your data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!userProfile) {
    return <Onboarding onComplete={handleOnboarding} />;
  }

  if (!breathCoachCompleted) {
    return (
      <BreathCoach 
        language={userProfile.language} 
        onComplete={() => setBreathCoachCompleted(true)} 
      />
    );
  }

  if (!userIntent) {
    const intents = [
      { 
        id: UserIntent.GROUNDED, 
        title: t('groundedTitle', userProfile.language), 
        desc: t('groundedDesc', userProfile.language),
        icon: <ShieldCheck className="w-6 h-6 text-theme-primary" />,
        color: "hover:bg-theme-primary/10"
      },
      { 
        id: UserIntent.PRODUCTIVE, 
        title: t('productiveTitle', userProfile.language), 
        desc: t('productiveDesc', userProfile.language),
        icon: <Zap className="w-6 h-6 text-theme-primary" />,
        color: "hover:bg-theme-primary/10"
      },
      { 
        id: UserIntent.RELEASED, 
        title: t('releasedTitle', userProfile.language), 
        desc: t('releasedDesc', userProfile.language),
        icon: <Sparkles className="w-6 h-6 text-theme-primary" />,
        color: "hover:bg-theme-primary/10"
      }
    ];

    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-theme-bg">
        {/* Animated Background Elements */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-theme-primary/5 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-theme-secondary/20 rounded-full blur-[150px]"
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl w-full text-center relative z-10"
        >
          <div className="mb-20">
            <Logo className="w-24 h-24 mx-auto mb-10" />
            <h2 className="text-4xl md:text-6xl font-medium text-theme-primary mb-8 tracking-tight opacity-100">{t('intentTitle', userProfile.language)}</h2>
            <p className="text-theme-text text-xl font-light max-w-xl mx-auto opacity-60">{t('intentSubtitle', userProfile.language)}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {intents.map((intent) => (
              <motion.button
                key={intent.id}
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setUserIntent(intent.id);
                  const risk = moodHistory.length > 0 ? (moodHistory[moodHistory.length-1].mood <= 2 ? RiskLevel.MODERATE : RiskLevel.LOW) : RiskLevel.LOW;
                  generateMicroIntervention(risk, 'neutral', userProfile.language, intent.id).then(setCurrentIntervention);
                  getSupportSuggestions(risk, 'neutral', userProfile.language, intent.id).then(setSuggestions);
                }}
                className={`glass-tile p-10 w-full md:w-72 text-center group ${intent.color}`}
              >
                <div className="mb-8 flex justify-center">
                  <div className="p-5 bg-theme-bg/50 rounded-[32px] group-hover:scale-110 transition-transform duration-700">
                    {intent.icon}
                  </div>
                </div>
                <h3 className="text-xl font-medium text-theme-primary mb-3 opacity-100">{intent.title}</h3>
                <p className="text-sm text-theme-text leading-relaxed opacity-60">{intent.desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex text-theme-text bg-theme-bg">
      {/* Left Sidebar Navigation */}
      <nav className="w-20 md:w-72 glass-sidebar flex flex-col h-screen sticky top-0 z-40">
        <div className="p-8 flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <Logo className="w-10 h-10" />
            <h1 className="text-xl font-medium hidden md:block text-theme-primary tracking-tight opacity-100">SafeSpace</h1>
          </div>
          <p className="text-[10px] text-theme-text font-medium uppercase tracking-[0.3em] hidden md:block opacity-40">Your daily space for peace</p>
        </div>

        <div className="flex-1 py-10 px-4 space-y-4 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full p-5 rounded-[32px] transition-all duration-700 flex flex-col md:flex-row items-center gap-5 ${activeTab === 'dashboard' ? 'bg-theme-primary text-white opacity-100 shadow-[0_10px_30px_rgba(47,127,115,0.2)]' : 'text-theme-text opacity-40 hover:opacity-100 hover:bg-theme-secondary/20'}`}
          >
            <LineChart className="w-6 h-6" />
            <span className="text-[10px] md:text-sm font-medium uppercase tracking-widest md:normal-case md:font-medium">{t('trends', userProfile.language)}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('checkin')}
            className={`w-full p-5 rounded-[32px] transition-all duration-700 flex flex-col md:flex-row items-center gap-5 ${activeTab === 'checkin' ? 'bg-theme-primary text-white opacity-100 shadow-[0_10px_30px_rgba(47,127,115,0.2)]' : 'text-theme-text opacity-40 hover:opacity-100 hover:bg-theme-secondary/20'}`}
          >
            <Smile className="w-6 h-6" />
            <span className="text-[10px] md:text-sm font-medium uppercase tracking-widest md:normal-case md:font-medium">Check-in</span>
          </button>

          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full p-5 rounded-[32px] transition-all duration-700 flex flex-col md:flex-row items-center gap-5 ${activeTab === 'chat' ? 'bg-theme-primary text-white opacity-100 shadow-[0_10px_30px_rgba(47,127,115,0.2)]' : 'text-theme-text opacity-40 hover:opacity-100 hover:bg-theme-secondary/20'}`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-[10px] md:text-sm font-medium uppercase tracking-widest md:normal-case md:font-medium">{t('support', userProfile.language)}</span>
          </button>

          <button 
            onClick={() => setActiveTab('assessment')}
            className={`w-full p-5 rounded-[32px] transition-all duration-700 flex flex-col md:flex-row items-center gap-5 ${activeTab === 'assessment' ? 'bg-theme-primary text-white opacity-100 shadow-[0_10px_30px_rgba(47,127,115,0.2)]' : 'text-theme-text opacity-40 hover:opacity-100 hover:bg-theme-secondary/20'}`}
          >
            <Brain className="w-6 h-6" />
            <span className="text-[10px] md:text-sm font-medium uppercase tracking-widest md:normal-case md:font-medium">{t('selfTest', userProfile.language)}</span>
          </button>

          <div className="pt-10 mt-10 space-y-4">
            <button 
              onClick={() => setShowCrisis(true)}
              className="w-full p-5 rounded-[32px] text-rose-600 opacity-60 hover:opacity-100 hover:bg-rose-500/10 transition-all duration-700 flex flex-col md:flex-row items-center gap-5"
            >
              <AlertCircle className="w-6 h-6" />
              <span className="text-[10px] md:text-sm font-medium uppercase tracking-widest md:normal-case md:font-medium">{t('crisisSupport', userProfile.language)}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <button 
            onClick={() => {
              setUserProfile(null);
              setBreathCoachCompleted(false);
              setUserIntent(null);
            }}
            className="w-full p-4 rounded-[24px] text-theme-text opacity-40 hover:opacity-100 hover:bg-theme-secondary/20 transition-all duration-700 flex items-center justify-center md:justify-start gap-4"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium hidden md:block">{t('signOut', userProfile.language)}</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Insight Bar */}
        <AIPeek 
          userProfile={userProfile} 
          message={aiPeekMessage} 
          onTriggerBreath={() => setBreathCoachCompleted(false)} 
        />

        <header className="p-8 flex justify-end items-center sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <select 
              value={userProfile.language}
              onChange={(e) => setUserProfile({ ...userProfile, language: e.target.value })}
              className="bg-white/40 text-theme-primary rounded-full px-6 py-2.5 text-sm focus:outline-none transition-all duration-700 hover:bg-white/60 border border-theme-primary/5"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-white">{l.flag} {l.name}</option>
              ))}
            </select>
            <div className="w-12 h-12 bg-white/40 border border-theme-primary/5 rounded-full flex items-center justify-center text-theme-primary opacity-60">
              <User className="w-6 h-6" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 md:p-16 max-w-6xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-20"
          >
            <h2 className="text-5xl md:text-8xl font-medium mb-6 text-theme-primary tracking-tighter opacity-100">
              {t('hello', userProfile.language)}, {userProfile.name}
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-theme-primary animate-pulse" />
              <p className="text-xl text-theme-text font-light opacity-60">{t('takeMoment', userProfile.language)}</p>
            </div>
          </motion.div>

          <div className="space-y-12">
            {/* Active Feature Section */}
            <section>
              {activeTab === 'dashboard' && (
                <div className="space-y-12">
                  <Dashboard moodHistory={moodHistory} language={userProfile.language} />
                  
                  {/* Secondary Features (Stacked Below Dashboard) */}
                  <motion.div 
                    initial="hidden"
                    animate="show"
                    variants={containerVariants}
                    className="flex flex-col gap-12"
                  >
                    {/* Gamified Intervention */}
                    {currentIntervention && (
                      <motion.div variants={itemVariants}>
                        <h3 className="text-xs font-bold text-theme-text/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-theme-primary" />
                          AI Intervention
                        </h3>
                        <div className="glass-tile p-1">
                          <MicroInterventionCard 
                            intervention={currentIntervention}
                            language={userProfile.language}
                            onComplete={() => setCurrentIntervention(null)}
                            onRefresh={() => {
                              const risk = moodHistory.length > 0 ? (moodHistory[moodHistory.length-1].mood <= 2 ? RiskLevel.MODERATE : RiskLevel.LOW) : RiskLevel.LOW;
                              generateMicroIntervention(risk, 'neutral', userProfile.language, userIntent || undefined).then(setCurrentIntervention);
                            }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Suggestions Card */}
                    <motion.div variants={itemVariants} className="glass-tile p-10 bg-white text-theme-text shadow-2xl relative overflow-hidden group border-theme-primary/5">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-theme-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-theme-primary/10 transition-all duration-700" />
                      <h3 className="text-3xl mb-8 font-bold flex items-center gap-3 text-theme-primary">
                        <Zap className="w-8 h-8 text-theme-primary" />
                        {t('todayFocus', userProfile.language)}
                      </h3>
                      <div className="space-y-8 relative z-10">
                        {suggestions.length > 0 ? suggestions.map((s, i) => (
                          <div key={i} className="flex gap-6 items-start">
                            <div className="w-10 h-10 bg-theme-bg/50 backdrop-blur-md rounded-2xl flex-shrink-0 flex items-center justify-center text-lg font-mono border border-theme-primary/10 text-theme-primary">
                              {i + 1}
                            </div>
                            <p className="text-lg text-theme-text/80 leading-relaxed font-light">{s}</p>
                          </div>
                        )) : (
                          <p className="text-lg text-theme-text/40 italic font-light">Complete a check-in to get personalized suggestions.</p>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Privacy & Settings (Only on Dashboard) */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-tile p-10 border-l-8 border-theme-primary bg-white shadow-2xl"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div>
                        <h3 className="text-2xl mb-3 font-bold text-theme-primary">{t('privacy', userProfile.language)}</h3>
                        <p className="text-base text-theme-text/40 max-w-md font-light">
                          {t('privacyNote', userProfile.language)}
                        </p>
                      </div>
                      <button 
                        onClick={handleClearData}
                        className="flex items-center justify-center gap-3 text-sm font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 backdrop-blur-sm px-8 py-4 rounded-3xl transition-all shadow-sm hover:shadow-md border border-rose-500/20"
                      >
                        <Trash2 className="w-5 h-5" /> {t('deleteData', userProfile.language)}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
              
              {activeTab === 'checkin' && <MoodCheckIn onSave={handleMoodSave} language={userProfile.language} />}
              {activeTab === 'chat' && <ChatInterface userProfile={userProfile} />}
              {activeTab === 'assessment' && (
                <div className="glass-tile p-10">
                  <Assessment onComplete={handleAssessmentComplete} language={userProfile.language} />
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Crisis Modal */}
      <AnimatePresence>
        {showCrisis && <CrisisModal onClose={() => setShowCrisis(false)} language={userProfile.language} />}
      </AnimatePresence>
    </div>
  );
}
