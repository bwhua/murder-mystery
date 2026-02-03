import { useState, useRef, useEffect } from 'react';
import { Person } from '../types';
import './PersonCard.css';

interface PersonCardProps {
  person: Person;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height?: number) => void;
  zoom: number;
  pan: { x: number; y: number };
}

export default function PersonCard({ person, isSelected, onSelect, onMove, onResize, zoom, pan }: PersonCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && cardRef.current) {
        const board = cardRef.current.parentElement?.parentElement;
        if (!board) return;
        
        const boardRect = board.getBoundingClientRect();
        const mouseX = (e.clientX - boardRect.left - pan.x) / zoom;
        const mouseY = (e.clientY - boardRect.top - pan.y) / zoom;
        
        // Calculate new size based on mouse movement from resize start
        const deltaX = mouseX - resizeStart.x;
        const deltaY = mouseY - resizeStart.y;
        
        const minWidth = 120;
        const minHeight = 80;
        const newWidth = Math.max(minWidth, resizeStart.width + deltaX);
        const newHeight = Math.max(minHeight, resizeStart.height + deltaY);
        
        onResize(person.id, newWidth, newHeight);
      } else if (isDragging && cardRef.current) {
        // Get the board element (parent of the card)
        const board = cardRef.current.parentElement?.parentElement;
        if (!board) return;
        
        const boardRect = board.getBoundingClientRect();
        
        // Calculate new position in board coordinates (accounting for pan and zoom)
        const boardX = (e.clientX - boardRect.left - pan.x) / zoom;
        const boardY = (e.clientY - boardRect.top - pan.y) / zoom;
        
        // Calculate the actual position accounting for drag offset
        const newX = boardX - dragOffset.x / zoom;
        const newY = boardY - dragOffset.y / zoom;
        
        // Keep card within reasonable bounds (allow negative for panning)
        const cardWidth = (person.width || 180) / zoom;
        const cardHeight = (person.height || cardRef.current.offsetHeight) / zoom;
        const minX = -cardWidth * 2;
        const minY = -cardHeight * 2;
        const maxX = (boardRect.width / zoom) + cardWidth;
        const maxY = (boardRect.height / zoom) + cardHeight;
        
        const constrainedX = Math.max(minX, Math.min(maxX, newX));
        const constrainedY = Math.max(minY, Math.min(maxY, newY));
        
        onMove(person.id, constrainedX, constrainedY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, person.id, person.width, person.height, onMove, onResize, zoom, pan]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    
    const target = e.target as HTMLElement;
    
    // Check if clicking on resize handle
    if (target.classList.contains('resize-handle') || target.closest('.resize-handle')) {
      e.stopPropagation();
      e.preventDefault();
      
      if (cardRef.current) {
        const board = cardRef.current.parentElement?.parentElement;
        if (!board) return;
        
        const boardRect = board.getBoundingClientRect();
        const mouseX = (e.clientX - boardRect.left - pan.x) / zoom;
        const mouseY = (e.clientY - boardRect.top - pan.y) / zoom;
        
        setResizeStart({
          x: mouseX,
          y: mouseY,
          width: person.width || cardRef.current.offsetWidth,
          height: person.height || cardRef.current.offsetHeight,
        });
        
        setIsResizing(true);
      }
      return;
    }
    
    // If clicking on the card itself (not empty space or resize handle), allow dragging
    if (target.closest('.person-card') && !target.closest('.resize-handle')) {
      e.stopPropagation(); // Prevent board pan handler
      
      onSelect();
      
      if (cardRef.current) {
        const cardRect = cardRef.current.getBoundingClientRect();
        // Calculate offset within the card (in screen coordinates)
        setDragOffset({
          x: e.clientX - cardRect.left,
          y: e.clientY - cardRect.top,
        });
        setIsDragging(true);
      }
    }
  };

  return (
    <div
      ref={cardRef}
      className={`person-card ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${person.x}px`,
        top: `${person.y}px`,
        width: person.width ? `${person.width}px` : undefined,
        height: person.height ? `${person.height}px` : undefined,
        borderColor: person.color,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="person-card-header" style={{ backgroundColor: person.color }}>
        <h3>{person.name}</h3>
        <span className="person-role">{person.role}</span>
      </div>
      {person.description && (
        <div className="person-description">{person.description}</div>
      )}
      {person.testimonials.length > 0 && (
        <div className="person-testimonials">
          <strong>Testimonials:</strong>
          <ul>
            {person.testimonials.map((testimonial, idx) => (
              <li key={idx}>{testimonial}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="person-pin" style={{ backgroundColor: person.color }}></div>
      {isSelected && (
        <div className="resize-handle" />
      )}
    </div>
  );
}

