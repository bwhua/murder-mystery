import { Person, TimelineEvent } from '../types';
import './TimelineView.css';

interface TimelineViewProps {
  timelineEvents: TimelineEvent[];
  people: Person[];
}

export default function TimelineView({ timelineEvents, people }: TimelineViewProps) {
  if (timelineEvents.length === 0) {
    return (
      <div className="timeline-view empty">
        <div className="empty-message">
          <h2>No Timeline Events</h2>
          <p>Add events in the Timeline tab to see them visualized here</p>
        </div>
      </div>
    );
  }

  // Parse dates for sorting
  const sortedEvents = [...timelineEvents].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Group events by date
  const eventsByDate = sortedEvents.reduce((acc, event) => {
    const dateKey = event.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  const dateKeys = Object.keys(eventsByDate).sort();

  return (
    <div className="timeline-view">
      <div className="timeline-container">
        {dateKeys.map((dateKey, dateIndex) => {
          const events = eventsByDate[dateKey];
          const date = new Date(dateKey);
          const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div key={dateKey} className="timeline-day">
              <div className="timeline-day-header">
                <div className="timeline-date-line">
                  <div className="timeline-date-marker"></div>
                  <h2 className="timeline-date-title">{formattedDate}</h2>
                </div>
              </div>
              <div className="timeline-events">
                {events.map((event) => {
                  const eventDateTime = new Date(`${event.date}T${event.time}`);
                  const formattedTime = eventDateTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <div key={event.id} className="timeline-event-item">
                      <div className="timeline-event-content">
                        <div className="timeline-event-time">{formattedTime}</div>
                        <div className="timeline-event-description">{event.description}</div>
                        {event.personIds.length > 0 && (
                          <div className="timeline-event-people">
                            {event.personIds.map((personId) => {
                              const person = people.find(p => p.id === personId);
                              if (!person) return null;
                              return (
                                <span
                                  key={personId}
                                  className="timeline-person-tag"
                                  style={{ backgroundColor: person.color }}
                                >
                                  {person.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {dateIndex < dateKeys.length - 1 && <div className="timeline-day-separator"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

