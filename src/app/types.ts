export type Influencer = {
  id: string;
  name: string;
  niche: string;
  sceneImage?: string; // Optional: for scenario reference image data URI
  scenarioPrompt: string;
  actionPrompt: string;
  referenceImage?: string;
  characteristics?: string;
  personalityTraits?: string;
  appearanceDetails?: string;
  clothing?: string;
  shortBio?: string;
  uniqueTrait?: string;
  age?: string;
  gender?: string;
  dialogue?: string;
  cameraAngle?: string;
  duration?: number;
  videoFormat?: string;
  allowDigitalText?: string; // "true" or "false"
  allowPhysicalText?: string; // "true" or "false"
  productName?: string;
  partnerBrand?: string;
  productImage?: string;
  productDescription?: string;
  isPartnership?: boolean;
};
