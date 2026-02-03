import { useRef, useEffect, useState } from 'react';
import PersonCard from './PersonCard';
import { Person, Connection } from '../types';
import './Board.css';

interface BoardProps {
  people: Person[];
  connections: Connection[];
  selectedPerson: Person | null;
  editingConnection: string | null;
  onSelectPerson: (person: Person | null) => void;
  onMovePerson: (id: string, x: number, y: number) => void;
  onResizePerson: (id: string, width: number, height?: number) => void;
  onAddConnection: (fromPersonId: string, toPersonId: string, label?: string) => void;
  onDeleteConnection: (id: string) => void;
}

export default function Board({
  people,
  connections,
  selectedPerson,
  editingConnection,
  onSelectPerson,
  onMovePerson,
  onResizePerson,
  onAddConnection,
  onDeleteConnection,
}: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const minZoom = 0.5;
  const maxZoom = 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvas = () => {
      if (!boardRef.current) return;
      canvas.width = boardRef.current.clientWidth;
      canvas.height = boardRef.current.clientHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw red wire connections (accounting for pan and zoom)
      // The canvas is outside the transformed container, so we draw in screen coordinates
      connections.forEach(conn => {
        const fromPerson = people.find(p => p.id === conn.fromPersonId);
        const toPerson = people.find(p => p.id === conn.toPersonId);
        
        if (!fromPerson || !toPerson) return;

        // Calculate positions in screen coordinates at the pin location
        // Pin is at top center of card, so we need the card width to find center
        const fromCardWidth = fromPerson.width || 180;
        const toCardWidth = toPerson.width || 180;
        const fromX = (fromPerson.x + fromCardWidth / 2) * zoom + pan.x; // Center of card horizontally
        const fromY = fromPerson.y * zoom + pan.y; // Top of card (where pin is)
        const toX = (toPerson.x + toCardWidth / 2) * zoom + pan.x;
        const toY = toPerson.y * zoom + pan.y;

        // Draw straight line wire
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3 * zoom; // Scale line width with zoom
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Draw label if exists
        if (conn.label) {
          const midX = (fromX + toX) / 2;
          const midY = (fromY + toY) / 2;
          ctx.fillStyle = '#1f2937';
          ctx.font = `${12 * zoom}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(conn.label, midX, midY - 10 * zoom);
        }
      });
    };

    updateCanvas();
    window.addEventListener('resize', updateCanvas);
    return () => window.removeEventListener('resize', updateCanvas);
  }, [people, connections, zoom, pan]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(Number((prev + 0.1).toFixed(1)), maxZoom));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(Number((prev - 0.1).toFixed(1)), minZoom));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Always zoom with scroll wheel (like Figma)
      const board = boardRef.current;
      if (!board) return;
      
      const rect = board.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate the point in board coordinates before zoom
      const zoomPointX = (mouseX - pan.x) / zoom;
      const zoomPointY = (mouseY - pan.y) / zoom;
      
      // Zoom delta - use smaller increments for smoother zooming
      const zoomSpeed = 0.05;
      const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
      
      setZoom(prev => {
        const newZoom = Math.max(minZoom, Math.min(maxZoom, Number((prev + delta).toFixed(2))));
        
        // Adjust pan to zoom towards mouse position (keep the point under cursor in place)
        const newPanX = mouseX - zoomPointX * newZoom;
        const newPanY = mouseY - zoomPointY * newZoom;
        setPan({ x: newPanX, y: newPanY });
        
        return newZoom;
      });
    };

    const board = boardRef.current;
    if (board) {
      board.addEventListener('wheel', handleWheel, { passive: false });
      return () => board.removeEventListener('wheel', handleWheel);
    }
  }, [minZoom, maxZoom, pan, zoom]);

  const handleBoardMouseDown = (e: React.MouseEvent) => {
    // Only handle left clicks for panning
    if (e.button !== 0) return;
    
    // Check if we're clicking on a card (don't pan if clicking on card)
    const target = e.target as HTMLElement;
    if (target.closest('.person-card') || target.closest('.zoom-controls')) {
      return;
    }
    
    // Pan with left click on empty board space
    setIsPanning(true);
    setPanStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, panStart]);

  const handleBoardClick = (e: React.MouseEvent) => {
    // Only deselect if we're not panning and clicked on empty space
    if (!isPanning) {
      const target = e.target as HTMLElement;
      if (!target.closest('.person-card') && !target.closest('.zoom-controls')) {
        onSelectPerson(null);
      }
    }
  };

  return (
    <div 
      ref={boardRef} 
      className="board" 
      onClick={handleBoardClick}
      onMouseDown={handleBoardMouseDown}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      <div className="zoom-controls">
        <button onClick={handleZoomOut} disabled={zoom <= minZoom} title="Zoom Out">
          −
        </button>
        <span className="zoom-level">{(zoom * 100).toFixed(0)}%</span>
        <button onClick={handleZoomIn} disabled={zoom >= maxZoom} title="Zoom In">
          +
        </button>
        <button onClick={handleZoomReset} title="Reset Zoom & Pan">
          Reset
        </button>
      </div>
      <canvas ref={canvasRef} className="connections-canvas" />
      <div 
        className="board-content" 
        style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {people.map(person => (
          <PersonCard
            key={person.id}
            person={person}
            isSelected={selectedPerson?.id === person.id}
            onSelect={() => onSelectPerson(person)}
            onMove={onMovePerson}
            onResize={onResizePerson}
            zoom={zoom}
            pan={pan}
          />
        ))}
      </div>
    </div>
  );
}

