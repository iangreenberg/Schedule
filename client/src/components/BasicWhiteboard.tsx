import React, { useState, useEffect, useRef } from 'react';
import { WhiteboardItem } from '@shared/schema';
import BasicWhiteboardItem from './BasicWhiteboardItem';
import './BasicWhiteboardItem.css';
import { PlusCircle } from 'lucide-react';
import { findClosestDay } from '@/lib/utils/findClosestDay';
import Connector from './Connector';

interface WhiteboardProps {
  zoom: number;
  timelineScrollOffset?: number;
  refresh?: boolean;
}

const BasicWhiteboard: React.FC<WhiteboardProps> = ({ 
  zoom, 
  timelineScrollOffset = 0,
  refresh = false
}) => {
  const [items, setItems] = useState<WhiteboardItem[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const prevTimelineScrollOffset = useRef(timelineScrollOffset);
  
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
  
  // Reposition items when timeline scrolls
  useEffect(() => {
    // Skip on first render or when no items
    if (items.length === 0) return;
    
    // Calculate scroll delta from last position
    const scrollDelta = timelineScrollOffset - prevTimelineScrollOffset.current;
    prevTimelineScrollOffset.current = timelineScrollOffset;
    
    // Skip if no meaningful change
    if (Math.abs(scrollDelta) < 2) return;
    
    // If timeline has scrolled, we need to update all item positions
    // to maintain their connection to timeline days
    const repositionItems = async () => {
      try {
        // Get all timeline day elements
        const timelineDays = document.querySelectorAll('.timeline-day');
        if (!timelineDays.length) return;
        
        // Create a map of date strings to horizontal positions
        const datePositions = new Map<string, number>();
        timelineDays.forEach(day => {
          const dateStr = day.getAttribute('data-date');
          if (dateStr) {
            const rect = day.getBoundingClientRect();
            const horizontalCenter = rect.left + rect.width / 2;
            datePositions.set(dateStr, horizontalCenter);
          }
        });
        
        // Update each item's horizontal position based on its connected date
        const updatedItems = items.map(item => {
          // Format the item's date to match the data-date format
          const itemDateStr = new Date(item.connectedDate).toISOString().split('T')[0];
          // Find the horizontal position of the matching day
          const dayPosition = datePositions.get(itemDateStr);
          
          if (dayPosition !== undefined) {
            // Update the item's horizontal position to match its day
            return {
              ...item,
              position: {
                // Center the item horizontally on its day
                x: dayPosition - window.scrollX,
                y: item.position.y
              }
            };
          }
          return item;
        });
        
        setItems(updatedItems);
      } catch (error) {
        console.error('Error repositioning items:', error);
      }
    };
    
    // Only run this effect when timeline scrolls or when refresh is triggered
    if (Math.abs(scrollDelta) > 0 || refresh) {
      repositionItems();
    }
  }, [timelineScrollOffset, refresh, items]);
  
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
      
      // Get closest day on timeline
      const closestDay = new Date();
      try {
        // Find timeline element (in the middle of the screen)
        const timeline = document.getElementById('timeline');
        const timelineDays = document.querySelectorAll('.timeline-day');
        
        if (timeline && timelineDays.length > 0) {
          // Convert to array to make it easier to work with
          const days = Array.from(timelineDays);
          
          // We'll use horizontal distance to find the closest day
          const timelineRect = timeline.getBoundingClientRect();
          let closestDistance = Infinity;
          let closestDayElement = null;
          
          for (const day of days) {
            const rect = day.getBoundingClientRect();
            const horizontalCenter = rect.left + rect.width / 2;
            const distance = Math.abs(horizontalCenter - addMenuPosition.x);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestDayElement = day;
            }
          }
          
          // Get the date from the closest day
          if (closestDayElement) {
            const dateStr = closestDayElement.getAttribute('data-date');
            if (dateStr) {
              closestDay.setTime(new Date(dateStr).getTime());
            }
          }
        }
      } catch (error) {
        console.error('Error finding closest day:', error);
      }
      
      const newItem = {
        type,
        content,
        position: addMenuPosition,
        connectedDate: closestDay.toISOString() // Send as ISO string with connected date
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
  
  // Update item position and attach to nearest day
  const updateItemPosition = async (id: string, x: number, y: number) => {
    try {
      // Get the closest day on the timeline
      const closestDay = new Date();
      try {
        // Find timeline element
        const timeline = document.getElementById('timeline');
        const timelineDays = document.querySelectorAll('.timeline-day');
        
        if (timeline && timelineDays.length > 0) {
          // Convert to array to make it easier to work with
          const days = Array.from(timelineDays);
          
          // Use horizontal distance to find the closest day
          let closestDistance = Infinity;
          let closestDayElement = null;
          
          for (const day of days) {
            const rect = day.getBoundingClientRect();
            const horizontalCenter = rect.left + rect.width / 2;
            const distance = Math.abs(horizontalCenter - x);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestDayElement = day;
            }
          }
          
          // Get the date from the closest day
          if (closestDayElement) {
            const dateStr = closestDayElement.getAttribute('data-date');
            if (dateStr) {
              closestDay.setTime(new Date(dateStr).getTime());
            }
          }
        }
      } catch (error) {
        console.error('Error finding closest day:', error);
      }
      
      // Update the item with new position and connected date
      const updatedItems = items.map(item => 
        item.id === id 
          ? { 
              ...item, 
              position: { x, y },
              connectedDate: closestDay
            } 
          : item
      );
      
      setItems(updatedItems);
      
      // Send the update to the server
      await fetch(`/api/whiteboard-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          position: { x, y },
          connectedDate: closestDay.toISOString()
        }),
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
  
  // Track if we're currently dragging to prevent menu from opening
  const [hasDragged, setHasDragged] = useState(false);
  
  // Track mouse down position to detect dragging
  const [mouseDownPos, setMouseDownPos] = useState<{x: number, y: number} | null>(null);
  
  // Handle mouse down on canvas
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Don't track when clicking on items or button
    if ((e.target as HTMLElement).closest('.basic-whiteboard-item') || 
        (e.target as HTMLElement).closest('.add-item-button')) {
      return;
    }
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMouseDownPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setHasDragged(false);
    }
  };
  
  // Handle mouse move on canvas
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!mouseDownPos) return;
    
    // Check if mouse has moved more than a small threshold to count as dragging
    const moveThreshold = 5;
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      const distance = Math.sqrt(
        Math.pow(currentPos.x - mouseDownPos.x, 2) + 
        Math.pow(currentPos.y - mouseDownPos.y, 2)
      );
      
      if (distance > moveThreshold) {
        setHasDragged(true);
      }
    }
  };
  
  // Handle canvas click to either close add menu or create a new item
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Reset mouse down position
    setMouseDownPos(null);
    
    // If menu is open, close it
    if (showAddMenu) {
      setShowAddMenu(false);
      return;
    }
    
    // Don't open menu if we've been dragging
    if (hasDragged) {
      setHasDragged(false);
      return;
    }
    
    // Otherwise, create a new item at click position
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickPosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      // Don't create items when clicking on existing items or the add button
      if ((e.target as HTMLElement).closest('.basic-whiteboard-item') || 
          (e.target as HTMLElement).closest('.add-item-button')) {
        return;
      }
      
      setAddMenuPosition(clickPosition);
      setShowAddMenu(true);
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
        overflow: 'auto',
        backgroundColor: 'transparent',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      }}
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
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
      
      {/* Render connectors first (they should be under the items) */}
      {items.map(item => (
        <Connector key={`connector-${item.id}`} item={item} />
      ))}
      
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