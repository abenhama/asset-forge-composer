
import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, Trash2, Lock, Unlock, Layers as LayersIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Layer } from '@/types/canvas';

interface LayersPanelProps {
  layers: Layer[];
  activeLayer: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayer,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
  onMoveLayer
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="border rounded-md overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/80 font-medium">
          <div className="flex items-center gap-2">
            <LayersIcon className="h-4 w-4" />
            <span>Calques ({layers.length})</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {isOpen ? '▼' : '▶'}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="h-[250px]">
            <div className="p-2 space-y-1">
              {layers.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Aucun calque disponible
                </div>
              ) : (
                layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex items-center justify-between p-2 rounded-sm ${
                      activeLayer === layer.id ? 'bg-primary/10' : 'hover:bg-secondary'
                    } cursor-pointer`}
                    onClick={() => onSelectLayer(layer.id)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title={layer.visible ? "Masquer" : "Afficher"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility(layer.id);
                        }}
                      >
                        {layer.visible ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </Button>
                      <span className="truncate text-sm">{layer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {layer.type}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title={layer.locked ? "Déverrouiller" : "Verrouiller"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(layer.id);
                        }}
                      >
                        {layer.locked ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Unlock className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        title="Supprimer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLayer(layer.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default LayersPanel;
