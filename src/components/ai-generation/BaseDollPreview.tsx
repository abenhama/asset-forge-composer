
import React from 'react';
import { Asset } from '@/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <h4 className="font-medium text-blue-800 mb-2">Base sélectionnée pour l'analyse</h4>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 bg-white rounded-md overflow-hidden flex-shrink-0 border border-blue-200">
          <AspectRatio ratio={1/1}>
            <img 
              src={baseDoll.thumbnailUrl} 
              alt={baseDoll.name} 
              className="w-full h-full object-contain"
            />
          </AspectRatio>
        </div>
        <div>
          <p className="text-sm font-medium text-blue-700">{baseDoll.name}</p>
          <p className="text-xs text-blue-600 mt-1">
            L'IA analysera ce personnage pour créer un asset parfaitement adapté à son style et à ses caractéristiques.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BaseDollPreview;
