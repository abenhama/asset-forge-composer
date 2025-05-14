
import { useState, useCallback } from 'react';
import { Canvas, Object as FabricObject } from 'fabric';
import { ObjectProperties } from './types';

export const useObjectManagement = (fabricCanvas: Canvas | null) => {
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [objectProperties, setObjectProperties] = useState<ObjectProperties>({
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    angle: 0
  });

  // Update object properties when selected or modified
  const updateObjectProperties = useCallback((obj: FabricObject) => {
    if (!obj) return;

    setObjectProperties({
      position: { 
        x: Math.round(obj.left || 0), 
        y: Math.round(obj.top || 0) 
      },
      scale: { 
        x: obj.scaleX || 1, 
        y: obj.scaleY || 1 
      },
      angle: Math.round(obj.angle || 0)
    });
  }, []);

  // Handle object selection
  const handleObjectSelection = useCallback((e: any) => {
    if (!e.selected || e.selected.length === 0) {
      setSelectedObject(null);
      return null;
    }
    
    const obj = e.selected[0];
    setSelectedObject(obj);
    updateObjectProperties(obj);
    
    return obj;
  }, [updateObjectProperties]);

  // Update object position
  const updateObjectPosition = useCallback((x: number, y: number) => {
    if (!selectedObject || !fabricCanvas) return;
    
    selectedObject.set({ left: x, top: y });
    fabricCanvas.renderAll();
    setObjectProperties(prev => ({
      ...prev,
      position: { x, y }
    }));
  }, [fabricCanvas, selectedObject]);

  // Update object scale
  const updateObjectScale = useCallback((x: number, y: number) => {
    if (!selectedObject || !fabricCanvas) return;
    
    selectedObject.set({ scaleX: x, scaleY: y });
    fabricCanvas.renderAll();
    setObjectProperties(prev => ({
      ...prev,
      scale: { x, y }
    }));
  }, [fabricCanvas, selectedObject]);

  // Update object angle
  const updateObjectAngle = useCallback((angle: number) => {
    if (!selectedObject || !fabricCanvas) return;
    
    selectedObject.set({ angle });
    fabricCanvas.renderAll();
    setObjectProperties(prev => ({
      ...prev,
      angle
    }));
  }, [fabricCanvas, selectedObject]);

  return {
    selectedObject,
    setSelectedObject,
    objectProperties,
    updateObjectProperties,
    handleObjectSelection,
    updateObjectPosition,
    updateObjectScale,
    updateObjectAngle
  };
};
