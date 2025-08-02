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

const GenerateAvatarVideoInputSchema = z.object({
  sceneTitle: z.string().describe('Title of the scene.'),
  scenarioPrompt: z.string().describe('Detailed description of the environment and the influencer, including lighting, colors, objects, and atmosphere.'),
  actionPrompt: z.string().describe('The main action the influencer is performing.'),
  negativePrompt: z.string().optional().describe('A description of what to avoid in the video.'),
  dialogue: z.string().optional().describe('The dialogue the influencer is speaking.'),
  accent: z.string().optional().describe("The influencer's accent (e.g., Paulistano, Carioca)."),
  cameraAngle: z.string().optional().describe('The camera angle for the video.'),
  duration: z.number().optional().describe('The duration of the video in seconds.'),
  videoFormat: z.string().optional().describe('The format of the video (e.g., 9:16).'),
  allowDigitalText: z.boolean().optional().describe('Whether to allow digital on-screen text.'),
  allowPhysicalText: z.boolean().optional().describe('Whether to allow only physical text like labels and signs.'),
  sceneImageDataUri: z.string().optional().describe("An optional reference photo for the scene, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
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
    
    const promptText = `
      Scene Title: ${input.sceneTitle}
      Scenario and Influencer Details: ${input.scenarioPrompt}
      Main Action: ${input.actionPrompt}
      Dialogue: ${input.dialogue || 'No dialogue.'}
      Accent: ${input.accent || 'Padrão'}
      Camera Angle: ${input.cameraAngle || 'Dynamic Camera'}
      Video Format: ${input.videoFormat || '9:16'}
      Allow Digital On-Screen Text: ${input.allowDigitalText ? 'Yes' : 'No'}
      Allow Only Physical Text (labels, signs): ${input.allowPhysicalText ? 'Yes' : 'No'}
      Generate a video of the described influencer in the specified scenario, performing the main action and speaking the dialogue.
    `;

    const prompt: (string | {media: {url: string}})[] = [{text: promptText}];

    if (input.sceneImageDataUri) {
        prompt.push({media: {url: input.sceneImageDataUri}});
    }

    let {operation} = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: prompt,
      config: {
        durationSeconds: input.duration || 5,
        aspectRatio: input.videoFormat || '9:16',
        negativePrompt: input.negativePrompt,
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
