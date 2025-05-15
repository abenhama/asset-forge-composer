
import { Asset, AssetType, AssetSubType, AssetStyle } from './assets';

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
