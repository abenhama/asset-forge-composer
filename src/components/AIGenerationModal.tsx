
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AssetType, Asset, AssetStyle } from "@/types";
import { Wand2, Key } from 'lucide-react';
import { useForm } from "react-hook-form";
import { generateAssetWithAI } from '@/services/aiGenerationService';
import { toast } from 'sonner';

interface AIGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseDoll: Asset | null;
  onGenerate: (asset: Asset) => void;
}

type GenerationFormValues = {
  assetType: AssetType;
  prompt: string;
  style: AssetStyle;
  apiKey: string;
};

const AIGenerationModal = ({ open, onOpenChange, baseDoll, onGenerate }: AIGenerationModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState<string | null>(
    localStorage.getItem('openai_api_key')
  );
  
  const form = useForm<GenerationFormValues>({
    defaultValues: {
      assetType: 'hair',
      prompt: '',
      style: 'cartoon',
      apiKey: savedApiKey || '',
    },
  });

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
    } finally {
      setIsGenerating(false);
    }
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
          {baseDoll ? (
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-secondary/50 rounded-md overflow-hidden flex-shrink-0">
                <img 
                  src={baseDoll.thumbnailUrl} 
                  alt={baseDoll.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-medium">Base sélectionnée :</h4>
                <p className="text-sm text-muted-foreground">{baseDoll.name}</p>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
              Aucun personnage de base sélectionné. Veuillez d'abord ajouter un base-doll au canvas.
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clé API OpenAI</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="sk-..." 
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Effacer la clé API sauvegardée"
                        onClick={() => {
                          localStorage.removeItem('openai_api_key');
                          setSavedApiKey(null);
                          form.setValue('apiKey', '');
                        }}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Votre clé API sera stockée localement
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'asset à générer</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type d'asset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hair">Cheveux</SelectItem>
                        <SelectItem value="clothing">Vêtements</SelectItem>
                        <SelectItem value="accessory">Accessoires</SelectItem>
                        <SelectItem value="facial-hair">Pilosité faciale</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style visuel</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cartoon">Dessin animé</SelectItem>
                        <SelectItem value="realistic">Réaliste</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt de génération</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Cheveux courts bouclés rouges..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Décrivez l'asset que vous souhaitez générer
                    </FormDescription>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isGenerating || !baseDoll || !form.watch('apiKey')}
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Génération...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Wand2 className="mr-2 h-4 w-4" />
                      Générer
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIGenerationModal;
