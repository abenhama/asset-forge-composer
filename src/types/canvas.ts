
import { Asset, AssetType, AssetSubType, AssetAnchorPoints } from './assets';
import { AssetMetadata } from './metadata';

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
