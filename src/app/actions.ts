"use server";

import { z } from "zod";
import { generateAvatarVideo } from "@/ai/flows/generate-avatar-video";
import { generateTitle } from "@/ai/flows/generate-title-flow";
import { generateAction } from "@/ai/flows/generate-action-flow";
import { analyzeImage } from "@/ai/flows/analyze-image-flow";
import { analyzeText } from "@/ai/flows/analyze-text-flow";
import { generateDialogue } from "@/ai/flows/generate-dialogue-flow";
import { generateSeo } from "@/ai/flows/generate-seo-flow";
import { analyzeAvatarDetails, type AnalyzeAvatarDetailsOutput } from "@/ai/flows/analyze-avatar-details-flow";

const generateVideoSchema = z.object({
  sceneTitle: z.string().min(1, "Título da cena é obrigatório."),
  scenarioPrompt: z.string().min(1, "Descrição do cenário é obrigatória."),
  actionPrompt: z.string().min(1, "Ação principal é obrigatória."),
  sceneImageDataUri: z.string().optional(),
  dialogue: z.string().optional(),
  cameraAngle: z.string().optional(),
  duration: z.number().optional(),
  videoFormat: z.string().optional(),
  allowDigitalText: z.boolean().optional(),
  allowPhysicalText: z.boolean().optional(),
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

const generateDialogueSchema = z.object({
    context: z.string(),
});

type DialogueState = {
    success: boolean;
    dialogue?: string;
    error?: string;
};

export async function generateDialogueAction(
    data: z.infer<typeof generateDialogueSchema>
): Promise<DialogueState> {
    const validatedFields = generateDialogueSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input' };
    }
    try {
        const result = await generateDialogue(validatedFields.data);
        return { success: true, dialogue: result.dialogue };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Dialogue generation failed: ${errorMessage}` };
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