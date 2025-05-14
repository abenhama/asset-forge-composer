
import React from 'react';
import NavigationTabs from '@/components/NavigationTabs';
import AssetGallery from '@/components/AssetGallery';

const Gallery = () => {
  return (
    <div className="flex h-full">
      <NavigationTabs />
      <div className="flex-1 overflow-auto">
        <AssetGallery />
      </div>
    </div>
  );
};

export default Gallery;
