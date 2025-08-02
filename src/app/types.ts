export type Influencer = {
  id: string;
  name: string; // This will now be used for Scene Title
  sceneImage?: string; // Optional: for scenario reference image data URI
  scenarioPrompt: string;
  actionPrompt: string;
};
