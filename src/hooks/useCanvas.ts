
import { useEffect } from 'react';
import { useCanvasInitialization } from '@/features/canvas/useCanvasInitialization';
import { useLayerManagement } from '@/features/canvas/useLayerManagement';
import { useObjectManagement } from '@/features/canvas/useObjectManagement';
import { useAssetManagement } from '@/features/canvas/useAssetManagement';
import { useCanvasOperations } from '@/features/canvas/useCanvasOperations';
import { Asset } from '@/types';

export const useCanvas = (width: number = 500, height: number = 600) => {
  // Initialize canvas
  const { canvasRef, fabricCanvas } = useCanvasInitialization(width, height);
  
  // Layer management
  const { 
    layers, 
    activeLayer, 
    setActiveLayer,
    selectLayer, 
    toggleLayerVisibility, 
    toggleLayerLock, 
    deleteLayer, 
    moveLayer, 
    addLayer,
    clearLayers 
  } = useLayerManagement(fabricCanvas);
  
  // Object management
  const { 
    selectedObject, 
    setSelectedObject,
    objectProperties, 
    updateObjectProperties, 
    handleObjectSelection,
    updateObjectPosition, 
    updateObjectScale, 
    updateObjectAngle 
  } = useObjectManagement(fabricCanvas);
  
  // Asset management
  const { 
    selectedBaseDoll, 
    setSelectedBaseDoll, 
    addAssetToCanvas 
  } = useAssetManagement(fabricCanvas, addLayer, setSelectedObject, updateObjectProperties);
  
  // Canvas operations
  const { 
    clearCanvas, 
    downloadCanvas, 
    zoomCanvas, 
    saveCharacter 
  } = useCanvasOperations(fabricCanvas, layers, clearLayers, setSelectedBaseDoll, setSelectedObject);

  // Set up event listeners
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on('selection:created', (e) => {
      const obj = handleObjectSelection(e);
      if (obj) {
        const layer = layers.find(layer => layer.object === obj);
        if (layer) {
          setActiveLayer(layer.id);
        }
      }
    });
    
    fabricCanvas.on('selection:updated', (e) => {
      const obj = handleObjectSelection(e);
      if (obj) {
        const layer = layers.find(layer => layer.object === obj);
        if (layer) {
          setActiveLayer(layer.id);
        }
      }
    });
    
    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setActiveLayer(null);
    });

    fabricCanvas.on('object:modified', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    fabricCanvas.on('object:moving', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    fabricCanvas.on('object:scaling', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    fabricCanvas.on('object:rotating', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    return () => {
      fabricCanvas.off();
    };
  }, [fabricCanvas, handleObjectSelection, layers, setActiveLayer, updateObjectProperties, setSelectedObject]);

  return {
    canvasRef,
    fabricCanvas,
    layers,
    activeLayer,
    selectedObject,
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
    updateObjectAngle,
    setSelectedBaseDoll,
    saveCharacter
  };
};
