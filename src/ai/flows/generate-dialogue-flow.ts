'use server';
/**
 * @fileOverview Flow to generate dialogue with AI.
 *
 * - generateDialogue - A function that generates dialogue for a scene.
 * - GenerateDialogueInput - The input type for the generateDialogue function.
 * - GenerateDialogueOutput - The return type for the generateDialogue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateDialogueInputSchema = z.object({
  context: z.string().describe('The context for the dialogue, including scenario and action.'),
});

export type GenerateDialogueInput = z.infer<typeof GenerateDialogueInputSchema>;

const GenerateDialogueOutputSchema = z.object({
  dialogue: z.string().describe('The generated dialogue in Brazilian Portuguese.'),
});

export type GenerateDialogueOutput = z.infer<typeof GenerateDialogueOutputSchema>;

export async function generateDialogue(input: GenerateDialogueInput): Promise<GenerateDialogueOutput> {
  return generateDialogueFlow(input);
}

const generateDialogueFlow = ai.defineFlow(
  {
    name: 'generateDialogueFlow',
    inputSchema: GenerateDialogueInputSchema,
    outputSchema: GenerateDialogueOutputSchema,
  },
  async (input) => {
    const prompt = `Based on the following context, generate a short and engaging dialogue for an influencer in a video scene. The dialogue must be in Brazilian Portuguese.
      Context: ${input.context}
      `;

    const {output} = await ai.generate({
        prompt: prompt,
        output: { schema: GenerateDialogueOutputSchema },
    });
    
    return output!;
  }
);
