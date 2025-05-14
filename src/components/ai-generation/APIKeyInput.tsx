
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { Key } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { GenerationFormValues } from './AIGenerationForm';

interface APIKeyInputProps {
  form: UseFormReturn<GenerationFormValues>;
  savedApiKey: string | null;
  onClearApiKey: () => void;
}

const APIKeyInput = ({ form, savedApiKey, onClearApiKey }: APIKeyInputProps) => {
  return (
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
              onClick={onClearApiKey}
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
  );
};

export default APIKeyInput;
