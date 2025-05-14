
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
      // Pour les URLs provenant de DALL-E, utiliser une approche sans CORS
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const imgElement = new Image();
        
        // Désactiver les restrictions CORS
        imgElement.crossOrigin = "anonymous";
        
        imgElement.onload = () => resolve(imgElement);
        imgElement.onerror = (error) => {
          console.error("Erreur de chargement de l'image:", error);
          reject(new Error("Impossible de charger l'image"));
        };
        
        // Définir la source en dernier pour éviter les problèmes de timing
        imgElement.src = asset.url;
      });

      // Déterminer les coordonnées et l'échelle à partir des suggestions d'IA ou utiliser des valeurs par défaut
      const left = asset.positioning?.suggestedX || (fabricCanvas.width ? fabricCanvas.width / 2 - img.width / 4 : 150);
      const top = asset.positioning?.suggestedY || (fabricCanvas.height ? fabricCanvas.height / 2 - img.height / 4 : 150);
      const scale = asset.positioning?.suggestedScale || 0.5;

      const fabricImage = new FabricImage(img, {
        left,
        top,
        scaleX: scale,
        scaleY: scale,
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
