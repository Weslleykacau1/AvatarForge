
'use server';
/**
 * @fileOverview Flow to analyze an image and generate a description of a scene.
 * 
 * - analyzeImage - A function that analyzes an image and generates a detailed description of a scene.
 * - AnalyzeImageInput - The input type for the analyzeImage function, containing the image data URI.
 * - AnalyzeImageOutput - The return type for the analyzeImage function, containing the generated description.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      `A photo of a scene, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.`
    ),
});

export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  description: z.string().describe('A detailed and faithful description of the scene, including lighting, colors, objects, materials, and overall atmosphere.'),
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
      Analyze the provided image of a scene and generate a detailed and faithful description. 
      Focus on the environment, lighting, dominant colors, objects, materials, and the overall atmosphere.
      This description will be used to generate a video scene. Ignore any people in the image and focus only on the scenery.
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
