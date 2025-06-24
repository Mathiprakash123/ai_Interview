import type { AnalyzeAnswerQualityOutput } from "@/ai/flows/analyze-answer-quality";

export type InterviewQuestion = {
  id: string;
  category: 'Behavioral' | 'Technical';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
};

// Represents one Q&A exchange
export type InterviewExchange = {
  question: InterviewQuestion;
  answer: string;
  feedback: AnalyzeAnswerQualityOutput;
};

// Represents a full interview session
export type InterviewSession = {
  id:string;
  timestamp: number;
  category: InterviewQuestion['category'];
  difficulty: InterviewQuestion['difficulty'];
  exchanges: InterviewExchange[];
};
