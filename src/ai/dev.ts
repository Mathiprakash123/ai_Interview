import { config } from 'dotenv';
config();

import '@/ai/flows/transcribe-answer.ts';
import '@/ai/flows/analyze-answer-quality.ts';
import '@/ai/flows/generate-question.ts';
