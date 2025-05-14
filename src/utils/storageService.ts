
import { SavedCharacter, Asset } from '@/types';

const CHARACTERS_KEY = 'saved-characters';
const ASSETS_KEY = 'uploaded-assets';

export const storageService = {
  // Sauvegarde des personnages
  saveCharacter: (character: SavedCharacter): void => {
    const existingCharacters = storageService.getSavedCharacters();
    const updatedCharacters = [...existingCharacters, character];
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(updatedCharacters));
  },

  getSavedCharacters: (): SavedCharacter[] => {
    const charactersJSON = localStorage.getItem(CHARACTERS_KEY);
    if (!charactersJSON) return [];
    try {
      return JSON.parse(charactersJSON);
    } catch (e) {
      console.error('Error parsing saved characters', e);
      return [];
    }
  },

  getCharacterById: (id: string): SavedCharacter | null => {
    const characters = storageService.getSavedCharacters();
    return characters.find(character => character.id === id) || null;
  },

  updateCharacter: (character: SavedCharacter): void => {
    const characters = storageService.getSavedCharacters();
    const index = characters.findIndex(c => c.id === character.id);
    
    if (index !== -1) {
      characters[index] = {
        ...character,
        dateModified: new Date().toISOString()
      };
      localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
    }
  },

  deleteCharacter: (id: string): void => {
    const characters = storageService.getSavedCharacters();
    const filteredCharacters = characters.filter(c => c.id !== id);
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(filteredCharacters));
  },

  // Gestion des assets
  saveAsset: (asset: Asset): void => {
    const existingAssets = storageService.getUploadedAssets();
    const updatedAssets = [...existingAssets, asset];
    localStorage.setItem(ASSETS_KEY, JSON.stringify(updatedAssets));
  },

  getUploadedAssets: (): Asset[] => {
    const assetsJSON = localStorage.getItem(ASSETS_KEY);
    if (!assetsJSON) return [];
    try {
      return JSON.parse(assetsJSON);
    } catch (e) {
      console.error('Error parsing assets', e);
      return [];
    }
  },

  updateAsset: (asset: Asset): void => {
    const assets = storageService.getUploadedAssets();
    const index = assets.findIndex(a => a.id === asset.id);
    
    if (index !== -1) {
      assets[index] = {
        ...asset,
        dateModified: new Date().toISOString()
      };
      localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
    }
  },

  deleteAsset: (id: string): void => {
    const assets = storageService.getUploadedAssets();
    const filteredAssets = assets.filter(a => a.id !== id);
    localStorage.setItem(ASSETS_KEY, JSON.stringify(filteredAssets));
  }
};
