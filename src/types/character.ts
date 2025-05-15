
import { AssetType, AssetSubType, AssetAnchorPoints } from './assets';
import { AssetMetadata } from './metadata';

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
  anchorPoints?: AssetAnchorPoints;
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
