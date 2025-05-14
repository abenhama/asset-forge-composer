
import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Crop, ZoomIn, ZoomOut, RotateCw, Save } from 'lucide-react';

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  open,
  onOpenChange,
  imageUrl,
  onCropComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });

  // Charger l'image
  useEffect(() => {
    if (!open || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      
      // Réinitialiser les états
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      
      // Ajuster la taille du canvas
      const maxSize = 400;
      const ratio = img.width / img.height;
      let width = maxSize;
      let height = maxSize;
      
      if (ratio > 1) {
        height = width / ratio;
      } else {
        width = height * ratio;
      }
      
      setCanvasSize({ width, height });
    };
    img.onerror = () => {
      console.error("Erreur lors du chargement de l'image");
    };
    img.src = imageUrl;
  }, [open, imageUrl]);

  // Dessiner l'image sur le canvas
  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sauvegarder l'état
    ctx.save();
    
    // Déplacer le point de référence au centre
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Mise à l'échelle
    ctx.scale(scale, scale);
    
    // Déplacer l'image
    ctx.translate(position.x / scale, position.y / scale);
    
    // Dessiner l'image centrée
    ctx.drawImage(
      image, 
      -image.width / 2, 
      -image.height / 2, 
      image.width, 
      image.height
    );
    
    // Restaurer l'état
    ctx.restore();
    
  }, [image, scale, rotation, position]);

  // Gestion du zoom
  const handleZoom = (zoomIn: boolean) => {
    setScale(prev => {
      const newScale = zoomIn ? prev * 1.1 : prev / 1.1;
      return Math.max(0.1, Math.min(3, newScale));
    });
  };

  // Gestion de la rotation
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Gestion du déplacement (drag)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Sauvegarder l'image recadrée
  const handleSave = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const croppedImageUrl = canvas.toDataURL('image/png');
    onCropComplete(croppedImageUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Recadrer l'image</DialogTitle>
          <DialogDescription>
            Ajustez l'image pour améliorer la transparence et le positionnement.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          <div 
            className="bg-secondary/30 rounded-lg overflow-hidden"
            style={{ 
              width: canvasSize.width, 
              height: canvasSize.height,
              backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xOdTWsmQAAAAbSURBVDhPY/j//z8DJYCJgUIwasCoAcMHAAYGABMGK5e0YUkdAAAAAElFTkSuQmCC")',
              backgroundRepeat: 'repeat'
            }}
          >
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ZoomIn className="w-4 h-4" />
                <span className="text-sm font-medium">Zoom: {Math.round(scale * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleZoom(false)}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Slider
                  value={[scale * 100]}
                  min={10}
                  max={300}
                  step={5}
                  className="flex-1"
                  onValueChange={([value]) => setScale(value / 100)}
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleZoom(true)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RotateCw className="w-4 h-4" />
                <span className="text-sm font-medium">Rotation: {rotation}°</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRotate}
                >
                  <RotateCw className="h-4 w-4 mr-1" />
                  Tourner 90°
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
