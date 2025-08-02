'use server';
/**
 * @fileOverview Flow to generate a principal action with AI.
 *
 * - generateAction - A function that generates a principal action.
 * - GenerateActionOutput - The return type for the generateAction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateActionOutputSchema = z.object({
  action: z.string().describe('A description of what the influencer is doing.'),
});

export type GenerateActionOutput = z.infer<typeof GenerateActionOutputSchema>;

export async function generateAction(context: string): Promise<GenerateActionOutput> {
  return generateActionFlow(context);
}

const generateActionFlow = ai.defineFlow(
  {
    name: 'generateActionFlow',
    inputSchema: z.string(),
    outputSchema: GenerateActionOutputSchema,
  },
  async (context) => {
    const prompt = `Based on the following scenario, describe a main action for an influencer in a video scene.
      Scenario: ${context}
      
      Describe a clear and engaging action.`;

    const {output} = await ai.generate({
        prompt: prompt,
        output: { schema: GenerateActionOutputSchema },
    });
    
    return output!;
  }
);
