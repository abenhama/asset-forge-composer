
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Trash, ZoomIn, ZoomOut, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Asset } from '@/types';

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onClear: () => void;
  onDownload: () => void;
  onGenerateAI: () => void;
  selectedBaseDoll: Asset | null;
  isGenerating: boolean;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onClear,
  onDownload,
  onGenerateAI,
  selectedBaseDoll,
  isGenerating
}) => {
  const handleGenerateAssets = () => {
    if (!selectedBaseDoll) {
      toast("Erreur", {
        description: "Veuillez d'abord ajouter un personnage de base au canvas."
      });
      return;
    }
    onGenerateAI();
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4 mr-1" />
          Zoom +
        </Button>
        <Button variant="outline" size="sm" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4 mr-1" />
          Zoom -
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onClear}>
          <Trash className="h-4 w-4 mr-1" />
          Effacer
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateAssets}
          disabled={!selectedBaseDoll || isGenerating}
        >
          <Wand2 className="h-4 w-4 mr-1" />
          Générer avec IA
        </Button>
        <Button size="sm" onClick={onDownload}>
          <Download className="h-4 w-4 mr-1" />
          Télécharger
        </Button>
      </div>
    </div>
  );
};

export default CanvasControls;
