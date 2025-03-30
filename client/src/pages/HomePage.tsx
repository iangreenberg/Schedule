import React from 'react';
import Timeline from '@/components/Timeline';
import Whiteboard from '@/components/Whiteboard';
import Controls from '@/components/Controls';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const [zoom, setZoom] = React.useState(100);
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-neutral py-4 px-6 shadow-sm relative z-20">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="font-handwritten text-4xl md:text-5xl font-bold title-underline">Ian's Schedule</h1>
          <div className="flex space-x-3">
            <Button className="px-3 py-2 rounded-md bg-primary text-white font-handwritten hover:bg-opacity-90">
              Save
            </Button>
            <Button 
              variant="outline"
              className="px-3 py-2 rounded-md bg-white border border-primary text-primary font-handwritten hover:bg-opacity-90"
            >
              Share
            </Button>
          </div>
        </div>
      </header>
      
      {/* Timeline */}
      <Timeline />
      
      {/* Whiteboard */}
      <Whiteboard zoom={zoom} />
      
      {/* Controls */}
      <Controls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
};

export default HomePage;
