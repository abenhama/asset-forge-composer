
import React from 'react';
import { Key } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface APIKeyInputProps {
  apiKey: string;
  onChange: (value: string) => void;
  onClear: () => void;
  savedApiKey: boolean;
}

const APIKeyInput = ({ apiKey, onChange, onClear, savedApiKey }: APIKeyInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="api-key">Clé API OpenAI</Label>
      <div className="flex space-x-2">
        <Input 
          id="api-key"
          type="password"
          placeholder="sk-..." 
          value={apiKey}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Effacer la clé API sauvegardée"
          onClick={onClear}
        >
          <Key className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-sm text-muted-foreground">
        {savedApiKey ? "Utilisation de la clé API sauvegardée" : "Votre clé API sera stockée localement"}
      </div>
    </div>
  );
};

export default APIKeyInput;
