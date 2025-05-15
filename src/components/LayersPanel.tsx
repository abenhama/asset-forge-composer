
import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, Trash2, Lock, Unlock, Layers as LayersIcon, MoveUp, MoveDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Layer } from '@/types/canvas';
import { getAssetTypeLabel } from '@/utils/assetLayerUtils';

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

  // Group layers by type for better organization
  const groupedLayers = React.useMemo(() => {
    const grouped: Record<string, Layer[]> = {};
    
    layers.forEach(layer => {
      const type = layer.type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(layer);
    });
    
    return grouped;
  }, [layers]);

  // Get z-index for a layer
  const getLayerZIndex = (layer: Layer): number => {
    return (layer.object as any).data?.zIndex || 0;
  };

  // Get color for a layer based on its type
  const getLayerTypeColor = (type: string): string => {
    if (type.includes('base-doll')) return 'bg-orange-500';
    if (type.includes('hair')) return 'bg-yellow-500';
    if (type.includes('clothing')) return 'bg-blue-500';
    if (type.includes('accessory')) return 'bg-purple-500';
    if (type.includes('facial-hair')) return 'bg-green-500';
    return 'bg-gray-500';
  };

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
            {layers.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Aucun calque disponible
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {layers.map((layer) => {
                  const assetType = (layer.object as any).data?.assetType || '';
                  const assetSubType = (layer.object as any).data?.assetSubType || '';
                  const typeLabel = getAssetTypeLabel(assetType, assetSubType);
                  const zIndex = getLayerZIndex(layer);
                  const typeColor = getLayerTypeColor(layer.type);
                  
                  return (
                    <div
                      key={layer.id}
                      className={`flex items-center justify-between p-2 rounded-sm ${
                        activeLayer === layer.id ? 'bg-primary/10' : 'hover:bg-secondary'
                      } cursor-pointer border-l-2 ${activeLayer === layer.id ? 'border-primary' : typeColor}`}
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
                        
                        <div className="flex flex-col">
                          <span className="truncate text-sm font-medium">{layer.name}</span>
                          <div className="flex gap-1 items-center">
                            <Badge variant="outline" className="text-[10px] py-0 h-4">
                              {typeLabel}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              z:{zIndex}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          title="Monter"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveLayer(layer.id, 'down'); // 'down' in the array means 'up' visually
                          }}
                        >
                          <MoveUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          title="Descendre"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveLayer(layer.id, 'up'); // 'up' in the array means 'down' visually
                          }}
                        >
                          <MoveDown className="h-3 w-3" />
                        </Button>
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
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default LayersPanel;
