
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
