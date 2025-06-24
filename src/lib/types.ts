import type { AnalyzeAnswerQualityOutput } from "@/ai/flows/analyze-answer-quality";

export type InterviewQuestion = {
  id: string;
  category: 'Behavioral' | 'Technical';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
};

export type InterviewSession = {
  id: string;
  question: InterviewQuestion;
  answer: string;
  feedback: AnalyzeAnswerQualityOutput;
  timestamp: number;
};
