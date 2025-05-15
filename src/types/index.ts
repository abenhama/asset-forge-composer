
// Main asset types
export type AssetType = 'base-doll' | 'hair' | 'clothing' | 'accessory' | 'facial-hair';

// Asset subtypes for more specific categorization
export type AssetSubType = 
  // Hair subtypes
  | 'hair-front'
  | 'hair-back'
  | 'hair-full'
  // Clothing subtypes
  | 'clothing-top'
  | 'clothing-bottom'
  | 'clothing-dress'
  | 'clothing-outerwear'
  | 'clothing-undergarment'
  // Accessory subtypes
  | 'glasses'
  | 'hat'
  | 'jewelry'
  | 'bag'
  | 'scarf'
  | 'watch'
  // Facial hair subtypes
  | 'mustache'
  | 'beard'
  | 'goatee'
  | 'sideburns'
  // Base doll has no subtypes
  | null;

export type AssetStyle = 'cartoon' | 'realistic' | 'anime' | 'minimalist';

// Skin tones for base dolls
export enum SkinTone {
  LIGHT = 'light',
  MEDIUM_LIGHT = 'medium-light',
  MEDIUM = 'medium',
  MEDIUM_DARK = 'medium-dark',
  DARK = 'dark'
}

// Hair colors
export enum HairColor {
  BLACK = '#000000',
  BROWN = '#4A2728',
  BLONDE = '#FDD835',
  RED = '#D84315',
  GRAY = '#757575',
  WHITE = '#FFFFFF'
}

// Common interface for all metadata types
export interface BaseMetadata {
  [key: string]: any;
}

// Base doll specific metadata
export interface BaseDollMetadata extends BaseMetadata {
  skinTone: SkinTone;
  gender: 'male' | 'female' | 'neutral';
  bodyType: 'slim' | 'regular' | 'curvy' | 'athletic';
  ageRange: 'child' | 'teen' | 'young-adult' | 'adult' | 'senior';
}

// Hair specific metadata
export interface HairMetadata extends BaseMetadata {
  length: 'short' | 'medium' | 'long' | 'extra-long';
  texture: 'straight' | 'wavy' | 'curly' | 'kinky';
  style: 'bob' | 'ponytail' | 'braid' | 'bun' | 'messy' | 'sleek';
  color: HairColor | string;
  hasAccessories: boolean;
}

// Clothing specific metadata
export interface ClothingMetadata extends BaseMetadata {
  category: 'shirt' | 'blouse' | 'sweater' | 'jacket' | 'pants' | 'skirt' | 'dress' | 'shorts';
  style: string;
  color: string;
  pattern?: 'solid' | 'striped' | 'polka-dot' | 'floral' | 'geometric';
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';
  formality: 'casual' | 'business' | 'formal' | 'sportswear';
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
}

// Accessory specific metadata
export interface AccessoryMetadata extends BaseMetadata {
  type: 'glasses' | 'hat' | 'jewelry' | 'bag' | 'scarf' | 'watch';
  material: 'metal' | 'fabric' | 'leather' | 'plastic' | 'glass';
  color: string;
  style: 'classic' | 'modern' | 'vintage' | 'trendy' | 'luxury';
  placement: 'head' | 'face' | 'neck' | 'ears' | 'hands' | 'body';
}

// Facial hair specific metadata
export interface FacialHairMetadata extends BaseMetadata {
  type: 'mustache' | 'beard' | 'goatee' | 'sideburns' | 'stubble';
  thickness: 'light' | 'medium' | 'thick';
  color: HairColor | string;
  style: string;
}

// Union type for all possible metadata types
export type AssetMetadata = 
  | BaseDollMetadata 
  | HairMetadata 
  | ClothingMetadata 
  | AccessoryMetadata 
  | FacialHairMetadata;

// Asset anchor points for positioning
export interface AssetAnchorPoints {
  center: { x: number; y: number };
  head?: { x: number; y: number };
  shoulders?: { x: number; y: number };
  waist?: { x: number; y: number };
  feet?: { x: number; y: number };
  // New detailed facial anchor points
  eyes?: { x: number; y: number };
  nose?: { x: number; y: number };
  mouth?: { x: number; y: number };
  ears?: { x: number; y: number };
  // New detailed body anchor points
  neck?: { x: number; y: number };
  chest?: { x: number; y: number };
  hands?: { x: number; y: number };
  hips?: { x: number; y: number };
  knees?: { x: number; y: number };
  ankles?: { x: number; y: number };
}

// Z-index constants for proper layering
export const LAYER_Z_INDEX = {
  BASE_DOLL: 0,
  UNDERGARMENT: 2,
  CLOTHING_BOTTOM: 3,
  CLOTHING_DRESS: 3.5,
  CLOTHING_TOP: 4,
  HAIR_BACK: 5,
  CLOTHING_OUTERWEAR: 6,
  ACCESSORY_JEWELRY: 7,
  ACCESSORY_SCARF: 8,
  ACCESSORY_BAG: 9,
  ACCESSORY_WATCH: 10,
  FACIAL_HAIR: 11,
  FACE_MAKEUP: 12,
  ACCESSORY_FACE_MISC: 13,
  ACCESSORY_GLASSES: 14,
  HAIR_FRONT: 15,
  ACCESSORY_HAT: 16
};

// Enhanced Asset interface with the new metadata and positioning
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  subType?: AssetSubType;
  style: AssetStyle;
  url: string;
  thumbnailUrl: string;
  tags: string[];
  colors: string[];
  dateCreated: string;
  dateModified: string;
  metadata?: AssetMetadata;
  positioning?: {
    suggestedX: number;
    suggestedY: number;
    suggestedScale: number;
    anchorPoints?: AssetAnchorPoints;
    alignTo?: Array<{
      assetType: AssetType;
      anchorPoint: keyof AssetAnchorPoints;
      targetAnchorPoint: keyof AssetAnchorPoints;
      offset?: { x: number; y: number };
    }>;
  };
  zIndex?: number;
  version?: string;
}

// Asset compatibility rule
export interface CompatibilityRule {
  assetType: AssetType;
  subType?: AssetSubType;
  conflicts: Array<{
    type: AssetType;
    subType?: AssetSubType;
  }>;
  requires?: Array<{
    type: AssetType;
    subType?: AssetSubType;
  }>;
}

// Asset upload progress tracking
export interface UploadProgress {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  previewUrl?: string;
}

// Canvas object representation
export interface CanvasObject {
  id: string;
  assetId: string;
  type: AssetType;
  subType?: AssetSubType;
  url: string;
  zIndex: number;
  position: {
    x: number;
    y: number;
  };
  scale: {
    x: number;
    y: number;
  };
  angle: number;
  metadata?: AssetMetadata;
  anchorPoints?: AssetAnchorPoints;
}

// AI generation options
export interface AIGenerationOptions {
  assetType: AssetType;
  assetSubType?: AssetSubType;
  style: AssetStyle;
  prompt?: string;
  baseDollId: string;
  targetAnchorPoints?: string[]; // Which anchor points to focus on
}

// AI generated asset
export interface AIGeneratedAsset extends Asset {
  originalPrompt: string;
  basedOnAssetId: string;
}

// Saved character layer
export interface CharacterLayer {
  id: string;
  name: string;
  type: AssetType;
  subType?: AssetSubType;
  visible: boolean;
  locked: boolean;
  assetId: string | null;
  position: {
    x: number;
    y: number;
  };
  scale: {
    x: number;
    y: number;
  };
  angle: number;
  zIndex: number;
  metadata?: AssetMetadata;
}

// Saved character
export interface SavedCharacter {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  layers: CharacterLayer[];
  dateCreated: string;
  dateModified: string;
  tags?: string[];
}

// Saved character preview (for listings)
export interface SavedCharacterPreview {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  layerCount: number;
  dateCreated: string;
  dateModified: string;
  tags?: string[];
}
