
import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Image as FabricImage, Object as FabricObject } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Asset, AssetType } from '@/types';
import { Layer, ObjectProperties } from '@/types/canvas';

export const useCanvas = (width: number = 500, height: number = 600) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [objectProperties, setObjectProperties] = useState<ObjectProperties>({
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    angle: 0
  });
  const [selectedBaseDoll, setSelectedBaseDoll] = useState<Asset | null>(null);

  // Initialiser le canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#f8f9fa',
    });

    canvas.on('selection:created', (e) => handleObjectSelection(e));
    canvas.on('selection:updated', (e) => handleObjectSelection(e));
    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setActiveLayer(null);
    });

    canvas.on('object:modified', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    canvas.on('object:moving', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    canvas.on('object:scaling', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    canvas.on('object:rotating', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  // Mettre à jour les propriétés d'un objet sélectionné
  const updateObjectProperties = useCallback((obj: FabricObject) => {
    if (!obj) return;

    setObjectProperties({
      position: { 
        x: obj.left || 0, 
        y: obj.top || 0 
      },
      scale: { 
        x: obj.scaleX || 1, 
        y: obj.scaleY || 1 
      },
      angle: obj.angle || 0
    });
  }, []);

  // Gérer la sélection d'un objet
  const handleObjectSelection = useCallback((e: any) => {
    if (!e.selected || e.selected.length === 0) return;
    
    const obj = e.selected[0];
    setSelectedObject(obj);
    updateObjectProperties(obj);
    
    const layer = layers.find(layer => layer.object === obj);
    if (layer) {
      setActiveLayer(layer.id);
    }
  }, [layers, updateObjectProperties]);

  // Ajouter un asset au canvas
  const addAssetToCanvas = useCallback(async (asset: Asset) => {
    if (!fabricCanvas) return;

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        imgElement.src = asset.url;
        imgElement.onload = () => resolve(imgElement);
        imgElement.onerror = reject;
      });

      const fabricImage = new FabricImage(img, {
        left: 150,
        top: 150,
        scaleX: 0.5,
        scaleY: 0.5,
      });

      // Ajouter des métadonnées à l'objet
      (fabricImage as any).data = {
        assetId: asset.id,
        assetType: asset.type,
      };

      fabricCanvas.add(fabricImage);
      fabricCanvas.setActiveObject(fabricImage);
      fabricCanvas.renderAll();

      // Si l'asset est un base-doll, le stocker pour la génération d'IA
      if (asset.type === 'base-doll') {
        setSelectedBaseDoll(asset);
      }

      // Créer un nouveau calque
      const newLayer: Layer = {
        id: uuidv4(),
        name: asset.name,
        type: asset.type,
        visible: true,
        locked: false,
        object: fabricImage
      };

      setLayers(prev => [...prev, newLayer]);
      setActiveLayer(newLayer.id);
      setSelectedObject(fabricImage);
      updateObjectProperties(fabricImage);

      toast("Asset ajouté", {
        description: `${asset.name} a été ajouté au canvas.`,
      });
    } catch (error) {
      console.error("Erreur lors du chargement de l'image:", error);
      toast("Erreur", {
        description: "Impossible d'ajouter l'asset au canvas.",
      });
    }
  }, [fabricCanvas, updateObjectProperties]);

  // Effacer le canvas
  const clearCanvas = useCallback(() => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#f8f9fa';
    fabricCanvas.renderAll();
    setSelectedBaseDoll(null);
    setLayers([]);
    setActiveLayer(null);
    setSelectedObject(null);
    toast("Canvas effacé", {
      description: "Tous les assets ont été supprimés du canvas.",
    });
  }, [fabricCanvas]);

  // Télécharger le canvas
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

  // Zoomer sur le canvas
  const zoomCanvas = useCallback((zoomIn: boolean) => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom();
    fabricCanvas.setZoom(zoomIn ? zoom * 1.1 : zoom * 0.9);
  }, [fabricCanvas]);

  // Sélectionner un calque
  const selectLayer = useCallback((id: string) => {
    const layer = layers.find(layer => layer.id === id);
    if (!layer || !fabricCanvas) return;

    setActiveLayer(id);
    fabricCanvas.setActiveObject(layer.object);
    fabricCanvas.renderAll();
    
    setSelectedObject(layer.object);
    updateObjectProperties(layer.object);
  }, [fabricCanvas, layers, updateObjectProperties]);

  // Basculer la visibilité d'un calque
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

  // Verrouiller/déverrouiller un calque
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

  // Supprimer un calque
  const deleteLayer = useCallback((id: string) => {
    const layer = layers.find(layer => layer.id === id);
    if (layer && fabricCanvas) {
      fabricCanvas.remove(layer.object);
      setLayers(layers.filter(l => l.id !== id));
      
      if (activeLayer === id) {
        setActiveLayer(null);
        setSelectedObject(null);
      }
    }
  }, [activeLayer, fabricCanvas, layers]);

  // Déplacer un calque
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

    // Échanger les calques
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    
    // Mettre à jour l'ordre dans le canvas si nécessaire
    if (fabricCanvas) {
      const obj1 = newLayers[index].object;
      const obj2 = newLayers[newIndex].object;
      
      if (direction === 'up') {
        obj1.bringForward();
      } else {
        obj1.sendBackwards();
      }
      
      fabricCanvas.renderAll();
    }
    
    setLayers(newLayers);
  }, [fabricCanvas, layers]);

  // Modifier la position d'un objet
  const updateObjectPosition = useCallback((x: number, y: number) => {
    if (!selectedObject || !fabricCanvas) return;
    
    selectedObject.set({ left: x, top: y });
    fabricCanvas.renderAll();
    setObjectProperties(prev => ({
      ...prev,
      position: { x, y }
    }));
  }, [fabricCanvas, selectedObject]);

  // Modifier l'échelle d'un objet
  const updateObjectScale = useCallback((x: number, y: number) => {
    if (!selectedObject || !fabricCanvas) return;
    
    selectedObject.set({ scaleX: x, scaleY: y });
    fabricCanvas.renderAll();
    setObjectProperties(prev => ({
      ...prev,
      scale: { x, y }
    }));
  }, [fabricCanvas, selectedObject]);

  // Modifier l'angle d'un objet
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
    setSelectedBaseDoll
  };
};
