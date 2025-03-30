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
    x: Math.min(position.x, window.innerWidth - 160),
    y: Math.min(position.y, window.innerHeight - 220)
  };
  
  return (
    <div 
      id="add-menu" 
      ref={menuRef}
      className="absolute bg-white rounded-lg shadow-lg p-3 flex flex-col gap-2" 
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        zIndex: 30
      }}
    >
      <div className="text-center font-handwritten font-bold text-sm text-gray-500 mb-1">Add Item</div>
      
      <button 
        className="menu-item flex items-center justify-between px-4 py-2 bg-neutral hover:bg-gray-100 rounded-md"
        onClick={() => onAddItem('text')}
      >
        <span className="font-handwritten">Text Note</span>
        <span className="ml-2">T</span>
      </button>
      
      <button 
        className="menu-item flex items-center justify-between px-4 py-2 bg-neutral hover:bg-gray-100 rounded-md"
        onClick={() => onAddItem('task')}
      >
        <span className="font-handwritten">Task</span>
        <span className="ml-2">✓</span>
      </button>
      
      <button 
        className="menu-item flex items-center justify-between px-4 py-2 bg-neutral hover:bg-gray-100 rounded-md"
        onClick={() => onAddItem('image')}
      >
        <span className="font-handwritten">Image</span>
        <span className="ml-2">🖼️</span>
      </button>
      
      <button 
        className="menu-item flex items-center justify-between px-4 py-2 bg-neutral hover:bg-gray-100 rounded-md"
        onClick={() => onAddItem('event')}
      >
        <span className="font-handwritten">Event</span>
        <span className="ml-2">📅</span>
      </button>
    </div>
  );
};

export default AddItemMenu;
