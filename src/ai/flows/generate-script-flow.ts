'use server';
/**
 * @fileOverview Flow to generate a detailed video script with AI.
 *
 * - generateScript - A function that generates a script for a scene.
 * - GenerateScriptInput - The input type for the generateScript function.
 * - GenerateScriptOutput - The return type for the generateScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateScriptInputSchema = z.object({
  influencerDetails: z.string().describe('A detailed description of the influencer.'),
  sceneDetails: z.string().describe('A detailed description of the scene.'),
  outputFormat: z.enum(['markdown', 'json']).describe('The desired output format for the script.'),
});

export type GenerateScriptInput = z.infer<typeof GenerateScriptInputSchema>;

const GenerateScriptOutputSchema = z.object({
  script: z.string().describe('The generated script in the specified format.'),
});

export type GenerateScriptOutput = z.infer<typeof GenerateScriptOutputSchema>;

export async function generateScript(input: GenerateScriptInput): Promise<GenerateScriptOutput> {
  return generateScriptFlow(input);
}

const generateScriptFlow = ai.defineFlow(
  {
    name: 'generateScriptFlow',
    inputSchema: GenerateScriptInputSchema,
    outputSchema: GenerateScriptOutputSchema,
  },
  async (input) => {
    const prompt = `
      You are a professional screenwriter. Create a detailed video script based on the influencer and scene provided.
      The script should include scene descriptions, camera directions, dialogues, and actions.
      The dialogue must always be in Brazilian Portuguese.
      
      Influencer Details:
      ${input.influencerDetails}
      
      Scene Details:
      ${input.sceneDetails}
      
      The output must be in ${input.outputFormat} format.
      
      If the output format is JSON, provide a structured script with keys like "title", "scenes", "camera_angles", "dialogue", "actions".
      If the output format is Markdown, use appropriate formatting for titles, scenes, and dialogues.
    `;

    const {output} = await ai.generate({
      prompt: prompt,
      output: { schema: GenerateScriptOutputSchema },
    });
    
    return output!;
  }
);
