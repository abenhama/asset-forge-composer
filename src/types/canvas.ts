
import { Canvas, Object as FabricObject } from 'fabric';
import { Asset, AssetType } from './index';

export interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  object: FabricObject;
}

export interface CanvasProps {
  width?: number;
  height?: number;
  onObjectSelected?: (object: FabricObject | null) => void;
  onObjectModified?: (object: FabricObject) => void;
}

export interface ObjectProperties {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  angle: number;
}
