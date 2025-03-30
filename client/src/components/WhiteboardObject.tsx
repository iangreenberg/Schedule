import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Line } from 'react-konva';
import { WhiteboardItem } from '@shared/schema';
import Konva from 'konva';

interface WhiteboardObjectProps {
  object: WhiteboardItem;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
  onContentChange?: (id: string, content: any) => void;
}

const WhiteboardObject: React.FC<WhiteboardObjectProps> = ({
  object,
  onDragMove,
  onDragEnd,
  onContentChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editSubtext, setEditSubtext] = useState('');
  const [editingField, setEditingField] = useState<'text' | 'subtext' | 'title' | 'time' | 'caption'>('text');
  const [width, setWidth] = useState(150);
  const [height, setHeight] = useState(60);
  const textRef = useRef<Konva.Text>(null);
  const group = useRef<Konva.Group>(null);
  
  // Initialize edit fields when going into edit mode
  useEffect(() => {
    if (isEditing) {
      switch (object.type) {
        case 'text':
          setEditText(object.content.text || '');
          setEditSubtext(object.content.subtext || '');
          break;
        case 'task':
          setEditText(object.content.text || '');
          break;
        case 'event':
          setEditText(object.content.title || '');
          setEditSubtext(object.content.time || '');
          break;
        case 'image':
          setEditText(object.content.caption || '');
          break;
      }
    }
  }, [isEditing, object.type, object.content]);
  
  useEffect(() => {
    // Calculate dimensions based on content
    if (textRef.current) {
      const textWidth = textRef.current.width();
      const textHeight = textRef.current.height();
      setWidth(Math.max(150, textWidth + 40));
      setHeight(Math.max(60, textHeight + 30));
    }
  }, [object.content]);
  
  // Handle double click to edit - separating from Konva completely
  const startEditing = () => {
    console.log('Start editing object with ID:', object.id);
    
    if (object.type === 'text') {
      setEditingField('text');
    } else if (object.type === 'task') {
      setEditingField('text');
    } else if (object.type === 'event') {
      setEditingField('title');
    } else if (object.type === 'image') {
      setEditingField('caption');
    }
    
    setIsEditing(true);
  };
  
  // Handle double click to edit - safe wrapper
  const handleDoubleClick = (e: Konva.KonvaEventObject<MouseEvent> | Konva.KonvaEventObject<TouchEvent>) => {
    // Stop event propagation to prevent conflicts
    e.cancelBubble = true;
    
    try {
      // Call our safe editing function
      startEditing();
    } catch (error) {
      console.error('Error in handleDoubleClick:', error);
    }
  };
  
  // Handle completing edit
  const completeEdit = () => {
    console.log('Completing edit for object ID:', object.id);
    console.log('onContentChange function exists:', Boolean(onContentChange));
    
    if (!onContentChange) {
      console.error('onContentChange is not defined!');
      setIsEditing(false);
      return;
    }
    
    let newContent;
    switch (object.type) {
      case 'text':
        newContent = {
          ...object.content,
          text: editText,
          subtext: editSubtext
        };
        break;
      case 'task':
        newContent = {
          ...object.content,
          text: editText
        };
        break;
      case 'event':
        newContent = {
          ...object.content,
          title: editText,
          time: editSubtext
        };
        break;
      case 'image':
        newContent = {
          ...object.content,
          caption: editText
        };
        break;
      default:
        newContent = object.content;
    }
    
    console.log('New content object:', newContent);
    try {
      onContentChange(object.id, newContent);
      console.log('Content change function called successfully');
    } catch (error) {
      console.error('Error calling onContentChange:', error);
    }
    setIsEditing(false);
  };
  
  // Handle keyboard events for editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditing) return;
      
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        completeEdit();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditing, editText, editSubtext]);
  
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!e.target || !group.current) return;
    // Use the group ref's position which is more reliable
    onDragMove(group.current.x(), group.current.y());
  };
  
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!e.target || !group.current) return;
    // Use the group ref's position which is more reliable
    onDragEnd(group.current.x(), group.current.y());
  };
  
  // Get color based on object type - Japanese-inspired color palette
  const getObjectColor = () => {
    switch(object.type) {
      case 'text':
        return '#A02C2C'; // Akane (Deep Red)
      case 'task':
        return '#DC6238'; // Persimmon 
      case 'event':
        return '#2A4B7C'; // Kon (Indigo Blue)
      case 'image':
        return '#5D3A1A'; // Kogecha (Dark Brown)
      default:
        return '#A02C2C'; // Default to Akane
    }
  };
  
  // Get background color with lighter tint
  const getBackgroundColor = () => {
    switch(object.type) {
      case 'text':
        return '#FFF8F8'; // Light red tint
      case 'task':
        return '#FFF9F1'; // Light orange tint
      case 'event':
        return '#F5F8FD'; // Light blue tint
      case 'image':
        return '#FAF7F5'; // Light brown tint
      default:
        return '#FFF8F8';
    }
  };
  
  const getObjectContent = () => {
    const color = getObjectColor();
    
    switch (object.type) {
      case 'text':
        return (
          <>
            <Text
              ref={textRef}
              text={object.content.text}
              fontSize={20}
              fontFamily="Caveat"
              fill={color} 
              width={width - 40}
              padding={10}
              align="center"
            />
            {object.content.subtext && (
              <Text
                text={object.content.subtext}
                fontSize={13}
                fontFamily="Quicksand"
                fill="#666666"
                width={width - 40}
                padding={10}
                y={30}
                align="center"
              />
            )}
          </>
        );
      case 'task':
        return (
          <>
            <Rect
              x={10}
              y={15}
              width={16}
              height={16}
              stroke={color}
              strokeWidth={1.5}
              fill={object.content.completed ? color : "white"}
              cornerRadius={3}
            />
            <Text
              ref={textRef}
              text={object.content.text}
              fontSize={18}
              fontFamily="Caveat"
              fill={color}
              width={width - 60}
              padding={10}
              x={32}
              align="left"
            />
          </>
        );
      case 'event':
        return (
          <>
            {/* Event icon circle */}
            <Rect
              x={10}
              y={10}
              width={width - 20}
              height={8}
              fill={color}
              opacity={0.8}
              cornerRadius={4}
            />
            <Text
              ref={textRef}
              text={object.content.title}
              fontSize={20}
              fontFamily="Caveat"
              fill={color} 
              width={width - 40}
              padding={10}
              y={15}
              align="center"
            />
            <Text
              text={object.content.time || ""}
              fontSize={12}
              fontFamily="Quicksand"
              fill="#666666"
              width={width - 40}
              padding={10}
              y={40}
              align="center"
            />
          </>
        );
      case 'image':
        return (
          <>
            <Rect
              x={10}
              y={10}
              width={width - 20}
              height={height - 40}
              stroke={color}
              strokeWidth={1}
              dash={[5, 2]}
              fill="#F9F9F9"
            />
            <Text
              text="+ Add Image"
              fontSize={14}
              fontFamily="Quicksand"
              fill="#666666"
              width={width - 20}
              padding={10}
              y={height / 2 - 20}
              align="center"
            />
            {object.content.caption && (
              <Text
                ref={textRef}
                text={object.content.caption}
                fontSize={12}
                fontFamily="Quicksand"
                fill="#666666"
                width={width - 40}
                padding={10}
                y={height - 30}
                align="center"
              />
            )}
          </>
        );
      default:
        return null;
    }
  };
  
  // Create Japanese-inspired brushstroke for border
  const color = getObjectColor();
  const bgColor = getBackgroundColor();
  
  // Function to create brush strokes with random variations
  const createBrushStroke = (startX: number, startY: number, endX: number, endY: number, width: number) => {
    const points: number[] = [];
    const segments = 8;
    const segmentLength = 1 / segments;
    
    for (let i = 0; i <= segments; i++) {
      const t = i * segmentLength;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      
      // Add random variation for artistic brush stroke effect
      const variation = (Math.random() * 2 - 1) * (width / 10);
      
      // Perpendicular direction
      const perpX = -(endY - startY);
      const perpY = endX - startX;
      
      // Normalize
      const length = Math.sqrt(perpX * perpX + perpY * perpY);
      const normPerpX = perpX / length;
      const normPerpY = perpY / length;
      
      points.push(x + normPerpX * variation, y + normPerpY * variation);
    }
    
    return points;
  };
  
  return (
    <>
      <Group
        ref={group}
        x={object.position.x}
        y={object.position.y}
        draggable
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {/* Shadow */}
        <Rect
          x={4}
          y={4}
          width={width}
          height={height}
          fill="rgba(0,0,0,0.08)"
          cornerRadius={6}
        />
        
        {/* Brushstroke border elements - bottom */}
        <Line
          points={createBrushStroke(-2, height + 2, width + 2, height + 2, 8)}
          stroke={color}
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
          opacity={0.8}
        />
        
        {/* Background with texture */}
        <Rect
          width={width}
          height={height}
          fill={bgColor}
          cornerRadius={4}
          perfectDrawEnabled={false}
        />
        
        {/* Brushstroke border elements - top */}
        <Line
          points={createBrushStroke(-2, -2, width + 2, -2, 8)}
          stroke={color}
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
          opacity={0.8}
        />
        
        {/* Brushstroke border elements - left */}
        <Line
          points={createBrushStroke(-2, -2, -2, height + 2, 8)}
          stroke={color}
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
          opacity={0.8}
        />
        
        {/* Brushstroke border elements - right */}
        <Line
          points={createBrushStroke(width + 2, -2, width + 2, height + 2, 8)}
          stroke={color}
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
          opacity={0.8}
        />
        
        {/* Content */}
        {getObjectContent()}
        
        {/* Hover indicator - clickable */}
        <Rect
          width={width}
          height={height}
          opacity={0}
          onClick={(e) => {
            // On mobile, a tap will trigger this
            if (e.evt.type === 'touchend') {
              try {
                startEditing();
              } catch (error) {
                console.error('Error handling touch tap:', error);
              }
            }
          }}
          onDblClick={(e) => {
            try {
              e.cancelBubble = true;
              startEditing();
            } catch (error) {
              console.error('Error handling double-click:', error);
            }
          }}
          onTap={() => {
            try {
              startEditing();
            } catch (error) {
              console.error('Error handling tap:', error);
            }
          }}
          perfectDrawEnabled={false}
        />
      </Group>
      
      {/* Editing interface */}
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
                minHeight: editingField === 'caption' ? height - 60 : 50,
                padding: 8,
                backgroundColor: 'white',
                border: `2px solid ${color}`,
                borderRadius: 4,
                fontFamily: editingField === 'time' ? 'Quicksand' : 'Caveat',
                fontSize: editingField === 'time' ? 14 : 18,
                resize: 'none',
                outline: 'none',
              }}
              placeholder={
                editingField === 'text' ? 'Enter text...' :
                editingField === 'title' ? 'Enter event title...' :
                editingField === 'time' ? 'Enter time/location...' : 
                'Enter caption...'
              }
            />
            
            {/* Second field for subtext if needed */}
            {(object.type === 'text' || object.type === 'event') && (
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
                  fontFamily: 'Quicksand',
                  fontSize: 12,
                  resize: 'none',
                  outline: 'none',
                }}
                placeholder={
                  object.type === 'text' ? 'Enter subtext...' : 'Enter time/location...'
                }
              />
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              margin: '5px 10px'
            }}>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  marginRight: 8,
                  padding: '5px 10px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: '#eee',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={completeEdit}
                style={{
                  padding: '5px 10px',
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

export default WhiteboardObject;
