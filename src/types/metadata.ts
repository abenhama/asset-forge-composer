
import { SkinTone, HairColor } from './enums';

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
