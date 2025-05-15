
import { useState, useCallback } from 'react';
import { Canvas, Image as FabricImage } from 'fabric';
import { toast } from 'sonner';
import { Asset } from '@/types';
import { 
  getAssetZIndex, 
  getSuggestedPosition, 
  getDefaultAnchorPoints, 
  checkAssetCompatibility,
  doesAssetRequireBaseDoll
} from '@/utils/assetLayerUtils';

export const useAssetManagement = (
  fabricCanvas: Canvas | null, 
  addLayer: (name: string, type: string, object: any) => any,
  setSelectedObject: (obj: any) => void,
  updateObjectProperties: (obj: any) => void
) => {
  const [selectedBaseDoll, setSelectedBaseDoll] = useState<Asset | null>(null);
  const [canvasAssets, setCanvasAssets] = useState<Asset[]>([]);

  // Add an asset to canvas
  const addAssetToCanvas = useCallback(async (asset: Asset) => {
    if (!fabricCanvas) return;

    // Check if we're trying to add a non-base-doll asset without having a base doll
    if (doesAssetRequireBaseDoll(asset.type) && !selectedBaseDoll) {
      toast.warning("Base requise", {
        description: "Veuillez d'abord ajouter un personnage de base avant d'ajouter des accessoires.",
      });
      return null;
    }

    // Check compatibility with existing assets
    if (canvasAssets.length > 0) {
      const incompatibleAssets = canvasAssets.filter(existingAsset => {
        const { compatible } = checkAssetCompatibility(asset, existingAsset);
        return !compatible;
      });

      if (incompatibleAssets.length > 0) {
        const assetNames = incompatibleAssets.map(a => a.name).join(", ");
        toast.warning("Conflit de compatibilité", {
          description: `"${asset.name}" n'est pas compatible avec: ${assetNames}`,
          action: {
            label: "Ajouter quand même",
            onClick: () => forceAddAssetToCanvas(asset),
          },
        });
        return null;
      }
    }

    return await forceAddAssetToCanvas(asset);
  }, [fabricCanvas, selectedBaseDoll, canvasAssets]);

  // Force add asset to canvas (bypassing compatibility checks)
  const forceAddAssetToCanvas = useCallback(async (asset: Asset) => {
    if (!fabricCanvas) return null;

    try {
      // For URLs from DALL-E, use a CORS-free approach
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const imgElement = new Image();
        
        // Disable CORS restrictions
        imgElement.crossOrigin = "anonymous";
        
        imgElement.onload = () => resolve(imgElement);
        imgElement.onerror = (error) => {
          console.error("Error loading image:", error);
          reject(new Error("Could not load image"));
        };
        
        // Set the source last to avoid timing issues
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

      // Add to canvas
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

      // If the asset is a base-doll, store it and update state
      if (asset.type === 'base-doll') {
        // If we already have a base doll, remove it
        if (selectedBaseDoll) {
          // Find the layer with the existing base doll
          const objects = fabricCanvas.getObjects();
          const baseDollObject = objects.find(obj => 
            (obj as any).data?.assetType === 'base-doll'
          );
          
          // Remove the old base doll if found
          if (baseDollObject) {
            fabricCanvas.remove(baseDollObject);
          }
          
          // Update canvas assets
          setCanvasAssets(prev => prev.filter(a => a.type !== 'base-doll'));
        }
        
        setSelectedBaseDoll(asset);
      }

      // Add this asset to our tracked assets
      setCanvasAssets(prev => [...prev, asset]);

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

  // Clear assets list when canvas is cleared
  const clearAssets = useCallback(() => {
    setCanvasAssets([]);
    setSelectedBaseDoll(null);
  }, []);

  return {
    selectedBaseDoll,
    setSelectedBaseDoll,
    canvasAssets,
    addAssetToCanvas,
    clearAssets
  };
};
