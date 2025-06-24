'use server';

/**
 * @fileOverview AI-powered feedback on interview answers, focusing on clarity, conciseness, and overall quality.
 *
 * - analyzeAnswerQuality - A function that handles the answer analysis process.
 * - AnalyzeAnswerQualityInput - The input type for the analyzeAnswerQuality function.
 * - AnalyzeAnswerQualityOutput - The return type for the analyzeAnswerQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAnswerQualityInputSchema = z.object({
  question: z.string().describe('The interview question asked.'),
  answer: z.string().describe('The answer given by the user.'),
});
export type AnalyzeAnswerQualityInput = z.infer<
  typeof AnalyzeAnswerQualityInputSchema
>;

const AnalyzeAnswerQualityOutputSchema = z.object({
  clarity: z.string().describe('Feedback on the clarity of the answer.'),
  conciseness: z
    .string()
    .describe('Feedback on the conciseness and length of the answer.'),
  overallQuality: z
    .string()
    .describe('Overall feedback on the quality of the answer.'),
  suggestions: z
    .string()
    .describe('Suggestions for improving the answer in the future.'),
});
export type AnalyzeAnswerQualityOutput = z.infer<
  typeof AnalyzeAnswerQualityOutputSchema
>;

export async function analyzeAnswerQuality(
  input: AnalyzeAnswerQualityInput
): Promise<AnalyzeAnswerQualityOutput> {
  return analyzeAnswerQualityFlow(input);
}

const analyzeAnswerQualityPrompt = ai.definePrompt({
  name: 'analyzeAnswerQualityPrompt',
  input: {schema: AnalyzeAnswerQualityInputSchema},
  output: {schema: AnalyzeAnswerQualityOutputSchema},
  prompt: `You are an AI assistant providing feedback on interview answers.

  Provide feedback on the following aspects of the answer:
  - Clarity: How clear and easy to understand was the answer?
  - Conciseness: Was the answer concise and to the point? Was it too long or too short?
  - Overall Quality: What was the overall quality of the answer?

  Offer suggestions for improving the answer in the future.

  Question: {{{question}}}
  Answer: {{{answer}}}

  The output should be a JSON object with keys 'clarity', 'conciseness', 'overallQuality', and 'suggestions'.
  Each key should be a string containing the feedback for that aspect of the answer.
  `,
});

const analyzeAnswerQualityFlow = ai.defineFlow(
  {
    name: 'analyzeAnswerQualityFlow',
    inputSchema: AnalyzeAnswerQualityInputSchema,
    outputSchema: AnalyzeAnswerQualityOutputSchema,
  },
  async input => {
    const {output} = await analyzeAnswerQualityPrompt(input);
    return output!;
  }
);
