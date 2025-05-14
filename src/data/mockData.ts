
import { Asset, AssetType, AssetStyle } from '../types';

const generateMockAsset = (
  id: string,
  name: string,
  type: AssetType,
  style: AssetStyle,
  tags: string[] = [],
  colors: string[] = []
): Asset => {
  // Image placeholder de base - à remplacer par de vraies images
  const placeholderUrl = "https://placehold.co/600x400/3B82F6/FFFFFF/png";
  const thumbnailUrl = "https://placehold.co/200x200/3B82F6/FFFFFF/png";
  
  return {
    id,
    name,
    type,
    style,
    url: placeholderUrl,
    thumbnailUrl,
    tags,
    colors,
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };
};

export const mockAssets: Asset[] = [
  // Base Dolls
  generateMockAsset('bd-1', 'Base Doll - Light Skin', 'base-doll', 'cartoon', ['light skin', 'female'], ['#F5DEB3']),
  generateMockAsset('bd-2', 'Base Doll - Medium Skin', 'base-doll', 'cartoon', ['medium skin', 'female'], ['#D2B48C']),
  generateMockAsset('bd-3', 'Base Doll - Dark Skin', 'base-doll', 'cartoon', ['dark skin', 'female'], ['#8B4513']),
  generateMockAsset('bd-4', 'Base Doll - Light Skin', 'base-doll', 'realistic', ['light skin', 'male'], ['#F5DEB3']),
  generateMockAsset('bd-5', 'Base Doll - Medium Skin', 'base-doll', 'realistic', ['medium skin', 'male'], ['#D2B48C']),
  
  // Hair
  generateMockAsset('h-1', 'Short Curly - Black', 'hair', 'cartoon', ['short', 'curly', 'black'], ['#000000']),
  generateMockAsset('h-2', 'Long Straight - Blonde', 'hair', 'cartoon', ['long', 'straight', 'blonde'], ['#FFD700']),
  generateMockAsset('h-3', 'Medium Wavy - Brown', 'hair', 'cartoon', ['medium', 'wavy', 'brown'], ['#8B4513']),
  generateMockAsset('h-4', 'Short Spiky - Red', 'hair', 'anime', ['short', 'spiky', 'red'], ['#FF0000']),
  generateMockAsset('h-5', 'Long Flowing - Purple', 'hair', 'anime', ['long', 'flowing', 'purple'], ['#800080']),
  
  // Clothing
  generateMockAsset('c-1', 'T-Shirt - White', 'clothing', 'cartoon', ['t-shirt', 'casual', 'top'], ['#FFFFFF']),
  generateMockAsset('c-2', 'Jeans - Blue', 'clothing', 'cartoon', ['jeans', 'casual', 'bottom'], ['#0000FF']),
  generateMockAsset('c-3', 'Dress - Red', 'clothing', 'cartoon', ['dress', 'formal'], ['#FF0000']),
  generateMockAsset('c-4', 'Jacket - Black', 'clothing', 'realistic', ['jacket', 'outerwear'], ['#000000']),
  generateMockAsset('c-5', 'Skirt - Green', 'clothing', 'realistic', ['skirt', 'bottom'], ['#008000']),
  
  // Accessories
  generateMockAsset('a-1', 'Glasses - Round', 'accessory', 'cartoon', ['glasses', 'face'], ['#000000']),
  generateMockAsset('a-2', 'Hat - Baseball Cap', 'accessory', 'cartoon', ['hat', 'head'], ['#0000FF']),
  generateMockAsset('a-3', 'Necklace - Gold', 'accessory', 'realistic', ['necklace', 'jewelry'], ['#FFD700']),
  generateMockAsset('a-4', 'Earrings - Silver', 'accessory', 'realistic', ['earrings', 'jewelry'], ['#C0C0C0']),
  generateMockAsset('a-5', 'Backpack - Red', 'accessory', 'cartoon', ['backpack', 'bag'], ['#FF0000']),
  
  // Facial Hair
  generateMockAsset('fh-1', 'Full Beard - Brown', 'facial-hair', 'cartoon', ['beard', 'full'], ['#8B4513']),
  generateMockAsset('fh-2', 'Mustache - Black', 'facial-hair', 'cartoon', ['mustache'], ['#000000']),
  generateMockAsset('fh-3', 'Goatee - Gray', 'facial-hair', 'realistic', ['goatee'], ['#808080']),
  generateMockAsset('fh-4', 'Stubble - Dark', 'facial-hair', 'realistic', ['stubble', 'light'], ['#696969']),
  generateMockAsset('fh-5', 'Sideburns - Red', 'facial-hair', 'cartoon', ['sideburns'], ['#FF0000']),
];
