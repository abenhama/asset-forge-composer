
import React from 'react';
import { Asset } from '@/types';

interface BaseDollPreviewProps {
  baseDoll: Asset | null;
}

const BaseDollPreview = ({ baseDoll }: BaseDollPreviewProps) => {
  if (!baseDoll) {
    return (
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
        Aucun personnage de base sélectionné. Veuillez d'abord ajouter un base-doll au canvas.
      </div>
    );
  }

  return (
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
  );
};

export default BaseDollPreview;
