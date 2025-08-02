'use server';
/**
 * @fileOverview Flow to generate SEO content with AI.
 *
 * - generateSeo - A function that generates SEO content for a scene.
 * - GenerateSeoInput - The input type for the generateSeo function.
 * - GenerateSeoOutput - The return type for the generateSeo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateSeoInputSchema = z.object({
  context: z.string().describe('The context for the SEO content, including title, scenario, and action.'),
});

export type GenerateSeoInput = z.infer<typeof GenerateSeoInputSchema>;

const GenerateSeoOutputSchema = z.object({
  seo: z.string().describe('Generated SEO content, including a title, description, and keywords.'),
});

export type GenerateSeoOutput = z.infer<typeof GenerateSeoOutputSchema>;

export async function generateSeo(input: GenerateSeoInput): Promise<GenerateSeoOutput> {
  return generateSeoFlow(input);
}

const generateSeoFlow = ai.defineFlow(
  {
    name: 'generateSeoFlow',
    inputSchema: GenerateSeoInputSchema,
    outputSchema: GenerateSeoOutputSchema,
  },
  async (input) => {
    const prompt = `Based on the following context, generate SEO content for a video. Include a compelling title, a short description, and relevant keywords.
      Context: ${input.context}
      `;

    const {output} = await ai.generate({
        prompt: prompt,
        output: { schema: GenerateSeoOutputSchema },
    });
    
    return output!;
  }
);
