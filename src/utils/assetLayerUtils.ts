
import { Asset, AssetType, AssetSubType, LAYER_Z_INDEX, AssetAnchorPoints } from "@/types";

/**
 * Get the appropriate z-index for an asset based on its type and subtype
 */
export const getAssetZIndex = (type: AssetType, subType?: AssetSubType): number => {
  switch (type) {
    case 'base-doll':
      return LAYER_Z_INDEX.BASE_DOLL;
    
    case 'hair':
      if (subType === 'hair-front') return LAYER_Z_INDEX.HAIR_FRONT;
      if (subType === 'hair-back') return LAYER_Z_INDEX.HAIR_BACK;
      if (subType === 'hair-full') {
        // Hair full is a special case - it has components at both HAIR_FRONT and HAIR_BACK z-indexes
        // Default to the front z-index for positioning
        return LAYER_Z_INDEX.HAIR_FRONT;
      }
      return LAYER_Z_INDEX.HAIR_BACK; // Default for hair
      
    case 'clothing':
      if (subType === 'clothing-top') return LAYER_Z_INDEX.CLOTHING_TOP;
      if (subType === 'clothing-bottom') return LAYER_Z_INDEX.CLOTHING_BOTTOM;
      if (subType === 'clothing-dress') return LAYER_Z_INDEX.CLOTHING_DRESS;
      if (subType === 'clothing-outerwear') return LAYER_Z_INDEX.CLOTHING_OUTERWEAR;
      if (subType === 'clothing-undergarment') return LAYER_Z_INDEX.UNDERGARMENT;
      return LAYER_Z_INDEX.CLOTHING_TOP; // Default for clothing
      
    case 'accessory':
      if (subType === 'glasses') return LAYER_Z_INDEX.ACCESSORY_GLASSES;
      if (subType === 'hat') return LAYER_Z_INDEX.ACCESSORY_HAT;
      if (subType === 'jewelry') return LAYER_Z_INDEX.ACCESSORY_JEWELRY;
      if (subType === 'bag') return LAYER_Z_INDEX.ACCESSORY_BAG;
      if (subType === 'scarf') return LAYER_Z_INDEX.ACCESSORY_SCARF;
      if (subType === 'watch') return LAYER_Z_INDEX.ACCESSORY_WATCH;
      return LAYER_Z_INDEX.ACCESSORY_FACE_MISC; // Default for accessories
      
    case 'facial-hair':
      return LAYER_Z_INDEX.FACIAL_HAIR;
      
    default:
      return 0;
  }
};

/**
 * Get default anchor points for a base doll
 */
export const getDefaultAnchorPoints = (): AssetAnchorPoints => {
  return {
    center: { x: 250, y: 300 },
    head: { x: 250, y: 150 },
    shoulders: { x: 250, y: 200 },
    waist: { x: 250, y: 350 },
    feet: { x: 250, y: 550 },
    eyes: { x: 250, y: 130 },
    nose: { x: 250, y: 150 },
    mouth: { x: 250, y: 170 },
    ears: { x: 250, y: 140 },
    neck: { x: 250, y: 180 },
    chest: { x: 250, y: 220 },
    hands: { x: 300, y: 300 },
    hips: { x: 250, y: 400 },
    knees: { x: 250, y: 480 },
    ankles: { x: 250, y: 520 }
  };
};

/**
 * Get the target anchor point for an asset type
 */
export const getTargetAnchorPoint = (assetType: AssetType, assetSubType?: AssetSubType): keyof AssetAnchorPoints => {
  switch (assetType) {
    case 'hair':
      if (assetSubType === 'hair-front') return 'head';
      if (assetSubType === 'hair-back') return 'head';
      return 'head';
      
    case 'clothing':
      if (assetSubType === 'clothing-top') return 'chest';
      if (assetSubType === 'clothing-bottom') return 'hips';
      if (assetSubType === 'clothing-dress') return 'chest';
      if (assetSubType === 'clothing-outerwear') return 'shoulders';
      if (assetSubType === 'clothing-undergarment') return 'waist';
      return 'chest';
      
    case 'accessory':
      if (assetSubType === 'glasses') return 'eyes';
      if (assetSubType === 'hat') return 'head';
      if (assetSubType === 'jewelry' || assetSubType === 'scarf') return 'neck';
      if (assetSubType === 'watch') return 'hands';
      if (assetSubType === 'bag') return 'hands';
      return 'center';
      
    case 'facial-hair':
      if (assetSubType === 'mustache') return 'mouth';
      if (assetSubType === 'beard') return 'mouth';
      if (assetSubType === 'goatee') return 'mouth';
      if (assetSubType === 'sideburns') return 'ears';
      return 'mouth';
      
    default:
      return 'center';
  }
};

/**
 * Check if two assets are compatible with each other
 */
