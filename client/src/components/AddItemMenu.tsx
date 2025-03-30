import React, { useEffect, useRef } from 'react';

interface AddItemMenuProps {
  position: { x: number, y: number };
  onAddItem: (type: 'text' | 'task' | 'image' | 'event') => void;
  onClose: () => void;
}

const AddItemMenu: React.FC<AddItemMenuProps> = ({ position, onAddItem, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Adjust menu position to ensure it stays within the viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 180),
    y: Math.min(position.y, window.innerHeight - 250)
  };
  
  return (
    <div 
      id="add-menu" 
      ref={menuRef}
      className="absolute bg-white/90 backdrop-blur-sm border border-secondary/20 rounded-lg shadow-lg p-3 flex flex-col gap-2" 
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        zIndex: 30,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.07)'
      }}
    >
      <div className="text-center font-handwritten font-bold text-xl text-primary opacity-90 mb-1">
        Add Item
      </div>
      
      {/* Text Note Button */}
      <button 
        className="menu-item flex items-center justify-between px-4 py-3 bg-white hover:bg-primary/5 rounded-md border border-primary/20 transition-all"
        onClick={() => onAddItem('text')}
        style={{ transform: 'rotate(-0.5deg)' }}
      >
        <span className="font-handwritten text-lg text-primary/90">Text Note</span>
        <span className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">T</span>
      </button>
      
      {/* Task Button */}
      <button 
        className="menu-item flex items-center justify-between px-4 py-3 bg-white hover:bg-orange-50 rounded-md border border-orange-200 transition-all"
        onClick={() => onAddItem('task')}
        style={{ transform: 'rotate(0.3deg)' }}
      >
        <span className="font-handwritten text-lg text-orange-700">Task</span>
        <span className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-700">✓</span>
      </button>
      
      {/* Image Button */}
      <button 
        className="menu-item flex items-center justify-between px-4 py-3 bg-white hover:bg-amber-50 rounded-md border border-amber-200 transition-all"
        onClick={() => onAddItem('image')}
        style={{ transform: 'rotate(-0.2deg)' }}
      >
        <span className="font-handwritten text-lg text-amber-800">Image</span>
        <span className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 text-amber-700">🖼️</span>
      </button>
      
      {/* Event Button */}
      <button 
        className="menu-item flex items-center justify-between px-4 py-3 bg-white hover:bg-blue-50 rounded-md border border-blue-200 transition-all"
        onClick={() => onAddItem('event')}
        style={{ transform: 'rotate(0.5deg)' }}
      >
        <span className="font-handwritten text-lg text-blue-700">Event</span>
        <span className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700">📅</span>
      </button>
    </div>
  );
};

export default AddItemMenu;
