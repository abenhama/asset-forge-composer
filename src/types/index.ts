export type AssetType = 'base-doll' | 'hair' | 'clothing' | 'accessory' | 'facial-hair';

export type AssetStyle = 'cartoon' | 'realistic' | 'anime';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  style: AssetStyle;
  url: string;
  thumbnailUrl: string;
  tags: string[];
  colors: string[];
  dateCreated: string;
  dateModified: string;
  positioning?: {
    suggestedX: number;
    suggestedY: number;
    suggestedScale: number;
  };
}

export interface UploadProgress {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  previewUrl?: string;
}

export interface CanvasObject {
  id: string;
  assetId: string;
  type: AssetType;
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
}

export interface AIGenerationOptions {
  assetType: AssetType;
  style: AssetStyle;
  prompt?: string;
  baseDollId: string;
}

export interface AIGeneratedAsset extends Asset {
  originalPrompt: string;
  basedOnAssetId: string;
}

export interface SavedCharacter {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  layers: {
    id: string;
    name: string;
    type: string;
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
  }[];
  dateCreated: string;
  dateModified: string;
}

export interface SavedCharacterPreview {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  layerCount: number;
  dateCreated: string;
  dateModified: string;
}