export const checkAssetCompatibility = (asset1: Asset, asset2: Asset): { compatible: boolean, reason?: string } => {
  // Base doll can only be added once
  if (asset1.type === 'base-doll' && asset2.type === 'base-doll') {
    return {
      compatible: false,
      reason: "Une seule base de personnage peut être utilisée à la fois."
    };
  }
  
  // Clothing dress conflicts with top and bottom
  if (asset1.type === 'clothing' && asset1.subType === 'clothing-dress') {
    if (asset2.type === 'clothing' && 
        (asset2.subType === 'clothing-top' || asset2.subType === 'clothing-bottom')) {
      return {
        compatible: false,
        reason: "Une robe ne peut pas être portée avec un haut ou un bas séparé."
      };
    }
  }
  
  // Same check in reverse
  if (asset2.type === 'clothing' && asset2.subType === 'clothing-dress') {
    if (asset1.type === 'clothing' && 
        (asset1.subType === 'clothing-top' || asset1.subType === 'clothing-bottom')) {
      return {
        compatible: false,
        reason: "Un haut ou un bas ne peut pas être porté avec une robe."
      };
    }
  }
  
  // Some hats may conflict with certain hairstyles
  if (asset1.type === 'accessory' && asset1.subType === 'hat') {
    if (asset2.type === 'hair' && asset2.subType === 'hair-front') {
      // This is a simplified check - in a real implementation we'd check specific hat and hair types
      return {
        compatible: true,
        reason: "Attention: certains chapeaux peuvent ne pas s'adapter parfaitement à cette coiffure."
      };
    }
  }
  
  // Default case: assets are compatible
  return { compatible: true };
};

/**
 * Get suggested position for an asset based on its type and the base doll
 */
export const getSuggestedPosition = (
  asset: Asset, 
  baseDoll?: Asset | null
): { x: number; y: number; scale: number } => {
  // If the asset already has positioning information, use that
  if (asset.positioning) {
    return {
      x: asset.positioning.suggestedX,
      y: asset.positioning.suggestedY,
      scale: asset.positioning.suggestedScale
    };
  }
  
  // Default canvas center position
  const defaultPosition = { x: 250, y: 300, scale: 0.5 };
  
  // If no base doll is available, use default positioning
  if (!baseDoll) {
    return defaultPosition;
  }
  
  // Get the default anchor points for a base doll
  const anchorPoints = baseDoll.positioning?.anchorPoints || getDefaultAnchorPoints();
  
  // Determine which anchor point to use based on the asset type and subtype
  const targetAnchorPoint = getTargetAnchorPoint(asset.type, asset.subType);
  
  // If we have anchor points for the target area, use them
  if (anchorPoints[targetAnchorPoint]) {
    const point = anchorPoints[targetAnchorPoint];
    let scale = baseDoll.positioning?.suggestedScale || 0.5;
    
    // Adjust scale based on asset type
    if (asset.type === 'facial-hair') {
      scale *= 0.7;
    } else if (asset.type === 'accessory' && asset.subType === 'glasses') {
      scale *= 0.6;
    } else if (asset.type === 'accessory' && asset.subType === 'hat') {
      scale *= 0.8;
    }
    
    return {
      x: point!.x,
      y: point!.y,
      scale
    };
  }
  
  // If all else fails, use the positioning from the base doll
  if (baseDoll.positioning) {
    return {
      x: baseDoll.positioning.suggestedX,
      y: baseDoll.positioning.suggestedY,
      scale: baseDoll.positioning.suggestedScale
    };
  }
  
  // Default fallback
  return defaultPosition;
};

/**
 * Get a human-readable label for an asset type
 */
export const getAssetTypeLabel = (type: AssetType, subType?: AssetSubType): string => {
  switch (type) {
    case 'base-doll':
      return 'Personnage de base';
      
    case 'hair':
      if (subType === 'hair-front') return 'Cheveux (avant)';
      if (subType === 'hair-back') return 'Cheveux (arrière)';
      if (subType === 'hair-full') return 'Cheveux (complet)';
      return 'Cheveux';
      
    case 'clothing':
      if (subType === 'clothing-top') return 'Vêtement (haut)';
      if (subType === 'clothing-bottom') return 'Vêtement (bas)';
      if (subType === 'clothing-dress') return 'Robe';
      if (subType === 'clothing-outerwear') return 'Veste/Manteau';
      if (subType === 'clothing-undergarment') return 'Sous-vêtement';
      return 'Vêtement';
      
    case 'accessory':
      if (subType === 'glasses') return 'Lunettes';
      if (subType === 'hat') return 'Chapeau';
      if (subType === 'jewelry') return 'Bijou';
      if (subType === 'bag') return 'Sac';
      if (subType === 'scarf') return 'Écharpe';
      if (subType === 'watch') return 'Montre';
      return 'Accessoire';
      
    case 'facial-hair':
      if (subType === 'mustache') return 'Moustache';
      if (subType === 'beard') return 'Barbe';
      if (subType === 'goatee') return 'Barbichette';
      if (subType === 'sideburns') return 'Favoris';
      return 'Pilosité faciale';
      
    default:
      return 'Asset';
  }
};
