
import { useState, useCallback } from 'react';
import { Canvas, Image as FabricImage } from 'fabric';
import { toast } from 'sonner';
import { Asset } from '@/types';

export const useAssetManagement = (
  fabricCanvas: Canvas | null, 
  addLayer: (name: string, type: string, object: any) => any,
  setSelectedObject: (obj: any) => void,
  updateObjectProperties: (obj: any) => void
) => {
  const [selectedBaseDoll, setSelectedBaseDoll] = useState<Asset | null>(null);

  // Add an asset to canvas
  const addAssetToCanvas = useCallback(async (asset: Asset) => {
    if (!fabricCanvas) return;

    try {
      // Créer un blob à partir de l'URL pour contourner les problèmes CORS
      // souvent rencontrés avec les images générées par des API comme OpenAI
      const response = await fetch(asset.url, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        imgElement.src = blobUrl;
        imgElement.onload = () => resolve(imgElement);
        imgElement.onerror = (error) => {
          console.error("Erreur de chargement de l'image:", error);
          reject(new Error("Impossible de charger l'image"));
        };
      });

      const fabricImage = new FabricImage(img, {
        left: fabricCanvas.width ? fabricCanvas.width / 2 - img.width / 4 : 150,
        top: fabricCanvas.height ? fabricCanvas.height / 2 - img.height / 4 : 150,
        scaleX: 0.5,
        scaleY: 0.5,
      });

      // Add metadata to the object
      (fabricImage as any).data = {
        assetId: asset.id,
        assetType: asset.type,
      };

      fabricCanvas.add(fabricImage);
      fabricCanvas.setActiveObject(fabricImage);
      fabricCanvas.renderAll();

      // If the asset is a base-doll, store it for AI generation
      if (asset.type === 'base-doll') {
        setSelectedBaseDoll(asset);
      }

      // Create a new layer
      const newLayer = addLayer(asset.name, asset.type, fabricImage);
      setSelectedObject(fabricImage);
      updateObjectProperties(fabricImage);

      // Libérer la mémoire en révoquant l'URL du blob
      URL.revokeObjectURL(blobUrl);

      toast("Asset ajouté", {
        description: `${asset.name} a été ajouté au canvas.`,
      });
    } catch (error) {
      console.error("Erreur lors du chargement de l'image:", error);
      toast.error("Erreur", {
        description: "Impossible d'ajouter l'asset au canvas. Vérifiez l'URL de l'image.",
      });
    }
  }, [fabricCanvas, addLayer, setSelectedObject, updateObjectProperties]);

  return {
    selectedBaseDoll,
    setSelectedBaseDoll,
    addAssetToCanvas
  };
};
