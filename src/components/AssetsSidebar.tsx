
import React, { useEffect, useState } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Folder } from 'lucide-react';
import { Asset, AssetType, SavedCharacter } from '@/types';
import { mockAssets } from "@/data/mockData";
import { storageService } from '@/utils/storageService';
import SavedCharactersList from './SavedCharactersList';
import { toast } from 'sonner';

interface AssetsSidebarProps {
  onSelectAsset: (asset: Asset) => void;
  currentAssets?: Asset[]; // Add the currentAssets prop as optional
}

const AssetsSidebar: React.FC<AssetsSidebarProps> = ({ onSelectAsset, currentAssets = [] }) => {
  const [activeTab, setActiveTab] = React.useState<AssetType>('base-doll');
  const [userTab, setUserTab] = useState<'assets' | 'saves'>('assets');
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  
  // Charger les assets et personnages sauvegardés
  useEffect(() => {
    setUserAssets(storageService.getUploadedAssets());
    setSavedCharacters(storageService.getSavedCharacters());
  }, []);

  const getAssetsByType = (type: AssetType) => {
    // Combine les assets par défaut et les assets uploadés
    return [...mockAssets, ...userAssets].filter(asset => asset.type === type);
  };
  
  const handleDeleteCharacter = (id: string) => {
    storageService.deleteCharacter(id);
    setSavedCharacters(prev => prev.filter(char => char.id !== id));
    toast("Personnage supprimé", {
      description: "Le personnage a été supprimé avec succès.",
    });
  };
  
  const handleSelectCharacter = (character: SavedCharacter) => {
    toast("Fonctionnalité en construction", {
      description: "Le chargement des personnages sauvegardés sera bientôt disponible.",
    });
    // Dans une implémentation complète, on chargerait le personnage dans le canvas
  };

  // Check if an asset is already in the canvas to prevent duplicates
  const isAssetInCanvas = (asset: Asset) => {
    return currentAssets.some(a => a.id === asset.id);
  };

  return (
    <div className="w-80 flex flex-col bg-card border-l">
      <Card className="flex-1 rounded-none border-0">
        <CardHeader className="px-4 py-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Assets</CardTitle>
            <Layers className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            Sélectionnez des éléments à ajouter
          </CardDescription>
        </CardHeader>
        
        <div className="mb-2 px-4">
          <Tabs 
            value={userTab} 
            onValueChange={(value) => setUserTab(value as 'assets' | 'saves')}
          >
            <TabsList className="w-full">
              <TabsTrigger value="assets" className="flex-1">Assets</TabsTrigger>
              <TabsTrigger value="saves" className="flex-1">
                <Folder className="h-4 w-4 mr-1" />
                Sauvegardés
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <CardContent className="p-0">
          {userTab === 'assets' ? (
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as AssetType)}
              className="w-full"
            >
              <TabsList className="w-full justify-start px-4 rounded-none border-b h-auto py-0">
                <TabsTrigger value="base-doll" className="py-2 px-3 text-xs">Base</TabsTrigger>
                <TabsTrigger value="hair" className="py-2 px-3 text-xs">Cheveux</TabsTrigger>
                <TabsTrigger value="clothing" className="py-2 px-3 text-xs">Vêtements</TabsTrigger>
                <TabsTrigger value="accessory" className="py-2 px-3 text-xs">Accessoires</TabsTrigger>
                <TabsTrigger value="facial-hair" className="py-2 px-3 text-xs">Pilosité</TabsTrigger>
              </TabsList>
              
              {(['base-doll', 'hair', 'clothing', 'accessory', 'facial-hair'] as AssetType[]).map((type) => (
                <TabsContent key={type} value={type} className="overflow-auto h-[calc(100vh-13rem)]">
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {getAssetsByType(type).map((asset) => (
                      <div
                        key={asset.id}
                        className={`border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-colors ${
                          isAssetInCanvas(asset) ? 'bg-secondary/30 border-primary' : ''
                        }`}
                        onClick={() => onSelectAsset(asset)}
                      >
                        <div className="h-20 bg-secondary/50 flex items-center justify-center p-1">
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium truncate">{asset.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <SavedCharactersList
              characters={savedCharacters}
              onCharacterSelect={handleSelectCharacter}
              onCharacterDelete={handleDeleteCharacter}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetsSidebar;
