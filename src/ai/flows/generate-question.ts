'use server';

/**
 * @fileOverview Generates unique interview questions in real-time.
 *
 * - generateQuestion - A function that handles generating a new question.
 * - GenerateQuestionInput - The input type for the generateQuestion function.
 * - GenerateQuestionOutput - The return type for the generateQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuestionInputSchema = z.object({
  category: z.string().describe('The category of the interview question (e.g., Behavioral, Technical).'),
  difficulty: z.string().describe('The difficulty of the question (e.g., Easy, Medium, Hard).'),
  previousQuestions: z.array(z.string()).describe('A list of questions that have already been asked in this session.'),
});
export type GenerateQuestionInput = z.infer<typeof GenerateQuestionInputSchema>;

const GenerateQuestionOutputSchema = z.object({
  question: z.string().describe('A new, unique interview question based on the criteria.'),
});
export type GenerateQuestionOutput = z.infer<typeof GenerateQuestionOutputSchema>;

export async function generateQuestion(input: GenerateQuestionInput): Promise<GenerateQuestionOutput> {
  return generateQuestionFlow(input);
}

const generateQuestionPrompt = ai.definePrompt({
  name: 'generateQuestionPrompt',
  input: {schema: GenerateQuestionInputSchema},
  output: {schema: GenerateQuestionOutputSchema},
  prompt: `You are an expert interviewer. Your task is to generate a single interview question.

  The question should fit the following criteria:
  - Category: {{{category}}}
  - Difficulty: {{{difficulty}}}

  Most importantly, the question you generate MUST NOT be in the following list of previously asked questions:
  {{#if previousQuestions}}
  {{#each previousQuestions}}
  - {{{this}}}
  {{/each}}
  {{else}}
  (No questions asked yet)
  {{/if}}

  Generate one new and unique question.
  `,
});

const generateQuestionFlow = ai.defineFlow(
  {
    name: 'generateQuestionFlow',
    inputSchema: GenerateQuestionInputSchema,
    outputSchema: GenerateQuestionOutputSchema,
  },
  async input => {
    const {output} = await generateQuestionPrompt(input);
    return output!;
  }
);
