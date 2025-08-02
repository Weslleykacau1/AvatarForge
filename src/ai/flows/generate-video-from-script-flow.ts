'use server';
/**
 * @fileOverview Flow to generate a video based on a detailed JSON script.
 * 
 * This flow takes a structured JSON object describing a character and a sequence of scenes,
 * then generates a video for the first scene in the sequence. This is a foundational step
 * towards full multi-scene video generation.
 * 
 * - generateVideoFromScript - A function that orchestrates video generation from a script.
 * - GenerateVideoFromScriptInput - The input type (the JSON script).
 * - GenerateVideoFromScriptOutput - The return type (the generated video data URI).
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {generateAvatarVideo} from './generate-avatar-video';

// Define the schema for a single scene within the script
const SceneSchema = z.object({
  id: z.number(),
  visual_prompt: z.string().describe("Detailed visual description of the scene, including background, lighting, and objects."),
  camera_direction: z.string().describe("Instructions for the camera movement and angle."),
  expression: z.string().describe("The character's facial expression."),
  dialogue: z.string().describe("The dialogue spoken by the character in this scene."),
  start_time: z.number(),
  end_time: z.number(),
});

// Define the schema for the main script object
const ScriptSchema = z.object({
  character: z.object({
    name: z.string(),
    appearance: z.string().describe("A very detailed description of the character's physical appearance."),
    style: z.string().describe("A description of the character's clothing and style."),
  }),
  title: z.string(),
  format: z.string().optional(),
  duration_seconds: z.number().optional(),
  language: z.string().optional(),
  scenes: z.array(SceneSchema),
  product_integration: z.object({
    is_present: z.boolean(),
    product_name: z.string().optional(),
    integration_description: z.string().optional(),
  }).optional(),
});

const GenerateVideoFromScriptInputSchema = z.object({
    script: ScriptSchema
});

type GenerateVideoFromScriptInput = z.infer<typeof GenerateVideoFromScriptInputSchema>;

const GenerateVideoFromScriptOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated avatar video for the first scene as a data URI (video/mp4).'),
});

type GenerateVideoFromScriptOutput = z.infer<typeof GenerateVideoFromScriptOutputSchema>;

export async function generateVideoFromScript(input: GenerateVideoFromScriptInput): Promise<GenerateVideoFromScriptOutput> {
  return generateVideoFromScriptFlow(input);
}

const generateVideoFromScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoFromScriptFlow',
    inputSchema: GenerateVideoFromScriptInputSchema,
    outputSchema: GenerateVideoFromScriptOutputSchema,
  },
  async ({ script }) => {
    
    // For now, we only process the FIRST scene.
    // The full implementation would loop through all scenes and stitch the videos.
    const firstScene = script.scenes[0];
    if (!firstScene) {
        throw new Error("The script must contain at least one scene.");
    }

    // Combine character and scene details into a comprehensive prompt.
    const scenarioPrompt = `
      **Character Name:** ${script.character.name}
      **Character Appearance:** ${script.character.appearance}
      **Character Style:** ${script.character.style}
      
      **Scene Description:** ${firstScene.visual_prompt}
      **Character Expression:** ${firstScene.expression}
    `;

    const actionPrompt = `The character, ${script.character.name}, is performing. ${firstScene.camera_direction}`;
    
    const duration = firstScene.end_time - firstScene.start_time;

    // Call the existing video generation flow with the composed prompts.
    const videoResult = await generateAvatarVideo({
        sceneTitle: script.title,
        scenarioPrompt: scenarioPrompt,
        actionPrompt: actionPrompt,
        dialogue: firstScene.dialogue,
        duration: duration,
        videoFormat: script.format || '9:16',
        accent: script.language === 'pt-BR' ? 'Padrão' : undefined,
    });

    return {
        videoDataUri: videoResult.videoDataUri,
    };
  }
);
