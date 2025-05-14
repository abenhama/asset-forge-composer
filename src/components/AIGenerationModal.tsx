
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";
import { Asset } from "@/types";
import { generateAssetWithAI } from '@/services/aiGenerationService';
import { toast } from 'sonner';
import BaseDollPreview from './ai-generation/BaseDollPreview';
import AIGenerationForm, { GenerationFormValues } from './ai-generation/AIGenerationForm';
import ImageCropper from './ImageCropper';

interface AIGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseDoll: Asset | null;
  onGenerate: (asset: Asset) => void;
}

const AIGenerationModal = ({ open, onOpenChange, baseDoll, onGenerate }: AIGenerationModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState<string | null>(
    localStorage.getItem('openai_api_key')
  );
  const [generatedAsset, setGeneratedAsset] = useState<Asset | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleGenerate = async (data: GenerationFormValues) => {
    if (!baseDoll) {
      toast.error("Aucun personnage de base sélectionné");
      return;
    }

    // Sauvegarder la clé API pour une utilisation future
    if (data.apiKey) {
      localStorage.setItem('openai_api_key', data.apiKey);
      setSavedApiKey(data.apiKey);
    }

    setIsGenerating(true);
    
    toast("Analyse en cours...", {
      description: "Analyse du personnage de base avant la génération de l'asset...",
    });
    
    try {
      const asset = await generateAssetWithAI(
        {
          assetType: data.assetType,
          prompt: data.prompt,
          style: data.style,
          baseDollUrl: baseDoll.url,
        },
        data.apiKey
      );
      
      if (asset) {
        setGeneratedAsset(asset);
        setShowCropper(true);
        toast.success("Asset généré avec succès", {
          description: "Vous pouvez maintenant recadrer l'image pour optimiser la transparence.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      toast.error("Erreur lors de la génération", {
        description: "Une erreur s'est produite pendant le processus de génération."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    if (!generatedAsset) return;
    
    // Créer une copie de l'asset avec l'image recadrée
    const croppedAsset: Asset = {
      ...generatedAsset,
      url: croppedImageUrl,
      thumbnailUrl: croppedImageUrl
    };
    
    // Envoyer l'asset recadré
    onGenerate(croppedAsset);
    
    // Fermer le modal
    onOpenChange(false);
    
    // Réinitialiser l'état
    setGeneratedAsset(null);
    
    toast.success("Asset ajouté au canvas", {
      description: "L'asset recadré a été ajouté à votre composition.",
    });
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setSavedApiKey(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Génération d'assets avec IA</DialogTitle>
            <DialogDescription>
              Créez de nouveaux assets adaptés à votre personnage en utilisant l'intelligence artificielle.
            </DialogDescription>
          </DialogHeader>

          <div>
            <BaseDollPreview baseDoll={baseDoll} />
            
            <AIGenerationForm 
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
              savedApiKey={savedApiKey}
              onClearApiKey={handleClearApiKey}
              onCancel={() => onOpenChange(false)}
              disableSubmit={!baseDoll}
            />
          </div>
        </DialogContent>
      </Dialog>

      {generatedAsset && (
        <ImageCropper 
          open={showCropper}
          onOpenChange={setShowCropper}
          imageUrl={generatedAsset.url}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
};

export default AIGenerationModal;
