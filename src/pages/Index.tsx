
import React from 'react';
import NavigationTabs from '@/components/NavigationTabs';
import UploadArea from '@/components/UploadArea';

const Index = () => {
  return (
    <div className="flex h-full">
      <NavigationTabs />
      <div className="flex-1 overflow-auto">
        <UploadArea />
      </div>
    </div>
  );
};

export default Index;
