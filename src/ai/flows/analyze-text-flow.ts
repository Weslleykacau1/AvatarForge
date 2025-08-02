
'use server';
/**
 * @fileOverview Flow to analyze a text description and extract influencer details.
 * 
 * - analyzeText - A function that analyzes a text description and extracts the influencer's name and niche.
 * - AnalyzeTextInput - The input type for the analyzeText function, containing the text description.
 * - AnalyzeTextOutput - The return type for the analyzeText function, containing the extracted name and niche.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeTextInputSchema = z.object({
  text: z.string().describe('A text description of an influencer.'),
});

export type AnalyzeTextInput = z.infer<typeof AnalyzeTextInputSchema>;

const AnalyzeTextOutputSchema = z.object({
  name: z.string().describe("The influencer's name."),
  niche: z.string().describe("The influencer's niche (e.g., Fashion, Games)."),
});

export type AnalyzeTextOutput = z.infer<typeof AnalyzeTextOutputSchema>;

export async function analyzeText(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  return analyzeTextFlow(input);
}

const analyzeTextFlow = ai.defineFlow(
  {
    name: 'analyzeTextFlow',
    inputSchema: AnalyzeTextInputSchema,
    outputSchema: AnalyzeTextOutputSchema,
  },
  async (input) => {
    const prompt = `
      Analyze the following text description of an influencer and extract their name and niche.
      Text: ${input.text}
    `;

    const {output} = await ai.generate({
        prompt: prompt,
        output: { schema: AnalyzeTextOutputSchema },
    });
    
    return output!;
  }
);
