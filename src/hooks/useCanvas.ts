
import { useEffect } from 'react';
import { useCanvasInitialization } from '@/features/canvas/useCanvasInitialization';
import { useLayerManagement } from '@/features/canvas/useLayerManagement';
import { useObjectManagement } from '@/features/canvas/useObjectManagement';
import { useAssetManagement } from '@/features/canvas/useAssetManagement';
import { useCanvasOperations } from '@/features/canvas/useCanvasOperations';

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

    const handleSelectionCreated = (e: any) => {
      const obj = handleObjectSelection(e);
      if (obj) {
        const layer = layers.find(layer => layer.object === obj);
        if (layer) {
          setActiveLayer(layer.id);
        }
      }
    };
    
    const handleSelectionUpdated = (e: any) => {
      const obj = handleObjectSelection(e);
      if (obj) {
        const layer = layers.find(layer => layer.object === obj);
        if (layer) {
          setActiveLayer(layer.id);
        }
      }
    };
    
    const handleSelectionCleared = () => {
      setSelectedObject(null);
      setActiveLayer(null);
    };

    const handleObjectModified = (e: any) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    };

    fabricCanvas.on('selection:created', handleSelectionCreated);
    fabricCanvas.on('selection:updated', handleSelectionUpdated);
    fabricCanvas.on('selection:cleared', handleSelectionCleared);
    fabricCanvas.on('object:modified', handleObjectModified);
    fabricCanvas.on('object:moving', handleObjectModified);
    fabricCanvas.on('object:scaling', handleObjectModified);
    fabricCanvas.on('object:rotating', handleObjectModified);

    return () => {
      fabricCanvas.off('selection:created', handleSelectionCreated);
      fabricCanvas.off('selection:updated', handleSelectionUpdated);
      fabricCanvas.off('selection:cleared', handleSelectionCleared);
      fabricCanvas.off('object:modified', handleObjectModified);
      fabricCanvas.off('object:moving', handleObjectModified);
      fabricCanvas.off('object:scaling', handleObjectModified);
      fabricCanvas.off('object:rotating', handleObjectModified);
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
