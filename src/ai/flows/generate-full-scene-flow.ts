'use server';
/**
 * @fileOverview Flow to generate a full scene (title, action, dialogue) and then the video.
 *
 * - generateFullScene - A function that orchestrates the generation of scene details and video.
 * - GenerateFullSceneInput - The input type for the generateFullScene function.
 * - GenerateFullSceneOutput - The return type for the generateFullScene function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {generateAvatarVideo} from './generate-avatar-video';

const GenerateFullSceneInputSchema = z.object({
  influencerDescription: z.string().describe("A detailed description of the influencer."),
  scenarioPrompt: z.string().describe('Detailed description of the environment.'),
  name: z.string().optional().describe('The title of the scene (if already exists).'),
  actionPrompt: z.string().optional().describe('The main action (if already exists).'),
  dialogue: z.string().optional().describe('The dialogue (if already exists).'),
  negativePrompt: z.string().optional().describe('A description of what to avoid in the video.'),
  sceneImageDataUri: z.string().optional().describe("An optional reference photo for the scene, as a data URI."),
  accent: z.string().optional().describe("The influencer's accent."),
  cameraAngle: z.string().optional().describe('The camera angle for the video.'),
  duration: z.number().optional().describe('The duration of the video in seconds.'),
  videoFormat: z.string().optional().describe('The format of the video (e.g., 9:16).'),
  allowDigitalText: z.boolean().optional().describe('Whether to allow digital on-screen text.'),
  allowPhysicalText: z.boolean().optional().describe('Whether to allow only physical text like labels and signs.'),
  hyperrealism: z.boolean().optional().describe('Whether to generate a hyperrealistic video.'),
  fourK: z.boolean().optional().describe('Whether to generate a 4k video.'),
  professionalCamera: z.boolean().optional().describe('Whether to simulate a professional camera.'),
});

export type GenerateFullSceneInput = z.infer<typeof GenerateFullSceneInputSchema>;

const SceneDetailsSchema = z.object({
    title: z.string().describe('A creative and concise title for the scene, less than 10 words.'),
    action: z.string().describe('A clear and engaging main action for the influencer in the video scene.'),
    dialogue: z.string().describe('A short and engaging dialogue for the influencer, in Brazilian Portuguese.'),
});

const GenerateFullSceneOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated avatar video as a data URI (video/mp4).'),
  generatedTitle: z.string(),
  generatedAction: z.string(),
  generatedDialogue: z.string(),
});

export type GenerateFullSceneOutput = z.infer<typeof GenerateFullSceneOutputSchema>;

export async function generateFullScene(input: GenerateFullSceneInput): Promise<GenerateFullSceneOutput> {
  return generateFullSceneFlow(input);
}

const generateFullSceneFlow = ai.defineFlow(
  {
    name: 'generateFullSceneFlow',
    inputSchema: GenerateFullSceneInputSchema,
    outputSchema: GenerateFullSceneOutputSchema,
  },
  async (input) => {
    let title = input.name;
    let action = input.actionPrompt;
    let dialogue = input.dialogue;

    // Only generate scene details if any of them are missing.
    if (!title || !action || !dialogue) {
        const sceneGenerationPrompt = `
            Based on the following influencer and scenario, generate the details for a compelling video scene.
            If a field is already provided in the input, use it instead of generating a new one.

            Influencer Description:
            ${input.influencerDescription}

            Scenario:
            ${input.scenarioPrompt}
        `;

        const { output: sceneDetails } = await ai.generate({
            prompt: sceneGenerationPrompt,
            output: { schema: SceneDetailsSchema },
            model: 'googleai/gemini-2.0-flash',
        });
        
        if (!sceneDetails) {
            throw new Error("Failed to generate scene details.");
        }

        title = input.name || sceneDetails.title;
        action = input.actionPrompt || sceneDetails.action;
        dialogue = input.dialogue || sceneDetails.dialogue;
    }


    const videoResult = await generateAvatarVideo({
        sceneTitle: title!,
        scenarioPrompt: `${input.influencerDescription}\n\n**Cenário:** ${input.scenarioPrompt}`,
        actionPrompt: action!,
        negativePrompt: input.negativePrompt,
        sceneImageDataUri: input.sceneImageDataUri,
        dialogue: dialogue,
        accent: input.accent,
        cameraAngle: input.cameraAngle,
        duration: input.duration,
        videoFormat: input.videoFormat,
        allowDigitalText: input.allowDigitalText,
        allowPhysicalText: input.allowPhysicalText,
        hyperrealism: input.hyperrealism,
        fourK: input.fourK,
        professionalCamera: input.professionalCamera,
    });

    return {
        videoDataUri: videoResult.videoDataUri,
        generatedTitle: title!,
        generatedAction: action!,
        generatedDialogue: dialogue!,
    };
  }
);
