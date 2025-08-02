"use server";

import { z } from "zod";
import { generateAvatarVideo } from "@/ai/flows/generate-avatar-video";
import { generateSeo } from "@/ai/flows/generate-seo-flow";
import { analyzeAvatarDetails, type AnalyzeAvatarDetailsOutput } from "@/ai/flows/analyze-avatar-details-flow";
import { generateScript } from "@/ai/flows/generate-script-flow";
import { analyzeProductImage, type AnalyzeProductImageOutput } from "@/ai/flows/analyze-product-image-flow";
import { analyzeImage } from "@/ai/flows/analyze-image-flow";
import { analyzeText } from "@/ai/flows/analyze-text-flow";
import { generateFullScene, type GenerateFullSceneOutput } from "@/ai/flows/generate-full-scene-flow";
import { generateVideoFromScript, type GenerateVideoFromScriptInput } from "@/ai/flows/generate-video-from-script-flow";


const generateFullSceneSchema = z.object({
  influencerDescription: z.string(),
  scenarioPrompt: z.string(),
  name: z.string().optional(),
  actionPrompt: z.string().optional(),
  dialogue: z.string().optional(),
  negativePrompt: z.string().optional(),
  sceneImageDataUri: z.string().optional(),
  accent: z.string().optional(),
  cameraAngle: z.string().optional(),
  duration: z.number().optional(),
  videoFormat: z.string().optional(),
  allowDigitalText: z.boolean().optional(),
  allowPhysicalText: z.boolean().optional(),
});

type FullSceneState = {
  success: boolean;
  videoDataUri?: string;
  generatedTitle?: string;
  generatedAction?: string;
  generatedDialogue?: string;
  error?: string;
};

export async function generateFullSceneAction(
  data: z.infer<typeof generateFullSceneSchema>
): Promise<FullSceneState> {
  const validatedFields = generateFullSceneSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid input passed to server action.',
    };
  }

  try {
    const result = await generateFullScene(validatedFields.data);
    return { 
        success: true, 
        videoDataUri: result.videoDataUri,
        generatedTitle: result.generatedTitle,
        generatedAction: result.generatedAction,
        generatedDialogue: result.generatedDialogue,
    };
  } catch (error) {
    console.error("Full scene generation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Scene generation failed: ${errorMessage}` };
  }
}


const analyzeImageSchema = z.object({
    photoDataUri: z.string(),
});

type AnalyzeImageState = {
    success: boolean;
    description?: string;
    error?: string;
};

export async function analyzeImageAction(
    data: z.infer<typeof analyzeImageSchema>
): Promise<AnalyzeImageState> {
    const validatedFields = analyzeImageSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input' };
    }
    try {
        const result = await analyzeImage(validatedFields.data);
        return { success: true, description: result.description };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Image analysis failed: ${errorMessage}` };
    }
}

const analyzeTextSchema = z.object({
    text: z.string(),
});

type AnalyzeTextState = {
    success: boolean;
    name?: string;
    niche?: string;
    error?: string;
};

export async function analyzeTextAction(
    data: z.infer<typeof analyzeTextSchema>
): Promise<AnalyzeTextState> {
    const validatedFields = analyzeTextSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input' };
    }
    try {
        const result = await analyzeText(validatedFields.data);
        return { success: true, name: result.name, niche: result.niche };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Text analysis failed: ${errorMessage}` };
    }
}

const generateSeoSchema = z.object({
    context: z.string(),
});

type SeoState = {
    success: boolean;
    seo?: string;
    error?: string;
};

export async function generateSeoAction(
    data: z.infer<typeof generateSeoSchema>
): Promise<SeoState> {
    const validatedFields = generateSeoSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input' };
    }
    try {
        const result = await generateSeo(validatedFields.data);
        return { success: true, seo: result.seo };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `SEO generation failed: ${errorMessage}` };
    }
}

const analyzeAvatarDetailsSchema = z.object({
    photoDataUri: z.string(),
});

type AnalyzeAvatarDetailsState = {
    success: boolean;
    details?: AnalyzeAvatarDetailsOutput;
    error?: string;
};

export async function analyzeAvatarDetailsAction(
    data: z.infer<typeof analyzeAvatarDetailsSchema>
): Promise<AnalyzeAvatarDetailsState> {
    const validatedFields = analyzeAvatarDetailsSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input' };
    }
    try {
        const result = await analyzeAvatarDetails(validatedFields.data);
        return { success: true, details: result };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Avatar details analysis failed: ${errorMessage}` };
    }
}


const generateScriptSchema = z.object({
  influencerDetails: z.string(),
  sceneDetails: z.string(),
  outputFormat: z.enum(['markdown', 'json']),
});

type ScriptState = {
    success: boolean;
    script?: string;
    error?: string;
};

export async function generateScriptAction(
    data: z.infer<typeof generateScriptSchema>
): Promise<ScriptState> {
    const validatedFields = generateScriptSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input' };
    }
    try {
        const result = await generateScript(validatedFields.data);
        return { success: true, script: result.script };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Script generation failed: ${errorMessage}` };
    }
}

const analyzeProductImageSchema = z.object({
    photoDataUri: z.string(),
});

type AnalyzeProductImageState = {
    success: boolean;
    details?: AnalyzeProductImageOutput;
    error?: string;
};

export async function analyzeProductImageAction(
    data: z.infer<typeof analyzeProductImageSchema>
): Promise<AnalyzeProductImageState> {
    const validatedFields = analyzeProductImageSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input' };
    }
    try {
        const result = await analyzeProductImage(validatedFields.data);
        return { success: true, details: result };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Product image analysis failed: ${errorMessage}` };
    }
}

const generateVideoFromScriptSchema = z.object({
    script: z.any(),
});

type VideoFromScriptState = {
    success: boolean;
    videoDataUri?: string;
    error?: string;
};

export async function generateVideoFromScriptAction(
    data: z.infer<typeof generateVideoFromScriptSchema>
): Promise<VideoFromScriptState> {
    const validatedFields = generateVideoFromScriptSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input' };
    }

    try {
        const result = await generateVideoFromScript({ script: validatedFields.data.script });
        return { success: true, videoDataUri: result.videoDataUri };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Video generation from script failed: ${errorMessage}` };
    }
}