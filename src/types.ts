import { Type } from "@google/genai";

export enum RiskLevel {
  LOW = "Low",
  MODERATE = "Moderate",
  HIGH = "High",
  CRITICAL = "Critical"
}

export interface MoodEntry {
  id: string;
  timestamp: number;
  mood: number; // 1-5
  stress: number; // 1-5
  sleep: number; // hours
  energy: number; // 1-5
  note?: string;
}

export interface AssessmentResult {
  id: string;
  timestamp: number;
  type: 'PHQ-9' | 'GAD-7';
  score: number;
  riskLevel: RiskLevel;
  recommendations: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sentiment?: string;
  riskFlag?: boolean;
}

export enum UserIntent {
  GROUNDED = "GROUNDED",
  PRODUCTIVE = "PRODUCTIVE",
  RELEASED = "RELEASED"
}

export interface UserProfile {
  name: string;
  consented: boolean;
  onboarded: boolean;
  language: string;
}

export type InterventionType = 'reframing' | 'journaling' | 'breathing' | 'gratitude';

export interface MicroIntervention {
  id: string;
  type: InterventionType;
  title: string;
  description: string;
  content: any; // Specific to the type
}
