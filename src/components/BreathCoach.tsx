import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Sparkles, CheckCircle2 } from 'lucide-react';
import { t } from '../translations';

interface Props {
  onComplete: () => void;
  language: string;
}

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export const BreathCoach = ({ onComplete, language }: Props) => {
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [seconds, setSeconds] = useState(4);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold1');
            return 4;
          } else if (phase === 'hold1') {
            setPhase('exhale');
            return 4;
          } else if (phase === 'hold2') {
            if (round >= 3) {
              setIsFinished(true);
              clearInterval(timer);
              return 0;
            } else {
              setRound(r => r + 1);
              setPhase('inhale');
              return 4;
            }
          } else { // exhale
            setPhase('hold2');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, round, isFinished]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return t('inhale', language) || 'Inhale';
      case 'hold1': return t('hold', language) || 'Hold';
      case 'exhale': return t('exhale', language) || 'Exhale';
      case 'hold2': return t('hold', language) || 'Hold';
    }
  };

  const getCoachMessage = () => {
    if (isFinished) return t('coachFinished', language) || "You've done a wonderful job. You're ready to start your day.";
    
    switch (phase) {
      case 'inhale': return t('coachInhale', language) || "Slowly breathe in, filling your lungs with calm.";
      case 'hold1': return t('coachHold1', language) || "Gently hold that breath. Feel the stillness within.";
      case 'exhale': return t('coachExhale', language) || "Release the air slowly, letting go of any tension.";
      case 'hold2': return t('coachHold2', language) || "Rest in this quiet moment before the next breath.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-theme-bg">
      {/* Background Glows */}
      <motion.div 
        animate={{ 
          scale: phase === 'inhale' ? 1.5 : 1,
          opacity: phase === 'inhale' ? 0.15 : 0.05
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="absolute w-[600px] h-[600px] bg-theme-primary rounded-full blur-[120px] -z-10"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full glass-tile p-12 text-center relative overflow-hidden text-theme-text"
      >
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div 
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-medium text-theme-text uppercase tracking-[0.3em] opacity-60">Breath-Coach</span>
                <span className="text-[10px] font-medium text-theme-text uppercase tracking-[0.3em] opacity-60">Round {round}/3</span>
              </div>

              <div className="relative flex justify-center items-center py-12">
                <motion.div 
                  animate={{ 
                    scale: phase === 'inhale' ? 2 : (phase === 'exhale' ? 1 : 2),
                    opacity: phase === 'inhale' ? 0.2 : (phase === 'exhale' ? 0.05 : 0.2)
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="w-40 h-40 bg-theme-primary/20 rounded-full absolute blur-2xl"
                />
                <div className="w-24 h-24 bg-theme-primary rounded-full flex items-center justify-center text-white z-10 shadow-[0_0_30px_rgba(47,127,115,0.3)]">
                  <Wind className="w-10 h-10" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-medium text-theme-primary uppercase tracking-tighter opacity-100">{getPhaseText()}</h2>
                <p className="text-5xl font-mono text-theme-primary opacity-100">{seconds}s</p>
              </div>

              <p className="text-theme-text italic min-h-[4rem] font-light leading-relaxed opacity-60">
                {getCoachMessage()}
              </p>

              <button 
                onClick={onComplete}
                className="mt-10 text-theme-text/40 text-[10px] font-medium uppercase tracking-widest hover:text-theme-primary transition-all duration-700 flex items-center justify-center gap-2 mx-auto"
              >
                {t('skip', language) || "Skip"}
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-10 py-8"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-theme-bg text-theme-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(47,127,115,0.2)]">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              </div>
              <h2 className="text-3xl font-medium text-theme-primary opacity-100">{t('greatJob', language)}</h2>
              <p className="text-theme-text italic font-light opacity-60 leading-relaxed">
                {getCoachMessage()}
              </p>
              <button 
                onClick={onComplete}
                className="btn-neon w-full py-5 text-base opacity-100"
              >
                {t('enterDashboard', language) || "Enter Dashboard"}
                <Sparkles className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
