'use server';
/**
 * @fileOverview Flow to generate a scene title with AI.
 *
 * - generateTitle - A function that generates a scene title.
 * - GenerateTitleOutput - The return type for the generateTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateTitleOutputSchema = z.object({
  title: z.string().describe('A creative and concise title for the scene.'),
});

export type GenerateTitleOutput = z.infer<typeof GenerateTitleOutputSchema>;

export async function generateTitle(context: string): Promise<GenerateTitleOutput> {
  return generateTitleFlow(context);
}

const generateTitleFlow = ai.defineFlow(
  {
    name: 'generateTitleFlow',
    inputSchema: z.string(),
    outputSchema: GenerateTitleOutputSchema,
  },
  async (context) => {
    const prompt = `Based on the following context, generate a short, catchy title for a video scene.
      Context: ${context}
      
      Generate a title that is less than 10 words.`;

    const {output} = await ai.generate({
        prompt: prompt,
        output: { schema: GenerateTitleOutputSchema },
    });
    
    return output!;
  }
);
