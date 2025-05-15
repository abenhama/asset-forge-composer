
import { useCallback } from 'react';
import { Canvas } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Layer } from './types';
import { getAssetZIndex } from '@/utils/assetLayerUtils';

export const useCanvasOperations = (
  fabricCanvas: Canvas | null,
  layers: Layer[],
  clearLayers: () => void,
  setSelectedBaseDoll: (doll: any) => void,
  setSelectedObject: (obj: any) => void
) => {
  // Clear the canvas
  const clearCanvas = useCallback(() => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#f8f9fa';
    fabricCanvas.renderAll();
    setSelectedBaseDoll(null);
    clearLayers();
    setSelectedObject(null);
    toast("Canvas effacé", {
      description: "Tous les assets ont été supprimés du canvas.",
    });
  }, [fabricCanvas, clearLayers, setSelectedBaseDoll, setSelectedObject]);

  // Download the canvas
  const downloadCanvas = useCallback(() => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    
    const link = document.createElement('a');
    link.download = 'character-composition.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Téléchargement réussi", {
      description: "Votre composition a été téléchargée.",
    });
  }, [fabricCanvas]);

  // Zoom the canvas
  const zoomCanvas = useCallback((zoomIn: boolean) => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom();
    const newZoom = zoomIn ? zoom * 1.1 : zoom * 0.9;
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  }, [fabricCanvas]);

  // Save character
  const saveCharacter = useCallback((name: string, description?: string) => {
    if (!fabricCanvas) return null;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    
    const layerData = layers.map(layer => {
      // Déterminer le type d'asset et sous-type si disponible
      const assetType = (layer.object as any).data?.assetType || layer.type;
      const assetSubType = (layer.object as any).data?.assetSubType;
      const anchorPoints = (layer.object as any).data?.anchorPoints;
      
      // Obtenir le zIndex approprié basé sur le type et sous-type
      // Utiliser soit la valeur zIndex stockée, soit calculer en fonction du type
      const zIndex = (layer.object as any).data?.zIndex || 
                     getAssetZIndex(assetType, assetSubType);
      
      return {
        id: layer.id,
        name: layer.name,
        type: assetType,
        subType: assetSubType,
        visible: layer.visible,
        locked: layer.locked,
        assetId: (layer.object as any).data?.assetId || null,
        position: {
          x: layer.object.left || 0,
          y: layer.object.top || 0
        },
        scale: {
          x: layer.object.scaleX || 1,
          y: layer.object.scaleY || 1
        },
        angle: layer.object.angle || 0,
        zIndex: zIndex,
        anchorPoints: anchorPoints
      };
    });
    
    const character = {
      id: uuidv4(),
      name,
      description: description || '',
      thumbnail: dataURL,
      layers: layerData,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    
    return character;
  }, [fabricCanvas, layers]);

  return {
    clearCanvas,
    downloadCanvas,
    zoomCanvas,
    saveCharacter
  };
};
