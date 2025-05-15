
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
