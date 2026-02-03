import { useState, useEffect } from 'react';
import Board from './components/Board';
import TimelineView from './components/TimelineView';
import Sidebar from './components/Sidebar';
import { Person, Connection, TimelineEvent } from './types';
import './App.css';

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [editingConnection, setEditingConnection] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'people' | 'timeline'>('people');

  // Load from localStorage on mount
  useEffect(() => {
    const savedPeople = localStorage.getItem('murderMystery_people');
    const savedConnections = localStorage.getItem('murderMystery_connections');
    const savedTimeline = localStorage.getItem('murderMystery_timeline');

    if (savedPeople) {
      const loadedPeople = JSON.parse(savedPeople);
      // Migrate old people to have width if they don't have it
      const migratedPeople = loadedPeople.map((p: Person) => ({
        ...p,
        width: p.width || 180,
      }));
      setPeople(migratedPeople);
    }
    if (savedConnections) setConnections(JSON.parse(savedConnections));
    if (savedTimeline) {
      const events = JSON.parse(savedTimeline);
      // Migrate old format (time only) to new format (date + time)
      const migratedEvents = events.map((event: TimelineEvent) => {
        if (!event.date) {
          // Old format: try to parse time string or use today's date
          const today = new Date().toISOString().split('T')[0];
          return {
            ...event,
            date: today,
            time: event.time || '12:00',
          };
        }
        return event;
      });
      setTimelineEvents(migratedEvents);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('murderMystery_people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('murderMystery_connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('murderMystery_timeline', JSON.stringify(timelineEvents));
  }, [timelineEvents]);

  const defaultColors = [
    '#dc2626', // Red
    '#2563eb', // Blue
    '#16a34a', // Green
    '#ca8a04', // Yellow
    '#9333ea', // Purple
    '#ea580c', // Orange
    '#0891b2', // Cyan
    '#be185d', // Pink
    '#059669', // Emerald
    '#7c2d12', // Brown
  ];

  const addPerson = (person: Omit<Person, 'id' | 'x' | 'y'>) => {
    // Cycle through default colors if no color provided (empty string means auto-assign)
    const colorIndex = people.length % defaultColors.length;
    const defaultColor = defaultColors[colorIndex];
    
    const newPerson: Person = {
      ...person,
      id: Date.now().toString(),
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150,
      color: (person.color && person.color.trim() !== '') ? person.color : defaultColor,
      width: person.width || 180,
      height: person.height || undefined, // undefined means auto height
    };
    setPeople([...people, newPerson]);
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople(people.map(p => p.id === id ? { ...p, ...updates } : p));
    if (selectedPerson?.id === id) {
      setSelectedPerson({ ...selectedPerson, ...updates });
    }
  };

  const deletePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    setConnections(connections.filter(c => c.fromPersonId !== id && c.toPersonId !== id));
    setTimelineEvents(timelineEvents.map(e => ({
      ...e,
      personIds: e.personIds.filter(pid => pid !== id)
    })));
    if (selectedPerson?.id === id) {
      setSelectedPerson(null);
    }
  };

  const movePerson = (id: string, x: number, y: number) => {
    setPeople(people.map(p => p.id === id ? { ...p, x, y } : p));
  };

  const resizePerson = (id: string, width: number, height?: number) => {
    setPeople(people.map(p => p.id === id ? { ...p, width, height } : p));
  };

  const addConnection = (fromPersonId: string, toPersonId: string, label?: string) => {
    // Check if connection already exists
    const exists = connections.some(
      c => (c.fromPersonId === fromPersonId && c.toPersonId === toPersonId) ||
           (c.fromPersonId === toPersonId && c.toPersonId === fromPersonId)
    );
    if (exists || fromPersonId === toPersonId) return;

    const newConnection: Connection = {
      id: Date.now().toString(),
      fromPersonId,
      toPersonId,
      label,
    };
    setConnections([...connections, newConnection]);
  };

  const deleteConnection = (id: string) => {
    setConnections(connections.filter(c => c.id !== id));
  };

  const addTimelineEvent = (event: Omit<TimelineEvent, 'id'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: Date.now().toString(),
    };
    setTimelineEvents([...timelineEvents, newEvent].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    }));
  };

  const updateTimelineEvent = (id: string, updates: Partial<TimelineEvent>) => {
    setTimelineEvents(
      timelineEvents
        .map(e => e.id === id ? { ...e, ...updates } : e)
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        })
    );
  };

  const deleteTimelineEvent = (id: string) => {
    setTimelineEvents(timelineEvents.filter(e => e.id !== id));
  };

  const exportData = () => {
    const data = {
      people,
      connections,
      timelineEvents,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `murder-mystery-board-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const data = JSON.parse(text);
            
            if (confirm('This will replace all current data. Are you sure you want to continue?')) {
              if (data.people && Array.isArray(data.people)) {
                setPeople(data.people);
              }
              if (data.connections && Array.isArray(data.connections)) {
                setConnections(data.connections);
              }
              if (data.timelineEvents && Array.isArray(data.timelineEvents)) {
                setTimelineEvents(data.timelineEvents);
              }
              setSelectedPerson(null);
            }
          } catch (error) {
            alert('Error importing file. Please make sure it is a valid JSON file exported from this application.');
            console.error('Import error:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="app">
      <Sidebar
        people={people}
        connections={connections}
        timelineEvents={timelineEvents}
        selectedPerson={selectedPerson}
        editingConnection={editingConnection}
        activeTab={activeSidebarTab}
        onTabChange={setActiveSidebarTab}
        onSelectPerson={setSelectedPerson}
        onEditConnection={setEditingConnection}
        onAddPerson={addPerson}
        onUpdatePerson={updatePerson}
        onDeletePerson={deletePerson}
        onAddConnection={addConnection}
        onDeleteConnection={deleteConnection}
        onAddTimelineEvent={addTimelineEvent}
        onUpdateTimelineEvent={updateTimelineEvent}
        onDeleteTimelineEvent={deleteTimelineEvent}
        onExportData={exportData}
        onImportData={handleImportClick}
      />
      <div className="main-content">
        <div className={`content-area ${activeSidebarTab === 'people' ? 'board' : 'timeline'}`}>
          {activeSidebarTab === 'people' && (
            <div className="full-view">
              <Board
                people={people}
                connections={connections}
                selectedPerson={selectedPerson}
                editingConnection={editingConnection}
                onSelectPerson={setSelectedPerson}
                onMovePerson={movePerson}
                onResizePerson={resizePerson}
                onAddConnection={addConnection}
                onDeleteConnection={deleteConnection}
              />
            </div>
          )}
          {activeSidebarTab === 'timeline' && (
            <div className="full-view">
              <TimelineView
                timelineEvents={timelineEvents}
                people={people}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

