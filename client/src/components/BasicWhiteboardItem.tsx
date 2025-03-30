import React, { useState, useRef, useEffect } from 'react';
import { WhiteboardItem } from '@shared/schema';

interface WhiteboardItemProps {
  item: WhiteboardItem;
  onMove: (id: string, x: number, y: number) => void;
  onUpdate: (id: string, content: any) => void;
}

const BasicWhiteboardItem: React.FC<WhiteboardItemProps> = ({ item, onMove, onUpdate }) => {
  const [position, setPosition] = useState({ x: item.position.x, y: item.position.y });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editSubtext, setEditSubtext] = useState('');
  
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Update position when item.position changes
  useEffect(() => {
    setPosition({ x: item.position.x, y: item.position.y });
  }, [item.position.x, item.position.y]);
  
  // Set initial edit values when editing starts
  useEffect(() => {
    if (isEditing) {
      switch (item.type) {
        case 'text':
          setEditText(item.content.text || '');
          setEditSubtext(item.content.subtext || '');
          break;
        case 'task':
          setEditText(item.content.text || '');
          break;
        case 'event':
          setEditText(item.content.title || '');
          setEditSubtext(item.content.time || '');
          break;
        case 'image':
          setEditText(item.content.caption || '');
          break;
      }
    }
  }, [isEditing, item]);
  
  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (itemRef.current && e.touches[0]) {
      const rect = itemRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      });
      setIsDragging(true);
    }
  };
  
  // Global mouse/touch move and up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && itemRef.current) {
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;
        setPosition({ x, y });
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && itemRef.current && e.touches[0]) {
        const x = e.touches[0].clientX - dragOffset.x;
        const y = e.touches[0].clientY - dragOffset.y;
        setPosition({ x, y });
        e.preventDefault(); // Prevent scrolling while dragging
      }
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onMove(item.id, position.x, position.y);
      }
    };
    
    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        onMove(item.id, position.x, position.y);
      }
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset, position, item.id, onMove]);
  
  // Open edit dialog
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Save edit changes
  const saveEdit = () => {
    let newContent;
    
    switch (item.type) {
      case 'text':
        newContent = {
          ...item.content,
          text: editText,
          subtext: editSubtext
        };
        break;
      case 'task':
        newContent = {
          ...item.content,
          text: editText
        };
        break;
      case 'event':
        newContent = {
          ...item.content,
          title: editText,
          time: editSubtext
        };
        break;
      case 'image':
        newContent = {
          ...item.content,
          caption: editText
        };
        break;
      default:
        newContent = item.content;
    }
    
    onUpdate(item.id, newContent);
    setIsEditing(false);
  };
  
  // Toggle task completion
  const toggleTaskComplete = () => {
    if (item.type === 'task') {
      const newContent = {
        ...item.content,
        completed: !item.content.completed
      };
      onUpdate(item.id, newContent);
    }
  };
  
  // Get color based on item type
  const getColor = () => {
    switch (item.type) {
      case 'text': return '#A02C2C'; // Akane (Deep Red)
      case 'task': return '#DC6238'; // Persimmon
      case 'event': return '#2A4B7C'; // Kon (Indigo Blue)
      case 'image': return '#5D3A1A'; // Kogecha (Dark Brown)
      default: return '#A02C2C';
    }
  };
  
  // Get background color
  const getBgColor = () => {
    switch (item.type) {
      case 'text': return '#FFF8F8'; // Light red tint
      case 'task': return '#FFF9F1'; // Light orange tint
      case 'event': return '#F5F8FD'; // Light blue tint
      case 'image': return '#FAF7F5'; // Light brown tint
      default: return '#FFF8F8';
    }
  };
  
  const color = getColor();
  const bgColor = getBgColor();
  
  // Determine width based on type
  const getItemWidth = () => {
    switch (item.type) {
      case 'text': return '180px';
      case 'task': return '200px';
      case 'event': return '180px';
      case 'image': return '160px';
      default: return '180px';
    }
  };
  
  // Render item content based on type
  const renderContent = () => {
    switch (item.type) {
      case 'text':
        return (
          <div className="whiteboard-item-content">
            <div className="whiteboard-item-text">{item.content.text || 'Text note'}</div>
            {item.content.subtext && (
              <div className="whiteboard-item-subtext">{item.content.subtext}</div>
            )}
          </div>
        );
        
      case 'task':
        return (
          <div className="whiteboard-item-content task">
            <div 
              className={`task-checkbox ${item.content.completed ? 'completed' : ''}`}
              onClick={toggleTaskComplete}
            ></div>
            <div className="whiteboard-item-text task-text">{item.content.text || 'Task item'}</div>
          </div>
        );
        
      case 'event':
        return (
          <div className="whiteboard-item-content">
            <div className="event-header"></div>
            <div className="whiteboard-item-text">{item.content.title || 'Event'}</div>
            {item.content.time && (
              <div className="whiteboard-item-subtext">{item.content.time}</div>
            )}
          </div>
        );
        
      case 'image':
        return (
          <div className="whiteboard-item-content">
            <div className="image-placeholder">+ Add Image</div>
            {item.content.caption && (
              <div className="whiteboard-item-subtext">{item.content.caption}</div>
            )}
          </div>
        );
        
      default:
        return <div>Unknown item type</div>;
    }
  };
  
  return (
    <>
      <div
        id={`item-${item.id}`}
        ref={itemRef}
        className={`basic-whiteboard-item ${item.type}-item ${isDragging ? 'dragging' : ''}`}
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: getItemWidth(),
          backgroundColor: bgColor,
          borderColor: color,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: isDragging ? 100 : 10,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleEdit}
      >
        {/* Item top accent bar */}
        <div 
          className="item-accent-bar"
          style={{ backgroundColor: color }}
        ></div>
        
        {/* Content */}
        {renderContent()}
        
        {/* Action buttons */}
        <div className="item-actions">
          <button 
            className="edit-button"
            onClick={handleEdit}
            style={{ backgroundColor: color }}
          >
            Edit
          </button>
        </div>
      </div>
      
      {/* Edit Dialog */}
      {isEditing && (
        <div className="editor-container">
          <div 
            className="editor-backdrop"
            onClick={() => setIsEditing(false)}
          ></div>
          <div className="editing-overlay">
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{
                width: 'calc(100% - 20px)',
                marginLeft: 10,
                marginTop: 10,
                minHeight: 50,
                padding: 8,
                backgroundColor: 'white',
                border: `2px solid ${color}`,
                borderRadius: 4,
                fontFamily: 'Caveat, cursive',
                fontSize: 16,
                resize: 'none',
                outline: 'none',
              }}
              placeholder={
                item.type === 'text' ? 'Enter text...' :
                item.type === 'task' ? 'Enter task...' :
                item.type === 'event' ? 'Enter event title...' : 
                'Enter caption...'
              }
            />
            
            {/* Second field for subtext if needed */}
            {(item.type === 'text' || item.type === 'event') && (
              <textarea
                value={editSubtext}
                onChange={(e) => setEditSubtext(e.target.value)}
                style={{
                  width: 'calc(100% - 20px)',
                  marginLeft: 10,
                  marginTop: 5,
                  height: 40,
                  padding: 8,
                  backgroundColor: 'white',
                  border: `2px solid ${color}`,
                  borderRadius: 4,
                  fontFamily: 'Quicksand, sans-serif',
                  fontSize: 12,
                  resize: 'none',
                  outline: 'none',
                }}
                placeholder={
                  item.type === 'text' ? 'Enter subtext...' : 'Enter time/location...'
                }
              />
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              margin: '10px 10px'
            }}>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  marginRight: 8,
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: '#eee',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: color,
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BasicWhiteboardItem;