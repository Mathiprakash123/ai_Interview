// 'use server';
/**
 * @fileOverview Transcribes user's spoken answers into text in real-time.
 *
 * - transcribeAnswer - A function that handles the transcription process.
 * - TranscribeAnswerInput - The input type for the transcribeAnswer function.
 * - TranscribeAnswerOutput - The return type for the transcribeAnswer function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAnswerInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The user's spoken answer as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAnswerInput = z.infer<typeof TranscribeAnswerInputSchema>;

const TranscribeAnswerOutputSchema = z.object({
  transcription: z
    .string()
    .describe('The transcribed text of the user response.'),
});
export type TranscribeAnswerOutput = z.infer<typeof TranscribeAnswerOutputSchema>;

export async function transcribeAnswer(input: TranscribeAnswerInput): Promise<TranscribeAnswerOutput> {
  return transcribeAnswerFlow(input);
}

const transcribeAnswerPrompt = ai.definePrompt({
  name: 'transcribeAnswerPrompt',
  input: {schema: TranscribeAnswerInputSchema},
  output: {schema: TranscribeAnswerOutputSchema},
  prompt: `Transcribe the following audio into text:

  {{media url=audioDataUri}}`,
});

const transcribeAnswerFlow = ai.defineFlow(
  {
    name: 'transcribeAnswerFlow',
    inputSchema: TranscribeAnswerInputSchema,
    outputSchema: TranscribeAnswerOutputSchema,
  },
  async input => {
    const {output} = await transcribeAnswerPrompt(input);
    return output!;
  }
);
