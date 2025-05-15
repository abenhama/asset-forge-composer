
import React, { useState } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import AIGenerationModal from './AIGenerationModal';
import LayersPanel from './LayersPanel';
import ObjectControls from './ObjectControls';
import CanvasControls from './CanvasControls';
import AssetsSidebar from './AssetsSidebar';
import CharacterSaveModal from './CharacterSaveModal';
import { SavedCharacter, Asset } from '@/types';
import { storageService } from '@/utils/storageService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

const CharacterComposer: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tempThumbnail, setTempThumbnail] = useState<string | undefined>(undefined);
  
  const {
    canvasRef,
    layers,
    activeLayer,
    objectProperties,
    selectedBaseDoll,
    canvasAssets,
    addAssetToCanvas,
    clearCanvas,
    downloadCanvas,
    zoomCanvas,
    selectLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    deleteLayer,
    moveLayer,
    updateObjectPosition,
    updateObjectScale,
    updateObjectAngle,
    saveCharacter
  } = useCanvas(500, 600);

  const handleSaveClick = () => {
    if (layers.length === 0) {
      toast("Aucun élément à sauvegarder", {
        description: "Ajoutez d'abord des éléments à votre personnage.",
      });
      return;
    }

    // Capture the current canvas thumbnail for the save modal
    if (canvasRef.current) {
      setTempThumbnail(canvasRef.current.toDataURL());
    }
    
    setShowSaveModal(true);
  };

  const handleSaveCharacter = (name: string, description: string): SavedCharacter | null => {
    const character = saveCharacter(name, description);
    
    if (character) {
      storageService.saveCharacter(character);
      return character;
    }
    
    return null;
  };

  const handleGeneratedAsset = (asset: Asset) => {
    setIsGenerating(true);
    
    try {
      // Sauvegarder l'asset généré
      storageService.saveAsset(asset);
      
      // Ajouter l'asset au canvas
      addAssetToCanvas(asset);
      
      toast.success("Asset ajouté", {
        description: "L'asset généré a été ajouté à votre canvas et sauvegardé dans votre bibliothèque."
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'asset:", error);
      toast.error("Erreur", {
        description: "Une erreur s'est produite lors de l'ajout de l'asset au canvas."
      });
    } finally {
      setIsGenerating(false);
      setShowAIModal(false);
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Panel - Canvas */}
      <div className="flex-1 flex flex-col p-6 overflow-auto border-r">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Compositeur de Personnages</h2>
          <Button onClick={handleSaveClick} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
        
        <CanvasControls
          onZoomIn={() => zoomCanvas(true)}
          onZoomOut={() => zoomCanvas(false)}
          onClear={clearCanvas}
          onDownload={downloadCanvas}
          onGenerateAI={() => setShowAIModal(true)}
          selectedBaseDoll={selectedBaseDoll}
          isGenerating={isGenerating}
        />
        
        <ResizablePanelGroup direction="vertical" className="flex-1">
          <ResizablePanel defaultSize={70} className="flex items-center justify-center bg-secondary/50 rounded-lg overflow-hidden border">
            <canvas ref={canvasRef} />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30} className="bg-card rounded-lg border">
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold mb-2">Propriétés</h3>
              
              {/* Panneau de calques */}
              <LayersPanel 
                layers={layers}
                activeLayer={activeLayer}
                onSelectLayer={selectLayer}
                onToggleVisibility={toggleLayerVisibility}
                onToggleLock={toggleLayerLock}
                onDeleteLayer={deleteLayer}
                onMoveLayer={moveLayer}
              />
              
              {/* Contrôles de l'objet sélectionné */}
              <ObjectControls 
                isVisible={!!objectProperties.position.x || !!objectProperties.position.y}
                position={objectProperties.position}
                scale={objectProperties.scale}
                angle={objectProperties.angle}
                onPositionChange={updateObjectPosition}
                onScaleChange={updateObjectScale}
                onAngleChange={updateObjectAngle}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {/* Right Panel - Assets */}
      <AssetsSidebar 
        onSelectAsset={addAssetToCanvas} 
        currentAssets={canvasAssets}
      />

      {/* Modal de génération d'IA */}
      <AIGenerationModal 
        open={showAIModal} 
        onOpenChange={setShowAIModal}
        baseDoll={selectedBaseDoll}
        onGenerate={handleGeneratedAsset}
      />
      
      {/* Modal de sauvegarde du personnage */}
      <CharacterSaveModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        onSave={handleSaveCharacter}
        thumbnail={tempThumbnail}
      />
    </div>
  );
};

export default CharacterComposer;
