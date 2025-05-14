
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
    
    try {
      const generatedAsset = await generateAssetWithAI(
        {
          assetType: data.assetType,
          prompt: data.prompt,
          style: data.style,
          baseDollUrl: baseDoll.url,
        },
        data.apiKey
      );
      
      if (generatedAsset) {
        onGenerate(generatedAsset);
        onOpenChange(false);
        toast.success("Asset généré avec succès", {
          description: `Un nouveau ${data.assetType} a été créé.`,
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

  const handleClearApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setSavedApiKey(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Génération d'assets avec IA</DialogTitle>
          <DialogDescription>
            Créez de nouveaux assets pour votre personnage en utilisant l'intelligence artificielle.
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
  );
};

export default AIGenerationModal;
