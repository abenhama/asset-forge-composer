
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { RotateCw, MoveHorizontal, MoveVertical, Maximize } from 'lucide-react';

interface ObjectControlsProps {
  isVisible: boolean;
  position: { x: number; y: number };
  scale: { x: number; y: number };
  angle: number;
  onPositionChange: (x: number, y: number) => void;
  onScaleChange: (x: number, y: number) => void;
  onAngleChange: (angle: number) => void;
}

const ObjectControls: React.FC<ObjectControlsProps> = ({
  isVisible,
  position,
  scale,
  angle,
  onPositionChange,
  onScaleChange,
  onAngleChange
}) => {
  if (!isVisible) return null;

  return (
    <div className="p-3 border rounded-md space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MoveHorizontal className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="position-x">Position X</Label>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="position-x"
            type="number"
            value={Math.round(position.x)}
            onChange={(e) => onPositionChange(parseInt(e.target.value), position.y)}
            className="w-20"
          />
          <Slider
            value={[position.x]}
            min={0}
            max={500}
            step={1}
            className="flex-1"
            onValueChange={([x]) => onPositionChange(x, position.y)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MoveVertical className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="position-y">Position Y</Label>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="position-y"
            type="number"
            value={Math.round(position.y)}
            onChange={(e) => onPositionChange(position.x, parseInt(e.target.value))}
            className="w-20"
          />
          <Slider
            value={[position.y]}
            min={0}
            max={600}
            step={1}
            className="flex-1"
            onValueChange={([y]) => onPositionChange(position.x, y)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Maximize className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="scale">Taille</Label>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="scale"
            type="number"
            value={(scale.x * 100).toFixed(0)}
            onChange={(e) => {
              const value = parseInt(e.target.value) / 100;
              onScaleChange(value, value);
            }}
            className="w-20"
            min="10"
            max="200"
            step="5"
          />
          <span className="text-xs">%</span>
          <Slider
            value={[scale.x * 100]}
            min={10}
            max={200}
            step={5}
            className="flex-1"
            onValueChange={([value]) => {
              const scaleFactor = value / 100;
              onScaleChange(scaleFactor, scaleFactor);
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="rotation">Rotation</Label>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="rotation"
            type="number"
            value={Math.round(angle)}
            onChange={(e) => onAngleChange(parseInt(e.target.value))}
            className="w-20"
            min="0"
            max="360"
            step="5"
          />
          <span className="text-xs">°</span>
          <Slider
            value={[angle]}
            min={0}
            max={360}
            step={5}
            className="flex-1"
            onValueChange={([value]) => onAngleChange(value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ObjectControls;
