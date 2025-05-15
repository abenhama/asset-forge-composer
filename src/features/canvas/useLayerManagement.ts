
import { useState, useCallback } from 'react';
import { Canvas, Object as FabricObject } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { Layer } from '@/types/canvas';
import { toast } from 'sonner';
import { getAssetZIndex } from '@/utils/assetLayerUtils';
import { checkAssetCompatibility } from '@/utils/assetLayerUtils';

export const useLayerManagement = (fabricCanvas: Canvas | null) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  // Select a layer
  const selectLayer = useCallback((id: string) => {
    const layer = layers.find(layer => layer.id === id);
    if (!layer || !fabricCanvas) return;

    setActiveLayer(id);
    fabricCanvas.setActiveObject(layer.object);
    fabricCanvas.renderAll();
  }, [fabricCanvas, layers]);

  // Toggle layer visibility
  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers(layers.map(layer => {
      if (layer.id === id) {
        const newVisible = !layer.visible;
        layer.object.visible = newVisible;
        fabricCanvas?.renderAll();
        return { ...layer, visible: newVisible };
      }
      return layer;
    }));
  }, [fabricCanvas, layers]);

  // Toggle layer lock
  const toggleLayerLock = useCallback((id: string) => {
    setLayers(layers.map(layer => {
      if (layer.id === id) {
        const newLocked = !layer.locked;
        layer.object.selectable = !newLocked;
        layer.object.evented = !newLocked;
        fabricCanvas?.renderAll();
        return { ...layer, locked: newLocked };
      }
      return layer;
    }));
  }, [fabricCanvas, layers]);

  // Delete a layer
  const deleteLayer = useCallback((id: string) => {
    const layer = layers.find(layer => layer.id === id);
    if (layer && fabricCanvas) {
      fabricCanvas.remove(layer.object);
      setLayers(layers.filter(l => l.id !== id));
      
      if (activeLayer === id) {
        setActiveLayer(null);
      }
    }
  }, [activeLayer, fabricCanvas, layers]);

  // Move a layer
  const moveLayer = useCallback((id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(layer => layer.id === id);
    if (index === -1) return;

    const newLayers = [...layers];
    let newIndex;

    if (direction === 'up' && index < newLayers.length - 1) {
      newIndex = index + 1;
    } else if (direction === 'down' && index > 0) {
      newIndex = index - 1;
    } else {
      return;
    }
    
    // Get z-index info for both layers
    const currentLayer = newLayers[index];
    const targetLayer = newLayers[newIndex];
    const currentZIndex = (currentLayer.object as any).data?.zIndex || 0;
    const targetZIndex = (targetLayer.object as any).data?.zIndex || 0;
    
    // If we're trying to move an object with a lower z-index above an object with a higher z-index
    // (or vice versa), warn the user but still allow it
    if ((direction === 'up' && currentZIndex < targetZIndex) || 
        (direction === 'down' && currentZIndex > targetZIndex)) {
      toast.warning("Attention", {
        description: "Cet ordre de calques n'est pas standard et pourrait causer des problèmes d'affichage.",
      });
    }

    // Swap layers
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    
    // Update order in canvas
    if (fabricCanvas) {
      const obj1 = newLayers[index].object;
      
      // Use the correct Fabric.js v6 methods
      if (direction === 'up') {
        // Move object forward in stacking order
        fabricCanvas.bringObjectForward(obj1);
      } else {
        // Move object backward in stacking order
        fabricCanvas.sendObjectBackwards(obj1);
      }
      
      fabricCanvas.renderAll();
    }
    
    setLayers(newLayers);
  }, [fabricCanvas, layers]);

  // Add a new layer with proper z-index ordering
  const addLayer = useCallback((name: string, type: string, object: FabricObject) => {
    // Get z-index from object metadata if it exists
    const zIndex = (object as any).data?.zIndex || 0;
    
    // Check compatibility with existing layers
    if ((object as any).data?.assetType) {
      // Get incompatible layers
      const incompatibleLayers = layers.filter(existingLayer => {
        if (!(existingLayer.object as any).data?.assetType) return false;
        
        const compatibility = checkAssetCompatibility(
          {
            type: (object as any).data.assetType,
            subType: (object as any).data.assetSubType,
          },
          {
            type: (existingLayer.object as any).data.assetType,
            subType: (existingLayer.object as any).data.assetSubType,
          }
        );
        
        return !compatibility.compatible;
      });
      
      // If incompatible layers found, show warning to user
      if (incompatibleLayers.length > 0) {
        const conflictNames = incompatibleLayers.map(layer => layer.name).join(', ');
        
        toast.warning("Conflits de compatibilité détectés", {
          description: `"${name}" pourrait être incompatible avec: ${conflictNames}`,
          action: {
            label: "Plus d'infos",
            onClick: () => {
              toast.info("Conseil", {
                description: "Certains éléments peuvent se chevaucher ou ne pas s'afficher correctement ensemble."
              });
            },
          },
        });
      }
    }
    
    const newLayer: Layer = {
      id: uuidv4(),
      name,
      type,
      visible: true,
      locked: false,
      object
    };

    // Insert the new layer at the correct position based on z-index
    setLayers(prev => {
      const newLayers = [...prev];
      
      // Find the right position to insert the new layer based on z-index
      let insertIndex = newLayers.length;
      for (let i = 0; i < newLayers.length; i++) {
        const layerZIndex = (newLayers[i].object as any).data?.zIndex || 0;
        if (zIndex < layerZIndex) {
          insertIndex = i;
          break;
        }
      }
      
      // Insert the new layer at the correct position
      newLayers.splice(insertIndex, 0, newLayer);
      return newLayers;
    });
    
    setActiveLayer(newLayer.id);
    
    return newLayer;
  }, [layers]);

  // Sort layers by z-index
  const sortLayersByZIndex = useCallback(() => {
    setLayers(prev => {
      // Create a copy of the layers array
      const sortedLayers = [...prev];
      
      // Sort the layers by z-index
      sortedLayers.sort((a, b) => {
        const aZIndex = (a.object as any).data?.zIndex || 0;
        const bZIndex = (b.object as any).data?.zIndex || 0;
        return aZIndex - bZIndex;
      });
      
      // If canvas is available, reorder the objects as well
      if (fabricCanvas) {
        // Temporarily remove objects from canvas
        const objects = sortedLayers.map(layer => layer.object);
        fabricCanvas.remove(...objects);
        
        // Add them back in the correct order
        objects.forEach(obj => {
          fabricCanvas.add(obj);
        });
        
        fabricCanvas.renderAll();
      }
      
      return sortedLayers;
    });
  }, [fabricCanvas]);

  // Clear all layers
  const clearLayers = useCallback(() => {
    setLayers([]);
    setActiveLayer(null);
  }, []);

  return {
    layers,
    activeLayer,
    setActiveLayer,
    selectLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    deleteLayer,
    moveLayer,
    addLayer,
    sortLayersByZIndex,
    clearLayers,
  };
};
