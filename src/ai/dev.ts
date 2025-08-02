'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-avatar-video.ts';
import '@/ai/flows/generate-title-flow.ts';
import '@/ai/flows/generate-action-flow.ts';
import '@/ai/flows/analyze-image-flow.ts';
import '@/ai/flows/analyze-text-flow.ts';
import '@/ai/flows/generate-dialogue-flow.ts';
import '@/ai/flows/generate-seo-flow.ts';
import '@/ai/flows/analyze-avatar-details-flow.ts';
