import { GoogleGenAI } from "@google/genai";
import { RiskLevel, MicroIntervention, MoodEntry, UserIntent } from "../types";

const apiKey = process.env.GEMINI_API_KEY;

export const analyzeSentimentAndRisk = async (text: string, language: string = 'en') => {
  if (!apiKey) return { sentiment: "neutral", risk: RiskLevel.LOW, confidence: 0 };

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following text for mental health risk and sentiment. 
    The text is in ${language}. Please provide the summary in ${language}.
    Text: "${text}"
    
    Return a JSON object with:
    - sentiment: string (positive, negative, neutral, anxious, depressed, etc.)
    - riskLevel: "Low", "Moderate", "High", or "Critical"
    - confidence: number (0-1)
    - crisisDetected: boolean (true if self-harm or immediate danger is mentioned)
    - summary: a brief summary of the emotional state`,
    config: {
      responseMimeType: "application/json",
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return { sentiment: "neutral", risk: RiskLevel.LOW, confidence: 0 };
  }
};

export const getSupportSuggestions = async (riskLevel: RiskLevel, sentiment: string, language: string = 'en', intent?: UserIntent) => {
  if (!apiKey) return ["Take a deep breath", "Go for a walk"];

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user is currently at a ${riskLevel} risk level with a ${sentiment} sentiment. 
    Their current intent is: ${intent || 'General support'}.
    Provide 3-4 personalized, empathetic, and actionable support suggestions (e.g., breathing exercises, journaling prompts, self-care activities).
    If intent is GROUNDED: Prioritize stability, calm, and sensory grounding.
    If intent is PRODUCTIVE: Prioritize clarity, focus, and small actionable steps.
    If intent is RELEASED: Prioritize emotional release, venting, and expressive activities.
    Please provide the suggestions in ${language}.
    Format as a JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return ["Take a deep breath", "Go for a walk", "Listen to calming music"];
  }
};

export const generateMicroIntervention = async (riskLevel: RiskLevel, sentiment: string, language: string = 'en', intent?: UserIntent): Promise<MicroIntervention> => {
  if (!apiKey) {
    return {
      id: "default",
      type: "breathing",
      title: "Calm Breath",
      description: "A simple breathing exercise to center yourself.",
      content: { duration: 30 }
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user is at a ${riskLevel} risk level with a ${sentiment} sentiment. 
    Their current intent is: ${intent || 'General support'}.
    Generate a 30-second "Micro-Intervention" task to help them.
    
    Behavior Rules based on Intent:
    - If intent is GROUNDED: Prioritize 'breathing' or sensory 'gratitude' tasks.
    - If intent is PRODUCTIVE: Prioritize 'reframing' or focus-based 'journaling'.
    - If intent is RELEASED: Prioritize 'gratitude' (Joy Game) or high-emotion venting 'journaling' prompts.
    
    Choose one type from: 'reframing', 'journaling', 'breathing', or 'gratitude'.
    
    Please provide all text in ${language}.
    
    Return a JSON object:
    {
      "id": "unique_id",
      "type": "reframing" | "journaling" | "gratitude" | "breathing",
      "title": "Short catchy title",
      "description": "Brief instruction",
      "content": {
        "negativeThought": "...", // if reframing
        "positiveReframe": "...", // if reframing
        "prompt": "...", // if journaling
        "category": "...", // if gratitude
        "duration": 30 // if breathing
      }
    }`,
    config: {
      responseMimeType: "application/json",
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      id: "fallback",
      type: "journaling",
      title: "Quick Reflection",
      description: "Write down one thing you're proud of today.",
      content: { prompt: "What is one small win you had today?" }
    };
  }
};

export const getAIPeekMessage = async (userName: string, moodHistory: MoodEntry[], language: string = 'en', intent?: UserIntent): Promise<string> => {
  if (!apiKey) {
    const lastMood = moodHistory[moodHistory.length - 1];
    const isStressed = lastMood && (lastMood.stress >= 4 || lastMood.mood <= 2);
    return isStressed 
      ? `You've been feeling a bit stressed lately, ${userName}. Want to try a 2-minute breathing exercise?`
      : `Taking a small break can work wonders, ${userName}. Ready for a quick breathing session?`;
  }

  const ai = new GoogleGenAI({ apiKey });
  const recentMoods = moodHistory.slice(-3).map(m => ({ mood: m.mood, stress: m.stress, sleep: m.sleep }));
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user ${userName} has the following recent mood data (last 3 entries): ${JSON.stringify(recentMoods)}.
    Their current intent is: ${intent || 'General support'}.
    Generate a very short (max 20 words), empathetic, and proactive "peek" message for their dashboard.
    
    Behavior Rules based on Intent:
    - If intent is GROUNDED: Focus on stability, calm, and staying present.
    - If intent is PRODUCTIVE: Focus on clarity, momentum, and focus.
    - If intent is RELEASED: Focus on emotional validation, expression, and letting go.
    
    The message should be in ${language}.
    Return ONLY the text of the message, no quotes or JSON.`,
  });

  return response.text?.trim() || "Ready for a quick breathing session?";
};
