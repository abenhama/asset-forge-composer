
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavedCharacter } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SavedCharactersListProps {
  characters: SavedCharacter[];
  onCharacterSelect: (character: SavedCharacter) => void;
  onCharacterDelete: (id: string) => void;
}

const SavedCharactersList: React.FC<SavedCharactersListProps> = ({
  characters,
  onCharacterSelect,
  onCharacterDelete
}) => {
  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      {characters.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          Aucun personnage sauvegardé
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {characters.map((character) => (
            <Card key={character.id} className="overflow-hidden">
              <div 
                className="w-full h-40 bg-secondary/50 cursor-pointer"
                onClick={() => onCharacterSelect(character)}
              >
                <img 
                  src={character.thumbnail} 
                  alt={character.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm truncate">{character.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {character.layers.length} calques • {formatDistanceToNow(new Date(character.dateModified), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCharacterDelete(character.id);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ScrollArea>
  );
};

export default SavedCharactersList;
