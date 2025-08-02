"use server";

import { z } from "zod";
import { generateAvatarVideo } from "@/ai/flows/generate-avatar-video";

const generateVideoSchema = z.object({
  clothingPrompt: z.string().min(1, "Clothing prompt is required."),
  otherDetailsPrompt: z.string(),
});

type State = {
  success: boolean;
  videoDataUri?: string;
  error?: string;
};

export async function generateVideoAction(
  data: z.infer<typeof generateVideoSchema>
): Promise<State> {
  const validatedFields = generateVideoSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid input passed to server action.',
    };
  }

  try {
    const result = await generateAvatarVideo({
      clothingPrompt: validatedFields.data.clothingPrompt,
      otherDetailsPrompt: validatedFields.data.otherDetailsPrompt,
    });
    return { success: true, videoDataUri: result.videoDataUri };
  } catch (error) {
    console.error("Video generation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Video generation failed: ${errorMessage}` };
  }
}
