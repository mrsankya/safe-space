import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { RiskLevel } from '../types';
import { t } from '../translations';

export const Assessment = ({ onComplete, language }: { onComplete: (score: number, risk: RiskLevel) => void, language: string }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const questions = t('questions', language) as string[];
  const options = t('options', language) as string[];

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [currentStep]: value });
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const calculateResult = () => {
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    let risk = RiskLevel.LOW;
    if (totalScore >= 20) risk = RiskLevel.CRITICAL;
    else if (totalScore >= 15) risk = RiskLevel.HIGH;
    else if (totalScore >= 10) risk = RiskLevel.MODERATE;
    
    onComplete(totalScore, risk);
  };

  const isLastStep = currentStep === questions.length - 1;
  const hasAnsweredCurrent = answers[currentStep] !== undefined;

  return (
    <div className="glass-tile p-10 max-w-2xl mx-auto text-theme-text">
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] font-medium text-theme-text uppercase tracking-[0.3em] opacity-60">{t('phq9', language)}</span>
          <span className="text-[10px] font-medium text-theme-text font-mono opacity-40">{currentStep + 1} / {questions.length}</span>
        </div>
        <div className="w-full h-1 bg-theme-bg rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-theme-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-[250px]"
        >
          <h3 className="text-xl font-medium text-theme-primary mb-10 leading-relaxed opacity-100">
            {questions[currentStep]}
          </h3>

          <div className="space-y-4">
            {options.map((label, value) => (
              <button 
                key={value}
                onClick={() => handleAnswer(value)}
                className={`w-full p-5 rounded-[28px] text-left transition-all duration-700 border-none ${
                  answers[currentStep] === value 
                    ? 'bg-theme-primary text-white font-medium opacity-100 shadow-[0_10px_30px_rgba(47,127,115,0.2)]' 
                    : 'bg-theme-bg/30 text-theme-text opacity-60 hover:opacity-100 hover:bg-theme-bg/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex justify-between">
        <button 
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(currentStep - 1)}
          className="flex items-center gap-2 text-theme-text opacity-40 disabled:opacity-10 hover:opacity-100 transition-all duration-700"
        >
          <ChevronLeft className="w-4 h-4" /> {t('previous', language)}
        </button>
        
        {isLastStep && hasAnsweredCurrent && (
          <button 
            onClick={calculateResult}
            className="btn-neon px-8 py-3 text-sm opacity-100"
          >
            {t('completeAssessment', language)} <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
