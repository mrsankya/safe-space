import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  RefreshCw,
  PenLine,
  Heart,
  Wind
} from 'lucide-react';
import { MicroIntervention } from '../types';
import { t } from '../translations';

interface Props {
  intervention: MicroIntervention;
  onComplete: () => void;
  onRefresh: () => void;
  language: string;
}

export const MicroInterventionCard = ({ intervention, onComplete, onRefresh, language }: Props) => {
  const [step, setStep] = useState<'intro' | 'active' | 'complete'>('intro');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [joys, setJoys] = useState<string[]>([]);
  const [currentJoy, setCurrentJoy] = useState('');

  useEffect(() => {
    let timer: any;
    if (step === 'active' && intervention.type === 'breathing') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStep('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, intervention.type]);

  const handleComplete = () => {
    setStep('complete');
    onComplete();
  };

  const handleAddJoy = () => {
    if (currentJoy.trim() && joys.length < 3) {
      setJoys([...joys, currentJoy.trim()]);
      setCurrentJoy('');
    }
  };

  const renderContent = () => {
    switch (intervention.type) {
      case 'reframing':
        return (
          <div className="space-y-8">
            <div className="p-6 bg-theme-bg/40 rounded-[32px]">
              <p className="text-[10px] text-theme-text font-medium uppercase mb-3 tracking-[0.3em] opacity-40">{t('negativeThought', language)}</p>
              <p className="text-theme-text italic opacity-60">"{intervention.content.negativeThought}"</p>
            </div>
            <div className="p-6 bg-theme-primary rounded-[32px] shadow-[0_10px_30px_rgba(47,127,115,0.2)]">
              <p className="text-[10px] text-white font-medium uppercase mb-3 tracking-[0.3em] opacity-40">{t('positiveReframe', language)}</p>
              <p className="text-white font-medium opacity-100">{intervention.content.positiveReframe}</p>
            </div>
            <p className="text-[10px] text-theme-text text-center uppercase tracking-widest opacity-40">{t('repeat3Times', language)}</p>
          </div>
        );
      case 'journaling':
        return (
          <div className="space-y-6">
            <p className="text-xl font-medium text-center text-theme-primary opacity-100">"{intervention.content.prompt}"</p>
            <textarea 
              className="w-full p-6 rounded-[32px] border-none bg-theme-bg/50 focus:outline-none transition-all duration-700 text-theme-text placeholder:text-theme-text/30"
              placeholder={t('writeThoughts', language)}
              rows={3}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </div>
        );
      case 'gratitude':
        return (
          <div className="space-y-8 text-center">
            <p className="text-lg font-light text-theme-text opacity-60">
              {t('find3Things', language)} <span className="font-medium text-theme-primary opacity-100 underline decoration-theme-primary/30 decoration-2 underline-offset-8">{intervention.content.category}</span>
            </p>
            
            <div className="relative h-64 bg-theme-bg/20 rounded-[48px] overflow-hidden flex items-center justify-center">
              <AnimatePresence>
                {joys.map((joy, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, y: 100, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      y: [0, -20, 0],
                      opacity: 1,
                      x: (idx - (joys.length - 1) / 2) * 100
                    }}
                    transition={{ 
                      y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: idx * 0.8 },
                      scale: { type: "spring", stiffness: 50, damping: 20 }
                    }}
                    className="absolute p-5 bg-theme-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold w-24 h-24 text-center shadow-[0_10px_30px_rgba(47,127,115,0.2)]"
                  >
                    <span className="line-clamp-3 leading-tight">{joy}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {joys.length === 0 && (
                <div className="flex flex-col items-center gap-4">
                  <Heart className="w-10 h-10 text-theme-primary/10 animate-pulse" />
                  <p className="text-theme-text text-xs italic max-w-[200px] opacity-40">{t('joyGameIntro', language)}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <input 
                type="text"
                value={currentJoy}
                onChange={(e) => setCurrentJoy(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddJoy()}
                placeholder={t('joyPlaceholder', language)}
                disabled={joys.length >= 3}
                className="flex-1 p-5 rounded-[28px] border-none bg-theme-bg/50 focus:outline-none disabled:opacity-20 text-sm text-theme-text placeholder:text-theme-text/30"
              />
              <button 
                onClick={handleAddJoy}
                disabled={!currentJoy.trim() || joys.length >= 3}
                className="w-14 h-14 bg-theme-primary text-white rounded-[28px] flex items-center justify-center disabled:opacity-20 hover:shadow-[0_0_20px_rgba(47,127,115,0.3)] transition-all duration-700 active:scale-90"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex justify-center gap-3">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-700 ${joys.length >= i ? 'bg-theme-primary w-8' : 'bg-theme-text/10 w-4'}`} 
                />
              ))}
            </div>
          </div>
        );
      case 'breathing':
        return (
          <div className="flex flex-col items-center justify-center space-y-10 py-12">
            <motion.div 
              animate={{ scale: [1, 1.6, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 bg-theme-primary/10 rounded-full flex items-center justify-center blur-md"
            >
              <div className="w-16 h-16 bg-theme-primary rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(47,127,115,0.3)]">
                <Wind className="w-8 h-8" />
              </div>
            </motion.div>
            <div className="text-center">
              <p className="text-2xl font-medium text-theme-primary mb-3 opacity-100">{t('inhaleExhale', language)}</p>
              <p className="text-5xl font-mono text-theme-primary opacity-100">{timeLeft}s</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      layout
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="glass-tile p-8 text-theme-text"
    >
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-theme-primary text-white rounded-[24px] shadow-[0_10px_30px_rgba(47,127,115,0.2)]">
                {intervention.type === 'reframing' && <Brain className="w-6 h-6" />}
                {intervention.type === 'journaling' && <PenLine className="w-6 h-6" />}
                {intervention.type === 'gratitude' && <Heart className="w-6 h-6" />}
                {intervention.type === 'breathing' && <Wind className="w-6 h-6" />}
              </div>
            </div>
            <h3 className="text-xl font-medium text-theme-primary mb-3 opacity-100">{intervention.title}</h3>
            <p className="text-theme-text text-sm mb-8 opacity-60 leading-relaxed">{intervention.description}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep('active')}
                className="btn-neon flex-1 flex items-center justify-center gap-2 opacity-100"
              >
                {t('startTask', language)} <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={onRefresh}
                className="w-12 h-12 rounded-full bg-theme-bg text-theme-primary opacity-40 hover:opacity-100 transition-all duration-700 flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'active' && (
          <motion.div 
            key="active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-medium text-theme-text uppercase tracking-[0.3em] opacity-40">{intervention.type}</span>
              <Sparkles className="w-4 h-4 text-theme-primary animate-pulse" />
            </div>
            
            {renderContent()}

            {intervention.type !== 'breathing' && (
              <button 
                onClick={handleComplete}
                disabled={intervention.type === 'gratitude' && joys.length < 3}
                className="btn-neon w-full mt-10 disabled:opacity-20 opacity-100"
              >
                {intervention.type === 'gratitude' && joys.length === 3 ? t('releaseJoys', language) : t('imDone', language)}
              </button>
            )}
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center py-8"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-theme-bg text-theme-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(47,127,115,0.2)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>
            <h3 className="text-2xl font-medium text-theme-primary mb-3 opacity-100">{t('greatJob', language)}</h3>
            <p className="text-theme-text mb-10 opacity-60 leading-relaxed">{t('completedIntervention', language)}</p>
            <button 
              onClick={() => {
                setStep('intro');
                setJoys([]);
                setCurrentJoy('');
                onComplete();
              }}
              className="w-full py-5 rounded-[28px] bg-theme-bg text-theme-primary font-medium hover:bg-theme-secondary/20 transition-all duration-700 opacity-100"
            >
              {t('backToDashboard', language)}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
