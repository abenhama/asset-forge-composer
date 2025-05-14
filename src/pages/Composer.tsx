
import React from 'react';
import NavigationTabs from '@/components/NavigationTabs';
import CharacterComposer from '@/components/CharacterComposer';

const Composer = () => {
  return (
    <div className="flex h-full">
      <NavigationTabs />
      <div className="flex-1 overflow-hidden">
        <CharacterComposer />
      </div>
    </div>
  );
};

export default Composer;
