
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
import { Layers, Download, Trash, ZoomIn, ZoomOut } from 'lucide-react';
import { mockAssets } from "@/data/mockData";
import { Asset, AssetType } from "@/types";
import { toast } from 'sonner';

const CharacterComposer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [activeTab, setActiveTab] = useState<AssetType>('base-doll');

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

    setFabricCanvas(canvas);

    // Cleanup
    return () => {
      canvas.dispose();
    };
  }, []);

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

      fabricCanvas.add(fabricImage);
      fabricCanvas.setActiveObject(fabricImage);
      fabricCanvas.renderAll();

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
    toast("Canvas effacé", {
      description: "Tous les assets ont été supprimés du canvas.",
    });
  };

  const downloadCanvas = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1, // Add the required multiplier property
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
            <Button size="sm" onClick={downloadCanvas}>
              <Download className="h-4 w-4 mr-1" />
              Télécharger
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center bg-secondary/50 rounded-lg overflow-hidden border">
          <canvas ref={canvasRef} />
        </div>
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
    </div>
  );
};

export default CharacterComposer;
