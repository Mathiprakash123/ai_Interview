'use server';

/**
 * @fileOverview Generates unique interview questions in real-time, based on the conversation history.
 *
 * - generateQuestion - A function that handles generating a new question.
 * - GenerateQuestionInput - The input type for the generateQuestion function.
 * - GenerateQuestionOutput - The return type for the generateQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterviewExchangeSchema = z.object({
  question: z.string().describe('The question that was asked to the candidate.'),
  answer: z.string().describe("The candidate's answer to the question."),
});

const GenerateQuestionInputSchema = z.object({
  category: z.string().describe('The category of the interview question (e.g., Behavioral, Technical).'),
  difficulty: z.string().describe('The difficulty of the question (e.g., Easy, Medium, Hard).'),
  previousExchanges: z.array(InterviewExchangeSchema).describe('A list of previous question-answer exchanges in this session.'),
});
export type GenerateQuestionInput = z.infer<typeof GenerateQuestionInputSchema>;

const GenerateQuestionOutputSchema = z.object({
  question: z.string().describe('A new, unique interview question based on the conversation so far.'),
});
export type GenerateQuestionOutput = z.infer<typeof GenerateQuestionOutputSchema>;

export async function generateQuestion(input: GenerateQuestionInput): Promise<GenerateQuestionOutput> {
  return generateQuestionFlow(input);
}

const generateQuestionPrompt = ai.definePrompt({
  name: 'generateQuestionPrompt',
  input: {schema: GenerateQuestionInputSchema},
  output: {schema: GenerateQuestionOutputSchema},
  prompt: `You are an expert interviewer conducting a live interview. Your goal is to have a natural, conversational interview.

  The interview is about:
  - Category: {{{category}}}
  - Difficulty: {{{difficulty}}}

  Here is the conversation so far:
  {{#if previousExchanges}}
  {{#each previousExchanges}}
  Interviewer: {{{this.question}}}
  Candidate: {{{this.answer}}}
  ---
  {{/each}}
  {{else}}
  (This is the first question of the interview.)
  {{/if}}

  Based on the conversation, especially the candidate's last answer, ask the next logical follow-up question.
  The question should feel like a natural continuation of the dialogue.
  If this is the first question, generate a good opening question for the specified category and difficulty.

  Do not repeat any questions that have already been asked.

  Generate only the text for the new question.
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
