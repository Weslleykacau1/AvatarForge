export type Scene = {
  id: string;
  name: string;
  niche: string;
  sceneImage?: string;
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
  allowDigitalText?: string;
  allowPhysicalText?: string;
  productName?: string;
  partnerBrand?: string;
  productImage?: string;
  productDescription?: string;
  isPartnership?: boolean;
};

export type Avatar = {
  id: string;
  name: string;
  niche: string;
  referenceImage?: string;
  characteristics?: string;
  personalityTraits?: string;
  appearanceDetails?: string;
  clothing?: string;
  shortBio?: string;
  uniqueTrait?: string;
  age?: string;
  gender?: string;
};

export type Product = {
  id: string;
  productName: string;
  partnerBrand?: string;
  productImage?: string;
  productDescription?: string;
  isPartnership?: boolean;
};
