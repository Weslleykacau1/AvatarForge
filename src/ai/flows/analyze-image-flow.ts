
'use server';
/**
 * @fileOverview Flow to analyze an image and generate a description of an influencer.
 * 
 * - analyzeImage - A function that analyzes an image and generates a detailed description of an influencer.
 * - AnalyzeImageInput - The input type for the analyzeImage function, containing the image data URI.
 * - AnalyzeImageOutput - The return type for the analyzeImage function, containing the generated description.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  description: z.string().describe('A detailed description of the influencer, including facial characteristics, hair, style, and personality.'),
});

export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async (input) => {
    const prompt = `
      Analyze the provided image of a person and generate a detailed description of them as an influencer. 
      Include characteristics such as facial features, hair, style, and personality.
      This description will be used to generate a consistent avatar in different scenarios.
    `;

    const {output} = await ai.generate({
        prompt: prompt,
        input: {
            photoDataUri: input.photoDataUri,
        },
        output: { schema: AnalyzeImageOutputSchema },
        model: 'googleai/gemini-2.0-flash',
    });
    
    return output!;
  }
);
