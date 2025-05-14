
import { useState, useCallback } from 'react';
import { Canvas, Object as FabricObject } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { Layer } from './types';

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

  // Add a new layer
  const addLayer = useCallback((name: string, type: string, object: FabricObject) => {
    const newLayer: Layer = {
      id: uuidv4(),
      name,
      type,
      visible: true,
      locked: false,
      object
    };

    setLayers(prev => [...prev, newLayer]);
    setActiveLayer(newLayer.id);
    
    return newLayer;
  }, []);

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
    clearLayers,
  };
};
