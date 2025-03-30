import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { WhiteboardItem } from '@shared/schema';

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
  // State for the object dimensions
  const [width, setWidth] = useState(180);
  const [height, setHeight] = useState(80);
  
  // State for editing functionality
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editSubtext, setEditSubtext] = useState('');
  
  // References
  const groupRef = useRef<Konva.Group>(null);
  
  // Set initial dimensions based on object type
  useEffect(() => {
    switch (object.type) {
      case 'text':
        setWidth(180);
        setHeight(80);
        break;
      case 'task':
        setWidth(200);
        setHeight(60);
        break;
      case 'event':
        setWidth(180);
        setHeight(90);
        break;
      case 'image':
        setWidth(160);
        setHeight(120);
        break;
      default:
        setWidth(180);
        setHeight(80);
    }
  }, [object.type]);
  
  // Set initial edit values when editing starts
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
  }, [isEditing, object]);
  
  // Simple drag handlers
  const handleDragMove = () => {
    if (groupRef.current) {
      onDragMove(groupRef.current.x(), groupRef.current.y());
    }
  };
  
  const handleDragEnd = () => {
    if (groupRef.current) {
      onDragEnd(groupRef.current.x(), groupRef.current.y());
    }
  };
  
  // Edit dialog functions
  const openEditDialog = () => {
    setIsEditing(true);
  };
  
  const saveEdit = () => {
    if (!onContentChange) {
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
    
    onContentChange(object.id, newContent);
    setIsEditing(false);
  };
  
  // Theme colors
  const getColor = () => {
    switch(object.type) {
      case 'text': return '#A02C2C'; // Akane (Deep Red)
      case 'task': return '#DC6238'; // Persimmon 
      case 'event': return '#2A4B7C'; // Kon (Indigo Blue)
      case 'image': return '#5D3A1A'; // Kogecha (Dark Brown)
      default: return '#A02C2C';
    }
  };
  
  const getBgColor = () => {
    switch(object.type) {
      case 'text': return '#FFF8F8'; // Light red tint
      case 'task': return '#FFF9F1'; // Light orange tint
      case 'event': return '#F5F8FD'; // Light blue tint
      case 'image': return '#FAF7F5'; // Light brown tint
      default: return '#FFF8F8';
    }
  };
  
  const color = getColor();
  const bgColor = getBgColor();
  
  // Render content based on object type
  const getContent = () => {
    switch (object.type) {
      case 'text':
        return (
          <>
            <Text
              text={object.content.text || ''}
              fontSize={18}
              fontFamily="Caveat"
              fill={color}
              width={width - 20}
              padding={10}
              align="center"
            />
            {object.content.subtext && (
              <Text
                text={object.content.subtext}
                fontSize={12}
                fontFamily="Quicksand"
                fill="#666666"
                width={width - 20}
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
              x={15}
              y={15}
              width={16}
              height={16}
              stroke={color}
              strokeWidth={1.5}
              fill={object.content.completed ? color : "white"}
              cornerRadius={3}
            />
            <Text
              text={object.content.text || ''}
              fontSize={16}
              fontFamily="Caveat"
              fill={color}
              width={width - 60}
              padding={10}
              x={35}
              y={5}
              align="left"
            />
          </>
        );
        
      case 'event':
        return (
          <>
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
              text={object.content.title || ''}
              fontSize={18}
              fontFamily="Caveat"
              fill={color}
              width={width - 20}
              padding={10}
              y={15}
              align="center"
            />
            <Text
              text={object.content.time || ''}
              fontSize={12}
              fontFamily="Quicksand"
              fill="#666666"
              width={width - 20}
              padding={10}
              y={45}
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
                text={object.content.caption}
                fontSize={12}
                fontFamily="Quicksand"
                fill="#666666"
                width={width - 20}
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
  
  return (
    <>
      <Group
        ref={groupRef}
        x={object.position.x}
        y={object.position.y}
        draggable
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {/* Shadow */}
        <Rect
          x={3}
          y={3}
          width={width}
          height={height}
          fill="rgba(0,0,0,0.08)"
          cornerRadius={5}
        />
        
        {/* Background */}
        <Rect
          width={width}
          height={height}
          fill={bgColor}
          stroke={color}
          strokeWidth={2}
          cornerRadius={5}
        />
        
        {/* Top border accent */}
        <Rect
          width={width}
          height={5}
          fill={color}
          opacity={0.7}
          cornerRadius={[5, 5, 0, 0]}
        />
        
        {/* Content */}
        {getContent()}
        
        {/* Clickable overlay */}
        <Rect
          width={width}
          height={height}
          opacity={0}
          onClick={openEditDialog}
          onTap={openEditDialog}
          onDblClick={openEditDialog}
        />
      </Group>
      
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
                fontFamily: object.type === 'task' ? 'Quicksand' : 'Caveat',
                fontSize: 16,
                resize: 'none',
                outline: 'none',
              }}
              placeholder={
                object.type === 'text' ? 'Enter text...' :
                object.type === 'task' ? 'Enter task...' :
                object.type === 'event' ? 'Enter event title...' : 
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

export default WhiteboardObject;