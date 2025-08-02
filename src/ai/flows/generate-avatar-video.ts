'use server';

/**
 * @fileOverview Flow to generate avatar video from user-provided prompts.
 *
 * - generateAvatarVideo - A function that generates a video of an avatar based on input prompts.
 * - GenerateAvatarVideoInput - The input type for the generateAvatarVideo function.
 * - GenerateAvatarVideoOutput - The return type for the generateAvatarVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as fs from 'fs';
import {Readable} from 'stream';

const GenerateAvatarVideoInputSchema = z.object({
  clothingPrompt: z.string().describe('Description of the avatar\'s clothing.'),
  otherDetailsPrompt: z.string().describe('Additional details for the avatar, such as accessories or environment.'),
});

export type GenerateAvatarVideoInput = z.infer<typeof GenerateAvatarVideoInputSchema>;

const GenerateAvatarVideoOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated avatar video as a data URI (video/mp4).'),
});

export type GenerateAvatarVideoOutput = z.infer<typeof GenerateAvatarVideoOutputSchema>;


export async function generateAvatarVideo(input: GenerateAvatarVideoInput): Promise<GenerateAvatarVideoOutput> {
  return generateAvatarVideoFlow(input);
}

const generateAvatarVideoFlow = ai.defineFlow(
  {
    name: 'generateAvatarVideoFlow',
    inputSchema: GenerateAvatarVideoInputSchema,
    outputSchema: GenerateAvatarVideoOutputSchema,
  },
  async input => {
    let {operation} = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: `Generate a video of an avatar with the following characteristics: Clothing: ${input.clothingPrompt}. Other details: ${input.otherDetailsPrompt}.`,
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes. Note that this may take some time, maybe even up to a minute. Design the UI accordingly.
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      // Sleep for 5 seconds before checking again.
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find(p => !!p.media);
    if (!video) {
      throw new Error('Failed to find the generated video');
    }
    const videoDataUri = await downloadVideo(video);
    return {videoDataUri};
  }
);

async function downloadVideo(video: any): Promise<string> {
  const fetch = (await import('node-fetch')).default;
  // Add API key before fetching the video.
  const videoDownloadResponse = await fetch(
    `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
  );
  if (
    !videoDownloadResponse ||
    videoDownloadResponse.status !== 200 ||
    !videoDownloadResponse.body
  ) {
    throw new Error('Failed to fetch video');
  }

  const buffer = await videoDownloadResponse.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:video/mp4;base64,${base64}`;
}
