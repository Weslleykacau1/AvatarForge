"use server";

import { z } from "zod";
import { generateAvatarVideo } from "@/ai/flows/generate-avatar-video";
import { generateTitle } from "@/ai/flows/generate-title-flow";
import { generateAction } from "@/ai/flows/generate-action-flow";
import { analyzeImage } from "@/ai/flows/analyze-image-flow";
import { analyzeText } from "@/ai/flows/analyze-text-flow";


const generateVideoSchema = z.object({
  sceneTitle: z.string().min(1, "Título da cena é obrigatório."),
  scenarioPrompt: z.string().min(1, "Descrição do cenário é obrigatória."),
  actionPrompt: z.string().min(1, "Ação principal é obrigatória."),
  sceneImageDataUri: z.string().optional(),
});

type VideoState = {
  success: boolean;
  videoDataUri?: string;
  error?: string;
};

export async function generateVideoAction(
  data: z.infer<typeof generateVideoSchema>
): Promise<VideoState> {
  const validatedFields = generateVideoSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid input passed to server action.',
    };
  }

  try {
    const result = await generateAvatarVideo(validatedFields.data);
    return { success: true, videoDataUri: result.videoDataUri };
  } catch (error) {
    console.error("Video generation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Video generation failed: ${errorMessage}` };
  }
}

const generateTitleSchema = z.object({
  context: z.string(),
});

type TitleState = {
  success: boolean;
  title?: string;
  error?: string;
};

export async function generateTitleAction(
  data: z.infer<typeof generateTitleSchema>
): Promise<TitleState> {
  const validatedFields = generateTitleSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input' };
  }

  try {
    const result = await generateTitle(validatedFields.data.context);
    return { success: true, title: result.title };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Title generation failed: ${errorMessage}` };
  }
}

const generateActionSchema = z.object({
  context: z.string(),
});

type ActionState = {
  success: boolean;
  action?: string;
  error?: string;
};

export async function generateActionAction(
  data: z.infer<typeof generateActionSchema>
): Promise<ActionState> {
  const validatedFields = generateActionSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input' };
  }

  try {
    const result = await generateAction(validatedFields.data.context);
    return { success: true, action: result.action };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Action generation failed: ${errorMessage}` };
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
