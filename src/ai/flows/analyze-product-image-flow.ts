'use server';
/**
 * @fileOverview Flow to analyze a product image and extract details.
 * 
 * - analyzeProductImage - A function that analyzes an image and extracts product details.
 * - AnalyzeProductImageInput - The input type for the analyzeProductImage function.
 * - AnalyzeProductImageOutput - The return type for the analyzeProductImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeProductImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});

export type AnalyzeProductImageInput = z.infer<typeof AnalyzeProductImageInputSchema>;

const AnalyzeProductImageOutputSchema = z.object({
  productName: z.string().describe("The product's name."),
  partnerBrand: z.string().describe("The product's brand."),
  productDescription: z.string().describe("A detailed description of the product."),
});

export type AnalyzeProductImageOutput = z.infer<typeof AnalyzeProductImageOutputSchema>;

export async function analyzeProductImage(input: AnalyzeProductImageInput): Promise<AnalyzeProductImageOutput> {
  return analyzeProductImageFlow(input);
}

const analyzeProductImageFlow = ai.defineFlow(
  {
    name: 'analyzeProductImageFlow',
    inputSchema: AnalyzeProductImageInputSchema,
    outputSchema: AnalyzeProductImageOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'analyzeProductImagePrompt',
        input: { schema: AnalyzeProductImageInputSchema },
        output: { schema: AnalyzeProductImageOutputSchema },
        prompt: `Analyze the provided image of a product and generate details about it. Fill in all the fields of the output schema based on the image.

Image: {{media url=photoDataUri}}`
    });

    const {output} = await prompt(input);
    return output!;
  }
);
