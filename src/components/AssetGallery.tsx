
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Asset, AssetType, AssetStyle } from "@/types";
import { mockAssets } from "@/data/mockData";
import { storageService } from "@/utils/storageService";
import { toast } from "sonner";

const AssetGallery = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType | 'all'>('all');
  const [styleFilter, setStyleFilter] = useState<AssetStyle | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  // Charger les assets
  useEffect(() => {
    const loadAssets = () => {
      const userAssets = storageService.getUploadedAssets();
      setAssets([...mockAssets, ...userAssets]);
      applyFilters([...mockAssets, ...userAssets], searchQuery, assetTypeFilter, styleFilter);
    };
    
    loadAssets();
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    applyFilters(assets, query, assetTypeFilter, styleFilter);
  }, [assets, assetTypeFilter, styleFilter]);

  const applyFilters = useCallback((assetList: Asset[], query: string, typeFilter: AssetType | 'all', style: AssetStyle | 'all') => {
    let result = assetList;
    
    // Apply search filter
    if (query) {
      const searchQuery = query.toLowerCase();
      result = result.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery) || 
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(asset => asset.type === typeFilter);
    }
    
    // Apply style filter
    if (style !== 'all') {
      result = result.filter(asset => asset.style === style);
    }
    
    setFilteredAssets(result);
  }, []);

  useEffect(() => {
    applyFilters(assets, searchQuery, assetTypeFilter, styleFilter);
  }, [searchQuery, assetTypeFilter, styleFilter, assets, applyFilters]);

  const resetFilters = () => {
    setSearchQuery('');
    setAssetTypeFilter('all');
    setStyleFilter('all');
  };

  const renderTypeBadge = (type: AssetType) => {
    const typeColorMap: Record<AssetType, string> = {
      'base-doll': 'bg-blue-100 text-blue-800',
      'hair': 'bg-yellow-100 text-yellow-800',
      'clothing': 'bg-green-100 text-green-800',
      'accessory': 'bg-purple-100 text-purple-800',
      'facial-hair': 'bg-orange-100 text-orange-800',
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${typeColorMap[type]}`}>
        {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };
  
  const handleDeleteAsset = (asset: Asset) => {
    // Vérifier si c'est un asset par défaut (mockAsset)
    const isMockAsset = mockAssets.some(mockAsset => mockAsset.id === asset.id);
    if (isMockAsset) {
      toast.error("Action impossible", {
        description: "Impossible de supprimer les assets par défaut du système.",
      });
      return;
    }
    
    setAssetToDelete(asset);
  };
  
  const confirmDeleteAsset = () => {
    if (!assetToDelete) return;
    
    // Vérifier si l'asset est utilisé par des personnages
    const isUsed = storageService.isAssetUsedByCharacters(assetToDelete.id);
    
    if (isUsed) {
      const characters = storageService.getCharactersUsingAsset(assetToDelete.id);
      toast.warning("Asset utilisé", {
        description: `Cet asset est utilisé par ${characters.length} personnage(s). La suppression peut affecter ces personnages.`,
      });
    }
    
    // Supprimer l'asset
    storageService.deleteAsset(assetToDelete.id);
    
    // Mettre à jour la liste des assets
    const updatedAssets = [...mockAssets, ...storageService.getUploadedAssets()];
    setAssets(updatedAssets);
    applyFilters(updatedAssets, searchQuery, assetTypeFilter, styleFilter);
    
    toast.success("Asset supprimé", {
      description: "L'asset a été supprimé avec succès.",
    });
    
    // Réinitialiser l'asset à supprimer
    setAssetToDelete(null);
  };

  const cancelDeleteAsset = () => {
    setAssetToDelete(null);
  };
  
  const isUserAsset = (asset: Asset): boolean => {
    return !mockAssets.some(mockAsset => mockAsset.id === asset.id);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Bibliothèque d'Assets</h2>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-secondary" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-card p-4 rounded-lg mb-6 border flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1 block">Type d'asset</label>
            <Select
              value={assetTypeFilter}
              onValueChange={(value) => setAssetTypeFilter(value as AssetType | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="base-doll">Base Doll</SelectItem>
                <SelectItem value="hair">Cheveux</SelectItem>
                <SelectItem value="clothing">Vêtements</SelectItem>
                <SelectItem value="accessory">Accessoires</SelectItem>
                <SelectItem value="facial-hair">Pilosité Faciale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1 block">Style</label>
            <Select
              value={styleFilter}
              onValueChange={(value) => setStyleFilter(value as AssetStyle | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les styles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les styles</SelectItem>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="realistic">Realistic</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="self-end" 
            onClick={resetFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredAssets.length > 0 ? (
          filteredAssets.map(asset => (
            <Card key={asset.id} className="flex flex-col overflow-hidden group">
              <div className="h-40 bg-secondary flex items-center justify-center relative overflow-hidden">
                <img 
                  src={asset.thumbnailUrl} 
                  alt={asset.name}
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm">Aperçu</Button>
                  <Button variant="secondary" size="sm">Utiliser</Button>
                  {isUserAsset(asset) && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAsset(asset);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-3">
                <div className="mb-2">
                  {renderTypeBadge(asset.type)}
                  {isUserAsset(asset) && (
                    <Badge variant="outline" className="ml-2 text-xs">Personnalisé</Badge>
                  )}
                </div>
                <h3 className="font-medium text-sm truncate" title={asset.name}>
                  {asset.name}
                </h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {asset.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-muted h-20 w-20 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Aucun résultat</h3>
            <p className="text-muted-foreground">
              Aucun asset ne correspond à votre recherche. Essayez de modifier vos filtres.
            </p>
            <Button variant="outline" className="mt-4" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
      
      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={!!assetToDelete} onOpenChange={open => !open && cancelDeleteAsset()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet asset ?
              {assetToDelete && storageService.isAssetUsedByCharacters(assetToDelete.id) && (
                <p className="mt-2 text-amber-500 font-medium">
                  Attention : Cet asset est utilisé par des personnages sauvegardés.
                  La suppression peut affecter l'apparence de ces personnages.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAsset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssetGallery;
