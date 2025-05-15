
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssetType, AssetStyle, AssetSubType } from '@/types';
import APIKeyInput from './APIKeyInput';
import { Loader2 } from 'lucide-react';

export interface GenerationFormValues {
  assetType: AssetType;
  assetSubType?: AssetSubType;
  style: AssetStyle;
  prompt: string;
  apiKey: string;
}

interface AIGenerationFormProps {
  onSubmit: (data: GenerationFormValues) => void;
  isGenerating: boolean;
  savedApiKey: string | null;
  onClearApiKey: () => void;
  onCancel: () => void;
  disableSubmit?: boolean;
}

// Map of asset types to their subtypes
const assetSubTypes: Record<AssetType, { value: AssetSubType; label: string }[]> = {
  'base-doll': [],
  'hair': [
    { value: 'hair-front', label: 'Cheveux (avant)' },
    { value: 'hair-back', label: 'Cheveux (arrière)' },
    { value: 'hair-full', label: 'Cheveux (complet)' }
  ],
  'clothing': [
    { value: 'clothing-top', label: 'Haut' },
    { value: 'clothing-bottom', label: 'Bas' },
    { value: 'clothing-dress', label: 'Robe' },
    { value: 'clothing-outerwear', label: 'Veste/Manteau' },
    { value: 'clothing-undergarment', label: 'Sous-vêtement' }
  ],
  'accessory': [
    { value: 'glasses', label: 'Lunettes' },
    { value: 'hat', label: 'Chapeau' },
    { value: 'jewelry', label: 'Bijou' },
    { value: 'bag', label: 'Sac' },
    { value: 'scarf', label: 'Écharpe' },
    { value: 'watch', label: 'Montre' }
  ],
  'facial-hair': [
    { value: 'mustache', label: 'Moustache' },
    { value: 'beard', label: 'Barbe' },
    { value: 'goatee', label: 'Barbichette' },
    { value: 'sideburns', label: 'Favoris' }
  ]
};

const AIGenerationForm: React.FC<AIGenerationFormProps> = ({
  onSubmit,
  isGenerating,
  savedApiKey,
  onClearApiKey,
  onCancel,
  disableSubmit
}) => {
  const [assetType, setAssetType] = useState<AssetType>('clothing');
  const [assetSubType, setAssetSubType] = useState<AssetSubType | undefined>(undefined);
  const [style, setStyle] = useState<AssetStyle>('cartoon');
  const [prompt, setPrompt] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>(savedApiKey || '');
  
  // Update subtype when asset type changes
  React.useEffect(() => {
    const availableSubTypes = assetSubTypes[assetType];
    if (availableSubTypes && availableSubTypes.length > 0) {
      setAssetSubType(availableSubTypes[0].value);
    } else {
      setAssetSubType(undefined);
    }
  }, [assetType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      assetType,
      assetSubType,
      style,
      prompt,
      apiKey
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="asset-type">Type d'asset</Label>
        <Select 
          value={assetType} 
          onValueChange={(value) => setAssetType(value as AssetType)}
        >
          <SelectTrigger id="asset-type">
            <SelectValue placeholder="Choisir un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clothing">Vêtement</SelectItem>
            <SelectItem value="hair">Cheveux</SelectItem>
            <SelectItem value="accessory">Accessoire</SelectItem>
            <SelectItem value="facial-hair">Pilosité Faciale</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Show subtype select only if the asset type has subtypes */}
      {assetSubTypes[assetType] && assetSubTypes[assetType].length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="asset-subtype">Sous-type</Label>
          <Select 
            value={assetSubType} 
            onValueChange={(value) => setAssetSubType(value as AssetSubType)}
          >
            <SelectTrigger id="asset-subtype">
              <SelectValue placeholder="Choisir un sous-type" />
            </SelectTrigger>
            <SelectContent>
              {assetSubTypes[assetType].map(subType => (
                <SelectItem key={subType.value} value={subType.value}>
                  {subType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="style">Style</Label>
        <Select 
          value={style} 
          onValueChange={(value) => setStyle(value as AssetStyle)}
        >
          <SelectTrigger id="style">
            <SelectValue placeholder="Choisir un style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cartoon">Cartoon</SelectItem>
            <SelectItem value="realistic">Réaliste</SelectItem>
            <SelectItem value="anime">Anime</SelectItem>
            <SelectItem value="minimalist">Minimaliste</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="prompt">Description détaillée (optionnel)</Label>
        <Textarea 
          id="prompt" 
          placeholder="Décrivez l'asset souhaité en détail..." 
          className="resize-none" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
      </div>
      
      <APIKeyInput
        apiKey={apiKey}
        onChange={setApiKey}
        onClear={onClearApiKey}
        savedApiKey={!!savedApiKey}
      />
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="submit"
          disabled={isGenerating || !apiKey || disableSubmit}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération...
            </>
          ) : (
            'Générer Asset'
          )}
        </Button>
      </div>
    </form>
  );
};

export default AIGenerationForm;
