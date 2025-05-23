
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UploadProgress } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { Asset, AssetType } from '@/types';
import { generateAssetName, suggestAssetType } from '@/utils/assetNameGenerator';
import { storageService } from '@/utils/storageService';

const assetTypeOptions: { value: AssetType; label: string }[] = [
  { value: 'base-doll', label: 'Personnage de Base' },
  { value: 'hair', label: 'Cheveux' },
  { value: 'clothing', label: 'Vêtements' },
  { value: 'accessory', label: 'Accessoires' },
  { value: 'facial-hair', label: 'Pilosité Faciale' }
];

const UploadArea = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [assetNames, setAssetNames] = useState<Record<string, string>>({});
  const [assetTypes, setAssetTypes] = useState<Record<string, AssetType>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const simulateUpload = useCallback((file: File) => {
    const uploadId = uuidv4();
    const previewUrl = URL.createObjectURL(file);
    
    // Suggérer un type d'asset basé sur le nom du fichier
    const suggestedType = suggestAssetType(file.name) as AssetType;
    
    // Générer un nom pour l'asset
    const suggestedName = generateAssetName(file, suggestedType);
    
    // Stocker le nom suggéré
    setAssetNames(prev => ({ ...prev, [uploadId]: suggestedName }));
    
    // Stocker le type suggéré
    setAssetTypes(prev => ({ ...prev, [uploadId]: suggestedType }));
    
    // Add to uploads list
    setUploads(prev => [
      ...prev, 
      { 
        id: uploadId, 
        file, 
        progress: 0, 
        status: 'pending',
        previewUrl 
      }
    ]);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      
      setUploads(prev => 
        prev.map(upload => 
          upload.id === uploadId 
            ? { 
                ...upload, 
                progress, 
                status: progress < 100 ? 'uploading' : 'processing' 
              } 
            : upload
        )
      );
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Simulate processing delay
        setTimeout(() => {
          setUploads(prev => 
            prev.map(upload => 
              upload.id === uploadId 
                ? { ...upload, status: 'complete' } 
                : upload
            )
          );
        }, 1000);
      }
    }, 300);
    
    return uploadId;
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (validFiles.length !== files.length) {
      toast("Certains fichiers ont été ignorés", {
        description: "Seules les images sont acceptées.",
      });
    }
    
    validFiles.forEach(file => {
      simulateUpload(file);
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleSaveAsset = (uploadId: string) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload || upload.status !== 'complete') return;
    
    const assetName = assetNames[uploadId] || 'Asset sans nom';
    const assetType = assetTypes[uploadId] || 'accessory';
    
    const newAsset: Asset = {
      id: uuidv4(),
      name: assetName,
      type: assetType,
      style: 'cartoon', // Default style
      url: upload.previewUrl || '',
      thumbnailUrl: upload.previewUrl || '',
      tags: [],
      colors: [],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    
    // Sauvegarder l'asset
    storageService.saveAsset(newAsset);
    
    toast("Asset sauvegardé", {
      description: `${assetName} a été ajouté à votre bibliothèque.`,
    });
    
    // Supprimer de la liste des uploads
    setUploads(prev => prev.filter(u => u.id !== uploadId));
    
    // Nettoyer les états
    setAssetNames(prev => {
      const newState = { ...prev };
      delete newState[uploadId];
      return newState;
    });
    
    setAssetTypes(prev => {
      const newState = { ...prev };
      delete newState[uploadId];
      return newState;
    });
  };
  
  const handleNameChange = (uploadId: string, name: string) => {
    setAssetNames(prev => ({
      ...prev,
      [uploadId]: name
    }));
  };
  
  const handleTypeChange = (uploadId: string, type: AssetType) => {
    setAssetTypes(prev => ({
      ...prev,
      [uploadId]: type
    }));
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <h2 className="text-2xl font-bold mb-6">Upload d'Assets</h2>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 mb-6 flex flex-col items-center justify-center transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Glissez-déposez vos fichiers ici</h3>
        <p className="text-muted-foreground text-center mb-4">
          Supportés: PNG, JPG, SVG (transparents de préférence)
        </p>
        <Button onClick={handleButtonClick}>
          Sélectionner des fichiers
        </Button>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFilesSelect}
        />
      </div>
      
      {uploads.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Téléchargements récents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploads.map(upload => (
              <Card key={upload.id} className="p-4 overflow-hidden">
                <div className="flex items-start space-x-4">
                  {upload.previewUrl && (
                    <div className="w-16 h-16 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                      <img 
                        src={upload.previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {upload.status === 'complete' ? (
                      <>
                        <div className="mb-2">
                          <Input
                            value={assetNames[upload.id] || ''}
                            onChange={(e) => handleNameChange(upload.id, e.target.value)}
                            placeholder="Nom de l'asset"
                            className="mb-2"
                          />
                          <Select 
                            value={assetTypes[upload.id] || 'accessory'} 
                            onValueChange={(value) => handleTypeChange(upload.id, value as AssetType)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Type d'asset" />
                            </SelectTrigger>
                            <SelectContent>
                              {assetTypeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={() => handleSaveAsset(upload.id)}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Sauvegarder
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium truncate">{upload.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(upload.file.size / 1024)} KB
                        </p>
                        <div className="mt-2">
                          <Progress value={upload.progress} className="h-1" />
                        </div>
                        <p className="text-xs mt-1">
                          {upload.status === 'pending' && 'En attente...'}
                          {upload.status === 'uploading' && `${upload.progress}% téléchargé`}
                          {upload.status === 'processing' && 'Traitement...'}
                          {upload.status === 'error' && upload.error}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
