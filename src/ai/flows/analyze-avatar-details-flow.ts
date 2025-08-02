'use server';
/**
 * @fileOverview Flow to analyze an image and extract detailed avatar information.
 * 
 * - analyzeAvatarDetails - A function that analyzes an image and generates a comprehensive description of an influencer.
 * - AnalyzeAvatarDetailsInput - The input type for the analyzeAvatarDetails function.
 * - AnalyzeAvatarDetailsOutput - The return type for the analyzeAvatarDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeAvatarDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type AnalyzeAvatarDetailsInput = z.infer<typeof AnalyzeAvatarDetailsInputSchema>;

const AnalyzeAvatarDetailsOutputSchema = z.object({
  name: z.string().describe("The influencer's name."),
  niche: z.string().describe("The influencer's niche (e.g., Fashion, Games, Tech)."),
  characteristics: z.string().describe('A summary of the most notable characteristics of the influencer.'),
  personalityTraits: z.string().describe("A description of the influencer's personality traits."),
  appearanceDetails: z.string().describe("A very detailed description of the influencer's physical appearance (face shape, eye color, hair texture, etc.)."),
  clothing: z.string().describe("A description of the clothes, shoes, and accessories the character is wearing."),
  shortBio: z.string().describe("A short biography for the influencer."),
  uniqueTrait: z.string().describe("A unique or peculiar trait that makes the influencer stand out."),
  age: z.string().describe("The estimated age of the influencer."),
  gender: z.string().describe("The gender of the influencer (Masculino, Feminino, Não-binário, Outro)."),
  negativePrompt: z.string().describe("A comma-separated list of common negative prompts to improve generation quality (e.g., bad hands, blurry, deformed)."),
});

export type AnalyzeAvatarDetailsOutput = z.infer<typeof AnalyzeAvatarDetailsOutputSchema>;

export async function analyzeAvatarDetails(input: AnalyzeAvatarDetailsInput): Promise<AnalyzeAvatarDetailsOutput> {
  return analyzeAvatarDetailsFlow(input);
}

const analyzeAvatarDetailsFlow = ai.defineFlow(
  {
    name: 'analyzeAvatarDetailsFlow',
    inputSchema: AnalyzeAvatarDetailsInputSchema,
    outputSchema: AnalyzeAvatarDetailsOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'analyzeAvatarPrompt',
        input: { schema: AnalyzeAvatarDetailsInputSchema },
        output: { schema: AnalyzeAvatarDetailsOutputSchema },
        prompt: `Analyze the provided image of a person and generate a detailed profile for them as a digital influencer. Fill in all the fields of the output schema based on the image. Be creative but realistic. The influencer should be relatable and have a clear niche.

Also, provide a set of useful, comma-separated negative prompts to avoid common generation errors (like deformed hands, blurry images, etc.).

Image: {{media url=photoDataUri}}`
    });

    const {output} = await prompt(input);
    return output!;
  }
);
