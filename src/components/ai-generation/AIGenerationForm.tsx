
import React from 'react';
import { useForm } from "react-hook-form";
import { Wand2 } from 'lucide-react';
import { AssetType, AssetStyle } from "@/types";
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
import APIKeyInput from "./APIKeyInput";

export type GenerationFormValues = {
  assetType: AssetType;
  prompt: string;
  style: AssetStyle;
  apiKey: string;
};

interface AIGenerationFormProps {
  onSubmit: (data: GenerationFormValues) => void;
  isGenerating: boolean;
  savedApiKey: string | null;
  onClearApiKey: () => void;
  onCancel: () => void;
  disableSubmit: boolean;
}

const AIGenerationForm = ({
  onSubmit,
  isGenerating,
  savedApiKey,
  onClearApiKey,
  onCancel,
  disableSubmit
}: AIGenerationFormProps) => {
  const form = useForm<GenerationFormValues>({
    defaultValues: {
      assetType: 'hair',
      prompt: '',
      style: 'cartoon',
      apiKey: savedApiKey || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <APIKeyInput 
          form={form} 
          savedApiKey={savedApiKey} 
          onClearApiKey={onClearApiKey} 
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

        <div className="pt-4 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isGenerating || disableSubmit || !form.watch('apiKey')}
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
        </div>
      </form>
    </Form>
  );
};

export default AIGenerationForm;
