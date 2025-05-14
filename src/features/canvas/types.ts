
import { Canvas, Object as FabricObject } from 'fabric';
import { Asset, AssetType } from '@/types';

export interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  object: FabricObject;
}

export interface ObjectProperties {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  angle: number;
}

export interface SavedLayer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  assetId: string | null;
  position: { x: number; y: number };
  scale: { x: number; y: number };
  angle: number;
}

export interface CanvasState {
  layers: Layer[];
  activeLayer: string | null;
  selectedObject: FabricObject | null;
  objectProperties: ObjectProperties;
  selectedBaseDoll: Asset | null;
}
