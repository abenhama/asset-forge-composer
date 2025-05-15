
import { useState, useCallback } from 'react';
import { Canvas, Image as FabricImage } from 'fabric';
import { toast } from 'sonner';
import { Asset } from '@/types';
import { getAssetZIndex, getSuggestedPosition, getDefaultAnchorPoints } from '@/utils/assetLayerUtils';

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

      // Get suggested position based on asset type and base doll
      const { x, y, scale } = getSuggestedPosition(asset, selectedBaseDoll);

      const fabricImage = new FabricImage(img, {
        left: x,
        top: y,
        scaleX: scale,
        scaleY: scale,
      });

      // Get the appropriate z-index for this asset type
      const zIndex = getAssetZIndex(asset.type, asset.subType);

      // Add metadata to the object
      (fabricImage as any).data = {
        assetId: asset.id,
        assetType: asset.type,
        assetSubType: asset.subType,
        zIndex: zIndex,
        anchorPoints: asset.positioning?.anchorPoints || 
                     (asset.type === 'base-doll' ? getDefaultAnchorPoints() : undefined)
      };

      // Assign the correct z-index
      fabricCanvas.add(fabricImage);
      
      // Ensure objects are ordered by z-index
      const objects = fabricCanvas.getObjects();
      objects.sort((a, b) => {
        const aZIndex = (a as any).data?.zIndex || 0;
        const bZIndex = (b as any).data?.zIndex || 0;
        return aZIndex - bZIndex;
      });
      
      // Re-render the canvas to apply z-index changes
      fabricCanvas.setActiveObject(fabricImage);
      fabricCanvas.renderAll();

      // If the asset is a base-doll, store it for AI generation
      if (asset.type === 'base-doll') {
        setSelectedBaseDoll(asset);
      }

      // Create a new layer with appropriate name
      const assetTypeLabel = asset.subType 
        ? `${asset.type} (${asset.subType})` 
        : asset.type;
        
      const newLayer = addLayer(asset.name, assetTypeLabel, fabricImage);
      setSelectedObject(fabricImage);
      updateObjectProperties(fabricImage);

      toast("Asset ajouté", {
        description: `${asset.name} a été ajouté au canvas.`,
      });

      return newLayer;
    } catch (error) {
      console.error("Erreur lors du chargement de l'image:", error);
      toast.error("Erreur", {
        description: "Impossible d'ajouter l'asset au canvas. Vérifiez l'URL de l'image.",
      });
      return null;
    }
  }, [fabricCanvas, addLayer, setSelectedObject, updateObjectProperties, selectedBaseDoll]);

  return {
    selectedBaseDoll,
    setSelectedBaseDoll,
    addAssetToCanvas
  };
};
