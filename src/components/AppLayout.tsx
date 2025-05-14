
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Upload, GalleryHorizontal, Layers, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AppLayout = () => {
  const { toast } = useToast();

  const handleNewProject = () => {
    toast({
      title: "Nouveau projet",
      description: "Cette fonctionnalité sera disponible prochainement."
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-primary">Asset Manager</h1>
          <div className="hidden md:flex items-center ml-8">
            <Button variant="ghost" size="sm" onClick={handleNewProject}>Nouveau</Button>
            <Button variant="ghost" size="sm" onClick={handleNewProject}>Exporter</Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>
            Actualiser
          </Button>
          <Button size="sm" variant="default">
            Aide
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
