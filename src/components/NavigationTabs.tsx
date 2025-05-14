
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Upload, Gallery, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const NavigationTabs = () => {
  const location = useLocation();
  
  const getActiveClass = (path: string) => {
    return location.pathname === path ? 
      "bg-secondary text-primary-foreground" : 
      "text-muted-foreground hover:text-primary hover:bg-secondary/50";
  };

  return (
    <div className="flex flex-col w-[64px] border-r bg-card h-full">
      <NavLink to="/" className="flex justify-center p-2 mt-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("rounded-full", getActiveClass("/"))}
        >
          <Upload className="h-5 w-5" />
        </Button>
      </NavLink>
      <NavLink to="/gallery" className="flex justify-center p-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("rounded-full", getActiveClass("/gallery"))}
        >
          <Gallery className="h-5 w-5" />
        </Button>
      </NavLink>
      <NavLink to="/composer" className="flex justify-center p-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("rounded-full", getActiveClass("/composer"))}
        >
          <Layers className="h-5 w-5" />
        </Button>
      </NavLink>
    </div>
  );
};

export default NavigationTabs;
