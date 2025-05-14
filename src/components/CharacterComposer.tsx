
import React, { useState } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import AIGenerationModal from './AIGenerationModal';
import LayersPanel from './LayersPanel';
import ObjectControls from './ObjectControls';
import CanvasControls from './CanvasControls';
import AssetsSidebar from './AssetsSidebar';
import { toast } from 'sonner';

const CharacterComposer: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  const {
    canvasRef,
    layers,
    activeLayer,
    objectProperties,
    selectedBaseDoll,
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
    updateObjectAngle
  } = useCanvas(500, 600);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Panel - Canvas */}
      <div className="flex-1 flex flex-col p-6 overflow-auto border-r">
        <h2 className="text-2xl font-bold mb-6">Compositeur de Personnages</h2>
        
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
      <AssetsSidebar onSelectAsset={addAssetToCanvas} />

      {/* Modal de génération d'IA */}
      <AIGenerationModal 
        open={showAIModal} 
        onOpenChange={setShowAIModal}
        baseDoll={selectedBaseDoll}
        onGenerate={(assetType) => {
          setIsGenerating(true);
          // Simulation d'une génération IA
          setTimeout(() => {
            setIsGenerating(false);
            setShowAIModal(false);
            toast.success(`Asset ${assetType} généré avec succès!`);
            // Dans une implémentation réelle, on ajouterait l'asset généré au canvas ici
          }, 2000);
        }}
      />
    </div>
  );
};

export default CharacterComposer;
