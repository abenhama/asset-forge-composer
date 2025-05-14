
import React from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers } from 'lucide-react';
import { Asset, AssetType } from '@/types';
import { mockAssets } from "@/data/mockData";

interface AssetsSidebarProps {
  onSelectAsset: (asset: Asset) => void;
}

const AssetsSidebar: React.FC<AssetsSidebarProps> = ({ onSelectAsset }) => {
  const [activeTab, setActiveTab] = React.useState<AssetType>('base-doll');

  const getAssetsByType = (type: AssetType) => {
    return mockAssets.filter(asset => asset.type === type);
  };

  return (
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
                      onClick={() => onSelectAsset(asset)}
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
  );
};

export default AssetsSidebar;
