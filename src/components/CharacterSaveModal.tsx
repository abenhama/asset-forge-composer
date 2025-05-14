
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SavedCharacter } from '@/types';
import { toast } from 'sonner';

interface CharacterSaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description: string) => SavedCharacter | null;
  thumbnail?: string;
}

const CharacterSaveModal: React.FC<CharacterSaveModalProps> = ({
  open,
  onOpenChange,
  onSave,
  thumbnail
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Veuillez donner un nom à votre personnage");
      return;
    }

    const savedCharacter = onSave(name, description);
    if (savedCharacter) {
      toast.success("Personnage sauvegardé avec succès!");
      setName('');
      setDescription('');
      onOpenChange(false);
    } else {
      toast.error("Une erreur est survenue lors de la sauvegarde");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sauvegarder le personnage</DialogTitle>
          <DialogDescription>
            Donnez un nom et une description optionnelle à votre création
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {thumbnail && (
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 bg-secondary/50 rounded border overflow-hidden">
                <img src={thumbnail} alt="Aperçu" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Mon personnage"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Description optionnelle..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSave}>
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterSaveModal;
