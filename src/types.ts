export interface Person {
  id: string;
  name: string;
  role: string;
  description: string;
  testimonials: string[];
  x: number;
  y: number;
  color: string;
  width?: number;
  height?: number;
}

export interface Connection {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  label?: string;
}

export interface TimelineEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or HH:MM:SS
  description: string;
  personIds: string[];
}


