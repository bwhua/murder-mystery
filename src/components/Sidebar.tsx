import { useState } from 'react';
import { Person, Connection, TimelineEvent } from '../types';
import './Sidebar.css';

interface SidebarProps {
  people: Person[];
  connections: Connection[];
  timelineEvents: TimelineEvent[];
  selectedPerson: Person | null;
  editingConnection: string | null;
  activeTab: 'people' | 'timeline';
  onTabChange: (tab: 'people' | 'timeline') => void;
  onSelectPerson: (person: Person | null) => void;
  onEditConnection: (personId: string | null) => void;
  onAddPerson: (person: Omit<Person, 'id' | 'x' | 'y'>) => void;
  onUpdatePerson: (id: string, updates: Partial<Person>) => void;
  onDeletePerson: (id: string) => void;
  onAddConnection: (fromPersonId: string, toPersonId: string, label?: string) => void;
  onDeleteConnection: (id: string) => void;
  onAddTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  onUpdateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  onDeleteTimelineEvent: (id: string) => void;
  onExportData: () => void;
  onImportData: () => void;
}

export default function Sidebar({
  people,
  connections,
  timelineEvents,
  selectedPerson,
  editingConnection,
  activeTab,
  onTabChange,
  onSelectPerson,
  onEditConnection,
  onAddPerson,
  onUpdatePerson,
  onDeletePerson,
  onAddConnection,
  onDeleteConnection,
  onAddTimelineEvent,
  onUpdateTimelineEvent,
  onDeleteTimelineEvent,
  onExportData,
  onImportData,
}: SidebarProps) {
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    role: '',
    description: '',
    color: '',
  });
  const [newTestimonial, setNewTestimonial] = useState('');
  const [newTimelineEvent, setNewTimelineEvent] = useState({
    date: '',
    time: '',
    description: '',
    personId: '',
  });
  const [newConnection, setNewConnection] = useState({ toId: '', label: '' });
  const [editingTimelineEvent, setEditingTimelineEvent] = useState<string | null>(null);
  const [editTimelineEvent, setEditTimelineEvent] = useState({
    date: '',
    time: '',
    description: '',
    personId: '',
  });

  const handleAddPerson = () => {
    if (!newPerson.name.trim()) return;
    
    const personData: Omit<Person, 'id' | 'x' | 'y'> = {
      name: newPerson.name,
      role: newPerson.role,
      description: newPerson.description,
      testimonials: [],
      color: newPerson.color || '', // Empty string means use auto cycling
    };
    
    onAddPerson(personData);
    setNewPerson({ name: '', role: '', description: '', color: '' });
    setIsAddingPerson(false);
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.trim() || !selectedPerson) return;
    
    onUpdatePerson(selectedPerson.id, {
      testimonials: [...selectedPerson.testimonials, newTestimonial],
    });
    setNewTestimonial('');
  };

  const handleAddConnection = () => {
    if (!selectedPerson || !newConnection.toId) return;
    
    onAddConnection(selectedPerson.id, newConnection.toId, newConnection.label || undefined);
    setNewConnection({ toId: '', label: '' });
    onEditConnection(null);
  };

  const handleAddTimelineEvent = () => {
    if (!newTimelineEvent.date || !newTimelineEvent.time || !newTimelineEvent.description) return;
    
    const personIds = newTimelineEvent.personId ? [newTimelineEvent.personId] : [];
    
    onAddTimelineEvent({
      date: newTimelineEvent.date,
      time: newTimelineEvent.time,
      description: newTimelineEvent.description,
      personIds: personIds,
    });
    // Keep date and time, only reset description and personId
    setNewTimelineEvent({ 
      date: newTimelineEvent.date, 
      time: newTimelineEvent.time, 
      description: '', 
      personId: '' 
    });
  };

  const handleEditTimelineEvent = (event: TimelineEvent) => {
    setEditingTimelineEvent(event.id);
    setEditTimelineEvent({
      date: event.date,
      time: event.time,
      description: event.description,
      personId: event.personIds.length > 0 ? event.personIds[0] : '',
    });
  };

  const handleSaveTimelineEvent = (eventId: string) => {
    if (!editTimelineEvent.date || !editTimelineEvent.time || !editTimelineEvent.description) return;
    
    const personIds = editTimelineEvent.personId ? [editTimelineEvent.personId] : [];
    
    onUpdateTimelineEvent(eventId, {
      date: editTimelineEvent.date,
      time: editTimelineEvent.time,
      description: editTimelineEvent.description,
      personIds: personIds,
    });
    
    setEditingTimelineEvent(null);
    setEditTimelineEvent({ date: '', time: '', description: '', personId: '' });
  };

  const handleCancelEditTimelineEvent = () => {
    setEditingTimelineEvent(null);
    setEditTimelineEvent({ date: '', time: '', description: '', personId: '' });
  };

  const availablePeople = people.filter(p => !selectedPerson || p.id !== selectedPerson.id);
  const selectedConnections = connections.filter(
    c => selectedPerson && (c.fromPersonId === selectedPerson.id || c.toPersonId === selectedPerson.id)
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-tabs">
          <button
            className={activeTab === 'people' ? 'active' : ''}
            onClick={() => onTabChange('people')}
          >
            People & Connections
          </button>
          <button
            className={activeTab === 'timeline' ? 'active' : ''}
            onClick={() => onTabChange('timeline')}
          >
            Timeline
          </button>
        </div>
        <div className="import-export-buttons">
          <button className="btn-import-export" onClick={onExportData} title="Export Data">
            Export
          </button>
          <button className="btn-import-export" onClick={onImportData} title="Import Data">
            Import
          </button>
        </div>
      </div>

      {activeTab === 'people' && (
        <div className="sidebar-content">
          <div className="section">
            <h2>People</h2>
            {!isAddingPerson ? (
              <button className="btn-primary" onClick={() => setIsAddingPerson(true)}>
                + Add Person
              </button>
            ) : (
              <div className="form">
                <input
                  type="text"
                  placeholder="Name"
                  value={newPerson.name}
                  onChange={e => setNewPerson({ ...newPerson, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Role (Suspect, Witness, Victim, etc.)"
                  value={newPerson.role}
                  onChange={e => setNewPerson({ ...newPerson, role: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  value={newPerson.description}
                  onChange={e => setNewPerson({ ...newPerson, description: e.target.value })}
                  rows={3}
                />
                <div className="color-picker">
                  <label>Color (optional - will auto-assign if not set):</label>
                  <input
                    type="color"
                    value={newPerson.color || '#dc2626'}
                    onChange={e => setNewPerson({ ...newPerson, color: e.target.value })}
                  />
                  {newPerson.color && (
                    <button
                      className="btn-small"
                      onClick={() => setNewPerson({ ...newPerson, color: '' })}
                      style={{ marginLeft: '8px' }}
                    >
                      Use Auto Color
                    </button>
                  )}
                </div>
                <div className="form-actions">
                  <button className="btn-primary" onClick={handleAddPerson}>
                    Add
                  </button>
                  <button className="btn-secondary" onClick={() => setIsAddingPerson(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="people-list">
              {people.map(person => (
                <div
                  key={person.id}
                  className={`person-item ${selectedPerson?.id === person.id ? 'selected' : ''}`}
                  onClick={() => onSelectPerson(person)}
                >
                  <div
                    className="person-color-indicator"
                    style={{ backgroundColor: person.color }}
                  />
                  <div className="person-info">
                    <strong>{person.name}</strong>
                    <span>{person.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedPerson && (
            <>
              <div className="section-divider"></div>
              <div className="section edit-section">
                <h2>Edit: {selectedPerson.name}</h2>
              <div className="form">
                <label>Name</label>
                <input
                  type="text"
                  value={selectedPerson.name}
                  onChange={e => onUpdatePerson(selectedPerson.id, { name: e.target.value })}
                />
                <label>Role</label>
                <input
                  type="text"
                  value={selectedPerson.role}
                  onChange={e => onUpdatePerson(selectedPerson.id, { role: e.target.value })}
                />
                <label>Description</label>
                <textarea
                  value={selectedPerson.description}
                  onChange={e => onUpdatePerson(selectedPerson.id, { description: e.target.value })}
                  rows={3}
                />
                <label>Color</label>
                <input
                  type="color"
                  value={selectedPerson.color}
                  onChange={e => onUpdatePerson(selectedPerson.id, { color: e.target.value })}
                />

                <div className="testimonials-section">
                  <label>Testimonials</label>
                  <div className="testimonials-list">
                    {selectedPerson.testimonials.map((testimonial, idx) => (
                      <div key={idx} className="testimonial-item">
                        <span>{testimonial}</span>
                        <button
                          className="btn-small"
                          onClick={() =>
                            onUpdatePerson(selectedPerson.id, {
                              testimonials: selectedPerson.testimonials.filter((_, i) => i !== idx),
                            })
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="add-testimonial">
                    <textarea
                      placeholder="Add testimonial..."
                      value={newTestimonial}
                      onChange={e => setNewTestimonial(e.target.value)}
                      rows={2}
                    />
                    <button className="btn-primary" onClick={handleAddTestimonial}>
                      Add Testimonial
                    </button>
                  </div>
                </div>

                <div className="connections-section">
                  <label>Connections</label>
                  {selectedConnections.map(conn => {
                    const otherPerson = people.find(
                      p => p.id === (conn.fromPersonId === selectedPerson.id ? conn.toPersonId : conn.fromPersonId)
                    );
                    return (
                      <div key={conn.id} className="connection-item">
                        <span>{otherPerson?.name}</span>
                        {conn.label && <span className="connection-label">{conn.label}</span>}
                        <button
                          className="btn-small"
                          onClick={() => onDeleteConnection(conn.id)}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                  {editingConnection !== selectedPerson.id ? (
                    <button
                      className="btn-secondary"
                      onClick={() => onEditConnection(selectedPerson.id)}
                    >
                      + Add Connection
                    </button>
                  ) : (
                    <div className="add-connection">
                      <select
                        value={newConnection.toId}
                        onChange={e => setNewConnection({ ...newConnection, toId: e.target.value })}
                      >
                        <option value="">Select person...</option>
                        {availablePeople.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Connection label (optional)"
                        value={newConnection.label}
                        onChange={e => setNewConnection({ ...newConnection, label: e.target.value })}
                      />
                      <div className="form-actions">
                        <button className="btn-primary" onClick={handleAddConnection}>
                          Add
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            onEditConnection(null);
                            setNewConnection({ toId: '', label: '' });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="btn-danger"
                  onClick={() => {
                    onDeletePerson(selectedPerson.id);
                    onSelectPerson(null);
                  }}
                >
                  Delete Person
                </button>
              </div>
            </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="sidebar-content">
          <div className="section">
            <h2>Timeline of Events</h2>
            <div className="form">
              <label>Date</label>
              <input
                type="date"
                value={newTimelineEvent.date}
                onChange={e => setNewTimelineEvent({ ...newTimelineEvent, date: e.target.value })}
                required
              />
              <label>Time</label>
              <input
                type="time"
                value={newTimelineEvent.time}
                onChange={e => setNewTimelineEvent({ ...newTimelineEvent, time: e.target.value })}
                required
              />
              <label>Description</label>
              <textarea
                placeholder="What happened?"
                value={newTimelineEvent.description}
                onChange={e => setNewTimelineEvent({ ...newTimelineEvent, description: e.target.value })}
                rows={3}
                required
              />
              <label>Who said/claimed this? (optional)</label>
              <select
                value={newTimelineEvent.personId}
                onChange={e => setNewTimelineEvent({ ...newTimelineEvent, personId: e.target.value })}
              >
                <option value="">Select person (optional)...</option>
                {people.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button className="btn-primary" onClick={handleAddTimelineEvent}>
                Add Event
              </button>
            </div>

            <div className="timeline-list">
              {timelineEvents.map(event => {
                if (editingTimelineEvent === event.id) {
                  return (
                    <div key={event.id} className="timeline-item editing">
                      <div className="form">
                        <label>Date</label>
                        <input
                          type="date"
                          value={editTimelineEvent.date}
                          onChange={e => setEditTimelineEvent({ ...editTimelineEvent, date: e.target.value })}
                        />
                        <label>Time</label>
                        <input
                          type="time"
                          value={editTimelineEvent.time}
                          onChange={e => setEditTimelineEvent({ ...editTimelineEvent, time: e.target.value })}
                        />
                        <label>Description</label>
                        <textarea
                          value={editTimelineEvent.description}
                          onChange={e => setEditTimelineEvent({ ...editTimelineEvent, description: e.target.value })}
                          rows={3}
                        />
                        <label>Who said/claimed this? (optional)</label>
                        <select
                          value={editTimelineEvent.personId}
                          onChange={e => setEditTimelineEvent({ ...editTimelineEvent, personId: e.target.value })}
                        >
                          <option value="">Select person (optional)...</option>
                          {people.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <div className="form-actions">
                          <button className="btn-primary" onClick={() => handleSaveTimelineEvent(event.id)}>
                            Save
                          </button>
                          <button className="btn-secondary" onClick={handleCancelEditTimelineEvent}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                const eventDateTime = new Date(`${event.date}T${event.time}`);
                const formattedDate = eventDateTime.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                });
                const formattedTime = eventDateTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true
                });
                
                return (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-time">
                      <div className="timeline-date">{formattedDate}</div>
                      <div className="timeline-time-value">{formattedTime}</div>
                    </div>
                    <div className="timeline-description">{event.description}</div>
                    {event.personIds.length > 0 && (
                      <div className="timeline-people">
                        Involved:{' '}
                        {event.personIds
                          .map(pid => people.find(p => p.id === pid)?.name)
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                    <div className="timeline-item-actions">
                      <button
                        className="btn-small"
                        onClick={() => handleEditTimelineEvent(event)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-small"
                        onClick={() => onDeleteTimelineEvent(event.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

