
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Image as FabricImage } from 'fabric';
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Layers, Download, Trash, ZoomIn, ZoomOut, Wand2 } from 'lucide-react';
import { mockAssets } from "@/data/mockData";
import { Asset, AssetType } from "@/types";
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import AIGenerationModal from './AIGenerationModal';
import LayersPanel from './LayersPanel';
import ObjectControls from './ObjectControls';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  object: fabric.Object;
}

const CharacterComposer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [activeTab, setActiveTab] = useState<AssetType>('base-doll');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedBaseDoll, setSelectedBaseDoll] = useState<Asset | null>(null);
  
  // Nouvelles fonctionnalités
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [objectPosition, setObjectPosition] = useState({ x: 0, y: 0 });
  const [objectScale, setObjectScale] = useState({ x: 1, y: 1 });
  const [objectAngle, setObjectAngle] = useState(0);

  // Filter assets by type
  const getAssetsByType = (type: AssetType) => {
    return mockAssets.filter(asset => asset.type === type);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric Canvas
    const canvas = new Canvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: '#f8f9fa',
    });

    // Événement de sélection d'objet
    canvas.on('selection:created', (e) => handleObjectSelection(e));
    canvas.on('selection:updated', (e) => handleObjectSelection(e));
    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setActiveLayer(null);
    });

    // Événement de modification d'objet
    canvas.on('object:modified', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    // Événement de déplacement d'objet
    canvas.on('object:moving', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    // Événement de redimensionnement d'objet
    canvas.on('object:scaling', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    // Événement de rotation d'objet
    canvas.on('object:rotating', (e) => {
      if (e.target) {
        updateObjectProperties(e.target);
      }
    });

    setFabricCanvas(canvas);

    // Cleanup
    return () => {
      canvas.dispose();
    };
  }, []);

  // Mettre à jour les propriétés de l'objet sélectionné
  const updateObjectProperties = (obj: fabric.Object) => {
    if (!obj) return;

    setObjectPosition({ 
      x: obj.left || 0, 
      y: obj.top || 0 
    });
    setObjectScale({ 
      x: obj.scaleX || 1, 
      y: obj.scaleY || 1 
    });
    setObjectAngle(obj.angle || 0);
  };

  // Gérer la sélection d'un objet
  const handleObjectSelection = (e: any) => {
    if (!e.selected || e.selected.length === 0) return;
    
    const obj = e.selected[0];
    setSelectedObject(obj);
    updateObjectProperties(obj);
    
    // Trouver et sélectionner le calque correspondant
    const layer = layers.find(layer => layer.object === obj);
    if (layer) {
      setActiveLayer(layer.id);
    }
  };

  const addAssetToCanvas = async (asset: Asset) => {
    if (!fabricCanvas) return;

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        imgElement.src = asset.url;
        imgElement.onload = () => resolve(imgElement);
        imgElement.onerror = reject;
      });

      const fabricImage = new FabricImage(img, {
        left: 150,
        top: 150,
        scaleX: 0.5,
        scaleY: 0.5,
      });

      // Ajouter une donnée personnalisée à l'objet
      fabricImage.data = {
        assetId: asset.id,
        assetType: asset.type,
      };

      fabricCanvas.add(fabricImage);
      fabricCanvas.setActiveObject(fabricImage);
      fabricCanvas.renderAll();

      // Si l'asset est un base-doll, le stocker pour la génération d'IA
      if (asset.type === 'base-doll') {
        setSelectedBaseDoll(asset);
      }

      // Créer un nouveau calque
      const newLayer: Layer = {
        id: uuidv4(),
        name: asset.name,
        type: asset.type,
        visible: true,
        locked: false,
        object: fabricImage
      };

      setLayers(prev => [...prev, newLayer]);
      setActiveLayer(newLayer.id);
      setSelectedObject(fabricImage);
      updateObjectProperties(fabricImage);

      toast("Asset ajouté", {
        description: `${asset.name} a été ajouté au canvas.`,
      });
    } catch (error) {
      console.error("Erreur lors du chargement de l'image:", error);
      toast("Erreur", {
        description: "Impossible d'ajouter l'asset au canvas.",
      });
    }
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#f8f9fa';
    fabricCanvas.renderAll();
    setSelectedBaseDoll(null);
    setLayers([]);
    setActiveLayer(null);
    setSelectedObject(null);
    toast("Canvas effacé", {
      description: "Tous les assets ont été supprimés du canvas.",
    });
  };

  const downloadCanvas = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1, // Required property
    });
    
    const link = document.createElement('a');
    link.download = 'character-composition.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Téléchargement réussi", {
      description: "Votre composition a été téléchargée.",
    });
  };

  const handleGenerateAssets = () => {
    if (!selectedBaseDoll) {
      toast("Erreur", {
        description: "Veuillez d'abord ajouter un personnage de base au canvas.",
      });
      return;
    }

    setShowAIModal(true);
  };

  const zoomIn = () => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom();
    fabricCanvas.setZoom(zoom * 1.1);
  };

  const zoomOut = () => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom();
    fabricCanvas.setZoom(zoom * 0.9);
  };

  // Nouvelles fonctions pour gérer les calques
  const handleSelectLayer = (id: string) => {
    const layer = layers.find(layer => layer.id === id);
    if (!layer || !fabricCanvas) return;

    setActiveLayer(id);
    fabricCanvas.setActiveObject(layer.object);
    fabricCanvas.renderAll();
    
    setSelectedObject(layer.object);
    updateObjectProperties(layer.object);
  };

  const handleToggleVisibility = (id: string) => {
    setLayers(layers.map(layer => {
      if (layer.id === id) {
        const newVisible = !layer.visible;
        layer.object.visible = newVisible;
        fabricCanvas?.renderAll();
        return { ...layer, visible: newVisible };
      }
      return layer;
    }));
  };

  const handleToggleLock = (id: string) => {
    setLayers(layers.map(layer => {
      if (layer.id === id) {
        const newLocked = !layer.locked;
        layer.object.selectable = !newLocked;
        layer.object.evented = !newLocked;
        fabricCanvas?.renderAll();
        return { ...layer, locked: newLocked };
      }
      return layer;
    }));
  };

  const handleDeleteLayer = (id: string) => {
    const layer = layers.find(layer => layer.id === id);
    if (layer && fabricCanvas) {
      fabricCanvas.remove(layer.object);
      setLayers(layers.filter(l => l.id !== id));
      
      if (activeLayer === id) {
        setActiveLayer(null);
        setSelectedObject(null);
      }
    }
  };

  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(layer => layer.id === id);
    if (index === -1) return;

    const newLayers = [...layers];
    let newIndex;

    if (direction === 'up' && index < newLayers.length - 1) {
      newIndex = index + 1;
    } else if (direction === 'down' && index > 0) {
      newIndex = index - 1;
    } else {
      return;
    }

    // Échanger les calques
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    
    // Mettre à jour l'ordre dans le canvas si nécessaire
    if (fabricCanvas) {
      const obj1 = newLayers[index].object;
      const obj2 = newLayers[newIndex].object;
      
      if (direction === 'up') {
        obj1.bringForward();
      } else {
        obj1.sendBackwards();
      }
      
      fabricCanvas.renderAll();
    }
    
    setLayers(newLayers);
  };

  // Fonctions pour modifier les propriétés de l'objet sélectionné
  const handlePositionChange = (x: number, y: number) => {
    if (!selectedObject || !fabricCanvas) return;
    
    selectedObject.set({ left: x, top: y });
    fabricCanvas.renderAll();
    setObjectPosition({ x, y });
  };

  const handleScaleChange = (x: number, y: number) => {
    if (!selectedObject || !fabricCanvas) return;
    
    selectedObject.set({ scaleX: x, scaleY: y });
    fabricCanvas.renderAll();
    setObjectScale({ x, y });
  };

  const handleAngleChange = (angle: number) => {
    if (!selectedObject || !fabricCanvas) return;
    
    selectedObject.set({ angle });
    fabricCanvas.renderAll();
    setObjectAngle(angle);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Panel - Canvas */}
      <div className="flex-1 flex flex-col p-6 overflow-auto border-r">
        <h2 className="text-2xl font-bold mb-6">Compositeur de Personnages</h2>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4 mr-1" />
              Zoom +
            </Button>
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4 mr-1" />
              Zoom -
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <Trash className="h-4 w-4 mr-1" />
              Effacer
            </Button>
            <Button 
              variant="outline"
              size="sm" 
              onClick={handleGenerateAssets}
              disabled={!selectedBaseDoll || isGenerating}
            >
              <Wand2 className="h-4 w-4 mr-1" />
              Générer avec IA
            </Button>
            <Button size="sm" onClick={downloadCanvas}>
              <Download className="h-4 w-4 mr-1" />
              Télécharger
            </Button>
          </div>
        </div>
        
        <ResizablePanelGroup direction="vertical" className="flex-1">
          <ResizablePanel defaultSize={70} className="flex items-center justify-center bg-secondary/50 rounded-lg overflow-hidden border">
            <canvas ref={canvasRef} />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30} className="bg-card rounded-lg border">
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold mb-2">Propriétés</h3>
              
              {/* Panneau de calques */}
              <LayersPanel 
                layers={layers}
                activeLayer={activeLayer}
                onSelectLayer={handleSelectLayer}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onDeleteLayer={handleDeleteLayer}
                onMoveLayer={handleMoveLayer}
              />
              
              {/* Contrôles de l'objet sélectionné */}
              <ObjectControls 
                isVisible={!!selectedObject}
                position={objectPosition}
                scale={objectScale}
                angle={objectAngle}
                onPositionChange={handlePositionChange}
                onScaleChange={handleScaleChange}
                onAngleChange={handleAngleChange}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {/* Right Panel - Assets */}
      <div className="w-80 flex flex-col bg-card border-l">
        <Card className="flex-1 rounded-none border-0">
          <CardHeader className="px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Assets</CardTitle>
              <Layers className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Sélectionnez des éléments à ajouter
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as AssetType)}
              className="w-full"
            >
              <TabsList className="w-full justify-start px-4 rounded-none border-b h-auto py-0">
                <TabsTrigger value="base-doll" className="py-2 px-3 text-xs">Base</TabsTrigger>
                <TabsTrigger value="hair" className="py-2 px-3 text-xs">Cheveux</TabsTrigger>
                <TabsTrigger value="clothing" className="py-2 px-3 text-xs">Vêtements</TabsTrigger>
                <TabsTrigger value="accessory" className="py-2 px-3 text-xs">Accessoires</TabsTrigger>
                <TabsTrigger value="facial-hair" className="py-2 px-3 text-xs">Pilosité</TabsTrigger>
              </TabsList>
              
              {(['base-doll', 'hair', 'clothing', 'accessory', 'facial-hair'] as AssetType[]).map((type) => (
                <TabsContent key={type} value={type} className="overflow-auto h-[calc(100vh-13rem)]">
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {getAssetsByType(type).map((asset) => (
                      <div
                        key={asset.id}
                        className="border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-colors"
                        onClick={() => addAssetToCanvas(asset)}
                      >
                        <div className="h-20 bg-secondary/50 flex items-center justify-center p-1">
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium truncate">{asset.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modal de génération d'IA */}
      <AIGenerationModal 
        open={showAIModal} 
        onOpenChange={setShowAIModal}
        baseDoll={selectedBaseDoll}
        onGenerate={(assetType) => {
          setIsGenerating(true);
          // Simulation d'une génération IA
          setTimeout(() => {
            setIsGenerating(false);
            setShowAIModal(false);
            toast.success(`Asset ${assetType} généré avec succès!`);
            // Dans une implémentation réelle, on ajouterait l'asset généré au canvas ici
          }, 2000);
        }}
      />
    </div>
  );
};

export default CharacterComposer;
