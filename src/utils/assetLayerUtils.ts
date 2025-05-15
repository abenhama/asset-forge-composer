
import { Asset, AssetType, AssetSubType, LAYER_Z_INDEX } from "@/types";

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
): { x: number, y: number, scale: number } => {
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
  if (!baseDoll || !baseDoll.positioning) {
    return defaultPosition;
  }
  
  // Customize positioning based on asset type and subtype
  switch (asset.type) {
    case 'hair':
      // Position hair near the head
      return {
        x: baseDoll.positioning.suggestedX,
        y: baseDoll.positioning.suggestedY - 100, // Adjust Y to be above the base doll's center
        scale: baseDoll.positioning.suggestedScale
      };
      
    case 'clothing':
      // Position clothing based on subtype
      if (asset.subType === 'clothing-top') {
        return {
          x: baseDoll.positioning.suggestedX,
          y: baseDoll.positioning.suggestedY - 50, // Slightly above center
          scale: baseDoll.positioning.suggestedScale
        };
      } else if (asset.subType === 'clothing-bottom') {
        return {
          x: baseDoll.positioning.suggestedX,
          y: baseDoll.positioning.suggestedY + 50, // Slightly below center
          scale: baseDoll.positioning.suggestedScale
        };
      }
      // Use base doll positioning for other clothing
      return {
        x: baseDoll.positioning.suggestedX,
        y: baseDoll.positioning.suggestedY,
        scale: baseDoll.positioning.suggestedScale
      };
      
    case 'facial-hair':
      // Position facial hair near the face
      return {
        x: baseDoll.positioning.suggestedX,
        y: baseDoll.positioning.suggestedY - 75, // Adjust to face area
        scale: baseDoll.positioning.suggestedScale * 0.7 // Slightly smaller scale
      };
      
    case 'accessory':
      // Position accessories based on subtype
      if (asset.subType === 'glasses') {
        return {
          x: baseDoll.positioning.suggestedX,
          y: baseDoll.positioning.suggestedY - 90, // Position near eyes
          scale: baseDoll.positioning.suggestedScale * 0.6
        };
      } else if (asset.subType === 'hat') {
        return {
          x: baseDoll.positioning.suggestedX,
          y: baseDoll.positioning.suggestedY - 120, // Position above head
          scale: baseDoll.positioning.suggestedScale * 0.8
        };
      }
      // Default accessory positioning
      return {
        x: baseDoll.positioning.suggestedX,
        y: baseDoll.positioning.suggestedY,
        scale: baseDoll.positioning.suggestedScale
      };
      
    default:
      return defaultPosition;
  }
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
