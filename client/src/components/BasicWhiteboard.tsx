import React, { useState, useEffect, useRef } from 'react';
import { WhiteboardItem } from '@shared/schema';
import BasicWhiteboardItem from './BasicWhiteboardItem';
import './BasicWhiteboardItem.css';
import { PlusCircle } from 'lucide-react';

interface WhiteboardProps {
  zoom: number;
}

const BasicWhiteboard: React.FC<WhiteboardProps> = ({ zoom }) => {
  const [items, setItems] = useState<WhiteboardItem[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Load items from the server on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/whiteboard-items');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching whiteboard items:', error);
      }
    };
    
    fetchItems();
  }, []);
  
  // Add a new item
  const addItem = async (type: 'text' | 'task' | 'image' | 'event') => {
    try {
      let content;
      switch (type) {
        case 'text':
          content = { text: 'New text note', subtext: '' };
          break;
        case 'task':
          content = { text: 'New task', completed: false };
          break;
        case 'event':
          content = { title: 'New event', time: '' };
          break;
        case 'image':
          content = { caption: '' };
          break;
        default:
          content = {};
      }
      
      const newItem = {
        type,
        content,
        position: addMenuPosition,
        connectedDate: new Date()
      };
      
      const response = await fetch('/api/whiteboard-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      const data = await response.json();
      setItems(prev => [...prev, data]);
      setShowAddMenu(false);
    } catch (error) {
      console.error('Error adding whiteboard item:', error);
    }
  };
  
  // Update item position
  const updateItemPosition = async (id: string, x: number, y: number) => {
    try {
      const updatedItems = items.map(item => 
        item.id === id 
          ? { ...item, position: { x, y } } 
          : item
      );
      
      setItems(updatedItems);
      
      await fetch(`/api/whiteboard-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position: { x, y } }),
      });
    } catch (error) {
      console.error('Error updating item position:', error);
    }
  };
  
  // Update item content
  const updateItemContent = async (id: string, content: any) => {
    try {
      const updatedItems = items.map(item => 
        item.id === id 
          ? { ...item, content } 
          : item
      );
      
      setItems(updatedItems);
      
      await fetch(`/api/whiteboard-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
    } catch (error) {
      console.error('Error updating item content:', error);
    }
  };
  
  // Handle right click on canvas to show add menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setAddMenuPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setShowAddMenu(true);
    }
  };
  
  // Handle canvas click to close add menu
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (showAddMenu) {
      setShowAddMenu(false);
    }
  };
  
  return (
    <div 
      ref={canvasRef}
      className="basic-whiteboard"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        transform: `scale(${zoom})`,
        transformOrigin: 'center center',
      }}
      onClick={handleCanvasClick}
      onContextMenu={handleContextMenu}
    >
      {/* Add button */}
      <button
        className="add-item-button"
        onClick={(e) => {
          e.stopPropagation();
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            setAddMenuPosition({
              x: rect.width / 2,
              y: rect.height / 2
            });
            setShowAddMenu(true);
          }
        }}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          borderRadius: '50%',
          backgroundColor: '#A02C2C',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        }}
      >
        <PlusCircle size={24} />
      </button>
      
      {/* Render items */}
      {items.map(item => (
        <BasicWhiteboardItem
          key={item.id}
          item={item}
          onMove={updateItemPosition}
          onUpdate={updateItemContent}
        />
      ))}
      
      {/* Add item menu */}
      {showAddMenu && (
        <div 
          className="add-item-menu"
          style={{
            position: 'absolute',
            top: `${addMenuPosition.y}px`,
            left: `${addMenuPosition.x}px`,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '5px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
            padding: '8px',
            zIndex: 1000
          }}
        >
          <div 
            className="add-item-option"
            onClick={() => addItem('text')}
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              margin: '2px 0',
              borderRadius: '3px',
              color: '#A02C2C',
              backgroundColor: '#FFF8F8',
              fontFamily: 'Quicksand, sans-serif'
            }}
          >
            Text Note
          </div>
          <div 
            className="add-item-option"
            onClick={() => addItem('task')}
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              margin: '2px 0',
              borderRadius: '3px',
              color: '#DC6238',
              backgroundColor: '#FFF9F1',
              fontFamily: 'Quicksand, sans-serif'
            }}
          >
            Task
          </div>
          <div 
            className="add-item-option"
            onClick={() => addItem('event')}
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              margin: '2px 0',
              borderRadius: '3px',
              color: '#2A4B7C',
              backgroundColor: '#F5F8FD',
              fontFamily: 'Quicksand, sans-serif'
            }}
          >
            Event
          </div>
          <div 
            className="add-item-option"
            onClick={() => addItem('image')}
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              margin: '2px 0',
              borderRadius: '3px',
              color: '#5D3A1A',
              backgroundColor: '#FAF7F5',
              fontFamily: 'Quicksand, sans-serif'
            }}
          >
            Image
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicWhiteboard;